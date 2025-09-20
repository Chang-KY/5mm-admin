import {useNavigate, useParams} from "react-router-dom";
import {useGetDetailProject} from "@/hooks/useGetDetailProject.ts";
import {formatKoreanDateTime} from "@/utils/date.ts";
import PageTitle from "@/components/PageTitle.tsx";
import Loading from "@/components/loading/Loading.tsx";
import type {ProjectImage} from "@/types/project.ts";
import {useMemo, useState} from "react";
import Modal from "@/components/Modal.tsx";
import {useDeleteProject} from "@/hooks/useDeleteProject.ts";
import ScrollToPage from "@/components/ScrollToPage.tsx";
import ProgressScreen from "@/components/ProgressScreen.tsx";
import {toast} from "react-toastify";
import ErrorNotProject from "@/pages/error/ErrorNotProject.tsx";

const DetailProject = () => {
  const {id} = useParams();
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const {data: project, isLoading, error} = useGetDetailProject(id);
  const {mutate: deleteProject, isPending} = useDeleteProject();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [touched, setTouched] = useState(false);
  const isCorrect = useMemo(
    () => confirmText.trim().toUpperCase() === "DELETE",
    [confirmText]
  );
  const canDelete = isCorrect && !isPending;

  const handleDeleteClick = () => {
    if (!isCorrect) {
      setTouched(true);
      toast.error("삭제하려면 DELETE 를 정확히 입력하세요.", {
        toastId: "error-delete",
      });
      return;
    }
    deleteProject(Number(id), {
      onSuccess: () => {
        setIsOpen(false);
        navigate("/");
      },
      onError: (err) => {
        console.error("삭제 실패:", err);
        toast.error("삭제에 실패했습니다.");
      },
    });
  };

  if (isLoading) return (<ProgressScreen mention='프로젝트 데이터 불러오는 중...'/>);
  if (error) return <ErrorNotProject/>;
  if (!project) return (
    <div className="size-full flex flex-col gap-1.5 justify-center items-center">
      데이터가 없습니다.
    </div>
  );

  return (
    <div className="text-black pb-5">
      <PageTitle title="Project Detail">
        <div className='flex items-center justify-end gap-2'>
          <button
            type='button'
            className="btn-black"
            onClick={() => navigate(`/update-project/${id}`)}
          >
            Edit
          </button>
          <button type="button" className="btn-black" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </PageTitle>

      <div
        className="mt-10 space-y-8 pb-12 sm:space-y-2 sm:pb-0 px-3 py-3">
        <div className='flex items-center justify-start'>
          <p className='font-semibold min-w-24 w-24 max-w-24'>Title:</p>
          <p className='ml-3'>{project.title}</p>
        </div>
        <div className='flex items-center justify-start'>
          <p className='font-semibold min-w-24 w-24 max-w-24'>Title(EN):</p>
          <p className='ml-3'>{project.title_en}</p>
        </div>
        <div className='flex items-center justify-start'>
          <p className='font-semibold min-w-24 w-24 max-w-24'>Created At:</p>
          <p className='ml-3'>{formatKoreanDateTime(project.created_at as string)}</p>
        </div>
        <div className="flex items-start max-w-[50rem]">
          <p className="w-24 shrink-0 font-semibold">Description:</p>
          <p className="ml-3 flex-1 min-w-0 break-words whitespace-pre-line">
            {project.description || '-'}
          </p>
        </div>

        <div className="gap-10 border-t border-black mt-5">
          {/* 오른쪽: 썸네일 + 이미지 */}
          <div className="items-center justify-center gap-8">
            {project.thumbnail && (
              <div className='relative border-b border-gray-200 p-5'>
                <img
                  src={project.thumbnail}
                  loading="lazy"
                  alt={project.title ?? "프로젝트 썸네일"}
                  title={project.title ?? "프로젝트 썸네일"}
                  className="w-[40rem] h-[40rem] object-cover border border-black cursor-pointer"
                  onClick={() => setPreviewUrl(project.thumbnail)}
                />
                <div className='absolute left-6 top-6 px-2 py-1 bg-black text-white border border-white'>Thumbnail</div>
              </div>
            )}

            {project.project_image_urls.map((img: ProjectImage, index: number) => {
              return (
                <div className='relative border-b border-gray-200 p-5' key={img.id}>
                  <img
                    key={img.id}
                    src={img.image_url}
                    loading="lazy"
                    alt={`프로젝트-${project.title}-이미지-${index}`}
                    title={`프로젝트-${project.title}-이미지-${index + 1}`}
                    className="w-[40rem] h-[40rem] object-cover border border-black cursor-pointer"
                    onClick={() => setPreviewUrl(img.image_url)}
                  />
                  <div
                    className='absolute left-6 top-6 px-2 py-1 bg-black text-white border border-white'>Image{index + 1}</div>
                </div>
              )
            })}
          </div>
        </div>
        <div className='w-full flex items-center justify-end mt-5'>
          <div className='w-full mt-4 flex gap-3 items-center justify-end'>
            <button className="btn-red" onClick={() => setIsOpen(true)}>
              Project Delete
            </button>
          </div>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className='w-80 md:w-96 h-56 flex flex-col justify-between'>
          {/* 안내 문구 */}
          {isPending ?
            <div className='size-full flex flex-col gap-3 items-center justify-center'>
              <Loading color='black'/>
              <p>프로젝트({project.title}) 삭제 중...</p>
            </div> :
            <h3>해당 프로젝트(<span className='text-red-500'>{project.title}</span>)를 삭제 정말로 삭제 하시겠습니까?</h3>}

          <label htmlFor="confirmDelete" className="text-sm font-medium my-1">
            확인을 위해 <span className="font-bold text-red-500">DELETE</span> 를 입력하세요.
          </label>
          <input
            id="confirmDelete"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            onBlur={() => setTouched(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canDelete) handleDeleteClick();
            }}
            placeholder='Type "DELETE" to confirm'
            className={[
              "w-full px-3 py-2 border text-black  focus:outline-none focus:ring-2",
              touched && !isCorrect
                ? "border-red-500 focus:ring-red-500"
                : "border-black",
            ].join(" ")}
            disabled={isPending}
          />
          {/* 에러 문구 */}
          {touched && !isCorrect && (
            <p className="mt-1 text-xs text-red-600">
              {confirmText.trim() === ""
                ? "빈칸입니다. 'DELETE' 를 입력하세요."
                : "스펠링이 틀렸습니다. 'DELETE' 를 정확히 입력하세요."}
            </p>
          )}
          <div className="mt-6 w-full flex items-center justify-end">
            <div className="w-40 gap-x-6 flex items-center justify-end">
              <button type="button" className="btn-underline" onClick={() => setIsOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-red"
                onClick={handleDeleteClick}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </Modal>
      {/* 이미지 프리뷰 모달 */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setPreviewUrl(null)}
        >
          <img
            src={previewUrl}
            alt="Full Preview"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-lg"
          />
        </div>
      )}
      <ScrollToPage/>
    </div>
  );
};

export default DetailProject;
