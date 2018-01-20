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

// keep track of certain tabs events to update closed tab list
browser.sessions.onChanged.addListener(updateClosedTabList);
browser.tabs.onCreated.addListener(updateClosedTabList);

// initialization code
updateClosedTabList();