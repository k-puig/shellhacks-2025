import React from "react";
import { useParams } from "react-router";
import { Hash, Volume2, Users, HelpCircle, Inbox, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInstanceDetails } from "@/hooks/useServers";
import { useChannels } from "@/hooks/useChannel";
import { useUiStore } from "@/stores/uiStore";

const ChatPage: React.FC = () => {
  const { instanceId, channelId } = useParams();
  const { instance } = useInstanceDetails(instanceId);
  const { categories } = useChannels(instanceId);
  const { toggleMemberList, showMemberList } = useUiStore();

  // Find current channel
  const currentChannel = categories
    ?.flatMap((cat) => cat.channels)
    ?.find((ch) => ch.id === channelId);

  // Handle Direct Messages view
  // if (!instanceId || instanceId === '@me') {
  //   return (
  //     <div className="flex flex-col h-full">
  //       {/* DM Header */}
  //       <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800">
  //         <div className="flex items-center space-x-2">
  //           <Inbox size={20} className="text-gray-400" />
  //           <span className="font-semibold text-white">Direct Messages</span>
  //         </div>
  //         <div className="flex items-center space-x-2">
  //           <Button variant="ghost" size="icon" className="h-8 w-8">
  //             <HelpCircle size={16} />
  //           </Button>
  //         </div>
  //       </div>

  //       {/* DM Content */}
  //       <div className="flex-1 flex items-center justify-center">
  //         <div className="text-center text-gray-400 max-w-md">
  //           <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
  //             <Inbox size={24} />
  //           </div>
  //           <h2 className="text-xl font-semibold mb-2 text-white">No Direct Messages</h2>
  //           <p className="text-sm">
  //             When someone sends you a direct message, it will show up here.
  //           </p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  if (!currentChannel && channelId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <h2 className="text-xl font-semibold mb-2">Channel not found</h2>
          <p>
            The channel you're looking for doesn't exist or you don't have
            access to it.
          </p>
        </div>
      </div>
    );
  }

  // Default channel view (when just /channels/instanceId)
  if (!channelId && instance) {
    const firstChannel = categories?.[0]?.channels?.[0];
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-400 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
            <Hash size={24} />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-white">
            Welcome to {instance.name}!
          </h2>
          <p className="text-sm mb-4">
            {firstChannel
              ? `Select a channel from the sidebar to start chatting, or head to #${firstChannel.name} to get started.`
              : "This server doesn't have any channels yet. Create one to get started!"}
          </p>
        </div>
      </div>
    );
  }

  const ChannelIcon = currentChannel?.type === "voice" ? Volume2 : Hash;

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center space-x-2">
          <ChannelIcon size={20} className="text-gray-400" />
          <span className="font-semibold text-white">
            {currentChannel?.name}
          </span>
          {currentChannel?.topic && (
            <>
              <div className="w-px h-4 bg-gray-600" />
              <span className="text-sm text-gray-400 truncate max-w-xs">
                {currentChannel.topic}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pin size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${showMemberList ? "text-white bg-gray-700" : "text-gray-400"}`}
            onClick={toggleMemberList}
          >
            <Users size={16} />
          </Button>
          <div className="w-40">
            <Input
              placeholder="Search"
              className="h-8 bg-gray-700 border-none text-sm"
            />
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Inbox size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <HelpCircle size={16} />
          </Button>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {/* Welcome Message */}
            <div className="flex flex-col space-y-2 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <ChannelIcon size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Welcome to #{currentChannel?.name}!
                  </h3>
                  <p className="text-gray-400">
                    This is the start of the #{currentChannel?.name} channel.
                  </p>
                </div>
              </div>
              {currentChannel?.topic && (
                <div className="text-gray-400 bg-gray-800 p-3 rounded border-l-4 border-gray-600">
                  <strong>Topic:</strong> {currentChannel.topic}
                </div>
              )}
            </div>

            {/* Placeholder messages */}
            <div className="space-y-4 text-gray-400 text-center">
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 bg-gray-800">
          <div className="relative">
            <Input
              placeholder={`Message #${currentChannel?.name || "channel"}`}
              className="w-full bg-gray-700 border-none text-white placeholder-gray-400 pr-12"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="flex items-center space-x-1">
                {/* Emoji picker, file upload, etc. would go here */}
                <div className="text-gray-400 text-sm">Press Enter to send</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
