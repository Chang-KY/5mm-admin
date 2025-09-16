// lib/uploadWithTus.ts
import * as tus from "tus-js-client";
import {supabase} from "@/lib/supabase";

export function uploadWithTus(opts: {
  file: File;
  bucket: string;
  objectPath: string;
  onProgress?: (p: { uploaded: number; total: number; percent: number }) => void;
  contentType?: string;
  cacheControl?: number;
  upsert?: boolean;
}) {
  const {file, bucket, objectPath, onProgress, contentType, cacheControl, upsert} = opts;

  return new Promise<{ publicUrl: string; storageKey: string }>((resolve, reject) => {
    (async () => {
      try {
        const {data: {session}} = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error("인증 토큰이 없습니다.");

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
        const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
        const endpoint = `https://${projectRef}.storage.supabase.co/storage/v1/upload/resumable`;

        const upload = new tus.Upload(file, {
          endpoint,
          chunkSize: 6 * 1024 * 1024,
          uploadDataDuringCreation: true,
          removeFingerprintOnSuccess: true,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            authorization: `Bearer ${session.access_token}`,
            "x-upsert": upsert ? "true" : "false",
          },
          metadata: {
            bucketName: bucket,
            objectName: objectPath,
            contentType: contentType || file.type || "application/octet-stream",
            ...(cacheControl ? {cacheControl: String(cacheControl)} : {}),
          },
          onProgress: (uploaded, total) => {
            onProgress?.({uploaded, total, percent: (uploaded / total) * 100});
          },
          onError: (err) => reject(err),
          onSuccess: () => {
            const {data: {publicUrl}} = supabase.storage.from(bucket).getPublicUrl(objectPath);
            resolve({publicUrl, storageKey: objectPath});
          },
        });

        upload.start();
      } catch (e) {
        reject(e as Error);
      }
    })();
  });
}
