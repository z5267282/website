import { Outlet } from "react-router-dom";

import NavBar from "./NavBar";

export default function Layout() {
  return (
    <div className="grid grid-rows-[var(--nav-height)_1fr] min-h-dvh">
      <NavBar />
      <main className="min-w-0 flex flex-col items-center bg-white mx-auto w-full px-[25px] pb-[25px] md:w-[60%] md:border-x-[1.25px] md:border-black">
        <Outlet />
      </main>
    </div>
  );
}
