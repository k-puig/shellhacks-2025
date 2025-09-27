import { useEffect } from "react";
import { useUiStore } from "@/stores/uiStore";

export const useResponsive = () => {
  const { screenWidth, isMobile, setScreenWidth, updateIsMobile } =
    useUiStore();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      updateIsMobile();
    };

    // Set initial values
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, [setScreenWidth, updateIsMobile]);

  return {
    screenWidth,
    isMobile,
    isTablet: screenWidth >= 768 && screenWidth < 1024,
    isDesktop: screenWidth >= 1024,
    isLargeDesktop: screenWidth >= 1280,
  };
};
