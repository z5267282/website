import "react";

import "./App.css";

import NavBar from "./NavBar";

import AboutMe from "./pages/AboutMe";
import BlogHub from "./pages/BlogHub";
import ProjectHub from "./pages/ProjectHub";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import LanguageHub from "./pages/LanguageHub";
import Blog from "./pages/Blog";

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <div className="w-screen bg-[#fff4e2] overflow-auto min-h-[calc(100vh-35px)] mt-[35px]">
        <div className="bg-white ml-0 mr-0 md:ml-[10vw] md:mr-[10vw] min-h-[calc(100vh-35px)]">
          <Routes>
            <Route path="/">
              <Route index element={<AboutMe />} />
              <Route path="projects" element={<ProjectHub />} />
              <Route path="blogs">
                <Route index element={<BlogHub />} />
                <Route path=":lang">
                  <Route index element={<LanguageHub />} />
                  <Route path=":title" element={<Blog />} />
                </Route>
              </Route>
              <Route path="*" element={<div>not found :&#40;</div>} />
            </Route>
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
