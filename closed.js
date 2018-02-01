var defaultFavIcon = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

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

            let favIcon = $('<img class="favicon">&nbsp;')
            if(tab.favIconUrl) {
                favIcon.prop('src', tab.favIconUrl);
            }else {
                favIcon.prop('src', defaultFavIcon);
            }

            let title = $('<td>').append(favIcon).append(`<span>${tab.title}</span`);
            row.append(title);

            let commands = $('<td>');
            let restoreBtn = $('<a class="button"><span class="icon is-large"><i class="fa fa-lg fa-window-restore"></i></span></a>');
            restoreBtn.on('click', () => {
                browser.sessions.restore(tab.sessionId);
            });
            commands.append(restoreBtn);
            row.append(commands);

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