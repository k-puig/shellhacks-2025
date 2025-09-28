import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  // Sidebar states
  showMemberList: boolean;
  sidebarCollapsed: boolean;

  // Modal states
  showUserSettings: boolean;
  showServerSettings: boolean;
  showCreateChannel: boolean;
  showCreateServer: boolean;
  showInviteModal: boolean;

  // Navigation
  activeChannelId: string | null;
  activeInstanceId: string | null;

  // Computed: Should show channel sidebar
  shouldShowChannelSidebar: boolean;

  // Actions
  toggleMemberList: () => void;
  toggleSidebar: () => void;

  // Modal actions
  openUserSettings: () => void;
  closeUserSettings: () => void;
  openServerSettings: () => void;
  closeServerSettings: () => void;
  openCreateChannel: () => void;
  closeCreateChannel: () => void;
  openCreateServer: () => void;
  closeCreateServer: () => void;
  openInviteModal: () => void;
  closeInviteModal: () => void;

  // Navigation actions
  setActiveChannel: (channelId: string | null) => void;
  setActiveInstance: (instanceId: string | null) => void;
  selectedChannelsByInstance: Record<string, string>;
  setSelectedChannelForInstance: (
    instanceId: string,
    channelId: string,
  ) => void;
  getSelectedChannelForInstance: (instanceId: string) => string | null;
  updateSidebarVisibility: (pathname: string) => void;
}

// Helper function to determine if channel sidebar should be shown
const shouldShowChannelSidebar = (pathname: string): boolean => {
  // Show channel sidebar for server pages (not settings, home, etc.)
  const pathParts = pathname.split("/");
  const isChannelsRoute = pathParts[1] === "channels";
  const isSettingsRoute = pathname.includes("/settings");

  return isChannelsRoute && !isSettingsRoute;
};

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      // Initial state
      showMemberList: true,
      sidebarCollapsed: false,
      screenWidth: typeof window !== "undefined" ? window.innerWidth : 1024,
      showUserSettings: false,
      showServerSettings: false,
      showCreateChannel: false,
      showCreateServer: false,
      showInviteModal: false,
      activeChannelId: null,
      activeInstanceId: null,
      shouldShowChannelSidebar: false,
      selectedChannelsByInstance: {},

      // Sidebar actions
      toggleMemberList: () =>
        set((state) => ({ showMemberList: !state.showMemberList })),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Modal actions
      openUserSettings: () => set({ showUserSettings: true }),
      closeUserSettings: () => set({ showUserSettings: false }),
      openServerSettings: () => set({ showServerSettings: true }),
      closeServerSettings: () => set({ showServerSettings: false }),
      openCreateChannel: () => set({ showCreateChannel: true }),
      closeCreateChannel: () => set({ showCreateChannel: false }),
      openCreateServer: () => set({ showCreateServer: true }),
      closeCreateServer: () => set({ showCreateServer: false }),
      openInviteModal: () => set({ showInviteModal: true }),
      closeInviteModal: () => set({ showInviteModal: false }),

      // Navigation actions
      setActiveChannel: (channelId) => set({ activeChannelId: channelId }),
      setActiveInstance: (instanceId) => set({ activeInstanceId: instanceId }),

      setSelectedChannelForInstance: (instanceId, channelId) =>
        set((state) => ({
          selectedChannelsByInstance: {
            ...state.selectedChannelsByInstance,
            [instanceId]: channelId,
          },
        })),

      getSelectedChannelForInstance: (instanceId) => {
        const state = get();
        return state.selectedChannelsByInstance[instanceId] || null;
      },
      updateSidebarVisibility: (pathname) => {
        const showChannelSidebar = shouldShowChannelSidebar(pathname);
        const pathParts = pathname.split("/");
        const instanceId = pathParts[2] || null;
        const channelId = pathParts[3] || null;

        set({
          shouldShowChannelSidebar: showChannelSidebar,
          activeInstanceId: instanceId,
          activeChannelId: channelId,
        });

        // Store the selected channel for this instance if we have both
        if (instanceId && channelId) {
          get().setSelectedChannelForInstance(instanceId, channelId);
        }
      },
    }),
    {
      name: "concord-ui-store",
      // Only persist UI preferences, not temporary states
      partialize: (state) => ({
        showMemberList: state.showMemberList,
        sidebarCollapsed: state.sidebarCollapsed,

        selectedChannelsByInstance: state.selectedChannelsByInstance,
      }),
    },
  ),
);
