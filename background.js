/**
 * Enables or disables the "Close Tabs to the Right" menu item according to selected tab.
 */
const updateItemStatus = async function updateItemStatus(tab) {
  const allTabs = await browser.tabs.query({currentWindow: true});

  let enabled = false;
  if (tab.index < (allTabs.length - 1)) {
    enabled = true;
  }

  browser.contextMenus.update("close_right", {
    enabled,
  });

  browser.contextMenus.refresh();
};

/**
 * Closes all tabs in `all` that are to the right of the `selected` tab.
 *
 * @param {Object} selected - Tab from which context menu was opened.
 * @param {Object[]} all - All tabs in current window.
 */
const closeTabs = function closeTabs(selected, all) {
  const removedTabIDs = all
    .filter((tab) => {
      return tab.index > selected.index;
    })
    .filter((tab) => {
      return !tab.pinned;
    })
    .map((tab) => {
      return tab.id;
    });

  browser.tabs.remove(removedTabIDs);
};

const item = browser.contextMenus.create({
  id: "close_right",
  title: browser.i18n.getMessage("menuItemTitle"),
  contexts: ["tab"],
}, () => {
  if (browser.runtime.lastError) {
    console.error(browser.runtime.lastError);
  }
});

// Recalculate "Close Tabs to the Right" item status when context menu is shown.
browser.contextMenus.onShown.addListener(async (info, tab) => {
  updateItemStatus(tab);
});

/**
 * Calls "closeTabs" if the "close_right" context menu item is clicked.
 *
 * @param {Object} info - Clicked menu item info.
 * @param {Object} tab - Tab that was clicked.
 */
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "close_right") {
    const allTabs = await browser.tabs.query({currentWindow: true});
    closeTabs(tab, allTabs);
  }
});
