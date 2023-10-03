import { VERSIONS } from "../constants";
import { fileOpen } from "../data/filesystem";
import { t } from "../i18n";
import { ExcalidrawProps, UIAppState } from "../types";
import { useApp, useExcalidrawSetAppState } from "./App";

// const LibraryMenuBrowseButton = ({
//   theme,
//   id,
//   libraryReturnUrl,
// }: {
//   libraryReturnUrl: ExcalidrawProps["libraryReturnUrl"];
//   theme: UIAppState["theme"];
//   id: string;
// }) => {
//   const referrer =
//     libraryReturnUrl || window.location.origin + window.location.pathname;
//   return (
//     <a
//       className="library-menu-browse-button"
//       href={`${import.meta.env.VITE_APP_LIBRARY_URL}?target=${
//         window.name || "_blank"
//       }&referrer=${referrer}&useHash=true&token=${id}&theme=${theme}&version=${
//         VERSIONS.excalidrawLibrary
//       }`}
//       target="_excalidraw_libraries"
//     >
//       {t("labels.libraries")}
//     </a>
//   );
// };

const LibraryMenuBrowseButton = () => {
  const { library } = useApp();
  const setAppState = useExcalidrawSetAppState();
  
  const onLibraryImport = async () => {
    try {
      await library.updateLibrary({
        libraryItems: fileOpen({
          description: "Excalidraw library files",
          // ToDo: Be over-permissive until https://bugs.webkit.org/show_bug.cgi?id=34442
          // gets resolved. Else, iOS users cannot open `.excalidraw` files.
          /*
            extensions: [".json", ".excalidrawlib"],
            */
        }),
        merge: true,
        openLibraryMenu: true,
      });
    } catch (error: any) {
      if (error?.name === "AbortError") {
        console.warn(error);
        return;
      }
      setAppState({ errorMessage: t("errors.importLibraryError") });
    }
  };
  
  return (
    <a
      className="library-menu-browse-button"
      onClick={onLibraryImport}
    >
      {t("buttons.load")}
    </a>
  );
};

export default LibraryMenuBrowseButton;
