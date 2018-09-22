// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

$(function () {
  let start_btn = document.getElementById('on');
  let end_btn = document.getElementById('off');
  let option_btn = document.getElementById('options');
  let btnPicker = document.getElementById('bg-color-picker');
  let inputBgOp = document.getElementById('opacity-input');
  // feedback opacity value
  chrome.storage.sync.get('background', function (data) {
    $(btnPicker).val(data.background);
  });

  // feedback bg color
  chrome.storage.sync.get('opacity', function (data) {
    $(inputBgOp).val(data.opacity);
  });
  chrome.storage.sync.get('currentState', function (data) {
    console.log(data.currentState)
    if (data.currentState == 'off') { // if is off before
      chrome.storage.sync.get('color', function (data) {
        end_btn.style.backgroundColor = data.color;
        end_btn.style.color = 'white';
      });

    } else {
      // init start button color
      chrome.storage.sync.get('color', function (data) {
        start_btn.style.backgroundColor = data.color;
        start_btn.style.color = 'white';
      });


      // auto click start 
      $('#on').click();

      // choose background event 
      btnPicker.addEventListener('change', function (e) {
        let color = $(this).val()
        $('#bg-color-picker').css('backgroundColor', color);
        chrome.storage.sync.set({ background: color })
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          chrome.tabs.executeScript(null, { file: "subtitle.js" });
        });
      }, false)

      // select background opacity event 
      inputBgOp.addEventListener('input', function (e) {
        let _opacity = $(this).val();
        chrome.storage.sync.set({ opacity: _opacity })
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          chrome.tabs.executeScript(null, { file: "subtitle.js" });
        });
      }, false)
    }
  });

  // options event
  option_btn.onclick = function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.runtime.openOptionsPage()
    });
  }

  // start event
  start_btn.onclick = function (element) {
    chrome.storage.sync.get('background', function (data) {
      let style = `<style>.zh_sub{background:${data.background} !importang;}</style>`
      document.body.appendChild(style)
    })
    chrome.storage.sync.get('opacity', function (data) {
      let style = `<style>.zh_sub{opacity:${data.opacity} !importang;}</style>`
      document.body.appendChild(style)
    })
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
      chrome.tabs.executeScript(null, { file: "subtitle.js" });
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




