import {useNavigate} from "react-router-dom";

const ErrorNotProject = () => {
  const navigate = useNavigate();

  return (
    <div className='size-full flex flex-col justify-center items-center space-y-2'>
      <p className='text-red-500 font-bold'>해당하는 프로젝트는 존재하지 않습니다.</p>
      <button className='btn-red'
              onClick={() => navigate(-1)}
              type='button'
      >Back
      </button>
    </div>
  );
};

export default ErrorNotProject;