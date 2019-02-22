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
    let zh_font = document.getElementById('zh_font');
    let zh_color = document.getElementById('zh_color');
    let zh_weight = document.getElementById('zh_weight');
    let es_font = document.getElementById('es_font');
    let es_color = document.getElementById('es_color');
    let es_weight = document.getElementById('es_weight');
    let bgnone = document.getElementById('bgnone');
    // feedback opacity value
    chrome.storage.sync.get('background', function (data) {
        $(btnPicker).val(data.background);
    });
    chrome.storage.sync.get('zhcolor', function (data) {
        $(zh_color).val(data.zhcolor);
    });

    chrome.storage.sync.get('zhfontSize', function (data) {
        $(zh_font).val(data.zhfontSize);
    });

    chrome.storage.sync.get('zhfontWeight', function (data) {
        $(zh_weight).val(data.zhfontWeight);
    });

    chrome.storage.sync.get('esfontWeight', function (data) {
        $(es_weight).val(data.esfontWeight);
    });

    chrome.storage.sync.get('esfontSize', function (data) {
        $(es_font).val(data.esfontSize);
    });

    chrome.storage.sync.get('escolor', function (data) {
        $(es_color).val(data.escolor);
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

            bgnone.addEventListener('click', function (e) {
                chrome.storage.sync.set({
                    background: 'initial'
                })
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function (tabs) {
                    chrome.tabs.executeScript(null, {
                        file: "subtitle.js"
                    });
                });
            }, false)


            // auto click start
            $('#on').click();

            // choose background event
            btnPicker.addEventListener('change', function (e) {
                let color = $(this).val()
                $('#bg-color-picker').css('backgroundColor', color);
                chrome.storage.sync.set({
                    background: color
                })
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function (tabs) {
                    chrome.tabs.executeScript(null, {
                        file: "subtitle.js"
                    });
                });
            }, false)

            // select background opacity event
            inputBgOp.addEventListener('input', function (e) {
                let _opacity = $(this).val();
                chrome.storage.sync.set({
                    opacity: _opacity
                })
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function (tabs) {
                    chrome.tabs.executeScript(null, {
                        file: "subtitle.js"
                    });
                });
            }, false)

            zh_color.addEventListener('change', function (e) {
                let zh_color_css = $(this).val();
                chrome.storage.sync.set({
                    zhcolor: zh_color_css
                })
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function (tabs) {
                    chrome.tabs.executeScript(null, {
                        file: "subtitle.js"
                    });
                });
            }, false)
            es_color.addEventListener('change', function (e) {
                let es_color_css = $(this).val();
                chrome.storage.sync.set({
                    escolor: es_color_css
                })
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function (tabs) {
                    chrome.tabs.executeScript(null, {
                        file: "subtitle.js"
                    });
                });
            }, false)
            zh_font.addEventListener('input', function (e) {
                let zh_font_css = $(this).val();
                chrome.storage.sync.set({
                    zhfontSize: zh_font_css
                })
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function (tabs) {
                    chrome.tabs.executeScript(null, {
                        file: "subtitle.js"
                    });
                });
            }, false)
            es_font.addEventListener('input', function (e) {
                let es_font_css = $(this).val();
                chrome.storage.sync.set({
                    esfontSize: es_font_css
                })
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function (tabs) {
                    chrome.tabs.executeScript(null, {
                        file: "subtitle.js"
                    });
                });
            }, false)
            es_weight.addEventListener('input', function (e) {
                let es_weight_css = $(this).val();
                chrome.storage.sync.set({
                    esfontWeight: es_weight_css
                })
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function (tabs) {
                    chrome.tabs.executeScript(null, {
                        file: "subtitle.js"
                    });
                });
            }, false)
            zh_weight.addEventListener('input', function (e) {
                let zh_weight_css = $(this).val();
                chrome.storage.sync.set({
                    zhfontWeight: zh_weight_css
                })
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function (tabs) {
                    chrome.tabs.executeScript(null, {
                        file: "subtitle.js"
                    });
                });
            }, false)

        }
    });

    // options event
    option_btn.onclick = function () {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            chrome.runtime.openOptionsPage()
        });
    }

    // start event
    start_btn.onclick = function (element) {
        chrome.storage.sync.get('background', function (data) {
            if (document.all) { // document.createStyleSheet(url)
                window.style = `.zh_sub{background:${data.background} !important;}`;
                document.createStyleSheet("javascript:style");
            } else { //document.createElement(style)
                var style = document.createElement('style');
                style.type = 'text/css';
                style.innerHTML = `.zh_sub{background:${data.background} !important;}`;
                document.getElementsByTagName('HEAD').item(0).appendChild(style);
            }
        })
        chrome.storage.sync.get('opacity', function (data) {
            if (document.all) { // document.createStyleSheet(url)
                window.style = `.zh_sub{opacity:${data.opacity} !important;}`
                document.createStyleSheet("javascript:style");
            } else { //document.createElement(style)
                var style = document.createElement('style');
                style.type = 'text/css';
                style.innerHTML = `.zh_sub{opacity:${data.opacity} !important;}`
                document.getElementsByTagName('HEAD').item(0).appendChild(style);
            }
        })
        chrome.storage.sync.get('color', function (data) { // get color property
            resetBtn(end_btn);
            start_btn.style.backgroundColor = data.color;
            start_btn.setAttribute('value', data.color);
            start_btn.style.color = 'white';
        });
        chrome.storage.sync.set({
            currentState: 'on'
        });

        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            chrome.tabs.executeScript(null, {
                file: "lib/jquery-3.1.1.min.js"
            });
            chrome.tabs.executeScript(null, {
                file: "lib/md5.js"
            });
            chrome.tabs.executeScript(null, {
                file: "start.js"
            });
            chrome.tabs.executeScript(null, {
                file: "subtitle.js"
            });
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

        chrome.storage.sync.set({
            currentState: 'off'
        });
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            chrome.tabs.executeScript(null, {
                file: "end.js"
            });
        });
    };

    function resetBtn(dom) {
        dom.style.color = '';
        dom.style.backgroundColor = ''
    }




})