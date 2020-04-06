/*
    Netflix version
 */

import $ from 'zepto';
import { getItem } from './localStorage';

// 1.获取节点，获得字幕
const sub = {
  pre: '',
  current: '',
};

const appendCSS = () => {
  let css = '.player-timedtext-text-container{display:none !important} .mejs-captions-text{display:none !important}';
  const head = document.getElementsByTagName('head')[0];
  const style = document.createElement('style');
  style.type = 'text/css';
  style.id = 'chrome-extension-plugin-css';
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  head.appendChild(style);
};


const getOriginText = () => {
  let obj_text = '';
  $('.player-timedtext-text-container').find('span').forEach((span) => {
    obj_text += (span.innerText + ' ').replace('<br>', ' ')
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
    appendCSS();
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

// 2.监听得到消息，并修改字幕

//Used for sending/receiving URL to/from background.js
chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
  console.log(JSON.stringify(request));
  if (sub.current !== sub.pre) {
    chrome.storage.sync.get(null, (items) => {
      const subtitle = `<div class="SUBTILTE" 
      style="    
      position: relative;
      display: inline;
      height: auto;
      max-width: 80%;
      color: #fff;
      text-align: center;
      margin: 0 .5em 1em;
      padding: 20px 8px;
      white-space: pre-line;
      writing-mode: horizontal-tb;
      unicode-bidi: plaintext;
      direction: ltr;
      -webkit-box-decoration-break: clone;
      background: ${items['backgroundColor']};
      opacity: ${items['backgroundColor']};
    ">
       <div class="origin_subtitle" 
        style="
            color:${items['origin_color']} !important;
            font-weight:${items['origin_weight']} !important;
            font-size:${items['origin_font']}px !important;;
        "
       >${request.origin}</div>
        <div class="translate_subtitle" 
        style="
            color: ${items['trans_color']} !important;
            font-weight:${items['trans_weight']} !important;
            font-size: ${items['trans_font']}px !important;
        "
        >${request.translate}</div>
    </div>`;
      let hasSubtitle = $('div.SUBTILTE').length === 0;
      if (hasSubtitle) {
        $('.player-timedtext').after(subtitle);
      } else {
        $('div.SUBTILTE').remove();
        $('.player-timedtext').after(subtitle);
      }
    });
  }
});

// 3.接收结果    接收中心

// 4.替换内容   替换中心
