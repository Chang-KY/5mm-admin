import {FiLogOut, FiMail} from "react-icons/fi";
import {MdDashboard} from "react-icons/md";
import {useLocation, useNavigate} from "react-router-dom";
import {useState} from "react";
import {supabase} from "@/lib/supabase.ts";
import ProgressScreen from "@/components/ProgressScreen.tsx";
import {queryClient} from "@/lib/queryClient.ts";
import clsx from "clsx";
import Modal from "@/components/Modal.tsx";

const Aside = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [signingOut, setSigningOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const {error} = await supabase.auth.signOut();
      if (error) throw error;

      // (선택) react-query 캐시를 쓰고 있다면 여기서 초기화해도 됩니다.
      queryClient.clear();

      navigate("/login", {replace: true});
    } catch (e) {
      console.error("로그아웃 실패:", e);
      setSigningOut(false);
    }
  };

  return (
    <aside className='w-20 bg-black text-white fixed h-full flex flex-col justify-between items-center py-4'>

      {signingOut && <ProgressScreen mention="로그아웃 중입니다. 잠시만 기다려주세요..."/>}

      <div className="flex flex-col">
        <button className={clsx(
          "mb-4 p-2 flex items-center justify-center flex-col gap-1 rounded hover:bg-gray-700 cursor-pointer",
          location.pathname.startsWith("/dashboard") && "bg-gray-700"
        )}
                onClick={() => navigate('/dashboard')}
                title="누르시면 Dashboard 페이지로 이동합니다.">
          <MdDashboard size={20}/>
          {/*<span className='text-xs'>Dashboard</span>*/}
        </button>
        <button className={clsx(
          "mb-4 p-2 flex items-center justify-center flex-col gap-1 rounded hover:bg-gray-700 cursor-pointer",
          location.pathname.startsWith("/contact") && "bg-gray-700"
        )}
                onClick={() => navigate('/contact')}
                title="누르시면 Contact 페이지로 이동합니다.">
          <FiMail size={20}/>
          {/*<span className='text-xs'>Contact</span>*/}
        </button>
      </div>
      <button
        className="mb-4 hover:bg-gray-700 p-2 disabled:opacity-50 rounded flex items-center justify-center flex-col gap-1 cursor-pointer"
        title="누르시면 로그아웃 됩니다."
        aria-label="로그아웃"
        onClick={() => setIsOpen(true)}
        disabled={signingOut}
      >
        <FiLogOut size={20}/>
        {/*<span className='text-xs'>Logout</span>*/}
      </button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className='w-96 h-16 flex flex-col justify-between'>
          <h3>로그아웃을 하시겠습니까?</h3>
        </div>
        <div className="mt-6 w-full flex items-center justify-end">
          <div className="w-40 gap-x-6 flex items-center justify-end">
            <button type="button" className="btn-underline" onClick={() => setIsOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-red"
              onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </Modal>
    </aside>
  );
};

export default Aside;