import {useMutation} from "@tanstack/react-query";
import {supabase} from "@/lib/supabase";
import {queryClient} from "@/lib/queryClient";
import type {ProjectForm} from "@/types/projectForm";
import {makePath} from "@/utils/makePath";
import {extractStorageKeyFromUrl} from "@/utils/extractStoragePathFromUrl";
import {uploadWithTus} from "@/lib/uploadWithTus.ts";

type ProgressPayload =
  | { phase: "overall"; percent: number }
  | { phase: "thumbnail"; uploaded: number; total: number; percent: number }
  | { phase: "image"; index: number; uploaded: number; total: number; percent: number };

interface UpdatePayload extends ProjectForm {
  id: number;
  prevThumbnail: string;
  prevImageUrls: { id?: number; image_url: File | string; sort_order?: number }[];
}

type UpdateVars = UpdatePayload & {
  onProgress?: (p: ProgressPayload) => void;
};

export const useUpdateProject = () => {
  return useMutation({
    mutationFn: async (data: UpdateVars) => {
      const {data: {user}} = await supabase.auth.getUser();
      if (!user?.id) throw new Error("로그인이 필요합니다.");

      // ---------- overall % 준비 (썸네일이 File로 바뀌는 경우 + 이미지 중 File만) ----------
      const thumbBytes =
        data.prevThumbnail !== data.thumbnail && data.thumbnail instanceof File
          ? data.thumbnail.size
          : 0;

      const imageBytes =
        data.project_image_urls?.reduce((sum, img) => {
          const v = img?.image_url as unknown;
          // 신규 추가(!id & File) + 교체(id & File)만 업로드 대상
          if (v instanceof File) return sum + v.size;
          return sum;
        }, 0) ?? 0;

      const totalBytes = thumbBytes + imageBytes;
      const hasUploads = totalBytes > 0;

      const lastUploadedByKey = new Map<string, number>();
      let overallUploaded = 0;
      const reportOverall = (key: string, uploaded: number) => {
        const prev = lastUploadedByKey.get(key) ?? 0;
        const delta = uploaded - prev;
        lastUploadedByKey.set(key, uploaded);
        overallUploaded += Math.max(0, delta);
        if (totalBytes > 0) {
          data.onProgress?.({
            phase: "overall",
            percent: (overallUploaded / totalBytes) * 100,
          });
        }
      };

      const {
        project_image_urls,
        prevImageUrls,
        id,
        prevThumbnail,
        onProgress: _ignore,
        ...projectData
      } = data;

      // ---- 보상 트랜잭션(롤백)용 트래커 ----
      const uploadsNew: string[] = [];                 // 이번 요청에서 새로 업로드한 스토리지 키(실패 시 삭제)
      const insertedIds: number[] = [];                // 이번에 insert된 project_images id(실패 시 삭제)
      const replacedToRevert: { id: number; oldUrl: string }[] = []; // 교체되었던 이미지 복구용
      const storageToDeleteOnSuccess: string[] = [];   // 성공 시 삭제할 이전 파일 키
      let projectUpdated = false;

      try {
        // 1) 썸네일 처리 (TUS + onProgress)
        let thumbnailUrl = prevThumbnail;
        if (prevThumbnail !== data.thumbnail && data.thumbnail instanceof File) {
          const ext = data.thumbnail.name.split(".").pop();
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

          uploadsNew.push(storageKey);
          thumbnailUrl = publicUrl;

          const oldThumbKey = extractStorageKeyFromUrl(prevThumbnail, "5mm-studio");
          if (oldThumbKey) storageToDeleteOnSuccess.push(oldThumbKey);
        }

        // 2) projects 업데이트
        const {data: updatedProject, error: updErr} = await supabase
          .from("projects")
          .update({...projectData, thumbnail: thumbnailUrl})
          .eq("id", id)
          .select()
          .single();
        if (updErr) throw new Error(updErr.message);
        projectUpdated = true;

        if (!project_image_urls) return updatedProject;

        // 3) 삭제 대상 산출 → DB 삭제 먼저, 스토리지는 성공 후 일괄 삭제
        const toDelete = prevImageUrls.filter(
          (prev) => !project_image_urls.some((curr) => curr.id === prev.id)
        );
        if (toDelete.length > 0) {
          const {error: delErr} = await supabase
            .from("project_images")
            .delete()
            .in("id", toDelete.map((img) => img.id));
          if (delErr) throw new Error(delErr.message);

          for (const img of toDelete) {
            if (typeof img.image_url === "string") {
              const key = extractStorageKeyFromUrl(img.image_url, "5mm-studio");
              if (key) storageToDeleteOnSuccess.push(key);
            }
          }
        }

        // 4) 신규/교체/순서변경 준비 & 업로드(TUS)
        const addRows: { project_id: number; image_url: string; sort_order: number }[] = [];
        const orderUpdates: { id: number; sort_order: number }[] = [];
        const replaceOps: {
          id: number; newUrl: string; oldUrl: string; oldKey?: string | null; sort_order?: number
        }[] = [];

        // visibleIdx: 화면 표시 순서 기준 인덱스(문자열 URL도 포함)
        let visibleIdx = -1;

        for (let index = 0; index < project_image_urls.length; index++) {
          const img = project_image_urls[index];
          const v = img?.image_url as unknown;

          // 빈칸/지원X 스킵
          if (
            v == null ||
            (typeof v === "string" && v.trim() === "") ||
            (typeof v === "object" && !(v instanceof File))
          ) {
            continue;
          }

          // 화면에 보이는 항목만 인덱스 증가
          visibleIdx++;

          // 신규 (id 없음 + File)
          if (!img.id && v instanceof File) {
            const ext = v.name.split(".").pop();
            const filePath = makePath({titleEn: data.title_en, ext, type: "image"});

            const {publicUrl, storageKey} = await uploadWithTus({
              file: v,
              bucket: "5mm-studio",
              objectPath: filePath,
              onProgress: ({uploaded, total, percent}) => {
                data.onProgress?.({phase: "image", index: visibleIdx, uploaded, total, percent});
                reportOverall(`img-${visibleIdx}`, uploaded);
              },
              upsert: true,
            });

            uploadsNew.push(storageKey);
            addRows.push({project_id: id, image_url: publicUrl, sort_order: visibleIdx});
            continue;
          }

          // 교체 (id 있음 + File)
          if (img.id && v instanceof File) {
            const file = v as File;
            const ext = file.name.split(".").pop();
            const filePath = makePath({titleEn: data.title_en, ext, type: "image"});

            const {publicUrl, storageKey} = await uploadWithTus({
              file,
              bucket: "5mm-studio",
              objectPath: filePath,
              onProgress: ({uploaded, total, percent}) => {
                data.onProgress?.({phase: "image", index: visibleIdx, uploaded, total, percent});
                reportOverall(`img-${visibleIdx}`, uploaded);
              },
              upsert: true,
            });

            uploadsNew.push(storageKey);

            const prev = prevImageUrls.find((p) => p.id === img.id);
            const oldUrl = typeof prev?.image_url === "string" ? prev.image_url : "";
            const oldKey = oldUrl ? extractStorageKeyFromUrl(oldUrl, "5mm-studio") : undefined;

            replaceOps.push({id: img.id, newUrl: publicUrl, oldUrl, oldKey, sort_order: img.sort_order});
            continue;
          }

          // 순서만 변경 (기존 문자열 URL 등)
          if (img.id) {
            orderUpdates.push({id: img.id, sort_order: visibleIdx});
          }
        }

        // 5) DB insert (신규)
        if (addRows.length > 0) {
          const {data: insertedImgs, error: insErr} = await supabase
            .from("project_images")
            .insert(addRows)
            .select("id");
          if (insErr) throw new Error(insErr.message);
          insertedIds.push(...insertedImgs.map((r) => r.id));
        }

        // 6) DB update (교체)
        for (const op of replaceOps) {
          const {error: repErr} = await supabase
            .from("project_images")
            .update({image_url: op.newUrl, sort_order: op.sort_order})
            .eq("id", op.id);
          if (repErr) throw new Error(repErr.message);

          replacedToRevert.push({id: op.id, oldUrl: op.oldUrl});
          if (op.oldKey) storageToDeleteOnSuccess.push(op.oldKey);
        }

        // 7) DB update (순서만 변경)
        for (const upd of orderUpdates) {
          const {error: ordErr} = await supabase
            .from("project_images")
            .update({sort_order: upd.sort_order})
            .eq("id", upd.id);
          if (ordErr) throw new Error(ordErr.message);
        }

        // 8) 최종 성공 → 이전 파일들 삭제
        if (storageToDeleteOnSuccess.length > 0) {
          await supabase.storage.from("5mm-studio").remove(storageToDeleteOnSuccess);
        }
        if (!hasUploads) {
          data.onProgress?.({phase: "overall", percent: 100});
        }

        return updatedProject;
      } catch (err) {
        // ----------- 롤백 -----------
        if (projectUpdated) {
          try {
            await supabase.from("projects").update({thumbnail: data.prevThumbnail}).eq("id", data.id);
          } catch {
            console.error('여기서 에러가 발생')
          }
        }
        if (insertedIds.length > 0) {
          try {
            await supabase.from("project_images").delete().in("id", insertedIds);
          } catch {
            console.error('여기서 에러가 발생')
          }
        }
        if (replacedToRevert.length > 0) {
          for (const r of replacedToRevert) {
            try {
              await supabase.from("project_images").update({image_url: r.oldUrl}).eq("id", r.id);
            } catch {
              console.error('여기서 에러가 발생')
            }
          }
        }
        if (uploadsNew.length > 0) {
          try {
            await supabase.storage.from("5mm-studio").remove(uploadsNew);
          } catch {
            console.error('여기서 에러가 발생')
            console.log(_ignore);
          }
        }
        throw err;
      }
    },
    onMutate: (vars) => {
      vars.onProgress?.({phase: "overall", percent: 0}); // 시작 시 0%
    },
    onSuccess: async (_res, vars) => {
      vars.onProgress?.({phase: "overall", percent: 100});
      await queryClient.invalidateQueries({queryKey: ["projects"]});
    },
  });
};