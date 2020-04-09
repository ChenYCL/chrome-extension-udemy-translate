import { baiduRequest, googleTranslate, youdaoRequset,yandexRequest } from '../Content/modules/aixos';
import { getItem } from '../Content/modules/localStorage';

require('../../assets/img/icon-48.png');
require('../../assets/img/icon-128.png');

console.log('This is the background page.');
console.log('Put the background scripts here.');
console.log('init done');

// init storage
chrome.storage.sync.set({
  status: false,
  backgroundColor: '#000000',
  backgroundOpacity: 1,
  origin_font: 22,
  origin_color: '#ffffff',
  origin_weight: 700,
  trans_font: 28,
  trans_color: '#ffffff',
  trans_weight: 700,
  language: 'zh-cn',
  origin_lang:'auto',
  trans_way: 'youdao',
  trans_api: {
    youdao: {
      id: '57355d88f4156443',
      key: 'U6RHqaWtXdNqebvTfq8wjU6qzoy3WaI6',
    },
    baidu: {
      id: '20200404000412162',
      key: 'R7ehsQvB84gh0cHsmurk',
    },
    yandex: {
      id: 'trnsl.1.1.20190217T040712Z.7687025b32fef67e.bb176444ff3f4403d821f1b7b4a93ddcdac45633',
    },
    deepl:{
      id:'',
      key:''
    }
    // more...
  },
  // 翻译的文本信息 暂时存储
  txt: {},
});

const REQUEST = async (originText) => {
  let trans_way = await getItem('trans_way');
  switch (trans_way) {
    case 'youdao':
      return await youdaoRequset(originText);
    case 'google':
      let res = await googleTranslate(originText);
      return {
        origin: originText,
        translate: res.data[0],
      };
    case 'baidu':
      return await baiduRequest(originText);
    case 'yandex':
      return await yandexRequest(originText);
    case 'deepl':
      break;
  }
};

// background.js
chrome.runtime.onMessage.addListener(
  async function(request, sender, sendResponse) {
    let { text } = request;
    let result = await REQUEST(text);
    console.log(result);
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { ...result });
    });
  },
);



// devtools connection background.js
/*
chrome.runtime.onConnect.addListener(function(devToolsConnection) {
  // assign the listener function to a variable so we can remove it later
  var devToolsListener = function(message, sender, sendResponse) {
    // Inject a content script into the identified tab
    console.log(message,sender,sendResponse);
    chrome.tabs.executeScript(message.tabId,
      { file: message.scriptToInject });
  }
  // add the listener
  devToolsConnection.onMessage.addListener(devToolsListener);

  devToolsConnection.onDisconnect(function() {
    devToolsConnection.onMessage.removeListener(devToolsListener);
  });
});*/
