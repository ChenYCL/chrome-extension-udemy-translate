// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

// const kButtonColors = ['#3aa757', '#e8453c', '#f9bb2d', '#4688f1'];

// function constructOptions(kButtonColors) {
//   for (let item of kButtonColors) {
//     let button = document.createElement('button');
//     button.style.backgroundColor = item;
//     button.addEventListener('click', function() {
//       chrome.storage.sync.set({color: item}, function() {
//         console.log('color is ' + item);
//       })
//     });
//     document.body.appendChild(button);
//   }
// }
// constructOptions(kButtonColors);

window.onload = function () {
    let configInfoBefore = null;
    restore(configInfoBefore);
    var apiconfig = {
        'youdao': {
            apikey: ''
        },
        'baidu': {
            apikey: ''
        }
    }

    $('.apply').on('click', function (e) {
        e.stopPropagation();
        config();
    })
    $('.cancel').on('click', function (e) {
        e.stopPropagation();
    })



}

function restore(configInfoBefore) {

    chrome.storage.sync.get('udemy', function (data) {
        configInfoBefore = JSON.parse(data.udemy);
        // $('input[name=apiType]:checked').val()
        $('input[name=apiValue]').val(configInfoBefore.apiKey)
        // $('input[name=' + $('input[name=apiType]:checked').val() + ']:checked').val()
        $('input[name=key]').val(configInfoBefore.Key)
    })

}

function config() {

    let config = {
        'apiType': $('input[name=apiType]:checked').val(),
        'apiKey': $('input[name=apiValue]').val(),
        'aimLang': $('input[name=' + $('input[name=apiType]:checked').val() + ']:checked').val(),
        'Key': $('input[name=key]').val(),
    }
    // chrome.extension.sendRequest({greeting: "hello"}, function(response) {
    //     console.log(1);
    // });
    chrome.storage.sync.set({ udemy: JSON.stringify(config) }, function () {
        console.log('存入')
    })
    console.log(config);

    return config;
}


