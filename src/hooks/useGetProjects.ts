import {useQuery} from "@tanstack/react-query";
import {supabase} from "@/lib/supabase";

export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const {data, error,} = await supabase
        .from("projects")
        .select(`
          id,
          title,
          title_en,
          created_at,
          description,
          thumbnail,
          order_number
        `)
        .order("order_number", {ascending: false, nullsFirst: false}) // 1. 우선순위
        .order("created_at", {ascending: false});                    // 2. 보조 정렬

      if (error) throw new Error(error.message);
      return data;
    },
  });
};
