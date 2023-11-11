type Instance = {
  tabId: string;
  windowId: string;
  websessionId: string;
  webviewId: string;
};

const title = "Excalidraw";

const findFirstEmptySpot = (array: (unknown | null)[]) => {
  let emptySpotIndex = array.findIndex((item) => item === null);

  if (emptySpotIndex === -1) emptySpotIndex = array.length;

  return emptySpotIndex;
};

class InstancesManager {
  private instances: (Instance | null)[] = [];

  private creationLocked = false;

  private findInstance({ tabId, windowId }: Partial<Instance>) {
    const instanceIndex = this.instances.findIndex(
      (instance) =>
        (tabId && instance?.tabId === tabId) ||
        (windowId && instance?.windowId === windowId),
    );
    const instance = this.instances[instanceIndex];

    return { instance, instanceIndex };
  }

  async create() {
    try {
      if (this.creationLocked) return;
      this.creationLocked = true;

      const isDarkMode = await ext.windows.getPlatformDarkMode();
      const availableSpot = findFirstEmptySpot(this.instances);

      const tab = await ext.tabs.create({
        index: availableSpot,
        text: `${title} - #${availableSpot + 1}`,
        icon: "./assets/128.png",
        icon_dark: "./assets/128-dark.png",
      });

      const window = await ext.windows.create({
        center: true,
        darkMode: "platform",
        title: `${title} - #${availableSpot + 1}`,
        icon: isDarkMode ? "./assets/128.png" : "./assets/128-dark.png",
        vibrancy: false,
        minWidth: 730,
        minHeight: 532,
      });

      const contentSize = await ext.windows.getContentSize(window.id);

      const permissions = await ext.runtime.getPermissions();
      const persistent =
        (permissions["websessions"] ?? {})["create.persistent"]?.granted ??
        false;
      const websession = await ext.websessions.create({
        partition: `${title} - #${availableSpot + 1}`,
        cache: true,
        persistent,
        global: false,
      });

      const webview = await ext.webviews.create({
        window,
        websession,
        bounds: { ...contentSize, x: 0, y: 0 },
        autoResize: { horizontal: true, vertical: true },
      });
      await ext.webviews.loadFile(webview.id, "index.html");

      // await ext.webviews.openDevTools(webview.id, {
      //   mode: "detach",
      //   activate: true,
      // });

      const instance: Instance = {
        tabId: tab.id,
        windowId: window.id,
        websessionId: websession.id,
        webviewId: webview.id,
      };

      this.instances[availableSpot] = instance;

      this.creationLocked = false;
    } catch (error) {
      console.error(error);
    }
  }

  async destroy({ tabId, windowId }: { tabId?: string; windowId?: string }) {
    try {
      const { instance, instanceIndex } = this.findInstance({
        tabId,
        windowId,
      });

      if (instance) {
        await ext.windows.remove(instance.windowId);
        await ext.tabs.remove(instance.tabId);
        await ext.webviews.remove(instance.webviewId);
        await ext.websessions.remove(instance.websessionId);
        this.instances[instanceIndex] = null;
      }
    } catch (error) {
      console.error(error);
    }
  }

  async focusWindow({ tabId }: { tabId: string }) {
    console.log("focus");
    const { instance } = this.findInstance({ tabId });

    if (instance) {
      await ext.windows.restore(instance.windowId);
      await ext.windows.focus(instance.windowId);
    }
  }

  async toggleMute({ tabId }: { tabId: string }) {
    const { instance } = this.findInstance({ tabId });

    if (instance) {
      const muted = await ext.webviews.isAudioMuted(instance.webviewId);
      await ext.webviews.setAudioMuted(instance.webviewId, !muted);
      await ext.tabs.update(instance.tabId, { muted: !muted });
    }
  }
}

const instanceManager = new InstancesManager();

ext.runtime.onExtensionClick.addListener(async () => {
  await instanceManager.create();
});

ext.tabs.onClicked.addListener(async (event) => {
  await instanceManager.focusWindow({ tabId: event.id });
});

ext.tabs.onClickedClose.addListener(async (event) => {
  await instanceManager.destroy({ tabId: event.id });
});

ext.tabs.onRemoved.addListener(async (event) => {
  await instanceManager.destroy({ tabId: event.id });
});

ext.tabs.onClickedMute.addListener(async (event) => {
  await instanceManager.toggleMute({ tabId: event.id });
});

ext.windows.onClosed.addListener(async (event) => {
  await instanceManager.destroy({ windowId: event.id });
});

ext.windows.onRemoved.addListener(async (event) => {
  await instanceManager.destroy({ windowId: event.id });
});

ext.windows.onUpdatedDarkMode.addListener(async (event, details) => {
  console.log("dark");
  await ext.windows.update(event.id, {
    icon:
      details.enabled && details.platform
        ? "./assets/128.png"
        : "./assets/128-dark.png",
  });
});
