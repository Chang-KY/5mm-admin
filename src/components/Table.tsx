import {type ColumnDef, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import {useNavigate} from "react-router-dom";

interface TableProps<TData extends { id: string | number; title: string }> {
  data: TData[];
  columns: ColumnDef<TData>[];
}

const Table = <TData extends { id: string | number; title: string }>({
                                                                       data,
                                                                       columns,
                                                                     }: TableProps<TData>) => {
  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const navigate = useNavigate();
  return (
    <div className="">
      <div className="mt-8 flow-root">
        <div className="overflow-x-hidden">
          <div className="inline-block min-w-full pt-2 align-middle">
            <table className="relativrelative w-full table-fixed divide-y divide-black">
              <colgroup>
                {/* 번호 */}
                <col style={{width: 48}}/>
                {/* Title */}
                <col style={{width: '30%'}}/>
                {/* Title(EN) */}
                <col style={{width: '30%'}}/>
                {/* Description (남는 폭) */}
                <col/>
                {/* Created At */}
                <col style={{width: '16ch'}}/>
              </colgroup>
              <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
              {table.getRowModel().rows.map((row) => {
                  return (
                    <tr
                      key={row.id}
                      className="group cursor-pointer
                                odd:bg-gray-50 even:bg-white
                                hover:bg-indigo-50 transition-colors"
                      title={`클릭 하면 -${row.original.title}- 디테일 페이지에 이동`}
                      onClick={() => navigate(`/detail-project/${row.original.id}`)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-3 py-5 text-sm whitespace-nowrap overflow-hidden text-ellipsis text-gray-500 transition-colors"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  )
                }
              )}
              </tbody>
            </table>
          </div>
          <p className='text-xs text-right w-full px-2 py-0.5 font-bold'>
            - 5MM Studio Project Table -
          </p>
        </div>
      </div>
    </div>
  );
};

export default Table;