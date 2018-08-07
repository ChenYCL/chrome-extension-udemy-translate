// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

$(function () {
  let start_btn = document.getElementById('on');
  let end_btn = document.getElementById('off');
  let option_btn = document.getElementById('options');

  chrome.storage.sync.get('currentState', function (data) {
    console.log(data.currentState)
    if (data.currentState == 'off') { // if is off before
      chrome.storage.sync.get('color', function (data) {
        end_btn.style.backgroundColor = data.color;
        end_btn.style.color = 'white';
      });

    } else {
      chrome.storage.sync.get('color', function (data) { 
        start_btn.style.backgroundColor = data.color;
        start_btn.style.color = 'white';
      });
      $('#on').click();

    }
  });

  // options event
  option_btn.onclick = function (){
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.runtime.openOptionsPage()
    });
  }

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
  
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.executeScript(null, { file: "lib/jquery-3.1.1.min.js" });
      chrome.tabs.executeScript(null, { file: "lib/md5.js" });
      chrome.tabs.executeScript(null, { file: "start.js" });
    });
  };


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
      chrome.tabs.executeScript(null, { file: "end.js" });
    });
  };
  function resetBtn(dom) {
    dom.style.color = '';
    dom.style.backgroundColor = ''
  }


})




