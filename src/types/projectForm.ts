export type ProjectForm = {
  title: string;
  title_en: string;
  description: string;
  thumbnail: File | string; // File도 받을 수 있게 변경
  project_image_urls: { id?: number, image_url: File | string, sort_order?: number }[];
};