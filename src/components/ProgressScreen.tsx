import Loading from "@/components/loading/Loading.tsx";

const ProgressScreen = ({mention, subMention}: { mention: string, subMention?: string }) => {
  return (
    <div className="fixed inset-0 size-full flex flex-col items-center justify-center z-50">
      <div
        className="flex flex-col items-center justify-center px-5 py-10 bg-black shadow-2xl border border-white">
        <Loading/>
        <p className="text-white mt-2">{mention}</p>
        {subMention && <p className='text-gray-200'>{subMention}</p>}
      </div>
    </div>
  );
};

export default ProgressScreen;