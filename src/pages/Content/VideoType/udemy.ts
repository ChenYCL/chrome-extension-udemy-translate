import { getItem } from '../modules/localStorage.js';
// @ts-ignore
import { hiddenSubtitleCssInject,dealSubtitle } from "../modules/utils.ts";

// 1.get screen subtitle
const sub = {
  pre: '',
  current: '',
};


sub.pre = $('[data-purpose=captions-cue-text]').html();

const run = async () => {
  let plugin_status = await getItem('status');
  if (plugin_status) {
    // cover css
    hiddenSubtitleCssInject(['div[class^="captions-display--vjs-ud-captions-cue-text"]',
      '[data-purpose="captions-cue-text"]']);
    let current = $('[data-purpose=captions-cue-text]').html();

    // when change send request ,then make same

    if (sub.pre !== current && current !== null) {
      sub.pre = current;
      // 2. send message to background
      // @ts-ignore
      if (typeof chrome.app.isInstalled !== 'undefined') {
        // @ts-ignore
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
// @ts-ignore
chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
  console.log(JSON.stringify(request));
  if (sub.current !== sub.pre) {
    dealSubtitle('[data-purpose=captions-cue-text]',request);
  }
});

