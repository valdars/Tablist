var lockList = [];

// get all tabs and create html for tab list
function updateTabList(options) {
    if(options === undefined) {
        options = {};
    }
    var content = document.createDocumentFragment();

    // if searching create regexp object for filtering
    let filter = null;
    if(options.search !== undefined && options.search.length > 0) {
        filter = new RegExp(`.*${options.search}.*`, 'i');
    }

    browser.tabs.query({}).then(tabs => {
        for (let tab of tabs) {
            if(filter && !filter.test(tab.title)) {
                continue;
            }

            let tabId = tab.id;
            let row = $("<tr>");

            let titleLink = $(`<a href="javascript:void();">${tab.title}</a>`);
            titleLink.on('click', () => {
                browser.tabs.update(tabId, { active: true });
            });
            let favIcon = $('<img class="favicon">&nbsp;').prop('src', tab.favIconUrl);
            let title = $('<td>').append(favIcon).append(titleLink);
            row.append(title);

            let commands = $('<td>');

            let lockBtn = '';
            if (isLocked(tab.url)) {
                lockBtn = $('<a class="button"><span class="icon is-large has-text-success"><i class="fa fa-lg fa-unlock"></i></span></a>');
                lockBtn.on('click', () => {
                    unlock(tab.url);
                });
            } else {
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

function updateLockList() {
    browser.storage.sync.get({ locked: {} })
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

// initialization code
updateTabList();
updateLockList();

var wto;
$('#search').on('keyup', function() {
    var $this = $(this);
    clearTimeout(wto);
    wto = setTimeout(function () {
        updateTabList({
            search: $this.val()
        })
    }, 300);
});

$('#btnSearchReset').on('click', () => {
    $('#search').val('');
    updateTabList();
});

$('#btnSearch').on('click', () => {
    updateTabList({
        search: $('#search').val()
    })
});