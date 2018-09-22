// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({ color: 'green', background: '#4F5155', currentState: 'off', opacity: 1 }, function () {
    console.log("Init btn color,subtitle cover background,state");
  });
});

// init state
// chrome.runtime.onInstalled.addListener(function () {
//   chrome.storage.sync.set({ currentState: 'off' }, function () {
//     console.log('init done')
//   })
// });

