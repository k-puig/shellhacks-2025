import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";

import ServerSidebar from "@/components/layout/ServerSidebar";
import ChannelSidebar from "@/components/layout/ChannelSidebar";
import UserPanel from "@/components/layout/UserPanel";
import MemberList from "@/components/layout/MemberList";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const AppLayout: React.FC = () => {
  const { isLoading } = useAuthStore();
  const {
    showMemberList,
    sidebarCollapsed,
    shouldShowChannelSidebar,
    updateSidebarVisibility,
  } = useUiStore();
  const location = useLocation();

  // Update sidebar visibility when route changes
  useEffect(() => {
    updateSidebarVisibility(location.pathname);
  }, [location.pathname, updateSidebarVisibility]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-concord-primary">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Uncomment if auth is required
  // if (!user) {
  //   return (
  //     <div className="h-screen w-screen flex items-center justify-center bg-concord-primary">
  //       <div className="text-red-400">Authentication required</div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex h-screen overflow-hidden bg-concord-primary text-concord-primary">
      {/* Server List Sidebar - Always visible on desktop, overlay on mobile */}
      <div className="relative w-[72px] sidebar-primary flex-shrink-0">
        <ServerSidebar />
      </div>

      {/* Channel Sidebar - Only shown when in a server context and not collapsed */}
      {shouldShowChannelSidebar && (
        <div
          className={`${
            sidebarCollapsed
              ? "w-0" // Collapse by setting width to 0
              : "w-60" // Default width
          }
          flex-col flex-shrink-0 sidebar-secondary transition-all duration-200 ease-in-out overflow-hidden`}
        >
          <div className="flex flex-col h-full">
            <ChannelSidebar />
            <UserPanel />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 ${
          !sidebarCollapsed ? "" : ""
        } transition-all duration-200 ease-in-out bg-concord-secondary`}
      >
        <Outlet />
      </div>

      {/* Member List - Only shown when in a channel and member list is enabled */}
      {showMemberList && shouldShowChannelSidebar && (
        <div className="flex-0 sidebar-secondary order-l border-sidebar">
          <MemberList />
        </div>
      )}
    </div>
  );
};

export default AppLayout;
