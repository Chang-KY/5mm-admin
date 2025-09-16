import {z} from "zod";

export const contactSchema = z.object({
  slogans: z
    .array(
      z.object({
        value: z.string().trim().min(1, "빈 문구는 저장할 수 없습니다."),
      })
    )
    .min(1, "최소 1개 이상 필요"),
  director_first: z.string().trim().min(1),
  director_last: z.string().trim().min(1),
  postal_code: z.string().trim().min(1),
  addr_line1: z.string().trim().min(1),
  addr_line2: z.string().trim().min(1),
  addr_country_en: z.string().trim().min(1),
  addr_ko: z.string().trim().min(1),
  email: z.string().email("올바른 이메일 형식이 아닙니다."),
  tel: z.string().trim().min(1),
  fax: z.string().trim().min(1),
});
