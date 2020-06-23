/*
  amazon version
 */

import { getItem } from '../modules/localStorage';
import { hiddenSubtitleCssInject, dealSubtitle } from '../modules/utils.ts';

const sub = {
  pre: '',
  current: '',
};

let obj_text = '';

function getText(node) {
  function checkout(node) {
    if (node.nodeType === 3) {
      obj_text += node.nodeValue;
    } else {
      for (var child of node.childNodes) {
        getText(child);
      }
    }
  }
  checkout(node);
}

const getOriginText = () => {
  if ($('.persistentPanel').length) {
    getText(document.querySelector('.persistentPanel span'));
  } else if ($('.timedTextWindow').length) {
    getText(document.querySelector('.timedTextWindow span'));
  } else if ($('.fg8afi5').length) {
    getText(document.querySelector('.fg8afi5'));
  }
};

// sub.pre first time get
// sub.pre = getOriginText();

const run = async () => {
  let plugin_status = await getItem('status');
  if (plugin_status) {
    // cover css
    obj_text = '';
    await getOriginText();
    console.log(obj_text);
    // when change send request ,then make same
    if (sub.pre !== obj_text && obj_text !== '') {
      hiddenSubtitleCssInject([
        '.timedTextBackground',
        '.persistentPanel',
        '.fg8afi5',
      ]);
      sub.pre = obj_text;
      console.log(sub);
      // send message to background
      if (typeof chrome.app.isInstalled !== 'undefined') {
        chrome.runtime.sendMessage({ text: obj_text });
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
    if ($('.persistentPanel').length) {
      dealSubtitle('.persistentPanel', request);
      return;
    } else if ($('.timedTextWindow').length) {
      dealSubtitle('.timedTextWindow', request);
    } else if ($('.fg8afi5').length) {
      dealSubtitle('.fbhsa9', request);
    }
  }
});
