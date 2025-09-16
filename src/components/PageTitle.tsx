import {type ReactNode} from "react";

const PageTitle = ({title, children}: { title: string, children?: ReactNode }) => {
  return (
    <div className='flex items-center justify-between py-2 px-3'>
      <h2 className='text-2lg'>・{title}</h2>
      <div className='min-w-40 w-[22rem] text-right'>
        {children}
      </div>
    </div>
  );
};

export default PageTitle;