import {useMutation, useQueryClient} from "@tanstack/react-query";
import {supabase} from "@/lib/supabase";

export type StudioInfoFormValues = {
  slogans: { value: string } [];
  director_first: string;
  director_last: string;
  postal_code: string;
  addr_line1: string;
  addr_line2: string;
  addr_country_en: string;
  addr_ko: string;
  email: string;
  tel: string;
  fax: string;
};

export const useSaveContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: StudioInfoFormValues) => {
      const slogansArray = values.slogans.map(s => s.value);

      const {error} = await supabase
        .from("contact")
        .update({
          ...values,
          slogans: slogansArray,
        })
        .eq("id", 1);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["contact"]}).then();
    },
  });
};