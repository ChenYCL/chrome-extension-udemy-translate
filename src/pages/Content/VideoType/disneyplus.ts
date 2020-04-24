import { getItem } from '../modules/localStorage';
import { dealSubtitle } from '../modules/utils.ts';

const sub = {
  pre: '',
  current: '',
};

// const getOriginText = () => {
//   let obj_text = '';
//   $('.persistentPanel').find('span').forEach((span) => {
//     obj_text += (span.innerText + ' ').replace('<br>', ' ')
//       .replace(/\[(.+)\]/, '');
//   });
//   return obj_text;
// };
let time = null;
const run = async () => {
  try {
    console.log('-----------seraching...-------------');
    if ($('video') !== null) {
      let plugin_status = await getItem('status');
      if (plugin_status) {
        let current = $('video')[0].textTracks[0].activeCues[0].text;
        current = current
          .replace('<br>', ' ')
          .replace(/\[(.+)\]/, '')
          .replace(/<i>/g, '')
          .replace(/<\/i>/g, ' ')
          .replace(/\n/g, ' ');

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
        // clearInterval(time);
        await $('style[id=chrome-extension-plugin-css]').remove();
        await $('.SUBTILTE').remove();
      }
    }
  } catch (e) {
    console.log('not found subtitle');
  }
};
time = setInterval(run, 100);

chrome.runtime.onMessage.addListener(async function(
  request,
  sender,
  sendResponse
) {
  console.log(JSON.stringify(request));
  if (sub.current !== sub.pre) {
    dealSubtitle('video', request);
  }
});
