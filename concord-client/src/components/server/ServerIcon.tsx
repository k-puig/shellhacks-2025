import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Instance } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "../ui/dialog";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Category } from "@/types";
import { useUiStore } from "@/stores/uiStore";
import {
  useCreateCategory,
  useCreateChannel,
  useCreateInstance,
} from "@/hooks/useServers";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectValue,
} from "../ui/select";

interface ServerIconProps {
  server: Instance;
  isActive: boolean;
  onClick: () => void;
}

const ServerIcon: React.FC<ServerIconProps> = ({
  server,
  isActive,
  onClick,
}) => {
  const getServerInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative group">
      {/* Active indicator */}
      <div
        className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 bg-accent-foreground rounded transition-all duration-200 ${
          isActive ? "h-10 rounded-xl" : "rounded-r h-2 group-hover:h-5"
        }`}
      />
      <Button
        variant="ghost"
        size="icon"
        className={`w-12 h-12 ml-3 transition-all duration-200 ${
          isActive
            ? "rounded-xl border-primary bg-primary/10 border-2"
            : "rounded-2xl hover:rounded-xl border hover:border-primary/50"
        }`}
        onClick={onClick}
      >
        {server.icon ? (
          <img
            src={server.icon}
            alt={server.name}
            className={`w-full h-full object-cover ${isActive ? "rounded-xl" : "rounded-2xl"}`}
          />
        ) : (
          <span className="font-semibold text-sm">
            {getServerInitials(server.name)}
          </span>
        )}
      </Button>
    </div>
  );
};

// Create Server Modal
export const CreateServerModal: React.FC = () => {
  const { showCreateServer, closeCreateServer } = useUiStore();
  const { mutate: createInstance, isPending } = useCreateInstance();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createInstance(
        {
          name: name.trim(),
          icon: icon.trim() || undefined,
          description: description.trim() || undefined,
        },
        {
          onSuccess: () => {
            setName("");
            setDescription("");
            setIcon("");
            closeCreateServer();
          },
          onError: (error) => {
            console.error("Failed to create server:", error);
          },
        },
      );
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setIcon("");
    closeCreateServer();
  };

  return (
    <Dialog open={showCreateServer} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Server</DialogTitle>
          <DialogDescription>
            Create a new server to chat with friends and communities.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="server-name">Server Name</Label>
            <Input
              id="server-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter server name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="server-description">Description (Optional)</Label>
            <Textarea
              id="server-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this server about?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="server-icon">Server Icon URL (Optional)</Label>
            <Input
              id="server-icon"
              type="url"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="https://example.com/icon.png"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? "Creating..." : "Create Server"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Create Channel Modal
export const CreateChannelModal: React.FC = () => {
  const { showCreateChannel, closeCreateChannel } = useUiStore();
  const { mutate: createChannel, isPending } = useCreateChannel();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"text" | "voice">("text");
  const [categoryId, setCategoryId] = useState("");

  // You'd need to get categories for the current instance
  // This is a simplified version
  const categories: Category[] = []; // Get from context or props

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && categoryId) {
      createChannel(
        {
          name: name.trim(),
          description: description.trim(),
          type,
          categoryId,
        },
        {
          onSuccess: () => {
            setName("");
            setDescription("");
            setType("text");
            setCategoryId("");
            closeCreateChannel();
          },
          onError: (error) => {
            console.error("Failed to create channel:", error);
          },
        },
      );
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setType("text");
    setCategoryId("");
    closeCreateChannel();
  };

  return (
    <Dialog open={showCreateChannel} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Channel</DialogTitle>
          <DialogDescription>
            Create a new text or voice channel in this server.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="channel-type">Channel Type</Label>
            <Select
              value={type}
              onValueChange={(value: "text" | "voice") => setType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select channel type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text Channel</SelectItem>
                <SelectItem value="voice">Voice Channel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel-category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel-name">Channel Name</Label>
            <Input
              id="channel-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter channel name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel-description">Description (Optional)</Label>
            <Textarea
              id="channel-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this channel for?"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? "Creating..." : "Create Channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Create Category Modal
export const CreateCategoryModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { mutate: createCategory, isPending } = useCreateCategory();

  const [name, setName] = useState("");
  const [instanceId, setInstanceId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && instanceId) {
      createCategory(
        {
          name: name.trim(),
          instanceId,
          position: 0,
        },
        {
          onSuccess: () => {
            setName("");
            setInstanceId("");
            setOpen(false);
          },
          onError: (error) => {
            console.error("Failed to create category:", error);
          },
        },
      );
    }
  };

  const handleClose = () => {
    setName("");
    setInstanceId("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Category</DialogTitle>
          <DialogDescription>
            Create a new category to organize your channels.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Category Name</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? "Creating..." : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const AdminModals: React.FC = () => {
  return (
    <>
      <CreateServerModal />
      <CreateChannelModal />
      <CreateCategoryModal />
    </>
  );
};
export default ServerIcon;
