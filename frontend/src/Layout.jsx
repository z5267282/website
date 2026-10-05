import { Outlet } from "react-router-dom";

import NavBar from "./NavBar";

export default function Layout() {
  return (
    <div className="grid grid-rows-[var(--nav-height)_1fr] min-h-dvh">
      <NavBar />
      <main className="bg-white mx-auto w-[60%] p-[25px] border-x-[1.25px] border-black">
        <Outlet />
      </main>
    </div>
  );
}
