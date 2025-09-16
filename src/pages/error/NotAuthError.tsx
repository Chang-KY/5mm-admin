const NotAuthError = () => {
  return (
    <div className='size-full flex items-center justify-center'>
      <p className='font-bold text-red-500'>인증되지 않은 유저입니다.</p>
    </div>
  );
};

export default NotAuthError;