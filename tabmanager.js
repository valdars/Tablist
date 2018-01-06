let list = $('#tablist');

function createElement(text) {
    return document.createRange().createContextualFragment(text).firstChild;
}

function updateTabList() {
    var content = document.createDocumentFragment();
    browser.tabs.query({}).then(tabs => {
        for (let tab of tabs) {
            let row = $("<tr>");
            
            let title = $('<td>').text(tab.title);
            row.append(title);

            let close = $('<td>');
            let closeBtn = $('<a class="button"><span class="icon is-large"><i class="fa fa-lg fa-window-close-o"></i></span></a>');
            let tabId = tab.id;
            closeBtn.on('click', () => {
                browser.tabs.remove(tabId);
            });
            close.append(closeBtn);
            row.append(close);
            
            content.appendChild(row[0]);
        }
        list.html(content);
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

function initTabs() {
    $('[data-tablink]').on('click', (event) => {
        let $this = $(event.currentTarget);
        let id = $this.data('tablink');
        $('[data-tablink]').parent().removeClass('is-active');
        $this.parent().addClass('is-active');
        $('[data-tabcontainer]').addClass('is-hidden');
        $('[data-tabcontainer="'+id+'"]').removeClass('is-hidden');
    });
}
initTabs();