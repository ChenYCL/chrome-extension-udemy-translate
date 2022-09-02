
// 👇️ ts-nocheck ignores all ts errors in the file
// @ts-nocheck


import { getItem , hiddenSubtitleCssInject,$} from '../../../utils/common.ts';

const sub = {
  pre: '',
  current: '',
};

const getOriginText = () => {
  let obj_text = '';
  $('.class2.class3>span>span').forEach((span) => {
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
    hiddenSubtitleCssInject(['.default.class2.class3>span>span']);
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
    chrome.storage.local.get(null, (items) => {
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
})


