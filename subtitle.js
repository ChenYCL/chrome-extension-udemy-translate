
function cssAppend() {
    let css = 'div[class^="captions-display--vjs-ud-captions-cue-text"] { display: none !important; }  .zh_sub{ display: block !important } .player-timedtext-text-container{display:none !important} .mejs-captions-text{display:none !important} .caption-text-box{display:none !important} .hbo-now{display:none !important} .timedTextBackground{display:none !important}',
        head = document.getElementsByTagName('head')[0],
        style = document.createElement('style'),
        _cssText = ``;
    chrome.storage.sync.get(null, function (items) {
        var allKeys = Object.keys(items);
        _cssText = `.zh_sub h2{color:${items['zhcolor']} !important;font-size:${items['zhfontSize']}px !important;font-weight:${items['zhfontWeight']} !important;}
        .zh_sub span{color:${items['escolor']} !important;font-size:${items['esfontSize']}px !important;font-weight:${items['esfontWeight']} !important;}
        .zh_sub{background:${items['background']} !important;opacity:${items['opacity']} !important}
    `
        css = css + ' ' + _cssText
        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        head.appendChild(style);
        if (window.location.href.includes('hbo')) {
            let broSubDom = $('video').parent().parent();
            broSubDom.next().css({
                "display": "none"
            })
        }
    });
}
cssAppend();
