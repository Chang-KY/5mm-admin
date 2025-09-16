import {useMutation} from "@tanstack/react-query";
import {supabase} from "@/lib/supabase";
import {queryClient} from "@/lib/queryClient";

export const useDeleteProject = () => {
  return useMutation({
    mutationFn: async (projectId: number) => {
      const {data: project, error: projError} = await supabase
        .from("projects")
        .select("id, thumbnail, project_images (id, image_url)")
        .eq("id", projectId)
        .single();

      if (projError) throw new Error(projError.message);
      if (!project) throw new Error("프로젝트를 찾을 수 없습니다.");

      // 2) storage 경로 추출
      const paths: string[] = [];
      if (project.thumbnail) {
        const relative = project.thumbnail.split(
          "/storage/v1/object/public/5mm-studio/"
        )[1];
        if (relative) paths.push(relative);
      }

      if (project.project_images) {
        for (const img of project.project_images) {
          if (img.image_url) {
            const relative = img.image_url.split(
              "/storage/v1/object/public/5mm-studio/"
            )[1];
            if (relative) paths.push(relative);
          }
        }
      }

      // 3) storage 삭제
      if (paths.length > 0) {
        const {error: storageError} = await supabase
          .storage
          .from("5mm-studio")
          .remove(paths);
        if (storageError) console.error("스토리지 삭제 실패:", storageError.message);
      }

      // 4) DB 삭제 (cascade 로 project_images 도 함께 삭제됨)
      const {error: deleteError} = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (deleteError) throw new Error(deleteError.message);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: ["projects"]});
    },
  });
};
