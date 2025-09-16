import {useMutation} from "@tanstack/react-query";
import {supabase} from "@/lib/supabase";
import {queryClient} from "@/lib/queryClient";

type Pair = { id: number; order_number: number };

export const useReorderProjects = () => {
  return useMutation({
    mutationFn: async (pairs: Pair[]) => {
      const {data: {user}} = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");
      const {error} = await supabase.rpc("reorder_projects", {pairs});
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({queryKey: ["projects"]}),
  });
};