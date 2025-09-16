import {Outlet} from "react-router-dom";
import Aside from "@/components/layout/Aside.tsx";

const Start = () => {
  return (
    <div className="flex min-h-screen">
      <Aside/>
      <main className="w-[calc(100%-5rem)] ml-20 flex-1 overflow-y-auto">
        <Outlet/>
      </main>
    </div>
  );
};

export default Start;