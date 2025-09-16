import './loading.css';
import clsx from "clsx";

const Loading = ({color = 'white'}: { color?: 'white' | 'black' }) => {
  return (
    <div>
      <span className={clsx(`loader border-5`, color === 'white' ? 'border-white' : 'border-black')}></span>
    </div>
  );
};

export default Loading;