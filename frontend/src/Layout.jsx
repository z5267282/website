import { Outlet } from "react-router-dom";

import NavBar from "./NavBar";

export default function Layout() {
  return (
    <div className="grid grid-rows-[var(--nav-height)_1fr] min-h-dvh">
      <NavBar />
      <Outlet />
    </div>
  );
}
