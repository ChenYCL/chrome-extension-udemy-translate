
function setSub({ ...ary }) {
    for (const index in ary) {
        let key = ary[index];
        chrome.storage.sync.get(key, function (data) {
            $('.zh_sub').css(key, data[key]);
        }
        )
    }
}



setSub(['background', 'opacity']);
