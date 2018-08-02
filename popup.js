// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

$(function(){
  let start_btn = document.getElementById('on');
  let end_btn = document.getElementById('off');
 
  chrome.storage.sync.get('currentState', function (data) {
    if (data.currentState == 'off') {
      chrome.storage.sync.get('color', function (data) {
        end_btn.style.backgroundColor = data.color;
        end_btn.style.color = 'white';
      });
    } else {
      chrome.storage.sync.get('color', function (data) {
        start_btn.style.backgroundColor = data.color;
        start_btn.style.color = 'white';
      });
    }
  });
  
  // start event
  start_btn.onclick = function (element) {
    let color = element.target.value;
    chrome.storage.sync.get('color', function (data) { // get color property
      resetBtn(end_btn);
      start_btn.style.backgroundColor = data.color;
      start_btn.setAttribute('value', data.color);
      start_btn.style.color = 'white';
    });
    chrome.storage.sync.set({ currentState: 'on' });
    console.log(md5,$.ajax)
  
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      
      chrome.tabs.executeScript(
        tabs[0].id,
        {
          code: `
          try{
            console.log(md5,$.ajax)
            document.body.style.backgroundColor = 'green';
            document.getElementsByClassName('captions-display--vjs-ud-captions-cue-text--38tMf')[0].style.display = 'none'
            if(document.getElementsByClassName('captions-display--vjs-ud-captions-cue-text--38tMf')[0]){
              var oldSub = document.getElementsByClassName('captions-display--vjs-ud-captions-cue-text--38tMf')[0].outerText;
            }
            // 发送内容 
            
            setInterval(function(){
              document.body.style.backgroundColor = 'green'
              let isNone = document.getElementsByClassName('captions-display--vjs-ud-captions-cue-text--38tMf')[0].style.display;
              if(isNone == ''){
                document.getElementsByClassName('captions-display--vjs-ud-captions-cue-text--38tMf')[0].style.display = 'none'
              }
              let subtitle = document.getElementsByClassName('captions-display--vjs-ud-captions-cue-text--38tMf');
              if(subtitle[0]){
                if(subtitle[0].outerText !== oldSub){
                  console.log(subtitle[0].outerText)
                  oldSub = subtitle[0].outerText;
                }
              }
            
            },200)
          }catch(e){
  
          }
         
          `}
  
      )
    });
  };

  chrome.runtime.sendMessage({
    method: 'showAlert'
  }, function(response) {});
  
  // end_btn event
  end_btn.onclick = function (element) {
    let color = element.target.value;
    chrome.storage.sync.get('color', function (data) {
      resetBtn(start_btn);
      end_btn.style.backgroundColor = data.color;
      end_btn.setAttribute('value', data.color);
      end_btn.style.color = 'white';
  
    });
  
    chrome.storage.sync.set({ currentState: 'off' });
  
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.executeScript(
        tabs[0].id,
        // {code: 'document.body.style.backgroundColor = "' + color + '";'}
        {
          code: `
          for(var i = 0; i < 9999; i++) {
              clearInterval(i)
          }
          document.getElementsByClassName('captions-display--vjs-ud-captions-cue-text--38tMf')[0].style.display = ''
          `}  // stop func here
  
      )
    });
  };
  function resetBtn(dom) {
    dom.style.color = '';
    dom.style.backgroundColor = ''
  }
  
  
})