import {useGetContact} from "@/hooks/contact/useGetContact.ts";
import PageTitle from "@/components/PageTitle.tsx";
import {useNavigate} from "react-router-dom";
import ProgressScreen from "@/components/ProgressScreen.tsx";

const Contact = () => {
  const {data, isLoading, error} = useGetContact();
  const navigate = useNavigate();

  if (isLoading) return <ProgressScreen mention='5MM Studio 데이터 불러오는 중...'/>;
  if (error) return <p className="text-red-500">에러가 발생했습니다.</p>;
  if (!data) return (
    <div className='flex items-center justify-center'>
      <p>데이터가 없습니다.</p>
    </div>
  );
  return (
    <div className="w-full">
      <PageTitle title="Contact">
        <button
          type='button'
          className="btn-black"
          onClick={() => navigate("/edit-contact")}
        >
          Contact Edit
        </button>
      </PageTitle>

      {/* Director */}
      <section className="mb-8 px-3">
        <p className="text-xs uppercase font-semibold tracking-[0.18em] text-foreground/60">
          Director
        </p>
        <h2 className="leading-[1.1] text-xl mt-1">
          {data.director_first} {data.director_last}
        </h2>
      </section>

      <hr className="my-5 border-foreground/10"/>

      {/* Address */}
      <section className="mb-8 px-3">
        <p className="text-xs uppercase font-semibold tracking-[0.18em] text-foreground/60">
          Address
        </p>
        <address className="not-italic text-[15px] leading-7 text-foreground/90 mt-1">
          <div>{data.postal_code}</div>
          <div>{data.addr_line1}</div>
          <div>{data.addr_line2}</div>
          <div>{data.addr_country_en}</div>
          <div>{data.addr_ko}</div>
        </address>
      </section>

      <hr className="my-5 border-foreground/10"/>

      {/* Contact */}
      <section className="mb-8 px-3">
        <p className="text-xs uppercase font-semibold tracking-[0.18em] text-foreground/60">
          Contact
        </p>
        <dl className="gap-3 text-[15px] mt-1">
          <div className="flex ">
            <dt className="text-foreground/60 min-w-20">E-mail:</dt>
            <dd className="font-medium">{data.email}</dd>
          </div>
          <div className="flex ">
            <dt className="text-foreground/60 min-w-20">Tel:</dt>
            <dd className="font-medium">{data.tel}</dd>
          </div>
          <div className="flex ">
            <dt className="text-foreground/60 min-w-20">Fax:</dt>
            <dd className="font-medium">{data.fax}</dd>
          </div>
        </dl>
      </section>

      <hr className="my-5 border-foreground/10"/>

      {/* Slogans */}
      <section className='px-3'>
        <p className="text-xs uppercase font-semibold tracking-[0.18em] text-foreground/60">
          Slogans
          <span className='text-xs text-gray-400 ml-2 font-normal'>(슬로건은 contact 페이지에서 표시됩니다.)</span>
        </p>
        <ul className="list-disc pl-5 text-[15px] leading-7 text-foreground/90 mt-1">
          {data.slogans?.map((s: string, i: number) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Contact;