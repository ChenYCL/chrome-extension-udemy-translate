/*
    Netflix version
 */

import { getItem } from '../modules/localStorage';
import {
  win,
  hiddenSubtitleCssInject,
  dealSubtitle,
} from '../modules/utils.ts';

win();
// 1.获取节点，获得字幕
const sub = {
  pre: '',
  current: '',
};

const getOriginText = () => {
  let obj_text = '';
  $('.player-timedtext-text-container')
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
    window['listStyle'].push(
      hiddenSubtitleCssInject([
        '.player-timedtext-text-container',
        '.mejs-captions-text',
      ])
    );
    let current = getOriginText();
    // when change send request ,then make same
    if (sub.pre !== current && current !== '' && current !== ' ') {
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
};

// if exist
var timer = setTimeout(function() {
  $('body').on(
    'DOMNodeInserted',
    '.player-timedtext-text-container',
    function() {
      run();
      clearTimeout(timer);
    }
  );
}, 3000);

chrome.runtime.onMessage.addListener(async function(
  request,
  sender,
  sendResponse
) {
  console.log(JSON.stringify(request));
  if (sub.current !== sub.pre) {
    dealSubtitle('.player-timedtext', request);
  }
});
