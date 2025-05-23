// src/components/Layout.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Layout/Sidebar";
import Header from "./Layout/Header";

const Layout = () => {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen(prev => !prev);

  return (
    <div className="flex h-screen">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      <main className="flex-1 overflow-y-auto bg-background p-6">
        <Header />
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
