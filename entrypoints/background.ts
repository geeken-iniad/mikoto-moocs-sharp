export default defineBackground(() => {
  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (
      changeInfo.status === "complete" &&
      tab.url?.startsWith("https://moocs.iniad.org/")
    ) {
      browser.scripting.executeScript({
        target: { tabId },
        files: ["/mikoto-userscript.js"],
      });
    }
  });
});