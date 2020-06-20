/*
    hbo max version
 */

import { getItem } from '../modules/localStorage';
import { hiddenSubtitleCssInject } from '../modules/utils.ts';

const sub = {
  pre: '',
  current: '',
};

const getOriginText = () => {
  let obj_text = '';
  $('.class20.class30>span>span').forEach((span) => {
    obj_text +=
      ' ' +
      (span.innerText + ' ')
        .replace('<br>', ' ')
        .replace(/\[(.+)\]/, '')
        .replace(/undefined/g, '')
        .replace(/[\r\n]/g, '')
        .trim();
  });
  return obj_text;
};

// sub.pre first time get
sub.pre = getOriginText();

const run = async () => {
  let plugin_status = await getItem('status');
  if (plugin_status) {
    // cover css
    hiddenSubtitleCssInject(['.default.class20.class30>span>span']);
    let current = getOriginText();
    // when change send request ,then make same
    if (sub.pre !== current && current !== '') {
      sub.pre = current;
      console.log(sub);
      // send message to background
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

chrome.runtime.onMessage.addListener(async function(
  request,
  sender,
  sendResponse
) {
  console.log(JSON.stringify(request));
  if (sub.current !== sub.pre) {
    chrome.storage.sync.get(null, (items) => {
      const subtitle = `<div class="SUBTILTE"
    style="
    position: absolute;
    bottom:30px;
    width:100%;
    text-align: center;
    margin: 0 .5em 1em;
    padding: 20px 8px;
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
        $('video')
          .parent()
          .parent()
          .after(subtitle);
      } else {
        $('div.SUBTILTE').remove();
        $('video')
          .parent()
          .parent()
          .after(subtitle);
      }
    });
  }
});
