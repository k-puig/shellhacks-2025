import React from "react";
import { useParams } from "react-router";
import { ChevronDown, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInstanceDetails } from "@/hooks/useServers";
import { useUiStore } from "@/stores/uiStore";
import ChannelList from "@/components/channel/ChannelList";

const ChannelSidebar: React.FC = () => {
  const { instanceId } = useParams();
  const { data: instance, isLoading: instanceLoading } =
    useInstanceDetails(instanceId);
  const categories = instance?.categories;
  const {
    toggleMemberList,
    showMemberList,
    openCreateChannel,
    openServerSettings,
  } = useUiStore();

  // Only show for valid instance IDs
  if (!instanceId) {
    return null;
  }

  if (instanceLoading) {
    return (
      <div className="sidebar-secondary flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!instance) {
    return (
      <div className="sidebar-secondary flex items-center justify-center h-full">
        <div className="text-concord-secondary">Server not found</div>
      </div>
    );
  }

  return (
    <div className="sidebar-secondary flex-1">
      <ScrollArea className="">
        {/* Server Header */}
        <div className="flex items-center justify-between border-b border-concord-primary shadow-sm px-4 py-3">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Button
              variant="ghost"
              className="flex items-center justify-between w-full h-8 font-semibold text-concord-primary hover:bg-concord-tertiary"
              onClick={openServerSettings}
            >
              <span className="truncate">{instance.name}</span>
              <ChevronDown size={20} className="flex-shrink-0 ml-1" />
            </Button>
          </div>
        </div>

        {/* Channel Categories and Channels */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {categories && categories.length > 0 ? (
              <ChannelList categories={categories} />
            ) : (
              <div className="text-sm text-concord-secondary text-center px-2 py-4">
                No channels yet
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Bottom Actions */}
        <div className="border-t border-sidebar px-2 py-2">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="interactive-hover"
              onClick={openCreateChannel}
            >
              <Plus size={16} className="mr-1" />
              Add Channel
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${showMemberList ? "text-interactive-active" : "interactive-hover"}`}
              onClick={toggleMemberList}
            >
              <Users size={16} />
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChannelSidebar;
