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

window.onload = function(){
    var apiconfig ={
        'youdao':{
            apikey:''
        },
        'baidu':{
            apikey:''
        }
    }

    $('.apply').on('click',function(e){
        e.stopPropagation();
        config();
    })
    $('.cancel').on('click',function(e){
        e.stopPropagation();
        alert(1)
    })

    
    
}


function config(){

    let config ={
        'apiType':$('input[name=apiType]:checked').val()
    }

    console.log(config);

    return config;
}
// chrome.browserAction.onClicked.addListener(function (tab) {
//     chrome.tabs.executeScript({
//         file: 'lib/jquery-3.1.1.min.js'
//     });
//     chrome.tabs.executeScript({
//         file: 'lib/metro.min.js'
//     });
// });

