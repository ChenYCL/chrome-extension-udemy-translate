// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({ color: 'green' }, function () {
    console.log("The color is green.");
  });
});

// init state
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({ currentState: 'off' }, function () {
    console.log('init done')
  })
});


chrome.extension.onRequest.addListener(
  function (request, sender, sendResponse) {
    console.log(request);
  });
chrome.extension.onMessage.addListener(function (request, _, sendResponse) {
  // 返回数据
  var dicReturn;

  // 读取已存数据
  // 从localstorage中读取数据
  var strList = localStorage['udemy'];
  if (strList) {
    // 将json字符串转为对象
    var dicList = JSON.parse(strList)
    dicReturn = { 'status': 200, 'data': dicList }
  } else {
    dicReturn = { 'status': 404 }
  }
  localStorage.udemy = strList;
  // 向content_script返回信息
  sendResponse(dicReturn);
})