
let networkRequst = {};
let i = 0;
chrome.devtools.panels.elements.createSidebarPane(
  'video srt',
  function(sidebar) {
    // sidebar.setObject({ some_data: "Some data to show" });
    chrome.devtools.network.onRequestFinished.addListener(function(request) {
      // 打印每一个请求 到console控制台
      // chrome.devtools.inspectedWindow.eval(
      //   'console.log("network: " + unescape("' +
      //   escape(JSON.stringify(request.request)) + '"))');
      if(request.request.url.endsWith('.vtt')){
       request.getContent(function(content,encoding) {
         chrome.devtools.inspectedWindow.eval('console.log("devtools start")',function() {
          console.dir(content);
         })
         networkRequst[i++]= content;
       })
      }
      sidebar.setObject(networkRequst);

    });

  });


// devtool 传递 background ， 之后background api翻译完成之后，送往content，处理页面数据

/*   var backgroundPageConnection = chrome.runtime.connect({
     name: "devtools-page"
   });

   backgroundPageConnection.onMessage.addListener(function (message) {
     // Handle responses from the background page, if any
     sidebar.setExpression(message);
   });

   // Relay the tab ID to the background page
   chrome.runtime.sendMessage({
     tabId: chrome.devtools.inspectedWindow.tabId,
     scriptToInject: "content_script.js"
   });*/