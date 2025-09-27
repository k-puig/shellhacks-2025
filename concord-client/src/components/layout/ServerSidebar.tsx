import React from "react";
import { useNavigate, useParams } from "react-router";
import { Plus, Home, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useServers } from "@/hooks/useServers";
import { useUiStore } from "@/stores/uiStore";
import { useResponsive } from "@/hooks/useResponsive";
import ServerIcon from "@/components/server/ServerIcon";

const ServerSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { instanceId } = useParams();
  const { data: servers, isLoading } = useServers();
  const { openCreateServer, toggleSidebar, setActiveInstance } = useUiStore();
  const { isMobile } = useResponsive();

  const handleServerClick = (serverId: string) => {
    setActiveInstance(serverId);
    navigate(`/channels/${serverId}`);
  };

  const handleHomeClick = () => {
    setActiveInstance(null);
    navigate("/channels/@me");
  };

  const handleMenuToggle = () => {
    toggleSidebar();
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center py-3 space-y-2 h-full bg-gray-900 border-r border-gray-800">
        {/* Mobile menu toggle */}
        {isMobile && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-2xl hover:rounded-xl bg-gray-700 hover:bg-gray-600 text-white transition-all duration-200"
                onClick={handleMenuToggle}
              >
                <Menu size={24} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Toggle Menu</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Home/DM Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={
                !instanceId || instanceId === "@me" ? "default" : "ghost"
              }
              size="icon"
              className="w-12 h-12 rounded-2xl hover:rounded-xl transition-all duration-200"
              onClick={handleHomeClick}
            >
              <Home size={24} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Direct Messages</p>
          </TooltipContent>
        </Tooltip>

        {/* Separator */}
        <div className="w-8 h-0.5 bg-gray-600 rounded-full" />

        {/* Server List */}
        <div className="flex-1 flex flex-col space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          ) : (
            servers?.map((server) => (
              <Tooltip key={server.id}>
                <TooltipTrigger asChild>
                  <div>
                    <ServerIcon
                      server={server}
                      isActive={instanceId === server.id}
                      onClick={() => handleServerClick(server.id)}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{server.name}</p>
                </TooltipContent>
              </Tooltip>
            ))
          )}
        </div>

        {/* Add Server Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-2xl hover:rounded-xl bg-gray-700 hover:bg-green-600 text-green-500 hover:text-white transition-all duration-200"
              onClick={openCreateServer}
            >
              <Plus size={24} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Add a Server</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default ServerSidebar;
