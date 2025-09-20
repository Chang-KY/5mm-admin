import {Outlet} from "react-router-dom";
import Aside from "@/components/layout/Aside.tsx";
import Header from "@/components/layout/Header.tsx";

const Start = () => {
  return (
    <div className="flex min-h-screen">
      <div className='md:block hidden'>
        <Aside/>
      </div>
      <div className='md:hidden block'>
        <Header/>
      </div>
      <main
        className="w-full md:w-[calc(100%-5rem)] md:h-full h-[calc(100%-3.5rem)] pt-14 md:pt-0 md:ml-20 ml-0 flex-1 overflow-y-auto">
        <Outlet/>
      </main>
    </div>
  );
};

export default Start;