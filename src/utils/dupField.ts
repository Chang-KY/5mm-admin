export type DupField = "title" | "title_en" | "unknown";

type ErrorLike = {
  code?: string;
  message?: string;
  details?: string;
};

function extractErrorLike(err: unknown): ErrorLike {
  if (typeof err === "object" && err !== null) {
    const o = err as Record<string, unknown>;
    return {
      code: typeof o.code === "string" ? o.code : undefined,
      message:
        typeof o.message === "string"
          ? o.message
          : err instanceof Error
            ? err.message
            : undefined,
      details: typeof o.details === "string" ? o.details : undefined,
    };
  }
  // 문자열/기타도 message 로 최대한 살려줌
  return {
    message: err instanceof Error ? err.message : typeof err === "string" ? err : undefined,
  };
}

export function parseUniqueError(
  err: unknown
): { field: DupField; message: string } | null {
  const {code, message, details} = extractErrorLike(err);
  const msg = `${message ?? ""} ${details ?? ""}`;

  // Postgres 고유키 위반
  if (code === "23505" || /duplicate key value/i.test(msg)) {
    if (/projects_title_en_key/i.test(msg) || /Key\s*\(title_en\)/i.test(msg)) {
      return {field: "title_en", message: "동일한 영문 타이틀을 가진 프로젝트가 존재합니다."};
    }
    if (/projects_title_key/i.test(msg) || /Key\s*\(title\)/i.test(msg)) {
      return {field: "title", message: "동일한 타이틀을 가진 프로젝트가 존재합니다."};
    }
    return {field: "unknown", message: "중복된 값이 있습니다."};
  }
  return null;
}
