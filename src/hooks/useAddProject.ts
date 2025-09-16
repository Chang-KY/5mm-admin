import {useMutation} from "@tanstack/react-query";
import {supabase} from "@/lib/supabase";
import {queryClient} from "@/lib/queryClient.ts";
import type {ProjectForm} from "@/types/projectForm.ts";
import {makePath} from "@/utils/makePath.ts";
import {uploadWithTus} from "@/lib/uploadWithTus.ts";

type ProgressPayload =
  | { phase: "overall"; percent: number }
  | { phase: "thumbnail"; uploaded: number; total: number; percent: number }
  | { phase: "image"; index: number; uploaded: number; total: number; percent: number };

type AddProjectVars = ProjectForm & {
  onProgress?: (p: ProgressPayload) => void;
};

export const useAddProject = () => {
  return useMutation({
    mutationFn: async (data: AddProjectVars) => {
      const {data: {user}} = await supabase.auth.getUser();
      if (!user?.id) throw new Error("로그인이 필요합니다.");

      // (선택) 전체 진행률 계산 위한 준비
      const totalBytes =
        (data.thumbnail instanceof File ? data.thumbnail.size : 0) +
        (data.project_image_urls?.reduce((sum, i) =>
          sum + (i?.image_url instanceof File ? i.image_url.size : 0), 0) ?? 0);

      const lastUploadedByKey = new Map<string, number>();
      let overallUploaded = 0;
      const reportOverall = (key: string, uploaded: number) => {
        const prev = lastUploadedByKey.get(key) ?? 0;
        const delta = uploaded - prev;
        lastUploadedByKey.set(key, uploaded);
        overallUploaded += Math.max(0, delta);
        if (totalBytes > 0) {
          data.onProgress?.({phase: "overall", percent: (overallUploaded / totalBytes) * 100});
        }
      };

      const uploadedFilePaths: string[] = [];

      // 1) 썸네일
      let thumbnailUrl = "";
      if (data.thumbnail instanceof File) {
        const ext = data.thumbnail.name.split(".").pop() || "png";
        const thumbPath = makePath({titleEn: data.title_en, ext, type: "thumbnail"});

        const {publicUrl, storageKey} = await uploadWithTus({
          file: data.thumbnail,
          bucket: "5mm-studio",
          objectPath: thumbPath,
          onProgress: ({uploaded, total, percent}) => {
            data.onProgress?.({phase: "thumbnail", uploaded, total, percent});
            reportOverall("thumb", uploaded);
          },
          upsert: true,
        });

        thumbnailUrl = publicUrl;
        uploadedFilePaths.push(storageKey);
      } else {
        thumbnailUrl = data.thumbnail as string;
      }

      // 2) order_number
      const {count, error: countError} = await supabase
        .from("projects")
        .select("*", {head: true, count: "exact"});
      if (countError) throw new Error(countError.message);
      const nextOrder = (count ?? 0) + 1;

      // 3) projects insert
      const {project_image_urls, onProgress: _ignore, ...projectData} = data;
      const {data: inserted, error} = await supabase
        .from("projects")
        .insert([{...projectData, thumbnail: thumbnailUrl, order_number: nextOrder}])
        .select()
        .single();

      if (error) {
        if (uploadedFilePaths.length) {
          await supabase.storage.from("5mm-studio").remove(uploadedFilePaths);
        }
        throw new Error(error.message);
      }

      // 4) images (보이는 인덱스 기준)
      if (project_image_urls?.length) {
        const rows: Array<{ project_id: number; image_url: string; sort_order: number }> = [];
        let visibleIdx = -1;

        for (const img of project_image_urls) {
          const v = img?.image_url as unknown;

          // 빈 칸/지원 안하는 타입 스킵
          if (
            v == null ||
            (typeof v === "string" && v.trim() === "") ||
            (typeof v === "object" && !(v instanceof File))
          ) {
            continue;
          }

          // 화면에 보이는 항목만 인덱스 증가
          visibleIdx++;

          if (v instanceof File) {
            const ext = v.name.split(".").pop() || "png";
            const filePath = makePath({titleEn: data.title_en, ext, type: "image"});

            const {publicUrl, storageKey} = await uploadWithTus({
              file: v,
              bucket: "5mm-studio",
              objectPath: filePath,
              onProgress: ({uploaded, total, percent}) => {
                data.onProgress?.({
                  phase: "image",
                  index: visibleIdx, // ✅ UI와 동일한 인덱스
                  uploaded,
                  total,
                  percent,
                });
                reportOverall(`img-${visibleIdx}`, uploaded); // 전체 % 갱신(선택)
              },
              upsert: true,
            });

            uploadedFilePaths.push(storageKey);
            rows.push({project_id: inserted.id, image_url: publicUrl, sort_order: visibleIdx});
          } else if (typeof v === "string") {
            rows.push({project_id: inserted.id, image_url: v, sort_order: visibleIdx});
          }
        }

        if (rows.length) {
          const {error: imgError} = await supabase.from("project_images").insert(rows);
          if (imgError) {
            if (uploadedFilePaths.length) {
              await supabase.storage.from("5mm-studio").remove(uploadedFilePaths);
            }
            console.log(_ignore);
            throw new Error(imgError.message);
          }
        }
      }

      return inserted;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: ["projects"]});
    },
    onMutate: (vars) => {
      vars.onProgress?.({phase: "overall", percent: 0});
    },
  });
};
