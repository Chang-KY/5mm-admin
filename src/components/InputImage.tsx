import {type ReactNode, useEffect, useRef, useState} from "react";
import React from 'react';
import type {UseFormSetValue, FieldValues, Path} from "react-hook-form";

type InputImageProps<T extends FieldValues> = {
  setValue: UseFormSetValue<T>;
  engTitle: Path<T>;   // form 필드 이름
  append?: (img?: { id?: number, image_url: File | string, sort_order?: number }) => void; // 새 칸 추가용
  isLast?: boolean;    // 마지막 필드인지 여부
  error?: string;
  children: ReactNode;
  multiple?: boolean;
  defaultValue?: string | File | { id?: number; image_url: string | File }; // 서버에서 가져온 초기값 (썸네일, 이미지 url)
};

const InputImage = <T extends FieldValues>({
                                             setValue,
                                             engTitle,
                                             append,
                                             error,
                                             defaultValue,
                                             multiple,
                                             children,
                                           }: InputImageProps<T>) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const handleClick = () => fileInputRef.current?.click();

  const handleFiles = (files: File[]) => {
    if (!files.length) return;

    // 1) 현재 칸엔 첫 번째 파일
    const [first, ...rest] = files;
    const firstUrl = URL.createObjectURL(first);
    // 이전 URL 정리
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = firstUrl;
    setPreview(firstUrl);

    setValue(engTitle, first as never, {shouldDirty: true, shouldValidate: true, shouldTouch: true});

    // 2) 나머지는 새 칸에 append
    if (append && rest.length > 0) {
      rest.forEach((f) => append({image_url: f}));
    }

    // 3) “맨 끝에 빈 칸 하나 더” 유지하고 싶다면 (선택)
    // if (isLast && append) append();

    // 동일한 파일을 다시 선택 가능하게 input 리셋
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fl = e.target.files;
    if (!fl) return;
    // multiple 여부와 상관 없이 공통 함수 사용
    handleFiles(Array.from(fl));
  };

  // 드래그&드롭 지원
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const fl = e.dataTransfer.files;
    if (!fl || !fl.length) return;
    handleFiles(Array.from(fl));
  };

  useEffect(() => {
    let value: unknown = defaultValue;
    if (defaultValue && typeof defaultValue === "object" && "image_url" in defaultValue) {
      value = (defaultValue).image_url;
    }
    if (!value) return;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      objectUrlRef.current = url;
      setPreview(url);
      setValue(engTitle, value as never, {shouldValidate: true, shouldDirty: true});
      return () => {
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
      };
    }

    if (typeof value === "string") {
      setPreview(value);
      setValue(engTitle, value as never, {shouldValidate: true});
    }
  }, [defaultValue, engTitle, setValue]);

  return (
    <div className="mt-2 sm:col-span-2 sm:mt-0 relative">
      <div
        onClick={handleClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className="border-2 border-dashed border-black min-w-60 w-60 max-w-60 min-h-72 h-72 max-h-72
                   flex items-center justify-center cursor-pointer hover:bg-blue-50 overflow-hidden"
        title={multiple ? "클릭 또는 드래그&드롭으로 여러 이미지를 추가" : "클릭하여 이미지 선택"}
      >
        {preview ? (
          <div className="relative size-full" title="이미지를 변경하려면 클릭하세요.">
            <img src={preview} alt={`${String(engTitle)} preview`} className="w-full h-full object-cover"/>
          </div>
        ) : (
          <span className="text-2xl text-gray-500">{multiple ? "＋" :
            <span className='flex flex-col items-center justify-center'>＋<span
              className='text-xs'>(썸네일은 한장입니다)</span></span>}</span>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        multiple={multiple}
      />
      {children}
      {error && (<p className="text-sm text-red-500 mt-1">{error}</p>)}
    </div>
  );
};


export default InputImage;