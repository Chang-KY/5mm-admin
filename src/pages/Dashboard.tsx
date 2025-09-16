import PageTitle from "@/components/PageTitle.tsx";
import Table from "@/components/Table.tsx";
import {columns} from "@/constants/projectColumns.tsx";
import {useNavigate} from "react-router-dom";
import {useProjects} from "@/hooks/useGetProjects.ts";
import ProgressScreen from "@/components/ProgressScreen.tsx";
import ScrollToPage from "@/components/ScrollToPage.tsx";
import {useState} from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const {data: projects, isLoading, error} = useProjects();
  const [searchTitle, setSearchTitle] = useState("");
  const filteredProjects = (projects ?? []).filter((p) => {
    const query = searchTitle.toLowerCase();
    return (
      p.title.toLowerCase().includes(query) ||
      (p.title_en?.toLowerCase().includes(query) ?? false)
    );
  });


  if (isLoading) return (<ProgressScreen mention='Dashboard 데이터 불러오는 중...'/>);
  if (error) return <p>에러 발생: {(error as Error).message}</p>;
  return (
    <div className=''>
      <PageTitle title="Dashboard">
        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={() => navigate('/reorder-projects')}
            className="btn-black">
            Reorder Projects
          </button>
          <button
            type='button'
            className="btn-black"
            onClick={() => navigate("/add-project")}
          >
            Project Add
          </button>
        </div>
      </PageTitle>

      <div>
        <div className='px-3 flex items-center justify-between'>
          <div>
            <label className="block text-sm font-medium text-gray-900">
              고객 페이지 노출 순서
            </label>
            <p className="mt-1 text-xs text-gray-500">
              숫자가 작을수록 먼저 표시됩니다. (1이 최상단)
            </p>
          </div>
          <div className='flex items-center justify-between'>
            <label className='min-w-28 font-bold'>Search Title: </label>
            <input
              id="title"
              type="text"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="min-w-[170px] max-w-[170px] w-[170px] h-14 px-3 py-2 border text-black border-black focus:outline-none focus:ring-2"
            />
          </div>
        </div>
        <Table columns={columns} data={filteredProjects}/>
      </div>
      <ScrollToPage/>
    </div>
  );
};

export default Dashboard;