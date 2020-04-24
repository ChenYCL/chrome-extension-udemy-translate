import {
    baiduRequest,
    googleTranslate,
    youdaoRequset,
    yandexRequest,
} from '../Content/modules/aixos';
import { getItem } from '../Content/modules/localStorage';

require('../../assets/img/icon-48.png');
require('../../assets/img/icon-128.png');

console.log('This is the background page.');
console.log('Put the background scripts here.');
console.log('init done');

// init storage
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == 'install') {
        console.log('This is a first install!');
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
            origin_lang: 'auto',
            trans_way: 'youdao',
            trans_api: {
                youdao: {
                    id: '',
                    key: '',
                },
                baidu: {
                    id: '',
                    key: '',
                },
                yandex: {
                    id: '',
                },
                deepl: {
                    id: '',
                    key: '',
                },
                // more...
            },
            // 翻译的文本信息 暂时存储
            txt: {},
        });
    } else if (details.reason == 'update') {
        var thisVersion = chrome.runtime.getManifest().version;
        console.log(
            'Updated from ' + details.previousVersion + ' to ' + thisVersion + '!'
        );
    }
});

const REQUEST = async(originText) => {
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
        default:
            // deepl
            break;
    }
};

// background.js
chrome.runtime.onMessage.addListener(async function(
    request,
    sender,
    sendResponse
) {
    let { text } = request;
    let result = await REQUEST(text);
    console.log(result);
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {...result });
    });
});

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