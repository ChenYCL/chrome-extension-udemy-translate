/*
    hulu version
 */

import { getItem } from '../modules/localStorage';
import { hiddenSubtitleCssInject, dealSubtitle } from '../modules/utils.ts';

const sub = {
  pre: '',
  current: '',
};


function getChildren(textAry: Array<string>, dom) {
  if (dom == null) {
    return '';
  }
  [...dom.children].forEach(node => {
    if (node.nodeType === 1) {   //判断类型
      textAry.push(node.innerText);
    }
    getChildren(textAry, node);
  });
}

const getOriginText = () => {
  var obj_text = [];
  getChildren(obj_text, document.querySelector('.CaptionBox'));
  var real_text = obj_text.join('').replace(/\n/g, ' ');
  return real_text;
};

// sub.pre first time get
sub.pre = getOriginText();

const run = async () => {
  let plugin_status = await getItem('status');
  if (plugin_status) {
    // cover css
    hiddenSubtitleCssInject(['.CaptionBox']);
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
  $('body').on('DOMNodeInserted', '.CaptionBox', function() {
    run();
    clearTimeout(timer);
  });
}, 3000);

chrome.runtime.onMessage.addListener(async function(
  request,
  sender,
  sendResponse,
) {
  // console.log(JSON.stringify(request));
  console.log(sub.current == sub.pre, sub);
  if (sub.current !== sub.pre) {
    // always  true
    dealSubtitle('.CaptionBox', request);
  }
});
