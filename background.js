// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

"use strict";
// chrome.runtime.onInstalled.addListener(function() {
 
// });

chrome.storage.sync.set(
    { color: "green", background: "#4F5155", currentState: "off", opacity: 1 },
    function() {
      console.log("Init btn color,subtitle cover background,state");
    }
  );

// init state
// chrome.runtime.onInstalled.addListener(function () {
//   chrome.storage.sync.set({ currentState: 'off' }, function () {
//     console.log('init done')
//   })
// });

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var query = "",
    _promise = null;
  if (request.currentRequstName == "yandex") {
    query = request.subtitle;
    var apiKey = request.apiKey;
    var to =
      request.configInfo.aimLang == "undefined"
        ? "zh"
        : request.configInfo.aimLang;
    if (query == "") return;

    _promise = ajaxThen(
      "https://translate.yandex.net/api/v1.5/tr.json/translate",
      {
        key: apiKey,
        text: query,
        lang: to
      }
    );
  } else if (request.currentRequstName == "baidu") {
    query = request.subtitle;
    var apiKey = request.apiKey;
    var to =
      request.configInfo.aimLang == "undefined"
        ? "zh"
        : request.configInfo.aimLang;
    var sign = request.sign;
    var from = request.from;
    var salt = request.salt;
    if (query == "") return;

    _promise = ajaxThen("https://api.fanyi.baidu.com/api/trans/vip/translate", {
      q: query,
      appid: apiKey,
      salt: salt,
      from: from,
      to: to,
      sign: sign
    });
  } else if (request.currentRequstName == "youdao") {
    query = request.subtitle;
    var apiKey = request.apiKey;
    var sign = request.sign;
    var from = request.from;
    var salt = request.salt;
    var to =
      request.configInfo.aimLang == "undefined"
        ? "zh"
        : request.configInfo.aimLang;
    if (query == "") return;

    _promise = ajaxThen("https://openapi.youdao.com/api", {
      q: query,
      appKey: apiKey,
      salt: salt,
      from: from,
      to: to,
      sign: sign
    });
  }

  let requstName = request.currentRequstName;

  _promise.then(function(data) {
    console.log(data);
    //  background.js message -> content_script(start.js) ,avoid cors then manage dom in content_scripts
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, [data, query, requstName], function(
        response
      ) {
        console.log("content_script get message from background.js send");
      });
    });
  });
});

function ajaxThen(url, params) {
  var dtd = $.Deferred();
  $.ajax({
    url: url,
    type: "post",
    data: params,
    dataType: "json"
  }).then(
    function(data) {
      dtd.resolve(data);
    },
    function() {
      toastr.error("submit failure", "oprate failure");
      dtd.reject();
    }
  );
  return dtd.promise();
}
