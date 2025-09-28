import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Hash, Volume2 } from "lucide-react";
import { useCreateChannel } from "@/hooks/useServers";
import { CategoryWithChannels } from "@/types/api";

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryWithChannels[];
  defaultCategoryId?: string;
}

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  isOpen,
  onClose,
  categories,
  defaultCategoryId,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"text" | "voice">("text");
  const [categoryId, setCategoryId] = useState(defaultCategoryId || "");

  const createChannelMutation = useCreateChannel();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;

    try {
      await createChannelMutation.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        type,
        categoryId,
      });

      // Reset form
      setName("");
      setDescription("");
      setType("text");
      setCategoryId(defaultCategoryId || "");
      onClose();
    } catch (error) {
      console.error("Failed to create channel:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Channel Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === "text" ? "default" : "outline"}
                onClick={() => setType("text")}
                className="flex-1"
              >
                <Hash className="h-4 w-4 mr-2" />
                Text
              </Button>
              <Button
                type="button"
                variant={type === "voice" ? "default" : "outline"}
                onClick={() => setType("voice")}
                className="flex-1"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Voice
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel-name">Channel Name</Label>
            <Input
              id="channel-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="awesome-channel"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel-description">Description</Label>
            <Textarea
              id="channel-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this channel about?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !name.trim() || !categoryId || createChannelMutation.isPending
              }
            >
              {createChannelMutation.isPending
                ? "Creating..."
                : "Create Channel"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
