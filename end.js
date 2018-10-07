for(var i = 0; i < 99999; i++) {
    clearInterval(i)
}
cssAppend()
if(window.location.href.includes('netflix')){
    chrome.storage.sync.get('netflixSubCache', function (data) {
        window.location.reload();
    })
}


function cssAppend() {
    let css = `div[class^="captions-display--vjs-ud-captions-cue-text"] { display: block !important; }
    .zh_sub{ display: none !important } .player-timedtext-text-container { display: none !important} .mejs-captions-text{display: block !important}`,
        head = document.getElementsByTagName('head')[0],
        style = document.createElement('style');
    style.type = 'text/css';
    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
    head.appendChild(style);
}