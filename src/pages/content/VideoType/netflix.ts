// 👇️ ts-nocheck ignores all ts errors in the file
// @ts-nocheck


import { getItem, hiddenSubtitleCssInject, dealSubtitle,win ,getOriginText, injectCss, delayInjectCss, $ } from '../../../utils/common.ts';



setTimeout(() => {
  let className = document.querySelector('video') && document.querySelector('.player-timedtext')
  delayInjectCss(className)
}, 6000);

win();

const sub = {
  pre: '',
  current: '',
};

const run = async () => {
  if (chrome.runtime?.id) {
    var plugin_status = await getItem('status');
  }
  if (plugin_status) {
    let current = null;
    let dom = document.querySelector('video') && document.querySelector('.player-timedtext')
    // let coverPart = document.querySelector('video') && document.querySelector('.player-timedtext')
    current = getOriginText(dom);
    // when change send request ,then make same 
    if (sub.pre !== current && current != '') {
      injectCss(dom)
      sub.pre = current;
      if (chrome?.runtime?.id) {
        chrome.runtime.sendMessage({ text: current }, async function (res) { });
      }
    }
  } else {
    document.querySelector('style[id=chrome-extension-plugin-css]') && document.querySelector('style[id=chrome-extension-plugin-css]')?.remove();
    document.querySelector('.SUBTILTE') && document.querySelector('.SUBTILTE')?.remove();
  }
  window.requestAnimationFrame(run);
};

run();

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  console.log(`get message`, JSON.stringify(request));
  sendResponse({ complete: true })
  if (request.origin == undefined || request.origin == '' || request.origin == ' ' || request.translate == undefined) {
    return false;
  };
  if (sub.current !== sub.pre) {
    chrome.storage.local.get(null, (items) => {
      const subtitle = `<div class="SUBTILTE" style=" position: absolute; bottom:30px; width:100%; text-align: center; margin: 0 .5em 1em; padding: 20px 8px; white-space: pre-line; writing-mode: horizontal-tb; unicode-bidi: plaintext; direction: ltr; -webkit-box-decoration-break: clone; box-decoration-break: clone; background: ${items['backgroundColor']}; opacity: ${items['backgroundOpacity']}; "> <div class="origin_subtitle" style=" color:${items['originColor']} !important; font-weight:${items['originWeight']} !important; font-size:${items['originFont']}px !important;; " >${request.origin}</div> <div class="translate_subtitle" style=" color: ${items['transColor']} !important; font-weight:${items['transWeight']} !important; font-size: ${items['transFont']}px !important; " >${request.translate}</div> </div>`;
      let hasSubtitleDom = $('div.SUBTILTE').length === 0;
      if (hasSubtitleDom) {
        $('video').parent().parent().after(subtitle);
      } else {
        $('div.SUBTILTE').remove();
        $('video').parent().parent().after(subtitle);
      }
    });
  };
})