import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

// Basic dropdown styles
const dropdownStyles = {
  content: `
    min-w-[220px]
    bg-white dark:bg-gray-800
    border border-gray-200 dark:border-gray-700
    rounded-md
    p-1
    shadow-lg
    z-50
    animate-in
    fade-in-80
    data-[state=open]:animate-in
    data-[state=closed]:animate-out
    data-[state=closed]:fade-out-0
    data-[state=open]:fade-in-0
    data-[state=closed]:zoom-out-95
    data-[state=open]:zoom-in-95
    data-[side=bottom]:slide-in-from-top-2
    data-[side=left]:slide-in-from-right-2
    data-[side=right]:slide-in-from-left-2
    data-[side=top]:slide-in-from-bottom-2
  `,
  item: `
    relative
    flex
    cursor-pointer
    select-none
    items-center
    rounded-sm
    px-2
    py-1.5
    text-sm
    outline-none
    transition-colors
    hover:bg-gray-100 dark:hover:bg-gray-700
    focus:bg-gray-100 dark:focus:bg-gray-700
    data-[disabled]:pointer-events-none
    data-[disabled]:opacity-50
  `,
  separator: `
    -mx-1
    my-1
    h-px
    bg-gray-200 dark:bg-gray-700
  `,
  label: `
    px-2
    py-1.5
    text-sm
    font-semibold
    text-gray-500 dark:text-gray-400
  `,
  destructive: `
    text-red-600 dark:text-red-400
    hover:bg-red-50 dark:hover:bg-red-900/20
    focus:bg-red-50 dark:focus:bg-red-900/20
  `,
};

// Utility to combine class names
const cn = (...classes: (string | undefined | false)[]) => {
  return classes.filter(Boolean).join(" ");
};

// Root dropdown menu
export const DirectDropdownMenu = DropdownMenu.Root;
export const DirectDropdownMenuTrigger = DropdownMenu.Trigger;

// Content component with styling
interface DirectDropdownMenuContentProps
  extends React.ComponentProps<typeof DropdownMenu.Content> {
  className?: string;
  sideOffset?: number;
}

export const DirectDropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenu.Content>,
  DirectDropdownMenuContentProps
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenu.Portal>
    <DropdownMenu.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        dropdownStyles.content.replace(/\s+/g, " ").trim(),
        className,
      )}
      {...props}
    />
  </DropdownMenu.Portal>
));
DirectDropdownMenuContent.displayName = "DirectDropdownMenuContent";

// Menu item component
interface DirectDropdownMenuItemProps
  extends React.ComponentProps<typeof DropdownMenu.Item> {
  className?: string;
  destructive?: boolean;
}

export const DirectDropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenu.Item>,
  DirectDropdownMenuItemProps
>(({ className, destructive, ...props }, ref) => (
  <DropdownMenu.Item
    ref={ref}
    className={cn(
      dropdownStyles.item.replace(/\s+/g, " ").trim(),
      destructive && dropdownStyles.destructive.replace(/\s+/g, " ").trim(),
      className,
    )}
    {...props}
  />
));
DirectDropdownMenuItem.displayName = "DirectDropdownMenuItem";

// Separator component
interface DirectDropdownMenuSeparatorProps
  extends React.ComponentProps<typeof DropdownMenu.Separator> {
  className?: string;
}

export const DirectDropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenu.Separator>,
  DirectDropdownMenuSeparatorProps
>(({ className, ...props }, ref) => (
  <DropdownMenu.Separator
    ref={ref}
    className={cn(
      dropdownStyles.separator.replace(/\s+/g, " ").trim(),
      className,
    )}
    {...props}
  />
));
DirectDropdownMenuSeparator.displayName = "DirectDropdownMenuSeparator";

// Label component
interface DirectDropdownMenuLabelProps
  extends React.ComponentProps<typeof DropdownMenu.Label> {
  className?: string;
}

export const DirectDropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenu.Label>,
  DirectDropdownMenuLabelProps
>(({ className, ...props }, ref) => (
  <DropdownMenu.Label
    ref={ref}
    className={cn(dropdownStyles.label.replace(/\s+/g, " ").trim(), className)}
    {...props}
  />
));
DirectDropdownMenuLabel.displayName = "DirectDropdownMenuLabel";

// Checkbox item component
interface DirectDropdownMenuCheckboxItemProps
  extends React.ComponentProps<typeof DropdownMenu.CheckboxItem> {
  className?: string;
  children: React.ReactNode;
}

export const DirectDropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenu.CheckboxItem>,
  DirectDropdownMenuCheckboxItemProps
>(({ className, children, ...props }, ref) => (
  <DropdownMenu.CheckboxItem
    ref={ref}
    className={cn(
      dropdownStyles.item.replace(/\s+/g, " ").trim(),
      "pl-8",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenu.ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </DropdownMenu.ItemIndicator>
    </span>
    {children}
  </DropdownMenu.CheckboxItem>
));
DirectDropdownMenuCheckboxItem.displayName = "DirectDropdownMenuCheckboxItem";

// Sub menu components
export const DirectDropdownMenuSub = DropdownMenu.Sub;

interface DirectDropdownMenuSubTriggerProps
  extends React.ComponentProps<typeof DropdownMenu.SubTrigger> {
  className?: string;
  children: React.ReactNode;
}

export const DirectDropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenu.SubTrigger>,
  DirectDropdownMenuSubTriggerProps
>(({ className, children, ...props }, ref) => (
  <DropdownMenu.SubTrigger
    ref={ref}
    className={cn(dropdownStyles.item.replace(/\s+/g, " ").trim(), className)}
    {...props}
  >
    {children}
    <ChevronRightIcon className="ml-auto h-4 w-4" />
  </DropdownMenu.SubTrigger>
));
DirectDropdownMenuSubTrigger.displayName = "DirectDropdownMenuSubTrigger";

interface DirectDropdownMenuSubContentProps
  extends React.ComponentProps<typeof DropdownMenu.SubContent> {
  className?: string;
}

export const DirectDropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenu.SubContent>,
  DirectDropdownMenuSubContentProps
>(({ className, ...props }, ref) => (
  <DropdownMenu.SubContent
    ref={ref}
    className={cn(
      dropdownStyles.content.replace(/\s+/g, " ").trim(),
      className,
    )}
    {...props}
  />
));
DirectDropdownMenuSubContent.displayName = "DirectDropdownMenuSubContent";

// Example usage component to test the dropdown
export const DirectDropdownExample: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="p-4">
      <DirectDropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DirectDropdownMenuTrigger asChild>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Open Menu
          </button>
        </DirectDropdownMenuTrigger>

        <DirectDropdownMenuContent align="end" className="w-56">
          <DirectDropdownMenuLabel>My Account</DirectDropdownMenuLabel>
          <DirectDropdownMenuSeparator />

          <DirectDropdownMenuItem
            onClick={() => console.log("Profile clicked")}
          >
            <span>Profile</span>
          </DirectDropdownMenuItem>

          <DirectDropdownMenuItem
            onClick={() => console.log("Settings clicked")}
          >
            <span>Settings</span>
          </DirectDropdownMenuItem>

          <DirectDropdownMenuSeparator />

          <DirectDropdownMenuItem
            destructive
            onClick={() => console.log("Logout clicked")}
          >
            <span>Log out</span>
          </DirectDropdownMenuItem>
        </DirectDropdownMenuContent>
      </DirectDropdownMenu>
    </div>
  );
};
