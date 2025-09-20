import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import {restrictToVerticalAxis, restrictToParentElement} from "@dnd-kit/modifiers";
import {CSS} from "@dnd-kit/utilities";
import {useEffect, useMemo, useRef, useState} from "react";
import {useProjects} from "@/hooks/useGetProjects";
import ProgressScreen from "@/components/ProgressScreen.tsx";
import PageTitle from "@/components/PageTitle.tsx";
import {useNavigate} from "react-router-dom";
import ScrollToPage from "@/components/ScrollToPage.tsx";
import {toast} from "react-toastify";
import {useReorderProjects} from "@/hooks/useReorderProjects.ts";

type Item = { id: number; title: string; order_number?: number };

function SortableRow({id, index, title}: { id: number; index: number; title: string }) {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border p-2 mb-2 bg-white flex items-center gap-3"
    >
      {/* 현재 화면상의 순번 */}
      <span className="font-bold w-6 text-right">{index + 1}</span>

      {/* 드래그 핸들 */}
      <button
        {...attributes}
        {...listeners}
        className="px-2 py-1 rounded border cursor-grab active:cursor-grabbing select-none touch-none"
        aria-label="Drag handle"
      >
        ↕
      </button>

      <span className="truncate">{title}</span>
    </div>
  );
}

export default function ReorderProjects() {
  const {data: projects, isLoading, error} = useProjects();
  const [items, setItems] = useState<Item[]>([]);
  const navigate = useNavigate();
  const initialRef = useRef<Item[]>([]);
  const reorder = useReorderProjects();

  useEffect(() => {
    const loaded = (projects ?? []).map(p => ({id: p.id, title: p.title, order_number: p.order_number}));
    setItems(loaded);
    initialRef.current = loaded.map(x => ({...x})); // 깊은 복사(참조 분리)
  }, [projects]);

  const isDirty = useMemo(() => {
    const a = items.map(i => i.id).join(",");
    const b = initialRef.current.map(i => i.id).join(",");
    return a !== b;
  }, [items]);

  const sensors = useSensors(
    // 데스크톱: 포인터로 즉시 시작
    useSensor(PointerSensor, {activationConstraint: {distance: 6}}),
    // 모바일: 살짝 누르고(press delay) 드래그 시작
    useSensor(TouchSensor, {
      activationConstraint: {delay: 150, tolerance: 8}, // 120~250ms 선호
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    if (!over) return;

    if (active.id !== over.id) {
      setItems(prev => {
        const oldIndex = prev.findIndex(p => p.id === active.id);
        const newIndex = prev.findIndex(p => p.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleUndo = () => {
    if (!isDirty) {
      toast.info('변경된 사항이 없습니다.', {toastId: 'Not Dirty'})
      return;
    }
    setItems(initialRef.current.map(x => ({...x})));
    toast.success('프로젝트 순서를 되돌리셨습니다.', {
      toastId: 'Undo',
    })
  };

  const handleSaveOrder = async () => {
    if (!isDirty) {
      toast.info('변경된 사항이 없습니다.', {toastId: 'Not Dirty'})
      return;
    }
    const newOrder = items.map((item, index) => ({
      id: item.id,
      order_number: (items.length) - index, // 0..len-1을 뒤집기 → 마지막이 0
    }));
    reorder.mutate(newOrder, {
      onSuccess: () => {
        alert("순서 저장 성공!");
        navigate('/dashboard');
      },
      onError: (e) => {
        alert("순서 저장 실패: " + (e as Error).message);
        toast.error('순서 저장 실패 했습니다.', {
          toastId: 'reorder Projects'
        });
      }
    });
  };

  if (isLoading) return <ProgressScreen mention="Dashboard 데이터 불러오는 중..."/>;
  if (error) return <p>에러 발생: {(error as Error).message}</p>;
  if (!items.length) return <p className="w-full flex items-center justify-center">데이터가 없습니다.</p>;

  return (
    <div>
      <PageTitle title="Reorder Projects">
        <button
          type='button'
          className="btn-black"
          onClick={() => navigate("/dashboard")}
        >
          Cancel
        </button>
      </PageTitle>
      <div className="px-3 py-5">

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            {items.map((p, idx) => (
              <SortableRow key={p.id} id={p.id} index={idx} title={p.title}/>
            ))}
          </SortableContext>
        </DndContext>

        <p className='font-bold text-left'>변경 후 2분 후 고객페이지에 반영됩니다.</p>

        <div className='w-full mt-4 flex gap-3 items-center justify-end'>
          <button className='btn-underline' type='button' onClick={handleUndo}>
            Undo
          </button>
          <button onClick={handleSaveOrder} type='button' className="btn-black">
            Save Order
          </button>
        </div>
      </div>
      <ScrollToPage/>
    </div>
  );
}
