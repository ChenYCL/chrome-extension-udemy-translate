for(var i = 0; i < 99999; i++) {
    clearInterval(i)
}
// document.getElementsByClassName('captions-display--vjs-ud-captions-cue-text--38tMf')[0].style.display = 'block !important'
cssAppend()
function cssAppend() {
    var css = `.captions-display--vjs-ud-captions-cue-text--38tMf { display: block !important; }
    .zh_sub{ display: none !important }`,
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