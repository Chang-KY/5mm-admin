import {type ColumnDef, createColumnHelper} from "@tanstack/react-table";
import type {Project} from "@/types/project.ts";
import {formatKoreanDateTime} from "@/utils/date.ts";
import clsx from "clsx";

const columnHelper = createColumnHelper<Project>();

export const columns = [
  {
    id: "rowNumber", // 실제 데이터에 없는 컬럼
    header: "",
    cell: ({row}) => row.index + 1, // 1부터 시작
  },
  columnHelper.accessor("title", {
    header: "Title",
    cell: ({getValue}) => (
      <span className="text-base truncate block">
        {getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("title_en", {
    header: "Title(EN)",
    cell: ({getValue}) => (
      <span className="text-base truncate block">
        {getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("description", {
    header: "Description",
    cell: ({getValue}) => {
      const value = (getValue() as string | null | undefined)?.trim();
      return (
        <span className={clsx('block w-full truncate', value ? '' : 'pl-9.5')}>
          {value ? value : '-'}
        </span>
      );
    },
  }),
  columnHelper.accessor("created_at", {
    header: "Created At",
    cell: ({getValue}) => formatKoreanDateTime(getValue() as string),
  }),
  // columnHelper.accessor("thumbnail", {
  //   header: "Thumbnail",
  //   cell: ({getValue}) => <ThumbnailCell url={getValue() as string}/>,
  // }),
] as ColumnDef<Project, unknown>[];
