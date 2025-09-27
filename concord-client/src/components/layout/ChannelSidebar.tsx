import React from "react";
import { useParams } from "react-router";
import { ChevronDown, Plus, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInstanceDetails } from "@/hooks/useServers";
import { useChannels } from "@/hooks/useChannel";
import { useUiStore } from "@/stores/uiStore";
import { useResponsive } from "@/hooks/useResponsive";
import ChannelList from "@/components/channel/ChannelList";

const ChannelSidebar: React.FC = () => {
  const { instanceId } = useParams();
  const { data: instance, isLoading: instanceLoading } =
    useInstanceDetails(instanceId);
  const { data: categories, isLoading: channelsLoading } =
    useChannels(instanceId);
  const {
    toggleMemberList,
    showMemberList,
    toggleSidebar,
    openCreateChannel,
    openServerSettings,
  } = useUiStore();
  const { isMobile, isDesktop } = useResponsive();

  // Handle Direct Messages view
  if (!instanceId || instanceId === "@me") {
    return (
      <div className="flex flex-col h-full">
        {/* DM Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={toggleSidebar}
              >
                <X size={16} />
              </Button>
            )}
            <h2 className="font-semibold text-white">Direct Messages</h2>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Plus size={16} />
          </Button>
        </div>

        {/* DM List */}
        <ScrollArea className="flex-1 px-2">
          <div className="py-2 space-y-1">
            <div className="text-sm text-gray-400 px-2 py-1">
              No direct messages yet
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  if (instanceLoading || channelsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!instance) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Server not found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Server Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 shadow-sm">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={toggleSidebar}
            >
              <X size={16} />
            </Button>
          )}
          <Button
            variant="ghost"
            className="flex items-center justify-between w-full px-2 py-1 h-auto font-semibold text-white hover:bg-gray-700"
            onClick={openServerSettings}
          >
            <span className="truncate">{instance.name}</span>
            <ChevronDown size={18} className="flex-shrink-0 ml-1" />
          </Button>
        </div>
      </div>

      {/* Channel Categories and Channels */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {categories && categories.length > 0 ? (
            <ChannelList categories={categories} />
          ) : (
            <div className="text-sm text-gray-400 px-2 py-4 text-center">
              No channels yet
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Bottom Actions */}
      <div className="px-2 py-2 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            onClick={openCreateChannel}
          >
            <Plus size={16} className="mr-1" />
            Add Channel
          </Button>

          {isDesktop && (
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${showMemberList ? "text-white" : "text-gray-400 hover:text-white"}`}
              onClick={toggleMemberList}
            >
              <Users size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelSidebar;
