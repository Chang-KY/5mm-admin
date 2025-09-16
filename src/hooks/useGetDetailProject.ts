import {useQuery} from "@tanstack/react-query";
import {supabase} from "@/lib/supabase.ts";
import type {ProjectImage} from "@/types/project.ts";

const fetchDetailProject = async (id: string) => {
  const {data, error} = await supabase
    .from("projects")
    .select("*, project_images(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  const {project_images, ...rest} = data;

  return {
    ...rest,
    project_image_urls: (project_images ?? [])
      .sort((a: ProjectImage, b: ProjectImage) => a.sort_order - b.sort_order)
      .map((img: ProjectImage) => ({
        id: img.id,
        image_url: img.image_url,
        sort_order: img.sort_order,
      })),
  };
};

export const useGetDetailProject = (id: string | undefined) => {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => fetchDetailProject(id as string),
    enabled: !!id, // id가 있을 때만 실행
  });
};