document.addEventListener("DOMContentLoaded", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0]?.id;
  
      chrome.storage.local.get(["activeTabs"], (data) => {
        const isActive = data.activeTabs?.[activeTabId] ? true : false;
  
        const startStopButton = document.getElementById("start-stop");
        startStopButton.textContent = isActive ? "Stop" : "Start";
  
        if (isActive) {
          document.getElementById("min-interval").value = data.activeTabs[activeTabId].minInterval || 50;
          document.getElementById("max-interval").value = data.activeTabs[activeTabId].maxInterval || 60;
        }
      });
    });
  
    // Ensure minimum interval is 50 seconds
    document.getElementById("min-interval").addEventListener("input", (e) => {
      if (parseInt(e.target.value, 10) < 50) {
        e.target.value = 50;
      }
    });
  });
  
  document.getElementById("start-stop").addEventListener("click", () => {
    const button = document.getElementById("start-stop");
    const isStarting = button.textContent === "Start";
  
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0]?.id;
  
      if (isStarting) {
        const minInterval = parseInt(document.getElementById("min-interval").value, 10);
        const maxInterval = parseInt(document.getElementById("max-interval").value, 10);
  
        if (minInterval >= 50 && maxInterval > minInterval) {
          chrome.storage.local.get({ activeTabs: {} }, (data) => {
            const activeTabs = data.activeTabs;
            activeTabs[activeTabId] = { minInterval, maxInterval };
            chrome.storage.local.set({ activeTabs });
  
            chrome.runtime.sendMessage({ action: "start", tabId: activeTabId });
          });
  
          button.textContent = "Stop";
          window.close(); // Close popup after starting
        } else {
          alert("Minimum interval must be at least 50 seconds, and max interval must be greater than min interval.");
        }
      } else {
        chrome.runtime.sendMessage({ action: "stop", tabId: activeTabId });
        chrome.storage.local.get({ activeTabs: {} }, (data) => {
          const activeTabs = data.activeTabs;
          delete activeTabs[activeTabId];
          chrome.storage.local.set({ activeTabs });
        });
  
        button.textContent = "Start";
      }
    });
  });
  