// 프로젝트 기본 정보
export interface Project {
  id: number;
  created_at: string;       // ISO string (timestamp with time zone)
  title: string | null;
  title_en: string;
  description: string | null;
  thumbnail: string | null; // 이미지 URL
  order_number: number | null;
}

// 프로젝트 이미지
export interface ProjectImage {
  id: number;
  project_id: number | null; // FK → projects.id
  image_url: string;
  sort_order: number;
  alt: string | null;
}
