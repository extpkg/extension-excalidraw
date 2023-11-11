import {
  Excalidraw,
  MainMenu,
  WelcomeScreen,
  defaultLang,
  languages,
} from "@excalidraw/excalidraw";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types/types";
import { useEffect, useState } from "react";
import useLocalStorageState from "./useLocalStorageState";

function App() {
  const [langCode, setLangCode] = useLocalStorageState(
    "langCode",
    defaultLang.code,
  );
  const [theme, setTheme] = useLocalStorageState<"dark" | "light">(
    "theme",
    "light",
  );
  const [userTheme, setUserTheme] = useLocalStorageState<boolean>(
    "userTheme",
    false,
  );
  const [initialData, setInitialData] = useState({});

  useEffect(() => {
    if (!userTheme) {
      console.log("userTheme", userTheme);
      ext.windows.getPlatformDarkMode().then((value) => {
        setTheme(value ? "dark" : "light");
      });

      ext.windows.onUpdatedDarkMode.addListener(async (_event, details) => {
        setTheme(details.enabled ? "dark" : "light");
      });
    }
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

  const persist = (
    elements: readonly ExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles,
  ) => {
    if (theme !== appState.theme) {
      setTheme(appState.theme);
      setUserTheme(true);
    }

    localStorage.setItem(
      "library",
      JSON.stringify({
        appState: { theme: appState.theme },
        elements,
        files,
      }),
    );
  };

  return (
    <Excalidraw
      langCode={langCode}
      theme={theme}
      onChange={persist}
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
