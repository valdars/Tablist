function openMyPage() {
   browser.tabs.create({
     "url": "/tabmanager.html"
   });
}


/*
Add openMyPage() as a listener to clicks on the browser action.
*/
browser.browserAction.onClicked.addListener(openMyPage);