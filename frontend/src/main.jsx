import { ViteReactSSG } from "vite-react-ssg";

import "./App.css";

import { routes } from "./App";

export const createRoot = ViteReactSSG({
  routes,
  basename: import.meta.env.BASE_URL,
});
