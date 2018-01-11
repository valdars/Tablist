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