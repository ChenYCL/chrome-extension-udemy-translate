/*
    hulu version
 */


import { getItem } from '../modules/localStorage';
// @ts-ignore
import { hiddenSubtitleCssInject, dealSubtitle } from '../modules/utils.ts';

const sub = {
  pre: '',
  current: '',
};

const getOriginText = () => {
  let obj_text = $('.caption-text-box').find('p').html();
  if(obj_text){
    obj_text =  obj_text.replace('<br>', ' ')
  }
  return obj_text;
};

// sub.pre first time get
sub.pre = getOriginText();

const run = async () => {
  let plugin_status = await getItem('status');
  if (plugin_status) {
    // cover css
    hiddenSubtitleCssInject(['.caption-text-box']);
    let current = getOriginText();
    // when change send request ,then make same
    if (sub.pre !== current && current !== '' && current !== null) {
      sub.pre = current;
      console.log(sub);
      // send message to background
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

// @ts-ignore
chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
  console.log(JSON.stringify(request));
  if (sub.current !== sub.pre) {
    dealSubtitle('.caption-text-box', request);
  }
});