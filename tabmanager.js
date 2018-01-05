let list = document.getElementById('tablist');
//var tabs = await browser.tabs.query({});

function createElement(text) {
    return document.createRange().createContextualFragment(text).firstChild;
}

function updateTabList() {
    var content = document.createDocumentFragment();
    browser.tabs.query({}).then(tabs => {
        for (let tab of tabs) {
            let row = document.createElement("tr");
            
            let title = document.createElement('td');
            title.textContent = tab.title;
            row.appendChild(title);

            let close = document.createElement('td');
            let closeBtn = createElement('<a class="button"><span class="icon is-large"><i class="fa fa-lg fa-window-close-o"></i></span></a>');
            let tabId = tab.id;
            closeBtn.addEventListener('click', () => {
                browser.tabs.remove(tabId);
            });
            close.appendChild(closeBtn);
            row.appendChild(close);
            
            content.appendChild(row);
        }
        list.innerHTML = '';
        list.appendChild(content);
    });
}

browser.tabs.onAttached.addListener(updateTabList);
browser.tabs.onCreated.addListener(updateTabList);
browser.tabs.onDetached.addListener(updateTabList);
browser.tabs.onMoved.addListener(updateTabList);
browser.tabs.onRemoved.addListener(() => {
    setTimeout(updateTabList, 200);
});
browser.tabs.onReplaced.addListener(updateTabList);
browser.tabs.onUpdated.addListener(updateTabList);

updateTabList();