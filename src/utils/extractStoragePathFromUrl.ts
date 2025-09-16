export function extractStorageKeyFromUrl(urlStr: string, bucket: string) {
  try {
    const url = new URL(urlStr);
    // 1) 쿼리 파라미터 제거된 path
    const pathname = url.pathname; // e.g. /storage/v1/object/public/5mm-studio/folder/file.png
    const parts = pathname.split('/').filter(Boolean);

    // 2) 버킷명이 path에 포함되어 있으면 (supabase 기본 퍼블릭 URL)
    const bucketIdx = parts.findIndex(p => p === bucket);
    if (bucketIdx >= 0) {
      // bucket 다음부터가 key
      return parts.slice(bucketIdx + 1).join('/');
    }

    // 3) CloudFront 등 커스텀 도메인인 경우 → /<key...> 형태라고 가정
    // 맨 앞 슬래시 제거
    return pathname.replace(/^\/+/, '');
  } catch {
    return null;
  }
}
