import React from "react";
import { useNavigate, useParams } from "react-router";
import { Plus, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useServers } from "@/hooks/useServers";
import { useUiStore } from "@/stores/uiStore";
import ServerIcon from "@/components/server/ServerIcon";

const ServerSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { instanceId } = useParams();
  const { data: servers, isLoading } = useServers();
  const { openCreateServer, setActiveInstance, getSelectedChannelForInstance } =
    useUiStore();

  const handleServerClick = (serverId: string) => {
    setActiveInstance(serverId);
    const lastChannelId = getSelectedChannelForInstance(serverId);

    console.log(servers);

    if (lastChannelId) {
      navigate(`/channels/${serverId}/${lastChannelId}`);
    } else {
      // Fallback: navigate to the server, let the page component handle finding a channel
      // A better UX would be to find and navigate to the first channel here.
      navigate(`/channels/${serverId}`);
    }
  };
  const handleHomeClick = () => {
    setActiveInstance(null);
    navigate("/channels/@me");
  };

  return (
    <TooltipProvider>
      <div className="sidebar-primary flex flex-col items-center h-full py-2 space-y-2">
        {/* Home/DM Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={` w-12 h-12 ml-0 ${
                !instanceId || instanceId === "@me" ? "active" : ""
              }`}
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
        <div className="w-8 h-0.5 bg-border rounded-full" />

        {/* Server List */}
        <div className="flex-1 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-border space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
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
              className="w-12 h-12 ml-3 rounded-2xl hover:rounded-xl bg-concord-secondary hover:bg-green-600 text-green-500 hover:text-white transition-all duration-200"
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
