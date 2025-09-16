import {DataSanitizeOnlyEn} from "@/utils/dataSanitizeOnlyEn.ts";

export function makePath(params: {
  titleEn: string;
  ext?: string;
  type?: "image" | "thumbnail"; // 기본은 일반 이미지
}) {
  const {titleEn, ext, type = "image"} = params;
  const sanitized = DataSanitizeOnlyEn(titleEn);

  // 고유성을 보장하기 위해 개별 루프마다 uniqueId 생성
  const uniqueId = Date.now() + "-" + Math.random().toString(36).slice(2, 8);

  if (type === "thumbnail") {
    return `${titleEn}/5mm-studio-thumbnail-${sanitized}-${uniqueId}.${ext}`;
  }

  // 일반 이미지 경로
  return `${titleEn}/5mm-studio-${sanitized}-${uniqueId}.${ext}`;
}
