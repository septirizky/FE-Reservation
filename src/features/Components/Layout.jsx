import { Outlet } from "react-router-dom";


export const Layout = () => {
  return (
    <>
      <div className="flex flex-col max-h-full max-w-screen-md mx-auto bg-gray-100">
        <main className="flex-grow overflow-auto">
          <Outlet />
        </main>
        {/* <Footer /> */}
      </div>
    </>
  );
};
