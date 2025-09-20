import InputImage from "@/components/InputImage.tsx";
import {DndContext} from "@dnd-kit/core";
import {SortableContext} from "@dnd-kit/sortable";
import SortableItem from "@/components/SortableItem.tsx";
import type {ProjectForm} from "@/types/projectForm.ts";
import {useNavigate} from "react-router-dom";
import ScrollToPage from "@/components/ScrollToPage.tsx";
import PageTitle from "@/components/PageTitle.tsx";
import {useState} from "react";
import clsx from "clsx";
import ProgressScreen from "@/components/ProgressScreen.tsx";
import {parseUniqueError} from "@/utils/dupField.ts";

interface Props {
  onSubmit: (data: ProjectForm) => void;
  isPending?: boolean;
  error?: Error | null;
  type: 'add' | 'update';
  form: ReturnType<typeof import("@/hooks/useProjectForm").useProjectForm>;
  overallPct?: number;
}

const ProjectCommonForm = ({onSubmit, isPending, error, form, type, overallPct}: Props) => {
  const {
    register,
    handleSubmit,
    setValue,
    fields,
    append,
    remove,
    move,
    errors,
    isSubmitting,
    sensors,
    watch,
  } = form;
  const navigate = useNavigate();
  const [isThumbDragging, setIsThumbDragging] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const scrollToBottom = () => {
    const bottom = document.documentElement.scrollHeight || document.body.scrollHeight;
    window.scrollTo({top: bottom, behavior: "smooth"});
  };
  const scrollToBottomAfterPaint = () => {
    // 렌더 → 페인트 이후로 미룸
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const bottom = document.documentElement.scrollHeight || document.body.scrollHeight;
        window.scrollTo({top: bottom, behavior: "smooth"});
      });
    });
  };

  return (
    <>
      <PageTitle title={`Project ${type === 'add' ? 'Add' : 'Edit'}`}>
        <button type="button" className="btn-black" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </PageTitle>
      <form className="px-5 py-2 text-black" onSubmit={handleSubmit(onSubmit)}>
        {isPending && <ProgressScreen mention='저장 중입니다. 잠시만 기다려주세요...'
                                      subMention={`${Math.min(overallPct ?? 0, 100).toFixed(2)} %`}/>}
        {error && (() => {
          const dup = parseUniqueError(error);
          return (
            <p className="text-red-500 mt-2">
              에러 발생: {dup?.message ?? (error instanceof Error ? error.message : "알 수 없는 오류")}
            </p>
          );
        })()}

        <div className="space-y-12 sm:space-y-16">
          <div className="mt-10 space-y-8 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:pb-0">

            {/* 타이틀 */}
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="title"
                className="block text-sm/6 font-medium sm:pt-1.5"
                title="이 프로젝트의 대표 제목을 입력하세요."
              >
                <p>프로젝트 타이틀</p>
                <span>(Title)</span>
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <input
                  id="title"
                  type="text"
                  {...register("title", {required: "타이틀은 필수입니다."})}
                  className="w-full px-3 py-2 border text-black border-black focus:outline-none focus:ring-2"
                />
                <p className="mt-3 text-sm/6 text-gray-600">
                  프로젝트의 타이틀을 넣어주세요.
                </p>
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                )}
              </div>
            </div>

            {/* 타이틀(EN) */}
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="title"
                className="block text-sm/6 font-medium sm:pt-1.5"
                title="이 프로젝트의 대표 제목을 영어로 입력하세요."
              >
                <p>프로젝트 타이틀(EN)</p>
                <span>(Title English)</span>
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <input
                  id="title_en"
                  type="text"
                  {...register("title_en", {
                    required: "영어 타이틀은 필수입니다.",
                    pattern: {
                      value: /^[A-Za-z0-9\s().,-]+$/,
                      message: "영문(숫자, 공백, 마침표, 괄호 포함)만 입력할 수 있습니다."
                    }
                  })}
                  className="w-full px-3 py-2 border text-black border-black focus:outline-none focus:ring-2"
                />
                <p className="mt-3 text-sm/6 text-gray-600">
                  프로젝트의 타이틀을 영어로 넣어주세요.
                </p>
                {errors.title_en && (
                  <p className="text-sm text-red-500 mt-1">{errors.title_en.message}</p>
                )}
              </div>
            </div>

            {/* 설명 */}
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="description"
                className="block text-sm/6 font-medium sm:pt-1.5"
                title="프로젝트에 대한 간단한 설명을 작성하세요."
              >
                <p>프로젝트 설명</p>
                <span>(Description)</span>
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
            <textarea
              id="description"
              rows={3}
              {...register("description")}
              className="w-full px-3 py-2 border text-black border-black focus:outline-none focus:ring-2"
            />
                <p className="mt-3 text-sm/6 text-gray-600">
                  프로젝트의 전체 설명문을 작성해주세요.
                </p>
              </div>
            </div>

            {/* 썸네일 */}
            <div className={clsx(`sm:grid sm:grid-cols-3 sm:items-center sm:gap-4 sm:py-6 relative`
              , isThumbDragging ? "bg-blue-50 " : "border-gray-300")}
                 onDrop={(e) => {
                   e.preventDefault();
                   setIsThumbDragging(false);
                   const file = e.dataTransfer.files?.[0];
                   if (file && file.type.startsWith("image/")) {
                     // 폼 값만 세팅하면 아래 InputImage가 watch("thumbnail")를 통해 프리뷰 갱신
                     setValue("thumbnail", file as File | string, {
                       shouldDirty: true,
                       shouldValidate: true,
                       shouldTouch: true,
                     });
                   }
                   scrollToBottom();
                 }}
                 onDragOver={(e) => {
                   e.preventDefault();
                   if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
                   setIsThumbDragging(true);
                 }}
                 onDragLeave={() => setIsThumbDragging(false)}
            >
              {isThumbDragging && (
                <div className='absolute inset-0 size-full flex items-center justify-center'>
                  <span className='bg-black px-8 py-4 text-white'>이곳에 놓아주세요.</span>
                </div>
              )}
              <label
                htmlFor="thumbnail"
                className="block text-sm/6 font-medium sm:pt-1.5"
                title="목록에서 대표로 보여질 썸네일 이미지를 업로드하세요."
              >
                <p>프로젝트 썸네일</p>
                <span>(Thumbnail)</span>
              </label>
              <InputImage setValue={setValue} engTitle="thumbnail"
                          error={errors.thumbnail?.message as string}
                          multiple={false}
                          defaultValue={watch("thumbnail")}>
                <input type="hidden" {...register("thumbnail", {required: `썸네일은 반드시 업로드해야 합니다.`})} />
              </InputImage>
            </div>

            {/* 이미지 배열 입력 */}
            <div className={clsx(`sm:grid sm:grid-cols-3 sm:items-center sm:gap-4 sm:py-6 relative`,
              isDragging ? "border-blue-500 bg-blue-50 " : "border-gray-300"
            )}
                 onDrop={(e) => {
                   e.preventDefault();
                   setIsDragging(false);

                   const dropped = Array.from(e.dataTransfer.files)
                     .filter((f) => f.type.startsWith("image/"));

                   if (dropped.length === 0) return;

                   const current = watch("project_image_urls") ?? [];
                   const used = new Set<number>();

                   dropped.forEach((file) => {
                     // 비어있는 슬롯 찾기
                     const emptyIdx = current.findIndex((v: { id?: number; image_url: string | File }, i: number) =>
                       !used.has(i) && (!v || !v.image_url || v.image_url === "")
                     );

                     if (emptyIdx >= 0) {
                       used.add(emptyIdx);
                       setValue(`project_image_urls.${emptyIdx}.image_url`, file as string | File, {
                         shouldDirty: true, shouldValidate: true
                       });
                     } else {
                       append({image_url: file});
                     }
                   });
                   scrollToBottomAfterPaint();
                 }}
                 onDragOver={(e) => {
                   e.preventDefault();
                   // 드래그 중에는 '복사' 드롭 효과
                   if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
                   setIsDragging(true);
                 }}
                 onDragLeave={(e) => {
                   e.preventDefault();
                   setIsDragging(false);
                 }}
            >
              {isDragging &&
                <div className='absolute inset-0 size-full flex items-center justify-center'>
                  <span className='bg-black px-8 py-4 text-white'>이곳에 놓아주세요.</span>
                </div>}
              <label
                htmlFor="project_image_urls"
                className="block text-sm/6 font-medium sm:pt-1.5"
                title="프로젝트 상세 페이지에서 보여질 이미지들을 업로드하세요."
              >
                <p>프로젝트 이미지's</p>
                <span>(Project Images)</span>
              </label>
              <div className="mt-2 space-y-4 sm:col-span-2">
                <DndContext
                  sensors={sensors}
                  onDragEnd={({active, over}) => {
                    if (over && active.id !== over.id) {
                      const from = fields.findIndex((f) => f.id === active.id);
                      const to = fields.findIndex((f) => f.id === over.id);
                      move(from, to);
                    }
                  }}
                >
                  <div
                    className=""
                    title="여기에 이미지를 Drag&Drop 해서 업로드하세요."
                  >
                    <SortableContext items={fields.map((f) => f.id)}>
                      {fields.map((field, index) => {
                        return (
                          <SortableItem key={field.id} id={field.id}>
                            <div className="flex items-center justify-between pb-4 border-b relative border-gray-200">
                              <InputImage<ProjectForm>
                                setValue={setValue}
                                append={(img) => append(img ?? {image_url: ""})} // 파일 있으면 세팅, 아니면 빈칸
                                isLast={index === fields.length - 1}
                                engTitle={`project_image_urls.${index}.image_url`}
                                defaultValue={field.image_url}
                                multiple={true}
                              >
                                <input
                                  type="hidden"
                                  {...register("project_image_urls", {
                                    validate: (value) =>
                                      Array.isArray(value) &&
                                      value.some((v) => v.image_url && v.image_url !== "") ||
                                      "프로젝트 이미지는 최소 1장 등록해야 합니다."
                                  })}
                                />
                                <span
                                  className='bg-black absolute top-1 left-1 text-white border border-white
                                              min-w-5 min-h-5 size-10 flex items-center justify-center p-1'>
                                  {index + 1}
                                </span>
                              </InputImage>
                              {index === 0 && <p className='text-xs'>처음 이미지는 삭제가 안됩니다.</p>}
                              {index === fields.length - 1 && 0 !== fields.length - 1 &&
                                <p className='text-xs'>마지막 이미지는 삭제가 안됩니다.</p>}
                              {index !== 0 && index !== fields.length - 1 && (
                                <button
                                  type="button"
                                  className="border border-red-600 px-4 py-3 mt-1 text-red-600 hover:bg-red-600 hover:text-white"
                                  onClick={() => remove(index)}
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </SortableItem>
                        )
                      })}
                      {errors.project_image_urls && (
                        <p className="text-sm text-red-500 mt-1">프로젝트 이미지는 최소 1장 등록해야 합니다.</p>)}
                    </SortableContext>
                  </div>
                </DndContext>
              </div>
            </div>
          </div>
        </div>

        <p className='font-bold text-left'>생성 및 변경 후 2분 후 고객페이지에 반영됩니다.</p>
        {/* 버튼 */}
        <div className="mt-6 w-full flex items-center justify-end">
          <div className="w-full mt-4 flex gap-3 items-center justify-end">
            <button type="button" className="btn-underline" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isPending}
              className="btn-black"
            >
              {isSubmitting || isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
        <ScrollToPage/>
      </form>
    </>
  );
};

export default ProjectCommonForm;
