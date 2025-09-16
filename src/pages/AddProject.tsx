import {useNavigate} from "react-router-dom";
import {useAddProject} from "@/hooks/useAddProject.ts";
import {useProjectForm} from "@/hooks/useProjectForm.ts";
import ProjectCommonForm from "@/components/ProjectCommonForm.tsx";
import type {ProjectForm} from "@/types/projectForm.ts";
import {parseUniqueError} from "@/utils/dupField.ts";
import {toast} from "react-toastify";
import {useState} from "react";

const AddProject = () => {
  const form = useProjectForm();
  const {mutate, isPending, error} = useAddProject();
  const [overallPct, setOverallPct] = useState(0);
  const navigate = useNavigate();

  const onSubmit = (data: ProjectForm) => {
    mutate(
      {
        ...data,
        onProgress: (e) => {
          switch (e.phase) {
            case "overall":
              setOverallPct(e.percent);
              break;
          }
        },
      },
      {
        onSuccess: () => {
          alert("등록 성공");
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
            toast.error(
              dup?.message ?? (e instanceof Error ? e.message : "저장 중 오류가 발생했습니다.")
            );
          }
        },
      }
    );
  };

  return (
    <ProjectCommonForm onSubmit={onSubmit} isPending={isPending} error={error} form={form} type="add"
                       overallPct={overallPct}/>
  );
};

export default AddProject;
