// @ts-nocheck
import { getItem, getOriginText, injectCss, delayInjectCss, dealSubtitle, $ } from '../../../utils/common.ts';

// 1.get screen subtitle
const sub = {
  pre: '',
  current: '',
};

delayInjectCss('.well--container--2edq4')

const run = async () => {
  if (chrome.runtime?.id) {
    var plugin_status = await getItem('status');
  }
  if (plugin_status) {
    let current = null;
    if ($('.well--container--2edq4').length) {
      current = getOriginText('.well--container--2edq4');
    } else {
      current = document.querySelector('[data-purpose=captions-cue-text]') && document.querySelector('[data-purpose=captions-cue-text]').innerText;
    }

    // when change send request ,then make same
    if (sub.pre !== current && current !== null) {
      injectCss()
      sub.pre = current;
      // console.log(sub)
      if (chrome?.runtime?.id) {
        chrome.runtime.sendMessage({ text: current }, async function (res) {
          // console.log(`get msg`, res)
        });
      }

    }
  } else {
    // close plugin
    document.querySelector('style[id=chrome-extension-plugin-css]') && document.querySelector('style[id=chrome-extension-plugin-css]')?.remove();
    document.querySelector('.SUBTILTE') && document.querySelector('.SUBTILTE')?.remove();
  }
  window.requestAnimationFrame(run);
};
run();

// 3.when get translated text from background.js, append subtitle
chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  // console.log(`得到消息`, JSON.stringify(request));
  sendResponse({ complete: true })
  if (sub.current !== sub.pre) {
    if (document.querySelector('.well--container--2edq4')) {
      chrome.storage.local.get(null, (items) => {
        const subtitle = `<div class="SUBTILTE"
      style="
      position: relative;
      bottom:0px;
      width:100%;
      text-align: center;
      margin: 0;
      padding: 0;
      white-space: pre-line;
      writing-mode: horizontal-tb;
      unicode-bidi: plaintext;
      direction: ltr;
      -webkit-box-decoration-break: clone;
      box-decoration-break: clone;
      background: ${items['backgroundColor']};
      opacity: ${items['backgroundOpacity']};
    ">
       <div class="origin_subtitle"
        style="
            color:${items['originColor']} !important;
            font-weight:${items['originWeight']} !important;
            font-size:${items['originFont']}px !important;;
        "
       >${request.origin}</div>
        <div class="translate_subtitle"
        style="
            color: ${items['transColor']} !important;
            font-weight:${items['transWeight']} !important;
            font-size: ${items['transFont']}px !important;
        "
        >${request.translate}</div>
    </div>`;
        let hasSubtitleDom = $('div.SUBTILTE').length === 0;
        if (hasSubtitleDom) {
          $('.well--container--2edq4').after(subtitle);
        } else {
          $('div.SUBTILTE').remove();
          $('.well--container--2edq4').after(subtitle);
        }
      });
    } else {
      dealSubtitle('[data-purpose=captions-cue-text]', request);
    }
  }
  return true;
});





