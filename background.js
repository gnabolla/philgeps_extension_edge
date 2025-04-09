// background.js
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
      console.log("PhilGEPS Extension installed for the first time!");
    } else if (details.reason === "update") {
      console.log("PhilGEPS Extension updated to a new version!");
    }
  });
  