import {FaArrowUp, FaArrowDown} from "react-icons/fa";
import {useEffect, useState} from "react";

const ScrollToPage = () => {
  const [isTop, setIsTop] = useState(true);
  const [isBottom, setIsBottom] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({top: 0, behavior: "smooth"});
  };

  const scrollToBottom = () => {
    const bottom =
      document.documentElement.scrollHeight || document.body.scrollHeight;

    window.scrollTo({top: bottom, behavior: "smooth"});
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      const scrollHeight = document.documentElement.scrollHeight;

      setIsTop(scrollTop <= 0); // 맨 위
      setIsBottom(scrollTop + clientHeight >= scrollHeight - 5); // 맨 밑
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // 초기 체크

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed bottom-20 right-3 flex flex-col gap-3">
      {/* 위로가기 */}
      {!isTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="p-2 bg-black text-white shadow hover:bg-gray-800 transition cursor-pointer"
          title="위로가기"
        >
          <FaArrowUp size={10}/>
        </button>
      )}

      {/* 아래로가기 */}
      {!isBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="p-2 bg-black text-white shadow hover:bg-gray-800 transition cursor-pointer"
          title="아래로가기"
        >
          <FaArrowDown size={10}/>
        </button>
      )}
    </div>
  );
};

export default ScrollToPage;