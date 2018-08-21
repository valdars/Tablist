function downloadString(text, fileType, fileName) {
    var blob = new Blob([text], { type: fileType });

    var a = document.createElement('a');
    a.download = fileName;
    a.href = URL.createObjectURL(blob);
    a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
}

function backupTabsToTxt() {
    browser.tabs.query({}, function (tabs) {
        let output = tabs.map(x => x.url).join("\n");
        downloadString(output, "text/plain", "tabs.txt");
    });
}

function backupTabsToHtml() {
    browser.tabs.query({}, function (tabs) {
        var template = $('#templateHtmlBackup').html();
        let output = tabs.map(x => `<li><a href="${x.url}">${x.title}</a></li>`).join("\n");
        var html = template.replace('{list}', output);
        downloadString(html, "text/html", "tabs.html");
    });
}

function backupExtToTxt() {
    browser.management.getAll().then(function (exts) {
        let output = exts.map(x => x.name).join("\n");
        downloadString(output, "text/plain", "addons.txt");
    });
}

$('#btnTabsTxtBackup').on('click', backupTabsToTxt);
$('#btnTabsHtmlackup').on('click', backupTabsToHtml);
$('#btnExtTxtBackup').on('click', backupExtToTxt);