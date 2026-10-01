import { Outlet } from "react-router-dom";

import NavBar from "./NavBar";

export default function Layout() {
  return (
    <>
      <NavBar />
      {/* <div className="w-screen bg-[#fff4e2] overflow-auto min-h-[calc(100vh-35px)] mt-[35px]">
        <div className="bg-white ml-0 mr-0 md:ml-[10vw] md:mr-[10vw] min-h-[calc(100vh-35px)]">
        </div>
      </div> */}
      <Outlet />
    </>
  );
}
