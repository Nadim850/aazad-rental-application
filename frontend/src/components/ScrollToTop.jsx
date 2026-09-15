import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Some containers like the Admin or User dashboard have their own overflow containers.
    // So we reset the main window first:
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    // Attempt to reset any scrolling layout containers
    const scrollableContainers = document.querySelectorAll('.overflow-y-auto');
    scrollableContainers.forEach(container => {
      container.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
  }, [pathname]);

  return null;
}
