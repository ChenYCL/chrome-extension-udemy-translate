let networkRequst = {};
let i = 0;
chrome.devtools.panels.create('Dev Tools from cra-crx-boilerplate', 'logo192.png', 'panel.html', function (sidebar) {
    // sidebar.setObject({ some_data: "Some data to show" });
    chrome.devtools.network.onRequestFinished.addListener(function (request) {
        if (request.request.url.endsWith('.vtt')) {
            request.getContent(function (content, encoding) {
                chrome.devtools.inspectedWindow.eval('console.log("devtools start")', function () {
                    console.dir(content);
                })
                // networkRequst[i++] = content;
            })
        }
        // sidebar.setObject('');
        // sidebar.setObject(networkRequst);

    })
});
export { };
