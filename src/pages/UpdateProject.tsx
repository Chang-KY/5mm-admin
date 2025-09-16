import {useParams, useNavigate} from "react-router-dom";
import {useProjectForm} from "@/hooks/useProjectForm.ts";
import ProjectCommonForm from "@/components/ProjectCommonForm.tsx";
import {useGetDetailProject} from "@/hooks/useGetDetailProject.ts";
import type {ProjectForm} from "@/types/projectForm.ts";
import {useUpdateProject} from "@/hooks/useUpdateProject.ts";
import {useEffect, useState} from "react";
import ProgressScreen from "@/components/ProgressScreen.tsx";
import {parseUniqueError} from "@/utils/dupField.ts";
import {toast} from "react-toastify";

const UpdateProject = () => {
  const {id} = useParams();
  const {data: project, isLoading} = useGetDetailProject(id);
  const form = useProjectForm();
  const {reset} = form;
  const {mutate, isPending, error} = useUpdateProject();
  const navigate = useNavigate();
  const [overallPct, setOverallPct] = useState(0);
  const onSubmit = (data: ProjectForm) => {
    mutate({
      id: Number(id),
      ...data,
      prevThumbnail: project?.thumbnail || "",
      prevImageUrls: project?.project_image_urls || [],
      onProgress: (e) => {
        if (e.phase === "overall") setOverallPct(Number(e.percent.toFixed(2)));
      },
    }, {
      onSuccess: () => {
        alert("업데이트 성공");
        navigate("/dashboard");
      },
      onError: (e) => {
        const dup = parseUniqueError(e);

        if (dup?.field === "title") {
          form.setError("title", {type: "duplicate", message: dup.message});
          toast.error(dup.message);
        } else if (dup?.field === "title_en") {
          form.setError("title_en", {type: "duplicate", message: dup.message});
          toast.error(dup.message);
        } else {
          toast.error(dup?.message ?? (e instanceof Error ? e.message : "저장 중 오류가 발생했습니다."));
        }
      }
    });
  };

  useEffect(() => {
    if (project) {
      reset({
        title: project.title,
        title_en: project.title_en,
        description: project.description,
        thumbnail: project.thumbnail,
        project_image_urls: project.project_image_urls ?? [{image_url: ""}],
      });
    }
  }, [project, reset]);

  return (
    <>
      {isLoading && <ProgressScreen mention="해당 프로젝트의 데이터 불러오는 중..."/>}
      <ProjectCommonForm
        onSubmit={onSubmit}
        isPending={isPending}
        error={error}
        form={form}
        type='update'
        overallPct={overallPct}
      />
    </>
  );
};

export default UpdateProject;
