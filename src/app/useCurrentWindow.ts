import { useEffect, useState } from "react";

export const useCurrentWindow = () => {
  const [currentWindow, setCurrentWindow] = useState<string>();

  useEffect(() => {
    (async () => {
      const currentWebview = await ext.webviews.getCurrent();
      const currentWindow = await ext.webviews.getAttachedWindow(
        currentWebview.id,
      );

      setCurrentWindow(currentWindow?.id);
    })();
  }, []);

  return currentWindow;
};
