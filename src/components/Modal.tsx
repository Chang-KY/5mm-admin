import {type ReactNode, useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import clsx from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

const Modal = ({isOpen, onClose, children, className}: ModalProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const modalRoot = document.getElementById('modal');

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isOpen) {
      setIsVisible(true);
      timer = setTimeout(() => {
        setIsMounted(true);
      }, 10);
    } else {
      setIsMounted(false);
      timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  // ESC 로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isOpen, onClose]);

  if (!isVisible) return null;
  if (!modalRoot) return null;
  return createPortal(
    <div
      className={clsx(
        'fixed inset-0 z-50 flex justify-center items-center transition-transform duration-300',
        isMounted ? 'translate-y-0' : 'translate-y-full',
      )}
      onMouseDown={onClose}
      onClick={onClose}
    >
      <div role="dialog"
           aria-modal="true"
           onMouseDown={(e) => e.stopPropagation()}
           onClick={(e) => e.stopPropagation()}
           className={clsx(`bg-white border-black border p-2 text-black relative transition duration-300`, className)}>
        {children}
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;
