import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Notifications from "./Notifications";

const Layout = ({ children }) => {
  const sidebarOpen = useSelector((state) => state.dashboard?.sidebarOpen ?? true);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-[1920px] mx-auto">{children}</div>
        </main>
      </div>

      {/* Notifications */}
      <Notifications />
    </div>
  );
};

export default Layout;
