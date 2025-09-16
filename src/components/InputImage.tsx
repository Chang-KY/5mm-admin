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
                                             isLast,
                                             error,
                                             defaultValue,
                                             multiple,
                                             children,
                                           }: InputImageProps<T>) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const handleClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);

    setValue(engTitle, file as never, {shouldDirty: true, shouldValidate: true, shouldTouch: true});

    if (isLast && append) append();
  };

  useEffect(() => {
    let value: unknown = defaultValue;

    // defaultValue가 { image_url: ... } 형태인 경우 꺼내기
    if (defaultValue && typeof defaultValue === "object" && "image_url" in defaultValue) {
      value = defaultValue.image_url;
    }

    // 값이 없으면 패스
    if (!value) return;

    // 이전 objectURL 정리
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    // File이면 objectURL로 프리뷰
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      objectUrlRef.current = url;
      setPreview(url);

      // RHF에도 값 세팅 (등록/검증 반영)
      setValue(engTitle, value as never, {shouldValidate: true, shouldDirty: true});

      // cleanup
      return () => {
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
      };
    }

    // 문자열(URL)인 경우 그대로 프리뷰
    if (typeof value === "string") {
      setPreview(value);
      setValue(engTitle, value as never, {shouldValidate: true});
    }
  }, [defaultValue, engTitle, setValue]);

  return (
    <div className="mt-2 sm:col-span-2 sm:mt-0 relative">
      <div
        onClick={handleClick}
        className="border-2 border-dashed border-black min-w-60 w-60 max-w-60 min-h-72 h-72 max-h-72 flex items-center justify-center cursor-pointer hover:bg-blue-50 overflow-hidden"
      >
        {preview ? (
          <div className="relative size-full" title='이미지를 변경하시려면 클릭하세요.'>
            <img
              src={preview}
              alt={`${engTitle} preview`}
              className="w-full h-full object-cover"
            />
            {/*<button*/}
            {/*  type="button"*/}
            {/*  onClick={() => {*/}
            {/*    setPreview(null);*/}
            {/*    setValue(engTitle, "" as never);*/}
            {/*  }}*/}
            {/*  className="absolute top-2 right-2 bg-white border hover:bg-red-600 hover:text-white text-black text-sm px-3 py-1"*/}
            {/*  title='클릭하시면 이미지가 지워지고 다시 넣을수 있게 됩니다.'*/}
            {/*>*/}
            {/*  Clear*/}
            {/*</button>*/}

          </div>
        ) : (
          <span className="text-2xl text-gray-500">+</span>
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