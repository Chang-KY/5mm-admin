import {format, parseISO} from "date-fns";
import {ko} from "date-fns/locale";

/**
 * Supabase Timestamp (ISO string) → 한국 시간 포맷
 */
export function formatKoreanDateTime(isoString: string): string {
  try {
    const date = parseISO(isoString);
    return format(date, "yyyy년 MM월 dd일 HH:mm", {locale: ko});
  } catch {
    return isoString;
  }
}

/**
 * 날짜만 (년-월-일)
 */
export function formatKoreanDate(isoString: string): string {
  try {
    const date = parseISO(isoString);
    return format(date, "yyyy년 MM월 dd일", {locale: ko});
  } catch {
    return isoString;
  }
}

/**
 * 시:분만
 */
export function formatTime(isoString: string): string {
  try {
    const date = parseISO(isoString);
    return format(date, "HH:mm", {locale: ko});
  } catch {
    return isoString;
  }
}
