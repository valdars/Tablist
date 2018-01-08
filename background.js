function openMyPage() {
  browser.tabs.create({
    "url": "/tabmanager.html"
  });
}

/*
Add openMyPage() as a listener to clicks on the browser action.
Browser.browserAction seems to be undefined randomly
*/
console.log(browser);
browser.browserAction.onClicked.addListener(openMyPage);

// keep track of all tabs so we have their data in tab remove event
let tabBuffer = new Map();
// keep track of closed tabs
let closedTabs = [];

// load in existing tabs
browser.tabs.query({}).then(tabs => {
  for (let tab of tabs) {
    tabBuffer.set(tab.id, tab);
  }
});

// add new tabs
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  tabBuffer.set(tabId, tab);
});

// when tab is removed add it to closed tabs and send out message of updated closed tabs list
browser.tabs.onRemoved.addListener((tabId) => {
  if (tabBuffer.has(tabId)) {
    closedTabs.push(tabBuffer.get(tabId));
    browser.runtime.sendMessage({
      action: 'closedTabs',
      tabs: closedTabs
    });
  }
});

function handleMessage(request, sender, sendResponse) {
  // request to get closed tabs list
  if (request.action === 'getClosedTabs') {
    sendResponse(closedTabs);
  }
}
browser.runtime.onMessage.addListener(handleMessage);