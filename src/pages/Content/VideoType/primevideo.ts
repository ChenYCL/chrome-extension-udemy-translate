/*
    primevideo
 */

import { getItem } from '../modules/localStorage';
import { hiddenSubtitleCssInject, dealSubtitle } from '../modules/utils.ts';

const sub = {
  pre: '',
  current: '',
};
const getOriginText = () => {
  if ($('.persistentPanel span').length) {
    let obj_text = $('.persistentPanel span').eq(0)[0].innerText;
    if (obj_text) {
      obj_text = obj_text.replace('<br>', ' ').replace(/\[(.+)\]/, '');
    }
    return obj_text;
  } else if ($('.fg8afi5') != null) {
    let obj_text = $('.fg8afi5').innerText;
    if (obj_text) {
      obj_text = obj_text.replace('<br>', ' ').replace(/\[(.+)\]/, '');
    }
  } else {
    return '';
  }

  // $('.persistentPanel')
  //   .find('span')
  //   .forEach((span) => {
  //     obj_text += (span.innerText + ' ')
  //       .replace('<br>', ' ')
  //       .replace(/\[(.+)\]/, '');
  //   });
};

// sub.pre first time get
sub.pre = getOriginText();

const run = async () => {
  let plugin_status = await getItem('status');
  if (plugin_status) {
    // cover css
    hiddenSubtitleCssInject(['.persistentPanel', '.webPlayerUIContainer']);
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

// let timer = null;
// timer = setInterval(() => {
//   $('body')
//     .undelegate('.persistentPanel', 'DOMNodeInserted')
//     .delegate('.persistentPanel', 'DOMNodeInserted', function() {
//       run();
//     });
// }, 200);

chrome.runtime.onMessage.addListener(async function(
  request,
  sender,
  sendResponse,
) {
  console.log(JSON.stringify(request));
  if (sub.current !== sub.pre) {
    if ($('.persistenPanel')) {
      dealSubtitle('.persistentPanel', request);
    } else if ($('.fg8afi5')) {
      dealSubtitle('.webPlayerUIContainer', request);
    }
  }
});
