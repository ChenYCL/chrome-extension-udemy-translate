import { getItem } from '../modules/localStorage.js';
import { hiddenSubtitleCssInject, dealSubtitle } from '../modules/utils.ts';

// 1.get screen subtitle
const sub = {
  pre: '',
  current: '',
};

const getOriginText = () => {
  let obj_text = '';
  $('.well--container--2edq4')
    .find('span')
    .forEach((span) => {
      obj_text += (span.innerText + ' ')
        .replace('<br>', ' ')
        .replace(/\[(.+)\]/, '');
    });
  return obj_text;
};
// if origin subtitle under video
if ($('.well--container--2edq4').length) {
  sub.pre = getOriginText();
} else {
  sub.pre = $('[data-purpose=captions-cue-text]').html();
}

const run = async () => {
  let plugin_status = await getItem('status');
  if (plugin_status) {
    // cover css
    let current = null;
    if ($('.well--container--2edq4').length) {
      current = getOriginText();
      hiddenSubtitleCssInject(['.well--container--2edq4']);
    } else {
      current = $('[data-purpose=captions-cue-text]').html();
      hiddenSubtitleCssInject([
        'div[class^="captions-display--vjs-ud-captions-cue-text"]',
        '[data-purpose="captions-cue-text"]',
      ]);
    }

    // when change send request ,then make same

    if (sub.pre !== current && current !== null) {
      sub.pre = current;
      // 2. send message to background
      if (typeof chrome.app.isInstalled !== 'undefined') {
        chrome.runtime.sendMessage({ text: current });
      }
    }
  } else {
    // close plugin
    await $('style[id=chrome-extension-plugin-css]').remove();
    await $('.SUBTILTE').remove();
  }
  window.requestAnimationFrame(run);
};
run();

// 3.when get translated text from background.js, append subtitle
chrome.runtime.onMessage.addListener(async function(
  request,
  sender,
  sendResponse
) {
  console.log(JSON.stringify(request));
  if (sub.current !== sub.pre) {
    if ($('.well--container--2edq4').length) {
      chrome.storage.sync.get(null, (items) => {
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
    opacity: ${items['backgroundColor']};
  ">
     <div class="origin_subtitle"
      style="
          color:${items['origin_color']} !important;
          font-weight:${items['origin_weight']} !important;
          font-size:${items['origin_font']}px !important;;
      "
     >${request.origin}</div>
      <div class="translate_subtitle"
      style="
          color: ${items['trans_color']} !important;
          font-weight:${items['trans_weight']} !important;
          font-size: ${items['trans_font']}px !important;
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
});
