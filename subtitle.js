chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action == "send") {
            console.log(request.keyword)
            sendResponse({state:'关键词填写成功！'});
        }
    }
);