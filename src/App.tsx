import {Outlet} from "react-router-dom";
import {ToastContainer, Slide} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function App() {

  return (
    <div className="size-full">
      <Outlet/>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition={Slide}
        toastClassName='!rounded-none'
        theme="dark"
      />
    </div>
  )
}

export default App
