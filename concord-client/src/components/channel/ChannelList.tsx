import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronDown, ChevronRight, Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryWithChannels } from "@/types/api";
import { Channel } from "@/types/database";
import ChannelItem from "@/components/channel/ChannelItem";

interface CategoryHeaderProps {
  category: CategoryWithChannels;
  isExpanded: boolean;
  onToggle: () => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  category,
  isExpanded,
  onToggle,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-1 py-1 h-6 text-xs font-semibold text-gray-400 uppercase tracking-wide hover:text-gray-300 group"
          onClick={(e) => {
            // Only toggle if not right-clicking (which opens dropdown)
            if (e.button === 0) {
              onToggle();
            }
          }}
        >
          <div className="flex items-center">
            {isExpanded ? (
              <ChevronDown size={12} className="mr-1" />
            ) : (
              <ChevronRight size={12} className="mr-1" />
            )}
            <span className="truncate">{category.name}</span>
          </div>
          <Plus
            size={12}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuItem>
          <Plus size={14} className="mr-2" />
          Create Channel
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Edit size={14} className="mr-2" />
          Edit Category
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-400 focus:text-red-400">
          Delete Category
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface ChannelListProps {
  categories: CategoryWithChannels[];
}

const ChannelList: React.FC<ChannelListProps> = ({ categories }) => {
  // Track expanded categories
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map((cat) => cat.id)), // Start with all expanded
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  if (!categories || categories.length === 0) {
    return (
      <div className="text-sm text-gray-400 px-2 py-4 text-center">
        No channels available
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {categories
        .sort((a, b) => a.position - b.position)
        .map((category) => {
          const isExpanded = expandedCategories.has(category.id);

          return (
            <div key={category.id} className="space-y-0.5">
              {/* Category Header */}
              <CategoryHeader
                category={category}
                isExpanded={isExpanded}
                onToggle={() => toggleCategory(category.id)}
              />

              {/* Channels */}
              {isExpanded && (
                <div className="ml-2 space-y-0.5">
                  {category.channels
                    .sort((a, b) => a.position - b.position)
                    .map((channel) => (
                      <ChannelItem key={channel.id} channel={channel} />
                    ))}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
};

export default ChannelList;
