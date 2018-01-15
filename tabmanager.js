var lockList = [];

// get all tabs and create html for tab list
function updateTabList() {
    var content = document.createDocumentFragment();
    browser.tabs.query({}).then(tabs => {
        //console.log(tabs[0]);
        for (let tab of tabs) {
            let tabId = tab.id;
            let row = $("<tr>");

            let favicon = $('<td>');
            favicon.append($('<img class="favicon">').prop('src', tab.favIconUrl));
            row.append(favicon);

            let titleLink = $(`<a href="javascript:void();">${tab.id} ${tab.title}</a>`);
            titleLink.on('click', () => {
                browser.tabs.update(tabId, { active: true });
            });
            let title = $('<td>').append(titleLink);
            row.append(title);

            let commands = $('<td>');

            let lockBtn = '';
            if(isLocked(tab.url)) {
                lockBtn = $('<a class="button"><span class="icon is-large has-text-success"><i class="fa fa-lg fa-unlock"></i></span></a>');
                lockBtn.on('click', () => {
                    unlock(tab.url);
                });
            }else {
                lockBtn = $('<a class="button"><span class="icon is-large has-text-danger"><i class="fa fa-lg fa-lock"></i></span></a>');
                lockBtn.on('click', () => {
                    lock(tab.url);
                });
            }
            commands.append(lockBtn);

            let closeBtn = $('<a class="button"><span class="icon is-large"><i class="fa fa-lg fa-window-close-o"></i></span></a>');
            closeBtn.on('click', () => {
                browser.tabs.remove(tabId);
            });
            commands.append(closeBtn);

            row.append(commands);

            content.appendChild(row[0]);
        }
        $('#tablist').html(content);
    });
}

// create html for closed tabs list
function updateClosedTabList() {
    var content = document.createDocumentFragment();
    browser.sessions.getRecentlyClosed().then(sessions => {
        for (let session of sessions) {
            if (!session.tab) {
                continue;
            }
            let tab = session.tab;

            let row = $("<tr>");

            let favicon = $('<td>');
            favicon.append($('<img class="favicon">').prop('src', tab.favIconUrl));
            row.append(favicon);

            let title = $('<td>').text(tab.title);
            row.append(title);

            let restore = $('<td>');
            let restoreBtn = $('<a class="button"><span class="icon is-large"><i class="fa fa-lg fa-window-restore"></i></span></a>');
            restoreBtn.on('click', () => {
                browser.sessions.restore(tab.sessionId);
            });
            restore.append(restoreBtn);
            row.append(restore);

            content.appendChild(row[0]);
        }
        $('#closedtablist').html(content);
    });
}

function updateLockList() {
    browser.storage.sync.get({locked: {}})
    .then(results => {
        lockList = results.locked;
        updateTabList();
    });
}

function saveLockList() {
    browser.storage.sync.set({
        locked: lockList
    }).then(() => {
        updateTabList();
    });
}

function isLocked(url) {
    return lockList.includes(url);
}

function lock(url) {
    lockList.push(url);
    saveLockList();
}

function unlock(url) {
    lockList = lockList.filter(x => x != url);
    saveLockList();
}

// init html tabs functionality
function initTabs() {
    $('[data-tablink]').on('click', (event) => {
        let $this = $(event.currentTarget);
        let id = $this.data('tablink');
        $('[data-tablink]').parent().removeClass('is-active');
        $this.parent().addClass('is-active');
        $('[data-tabcontainer]').addClass('is-hidden');
        $('[data-tabcontainer="' + id + '"]').removeClass('is-hidden');
    });
}

// keep track of certain tabs events to update tab list
browser.tabs.onAttached.addListener(updateTabList);
browser.tabs.onCreated.addListener(updateTabList);
browser.tabs.onDetached.addListener(updateTabList);
browser.tabs.onMoved.addListener(updateTabList);
browser.tabs.onRemoved.addListener(() => {
    // there seems to be delay in removed tab being actually purged
    setTimeout(updateTabList, 200);
});
browser.tabs.onReplaced.addListener(updateTabList);
browser.tabs.onUpdated.addListener(updateTabList);

// keep track of certain tabs events to update closed tab list
browser.sessions.onChanged.addListener(updateClosedTabList);
browser.tabs.onCreated.addListener(updateClosedTabList);

//  initialization code
updateTabList();
updateLockList();
updateClosedTabList();
initTabs();