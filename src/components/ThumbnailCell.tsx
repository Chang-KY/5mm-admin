import {useRef, useState} from "react";
import {createPortal} from "react-dom";

const ThumbnailCell = ({url}: { url: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({top: 0, left: 0});

  return (
    <div
      ref={ref}
      className="relative inline-block"
      onMouseEnter={() => {
        const r = ref.current?.getBoundingClientRect();
        if (r) {
          setPos({top: r.top + window.scrollY, left: r.right + 8});
        }
        setShow(true);
      }}
      onMouseLeave={() => setShow(false)}
    >

      {show &&
        createPortal(
          <div
            className="absolute z-50 rounded-lg bg-white shadow-lg p-2 -left-16"
            style={{top: pos.top, left: pos.left, position: "absolute"}}
          >
            <img src={url} alt="미리보기" className="w-64 h-64 object-contain"/>
          </div>,
          document.body
        )}
      <img src={url} alt="썸네일" className="w-16 h-16 object-cover rounded"/>


    </div>
  );
};

export default ThumbnailCell;
