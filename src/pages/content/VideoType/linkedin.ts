// 👇️ ts-nocheck ignores all ts errors in the file
// @ts-nocheck

import { getItem, hiddenSubtitleCssInject, dealSubtitle ,$} from '../../../utils/common.ts';

const sub = {
  pre: '',
  current: '',
};

const getOriginText = () => {
  let obj_text = '';
  obj_text = $('.vjs-custom-captions-cue > span').html() ? $('.vjs-custom-captions-cue > span').html() :'';
  obj_text.replace('<br>', ' ')
  .replace(/\[(.+)\]/, '');
  return obj_text;
};

// sub.pre first time get
sub.pre = getOriginText();

const run = async () => {
  let plugin_status = await getItem('status');
  if (plugin_status) {
    // cover css
    hiddenSubtitleCssInject(['.vjs-custom-captions-cue']);
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
    console.log(window['listStyle']);
    window['listStyle'].forEach((item) => item.remove());
    await $('.SUBTILTE').remove();
  }
  window.requestAnimationFrame(run);
};
run();

chrome.runtime.onMessage.addListener(async function(
  request,
  sender,
  sendResponse,
) {
  console.log(JSON.stringify(request));
  if (sub.current !== sub.pre) {
    dealSubtitle('.vjs-custom-captions-cue', request);
  }
});
