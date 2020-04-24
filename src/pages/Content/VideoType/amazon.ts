/*
  amazon version
 */

import { getItem } from '../modules/localStorage';
import { hiddenSubtitleCssInject, dealSubtitle } from '../modules/utils.ts';

const sub = {
  pre: '',
  current: '',
};

const getOriginText = () => {
  let obj_text = '';
  $('.timedTextWindow')
    .find('span')
    .forEach((span) => {
      obj_text += (span.innerText + ' ')
        .replace('<br>', ' ')
        .replace(/\[(.+)\]/, '');
    });
  return obj_text;
};

// sub.pre first time get
sub.pre = getOriginText();

const run = async () => {
  let plugin_status = await getItem('status');
  if (plugin_status) {
    // cover css
    hiddenSubtitleCssInject(['.timedTextBackground']);
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
    dealSubtitle('.timedTextWindow', request);
  }
});
