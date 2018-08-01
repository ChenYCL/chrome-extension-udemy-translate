// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({color: 'green'}, function() {
    console.log("The color is green.");
  });
});

// init state
chrome.runtime.onInstalled.addListener(function(){
  chrome.storage.sync.set({currentState: null},function(){
      console.log('init done')
  })
})
