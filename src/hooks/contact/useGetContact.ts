import {useQuery} from "@tanstack/react-query";
import {supabase} from "@/lib/supabase";

export const useGetContact = () => {
  return useQuery({
    queryKey: ["contact"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
};
