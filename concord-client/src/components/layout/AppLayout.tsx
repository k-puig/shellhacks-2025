import React from "react";
import { Outlet } from "react-router";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";

import ServerSidebar from "@/components/layout/ServerSidebar";
import ChannelSidebar from "@/components/layout/ChannelSidebar";
import UserPanel from "@/components/layout/UserPanel";
import MemberList from "@/components/layout/MemberList";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const AppLayout: React.FC = () => {
  const { user, isLoading } = useAuthStore();
  const { showMemberList, sidebarCollapsed, isMobile } = useUiStore();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // if (!user) {
  //   return (
  //     <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
  //       <div className="text-red-400">Authentication required</div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900 text-white">
      {/* Server List Sidebar - Always visible on desktop, overlay on mobile */}
      <div
        className={`${
          isMobile
            ? "fixed left-0 top-0 z-50 h-full w-[72px] transform transition-transform duration-200 ease-in-out"
            : "relative w-[72px]"
        } bg-gray-900 flex-shrink-0`}
      >
        <ServerSidebar />
      </div>

      {/* Channel Sidebar - Collapsible */}
      <div
      // className={`${
      //   sidebarCollapsed
      //     ? isMobile
      //       ? "hidden"
      //       : "w-0 overflow-hidden"
      //     : isMobile
      //       ? "fixed left-[72px] top-0 z-40 h-full w-60"
      //       : "w-60"
      // } bg-gray-800 flex flex-col flex-shrink-0 transition-all duration-200 ease-in-out`}
      >
        <div className="flex-1 overflow-hidden">
          <ChannelSidebar />
          <UserPanel />
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 ${
          isMobile && !sidebarCollapsed ? "ml-60" : ""
        } transition-all duration-200 ease-in-out`}
      >
        <Outlet />
      </div>

      {/* Member List - Conditionally shown */}
      {showMemberList && !isMobile && (
        <div className="w-60 bg-gray-800 flex-shrink-0 border-l border-gray-700">
          <MemberList />
        </div>
      )}

      {/* Mobile overlay for sidebars */}
      {isMobile && !sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => useUiStore.getState().toggleSidebar()}
        />
      )}
    </div>
  );
};

export default AppLayout;
