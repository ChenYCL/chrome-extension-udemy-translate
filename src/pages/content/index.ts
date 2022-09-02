// 👇️ ts-nocheck ignores all ts errors in the file
// @ts-nocheck

// import { MessageEventType } from '../../types';
// chrome.runtime.onMessage.addListener(
//     (
//         msg: MessageEventType,
//         sender: chrome.runtime.MessageSender,
//         sendResponse: (response: string) => void
//     ) => {
//         console.log('[content.js]. Message received', msg);
//         sendResponse('received',msg);
//         if (process.env.NODE_ENV === 'development') {
//             if (msg.type === 'window.location.reload') {
//                 console.log('current page will reload.');
//                 window.location.reload();
//             }
//         }
//     }
// );



const hrefMap = {
  udemy: 'udemy',
  netflix: 'netflix',
  linkedin: 'linkedin',
  lynda: 'lynda',
  hulu: 'hulu',
  amazon: 'amazon',
  hbonow: 'hbonow',
  hbomax: 'hbomax',
  primevideo: 'primevideo',
  disneyplus: 'disneyplus',
  paramountplus: 'paramountplus',
  simplilearn: 'simplilearn',
};

const whatsPage = (href:string) => {
  for (let key in hrefMap) {
    if (href.includes(key)) {
      return hrefMap[key];
    }
  }
};

console.log(
  '%c 当前视频页面类型:',
  'background:red;color:white',
  whatsPage(window.location.href),
);


require(`./VideoType/${hrefMap[whatsPage(window.location.href)]}.ts`);




console.log('Content script works!');

export {}