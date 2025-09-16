export const DataSanitizeOnlyEn = (str: string) =>
  str.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();

export const DataSanitizeWithKo = (str: string) =>
  str.replace(/[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ_-]/g, "_").toLowerCase();
