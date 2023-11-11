import { useCallback, useEffect, useState } from "react";
import {
  Excalidraw,
  MainMenu,
  WelcomeScreen,
  defaultLang,
  languages,
} from "@excalidraw/excalidraw";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import useLocalStorageState from "./useLocalStorageState";
import { useCurrentWindow } from "./useCurrentWindow";

function App() {
  const [langCode, setLangCode] = useLocalStorageState(
    "langCode",
    defaultLang.code,
  );

  const [initialData, setInitialData] = useState({});

  const [theme, setTheme] = useLocalStorageState<"dark" | "light">(
    "theme",
    "light",
  );
  const [userTheme, setUserTheme] = useLocalStorageState<boolean>(
    "userTheme",
    false,
  );

  const currentWindow = useCurrentWindow();

  const setDarkModeOnWindow = useCallback(async () => {
    if (currentWindow && userTheme)
      ext.windows.setDarkMode(currentWindow, theme === "dark");
  }, [currentWindow, userTheme]);

  const onUpdatedDarkMode = useCallback(
    async (_: unknown, details: { enabled: boolean }) => {
      if (!userTheme) setTheme(details.enabled ? "dark" : "light");
    },
    [userTheme],
  );

  useEffect(() => {
    if (!userTheme) {
      ext.windows.getPlatformDarkMode().then((value) => {
        setTheme(value ? "dark" : "light");
      });
    }

    ext.windows.onUpdatedDarkMode.addListener(onUpdatedDarkMode);

    return () => {
      ext.windows.onUpdatedDarkMode.removeListener(onUpdatedDarkMode);
    };
  }, [userTheme]);

  // this trick is needed to show the welcome screen
  // after resetting the canvas and reopening the excalidraw extension
  useEffect(() => {
    const savedData = localStorage.getItem("library");
    if (savedData !== null) {
      const data = JSON.parse(savedData);
      const elements = data.elements.filter(
        (element: ExcalidrawElement) => !element.isDeleted,
      );
      setInitialData({ ...data, elements });
    }
  }, []);

  return (
    <Excalidraw
      langCode={langCode}
      theme={theme}
      onChange={(elements, appState, files) => {
        if (appState.theme !== theme) {
          setTheme(appState.theme);
          setUserTheme(true);
          setDarkModeOnWindow();
        }

        localStorage.setItem(
          "library",
          JSON.stringify({
            appState: { theme: appState.theme },
            elements,
            files,
          }),
        );
      }}
      initialData={initialData}
      UIOptions={{ canvasActions: { toggleTheme: true } }}
    >
      <MainMenu>
        <MainMenu.DefaultItems.LoadScene />
        <MainMenu.DefaultItems.Export />
        <MainMenu.DefaultItems.SaveAsImage />
        <MainMenu.DefaultItems.Help />
        <MainMenu.DefaultItems.ClearCanvas />
        <MainMenu.Separator />
        <MainMenu.DefaultItems.ToggleTheme />
        <MainMenu.ItemCustom>
          <select
            className="dropdown-select dropdown-select__language"
            onChange={({ target }) => setLangCode(target.value)}
            value={langCode}
            style={{ width: "100%" }}
          >
            {languages
              .filter((lang) => !lang.label.includes("test"))
              .map((lang) => (
                <option
                  key={lang.code}
                  value={lang.code}
                >
                  {lang.label}
                </option>
              ))}
          </select>
        </MainMenu.ItemCustom>
        <MainMenu.DefaultItems.ChangeCanvasBackground />
      </MainMenu>
      <WelcomeScreen />
    </Excalidraw>
  );
}

export default App;
