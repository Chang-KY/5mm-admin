import {FiLogOut, FiMail} from "react-icons/fi";
import {MdDashboard} from "react-icons/md";
import {useLocation, useNavigate} from "react-router-dom";
import {useState} from "react";
import clsx from "clsx";

import {supabase} from "@/lib/supabase";
import {queryClient} from "@/lib/queryClient";
import ProgressScreen from "@/components/ProgressScreen";
import Modal from "@/components/Modal";

/**
 * Top Header (fixed)
 * - 좌: 로고/브랜드
 * - 중: 내비게이션 (Dashboard / Contact)
 * - 우: 로그아웃
 * 반응형:
 * - 모바일: 아이콘만
 * - md 이상: 아이콘 + 텍스트 라벨
 */
const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [signingOut, setSigningOut] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleLogout = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const {error} = await supabase.auth.signOut();
      if (error) throw error;
      queryClient.clear();
      navigate("/login", {replace: true});
    } catch (e) {
      console.error("로그아웃 실패:", e);
      setSigningOut(false);
    }
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <>
      {signingOut && (
        <ProgressScreen mention="로그아웃 중입니다. 잠시만 기다려주세요..."/>
      )}

      {/* iOS notch 안전영역 고려: pt-[env(safe-area-inset-top)] */}
      <header
        className="
          fixed top-0 inset-x-0 z-50
          bg-black text-white backdrop-blur supports-[backdrop-filter]:backdrop-blur
          border-b border-white/10
          pt-[env(safe-area-inset-top)]
        "
        role="banner"
      >
        <div className="mx-auto max-w-screen-2xl h-14 flex items-center justify-between px-3 sm:px-4">
          {/* Left: Brand / Home */}
          <div className="size-10 bg-white/10 ring-1 ring-white/15 flex items-center justify-center">
            {/* 간단한 마크 */}
            <span className="text-xs font-semibold">5mm</span>
          </div>

          {/* Center: Nav */}
          <nav className="">
            <ul className="flex items-center gap-1 sm:gap-2">
              <li>
                <button
                  onClick={() => navigate("/dashboard")}
                  className={clsx(
                    "px-3 size-10 flex items-center gap-2 transition",
                    "hover:bg-white/10",
                    isActive("/dashboard") && "bg-white/10 ring-1 ring-white/15"
                  )}
                  aria-label="Dashboard"
                  title="Dashboard"
                >
                  <MdDashboard size={18}/>
                  <span className="hidden md:inline text-sm">Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/contact")}
                  className={clsx(
                    "px-3 size-10 flex items-center gap-2 transition",
                    "hover:bg-white/10",
                    isActive("/contact") && "bg-white/10 ring-1 ring-white/15"
                  )}
                  aria-label="Contact"
                  title="Contact"
                >
                  <FiMail size={18}/>
                  <span className="hidden md:inline text-sm">Contact</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setConfirmOpen(true)}
                  className="px-3 h-10 rounded-lg flex items-center gap-2 transition hover:bg-white/10 disabled:opacity-50"
                  aria-label="로그아웃"
                  title="로그아웃"
                  disabled={signingOut}
                >
                  <FiLogOut size={18} className="text-red-200"/>
                  <span className="hidden md:inline text-sm text-red-200">
                Logout
              </span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Logout Modal */}
      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <div className="w-80">
          <h3 className="text-base font-semibold">로그아웃 하시겠습니까?</h3>
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              className="btn-underline"
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </button>
            <button type="button" className="btn-red" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Header;
