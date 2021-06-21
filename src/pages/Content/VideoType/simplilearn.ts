/**
 * simplilearn.com
 */
import { getItem } from '../modules/localStorage';
import { dealSubtitle, hiddenSubtitleCssInject } from '../modules/utils.ts';

const sub = {
  pre: '',
  current: '',
};

const getOriginText = () => {
  let searchText = $('.jw-text-track-cue')[0] ? $('.jw-text-track-cue')[0].innerText : sub.pre;
  const obj_text = searchText ? searchText
    .replace('<br>', ' ')
    .replace(/\[(.+)\]/, '')
    .replace(/<i>/g, '')
    .replace(/<\/i>/g, ' ')
    .replace(/\n/g, ' ') : '';

  return obj_text;
};

// sub.pre first time get
sub.pre = getOriginText();
console.log('pre', sub.pre);

const run = async () => {
  let plugin_status = await getItem('status');
  if (plugin_status) {
    // cover css
    hiddenSubtitleCssInject([
      '.jw-text-track-cue',
    ]);
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
    await $('style[id=chrome-extension-plugin-css]').remove();
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
    dealSubtitle('video', request);
  }
});
