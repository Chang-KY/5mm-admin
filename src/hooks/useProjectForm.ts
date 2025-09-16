import {useForm, useFieldArray} from "react-hook-form";
import type {ProjectForm} from "@/types/projectForm.ts";
import {useEffect} from "react";
import {PointerSensor, useSensor, useSensors} from "@dnd-kit/core";

export const useProjectForm = (defaultValues?: Partial<ProjectForm>) => {
  const {
    register,
    handleSubmit,
    control,
    formState: {errors, isSubmitting},
    reset,
    setValue,
    watch,
    setError,
  } = useForm<ProjectForm>({
    defaultValues: {
      title: "",
      description: "",
      thumbnail: "",
      project_image_urls: [{image_url: ""}],
      ...defaultValues,
    },
    mode: "onChange",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {distance: 10},
    })
  );

  const {fields, append, remove, move} = useFieldArray<ProjectForm>({
    control,
    name: "project_image_urls",
  });

  // 마지막 input이 채워지면 자동 append
  const imageUrls = watch("project_image_urls");
  useEffect(() => {
    if (imageUrls.length === 0) return;
    const last = imageUrls[imageUrls.length - 1];
    if (!last) return;

    const isFilled =
      (typeof last.image_url === "string" && last.image_url.trim() !== "") ||
      last.image_url instanceof File;

    if (isFilled && fields.length === imageUrls.length) {
      append({image_url: ""});
    }
  }, [imageUrls, append, fields.length]);

  return {
    register,
    handleSubmit,
    control,
    errors,
    isSubmitting,
    reset,
    setValue,
    watch,
    fields,
    append,
    remove,
    move,
    sensors,
    setError,
  };
};
