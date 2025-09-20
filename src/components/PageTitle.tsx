import {type ReactNode} from "react";

const PageTitle = ({title, children}: { title: string; children?: ReactNode }) => {
  return (
    <div
      className="
        px-3 py-2
        flex flex-col gap-2
        md:flex-row md:items-center md:justify-between
      "
    >
      {/* 위(모바일) / 왼쪽(md↑) : 제목 */}
      <h2 className="text-2xl">・{title}</h2>

      {/* 아래(모바일) / 오른쪽(md↑) : 버튼 영역 */}
      <div className="w-full text-right md:w-[22rem] md:min-w-40">
        {children}
      </div>
    </div>
  );
};

export default PageTitle;
