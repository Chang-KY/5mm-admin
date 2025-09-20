import {useEffect} from 'react';
import {useForm, useFieldArray} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import clsx from 'clsx';
import {FiPlus} from 'react-icons/fi';
import ProgressScreen from '@/components/ProgressScreen';
import {useGetContact} from "@/hooks/contact/useGetContact.ts";
import {z} from 'zod';
import {contactSchema} from "@/constants/contactSchema.ts";
import {useSaveContact} from "@/hooks/contact/useSaveContact.ts";
import PageTitle from "@/components/PageTitle.tsx";
import {useNavigate} from "react-router-dom";

type FormValues = z.infer<typeof contactSchema>;

export default function EditContact() {
  const {register, control, handleSubmit, reset, watch, formState: {errors, isDirty}} =
    useForm<FormValues>({resolver: zodResolver(contactSchema)});
  const {fields, append, remove} = useFieldArray({
    control,
    name: "slogans",
  });
  const infoQuery = useGetContact();
  const navigate = useNavigate();
  const saveMutation = useSaveContact();
  const w = watch();

  const buildDefaultValues = (d: {
    slogans: string[],
    director_first: string,
    director_last: string,
    postal_code: string,
    addr_line1: string,
    addr_line2: string,
    addr_country_en: string,
    addr_ko: string,
    email: string,
    tel: string,
    fax: string
  }) => ({
    slogans: d?.slogans?.map((s: string) => ({value: s})) ?? [{value: ''}],
    director_first: d?.director_first ?? '',
    director_last: d?.director_last ?? '',
    postal_code: d?.postal_code ?? '',
    addr_line1: d?.addr_line1 ?? '',
    addr_line2: d?.addr_line2 ?? '',
    addr_country_en: d?.addr_country_en ?? '',
    addr_ko: d?.addr_ko ?? '',
    email: d?.email ?? '',
    tel: d?.tel ?? '',
    fax: d?.fax ?? '',
  });

  const onSubmit = (values: FormValues) => {
    saveMutation.mutate(values, {
      onSuccess: () => {
        alert("변경 성공");
        navigate("/contact");
      }
    });
  };

  useEffect(() => {
    if (infoQuery.data) reset(buildDefaultValues(infoQuery.data));
  }, [infoQuery.data, reset]);

  return (
    <div className="">
      {(infoQuery.isLoading || saveMutation.isPending) && (
        <ProgressScreen mention={infoQuery.isLoading ? 'Contact 데이터를 불러오는 중…' : '데이터를 새롭게 저장 중…'}/>
      )}
      <PageTitle title="Contact Edit">
        <button
          type='button'
          className="btn-black"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
      </PageTitle>

      <div className='p-3'>
        {/* Slogans */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium mb-1">- Slogans</label>
            <button
              type="button"
              className="p-2 size-9 flex items-center justify-center border hover:bg-gray-50"
              onClick={() => append({value: ""})}
              title="문구 추가"
            >
              <FiPlus/>
            </button>
          </div>

          <ul className="space-y-2">
            {fields.map((f, idx) => (
              <li key={f.id} className="flex items-center gap-2">
                <input
                  className={clsx(
                    "flex-1 px-3 py-2 border text-black focus:outline-none focus:ring-2",
                    errors.slogans?.[idx]?.value && "border-red-500"
                  )}
                  {...register(`slogans.${idx}.value` as const)}
                  placeholder={`문구 #${idx + 1}`}
                  defaultValue={f.value}
                />
                <button
                  type="button"
                  className="p-2 size-9 flex items-center justify-center border border-red-500 text-red-500 hover:bg-red-50"
                  onClick={() => remove(idx)}   // <-- 여기!
                  title="삭제"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          {errors.slogans && <p className="text-sm text-red-600 mt-2">{errors.slogans.message as string}</p>}
        </section>

        {/* Director */}
        <section className="mb-8 grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">- Director First</label>
            <input
              className="w-full px-3 py-2 border text-black focus:outline-none focus:ring-2" {...register('director_first')} />
            {errors.director_first && <p className="text-sm text-red-600">{errors.director_first.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">- Director Last</label>
            <input
              className="w-full px-3 py-2 border text-black focus:outline-none focus:ring-2" {...register('director_last')} />
            {errors.director_last && <p className="text-sm text-red-600">{errors.director_last.message}</p>}
          </div>
        </section>

        {/* Address */}
        <section className="mb-8 grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">- Postal Code</label>
            <input
              className="w-full px-3 py-2 border text-black focus:outline-none focus:ring-2" {...register('postal_code')} />
            {errors.postal_code && <p className="text-sm text-red-600">{errors.postal_code.message}</p>}
          </div>
          <div/>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">- Address Line 1 (EN)</label>
            <input
              className="w-full px-3 py-2 border text-black focus:outline-none focus:ring-2" {...register('addr_line1')} />
            {errors.addr_line1 && <p className="text-sm text-red-600">{errors.addr_line1.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">- Address Line 2 (EN)</label>
            <input
              className="w-full px-3 py-2 border text-black focus:outline-none focus:ring-2" {...register('addr_line2')} />
            {errors.addr_line2 && <p className="text-sm text-red-600">{errors.addr_line2.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">- Country (EN)</label>
            <input
              className="w-full px-3 py-2 border text-black focus:outline-none focus:ring-2" {...register('addr_country_en')} />
            {errors.addr_country_en && <p className="text-sm text-red-600">{errors.addr_country_en.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">- Address (KO)</label>
            <input
              className="w-full px-3 py-2 border text-black focus:outline-none focus:ring-2" {...register('addr_ko')} />
            {errors.addr_ko && <p className="text-sm text-red-600">{errors.addr_ko.message}</p>}
          </div>
        </section>

        {/* Contact */}
        <section className="mb-8 grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">- E-mail</label>
            <input
              className="w-full px-3 py-2 border text-black focus:outline-none focus:ring-2" {...register('email')} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">- Tel</label>
            <input
              className="w-full px-3 py-2 border text-black focus:outline-none focus:ring-2" {...register('tel')} />
            {errors.tel && <p className="text-sm text-red-600">{errors.tel.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">- Fax</label>
            <input
              className="w-full px-3 py-2 border text-black focus:outline-none focus:ring-2" {...register('fax')} />
            {errors.fax && <p className="text-sm text-red-600">{errors.fax.message}</p>}
          </div>
        </section>

        <p className='font-bold text-left'>변경 후 2분 후 고객페이지에 반영됩니다.</p>
        {/* 액션바 */}
        <div className="sticky bottom-4 flex items-center justify-end gap-3">
          <div className='w-full mt-4 flex gap-3 items-center justify-end'>
            <button
              type="button"
              className="btn-underline"
              onClick={() => {
                if (infoQuery.data) reset(buildDefaultValues(infoQuery.data));
              }}
              disabled={!isDirty || saveMutation.isPending}
            >
              Undo
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={saveMutation.isPending}
              className="btn-black"
              title="저장"
            >
              {saveMutation.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {/* 오른쪽/하단 미리보기(간단) */}
        <div className="mt-10 border p-4">
          <h3 className="font-semibold mb-2">미리보기 (Public)</h3>
          <div className="text-sm text-gray-700">
            <div className="mb-3">
              <div className="text-xs uppercase font-semibold tracking-[0.18em] text-gray-500">Director</div>
              <div className="text-lg">{w.director_first} {w.director_last}</div>
            </div>
            <div className="mb-3">
              <div className="text-xs uppercase font-semibold tracking-[0.18em] text-gray-500">Address</div>
              <div>{w.postal_code}</div>
              <div>{w.addr_line1}</div>
              <div>{w.addr_line2}</div>
              <div>{w.addr_country_en}</div>
              <div>{w.addr_ko}</div>
            </div>
            <div className="mb-3">
              <div className="text-xs uppercase font-semibold tracking-[0.18em] text-gray-500">Contact</div>
              <div>{w.email} / {w.tel} / {w.fax}</div>
            </div>
            <div>
              <div className="text-xs uppercase font-semibold tracking-[0.18em] text-gray-500">Slogans</div>
              <ul className="list-disc pl-5">
                {w.slogans?.map((s, i) => <li key={i}>{s.value}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
