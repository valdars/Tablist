var lockList = [];
var selectList = [];
var currentTabs = [];
var isUpdateDisabled = false;
var searchText = null;
var defaultFavIcon = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

// get all tabs and create html for tab list
function updateTabList(options) {
    if(isUpdateDisabled) {
        return;
    }
    options = options || {};
    currentTabs = [];
    var content = document.createDocumentFragment();

    // if searching create regexp object for filtering
    let filter = null;
    if (searchText && searchText.length > 0) {
        filter = new RegExp(`.*${searchText}.*`, 'i');
    }

    browser.tabs.query({}).then(tabs => {
        for (let tab of tabs) {
            if (filter && !filter.test(tab.title)) {
                continue;
            }
            if(options.ignore && tab.id == options.ignore) {
                continue;
            }

            currentTabs.push(tab);

            let tabId = tab.id;
            let tabUrl = tab.url;

            let row = $("<tr>");

            let selectBox = $('<input class="checkbox" type="checkbox" />').prop('checked', isSelected(tabId)).on('change', function (evt) {
                if ($(this).prop('checked')) {
                    select(tabId);
                } else {
                    deselect(tabId);
                }
            });
            row.append($('<td>').append(selectBox));

            let titleLink = $(`<a href="#" onclick="return false;">${tab.title}</a>`);
            titleLink.on('click', () => {
                browser.tabs.update(tabId, { active: true });
            });
            let favIcon = $('<img class="favicon">&nbsp;')
            if(tab.favIconUrl) {
                favIcon.prop('src', tab.favIconUrl);
            }else {
                favIcon.prop('src', defaultFavIcon);
            }
            
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
                if(!isLocked(tab.url)) {
                    browser.tabs.remove(tabId);
                }
            });
            commands.append(closeBtn);

            row.append(commands);

            content.appendChild(row[0]);
        }
        $('#tablist').html(content);
    });
}

function isSelected(tabId) {
    return selectList.includes(tabId);
}

function select(tabId) {
    if (!isSelected(tabId)) {
        selectList.push(tabId);
    }
}

function deselect(tabId) {
    selectList = selectList.filter(x => x != tabId);
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
browser.tabs.onRemoved.addListener((x) => {
    // there seems to be delay in removed tab being actually removed
    updateTabList({ignore: tabId});
});
browser.tabs.onReplaced.addListener(updateTabList);
browser.tabs.onUpdated.addListener(updateTabList);

// initialization code
updateTabList();
updateLockList();

var wto;
$('#search').on('keyup', function () {
    var $this = $(this);
    clearTimeout(wto);
    wto = setTimeout(function () {
        searchText = $this.val();
        updateTabList();
    }, 300);
});

$('#btnSearchReset').on('click', () => {
    $('#search').val('');
    searchText = null;
    updateTabList();
});

$('#btnSearch').on('click', () => {
    searchText = $('#search').val();
    updateTabList();
});

$('.select-all-btn').on('click', () => {
    currentTabs.forEach(tab => {
        select(tab.id);
    });
    updateTabList();
});

$('.deselect-all-btn').on('click', () => {
    currentTabs.forEach(tab => {
        deselect(tab.id);
    });
    updateTabList();
});

$('.close-all-btn').on('click', () => {
    isUpdateDisabled = true;
    currentTabs.forEach(tab => {
        if(isSelected(tab.id) && !isLocked(tab.url)) {
            deselect(tab.id);
            browser.tabs.remove(tab.id);
        }
    });
    isUpdateDisabled = false;
    updateTabList();
});

$('.lock-all-btn').on('click', () => {
    isUpdateDisabled = true;
    currentTabs.forEach(tab => {
        if(isSelected(tab.id) && !isLocked(tab.url)) {
            lock(tab.url);
        }
    });
    isUpdateDisabled = false;
    updateTabList();
});

$('.unlock-all-btn').on('click', () => {
    isUpdateDisabled = true;
    currentTabs.forEach(tab => {
        if(isSelected(tab.id) && isLocked(tab.url)) {
            unlock(tab.url);
        }
    });
    isUpdateDisabled = false;
    updateTabList();
});