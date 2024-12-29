const activeTabTimers = {}; // Object to hold refresh timers per tab
let scrollTimers = {}; // Object to hold scroll timers per tab

// Function to simulate human-like scrolling behavior (in the content script)
function scrollPage(tabId) {
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const currentScroll = window.scrollY;

  if (maxScroll <= 0) {
    console.log("No scrollable content found.");
    return; // If there's no scrollable content, do nothing
  }

  // Human-like scroll speed (simulate natural pauses and irregular increments)
  const scrollDistance = Math.random() * 100 + 50; // Random scroll distance (50 to 150px)
  let direction = Math.random() > 0.5 ? 1 : -1; // Random direction: up or down

  // If current position is 0, always scroll down
  if (currentScroll === 0) {
    direction = 1; // Force scroll down
  }

  // Randomize the scroll speed and delay to simulate human-like pauses
  const delay = Math.random() * 200 + 150; // Random delay between 150ms to 350ms
  const targetScroll = currentScroll + direction * scrollDistance;

  // Ensure the scroll doesn't go beyond the max scroll position or below 0
  if (targetScroll < 0) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (targetScroll > maxScroll) {
    window.scrollTo({ top: maxScroll, behavior: "smooth" });
  } else {
    window.scrollBy({ top: direction * scrollDistance, behavior: "smooth" });
  }

  // Log the scroll event for debugging
  console.log(`Scrolling ${direction > 0 ? 'down' : 'up'} by ${scrollDistance}px. Current position: ${currentScroll}`);

  // Randomize the next delay between 1 to 10 seconds (1000 to 10000ms)
  const randomDelay = Math.floor(Math.random() * 10000) + 1000; // Random delay between 1 to 10 seconds

  // Send a message to the background to reschedule the next scroll
  chrome.runtime.sendMessage({
    action: "rescheduleScroll",
    tabId: tabId,
    delay: randomDelay // Send the random delay for the next scroll
  });
}

// Function to schedule refreshing the page
function scheduleRefresh(tabId, minInterval, maxInterval) {
  if (!tabId) return;

  // Clear any existing refresh timer
  if (activeTabTimers[tabId]) {
    clearTimeout(activeTabTimers[tabId]);
    delete activeTabTimers[tabId];
  }

  const randomInterval = Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
  let remainingTime = randomInterval;

  function updateBadge() {
    chrome.action.setBadgeText({ tabId, text: remainingTime.toString() });
    chrome.action.setBadgeBackgroundColor({ tabId, color: "#4CAF50" });

    if (remainingTime > 0) {
      remainingTime -= 1;
      setTimeout(updateBadge, 1000);
    }
  }

  updateBadge();

  activeTabTimers[tabId] = setTimeout(() => {
    chrome.tabs.reload(tabId, () => {
      delete activeTabTimers[tabId];
      scheduleRefresh(tabId, minInterval, maxInterval); // Reschedule refresh
    });
  }, randomInterval * 1000);

  // Start scrolling functionality after refresh timer is set
  scheduleScroll(tabId); // Trigger initial scroll
}

// Function to start scrolling for the given tab
function scheduleScroll(tabId) {
  if (!tabId) return;

  // Clear any existing scroll timer for the tab
  if (scrollTimers[tabId]) {
    clearTimeout(scrollTimers[tabId]);
    delete scrollTimers[tabId];
  }

  // Start the scroll after a delay of 10 seconds (10000ms)
  console.log(`Starting scroll timer for tab ${tabId} with 10-second delay.`);

  // Schedule the first scroll after the initial 10-second delay
  setTimeout(() => {
    console.log(`Starting to scroll on tab ${tabId}`);
    // Execute the scrollPage function in the content script
    chrome.scripting.executeScript(
      {
        target: { tabId },
        func: scrollPage,
        args: [tabId] // Pass tabId to the content script
      },
      (results) => {
        if (chrome.runtime.lastError) {
          console.error(`Error during scroll execution: ${chrome.runtime.lastError.message}`);
        } else {
          console.log(`Scroll script executed successfully on tab ${tabId}`);
        }
      }
    );
  }, 10000); // Delay the start by 10 seconds
}

// Listen for start/stop messages from popup
chrome.runtime.onMessage.addListener((message) => {
  const tabId = message.tabId;

  if (message.action === "start") {
    chrome.storage.local.get(["activeTabs"], (data) => {
      const { minInterval, maxInterval } = data.activeTabs[tabId] || {};
      if (minInterval && maxInterval) {
        scheduleRefresh(tabId, minInterval, maxInterval);
      }
    });
  } else if (message.action === "stop") {
    if (activeTabTimers[tabId]) {
      clearTimeout(activeTabTimers[tabId]);
      delete activeTabTimers[tabId];
    }

    if (scrollTimers[tabId]) {
      clearTimeout(scrollTimers[tabId]);
      delete scrollTimers[tabId];
    }

    // Clear badge
    chrome.action.setBadgeText({ tabId, text: "" });
  }
});

// Handle tab removal to clean up timers
chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeTabTimers[tabId]) {
    clearTimeout(activeTabTimers[tabId]);
    delete activeTabTimers[tabId];
  }

  if (scrollTimers[tabId]) {
    clearTimeout(scrollTimers[tabId]);
    delete scrollTimers[tabId];
  }
});

// Listen for rescheduling scroll messages and handle it
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "rescheduleScroll") {
    const { tabId, delay } = message;
    scrollTimers[tabId] = setTimeout(() => {
      // Re-trigger the scroll logic after the delay
      chrome.scripting.executeScript(
        {
          target: { tabId },
          func: scrollPage,
          args: [tabId] // Pass tabId again for the scroll function
        },
        (results) => {
          if (chrome.runtime.lastError) {
            console.error(`Error during scroll execution: ${chrome.runtime.lastError.message}`);
          } else {
            console.log(`Scroll script executed successfully on tab ${tabId}`);
          }
        }
      );
    }, delay);
  }
});
