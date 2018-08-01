// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let start_btn = document.getElementById('on');
let end_btn = document.getElementById('off');

chrome.storage.sync.get('color', function(data) {
  start_btn.style.backgroundColor = data.color;
  start_btn.style.color = 'white';

});


start_btn.onclick = function(element) {
  let color = element.target.value;
  chrome.storage.sync.get('color', function(data) {
      resetBtn(end_btn);
      start_btn.style.backgroundColor = data.color;
      start_btn.setAttribute('value', data.color);
      start_btn.style.color = 'white';
  });

  chrome.storage.sync.set({currentState: 'on'});

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(
        tabs[0].id,
        // {code: 'document.body.style.backgroundColor = "' + color + '";'}
        
      )
  });
};

end_btn.onclick = function(element) {
  let color = element.target.value;
  chrome.storage.sync.get('color', function(data) {
    resetBtn(start_btn);
    end_btn.style.backgroundColor = data.color;
    end_btn.setAttribute('value', data.color);
    end_btn.style.color = 'white';
    
  });

  chrome.storage.sync.set({currentState: 'off'});
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(
        tabs[0].id,
        // {code: 'document.body.style.backgroundColor = "' + color + '";'}
        
      )
  });
};

function resetBtn(dom){
  dom.style.color = '';
  dom.style.backgroundColor = ''
}
