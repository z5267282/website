import { Outlet } from "react-router-dom";

export default function PanelLayout() {
  return (
    <main className="bg-white mx-auto max-w-1/2 p-[25px] border-x-[1.25px] border-black">
      <Outlet />
    </main>
  );
}
