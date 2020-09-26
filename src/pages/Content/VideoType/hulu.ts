/*
    hulu version
 */

import { getItem } from '../modules/localStorage';
import { hiddenSubtitleCssInject, dealSubtitle } from '../modules/utils.ts';

const sub = {
  pre: '',
  current: '',
};

const getOriginText = () => {
  let obj_text = $('.caption-text-box')
    .find('p')
    .html();
  if (obj_text) {
    obj_text = obj_text
      .replace(/<br>/g, ' ')
      .replace(/<i>/g, '')
      .replace(/<\/i>/g, '');
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
    if (
      sub.pre !== current &&
      current !== '' &&
      current !== null &&
      current !== ' '
    ) {
      sub.pre = current; //  当前字幕变动存储一次
      // console.log(sub, '当前');
      // send message to background
      if (typeof chrome.app.isInstalled !== 'undefined') {
        chrome.runtime.sendMessage({ text: sub.pre });
      }
    }
  } else {
    // close plugin
    await $('style[id=chrome-extension-plugin-css]').remove();
    await $('.SUBTILTE').remove();
  }
};

// if exist
var timer = setTimeout(function() {
  $('body').on('DOMNodeInserted', '.caption-text-box', function() {
    run();
    clearTimeout(timer);
  });
}, 3000);

chrome.runtime.onMessage.addListener(async function(
  request,
  sender,
  sendResponse
) {
  // console.log(JSON.stringify(request));
  console.log(sub.current == sub.pre, sub);
  if (sub.current !== sub.pre) {
    // always  true
    dealSubtitle('.closed-caption-container', request);
  }
});
