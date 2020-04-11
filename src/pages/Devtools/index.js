
let networkRequst = {};
let i = 0;
chrome.devtools.panels.elements.createSidebarPane(
  'video srt',
  function(sidebar) {
    // sidebar.setObject({ some_data: "Some data to show" });
    chrome.devtools.network.onRequestFinished.addListener(function(request) {
      // 打印每一个请求 到console控制台

      if(request.request.url.endsWith('.vtt')){
       request.getContent(function(content,encoding) {
         chrome.devtools.inspectedWindow.eval('console.log("devtools start")',function() {
          // console.dir(content);
         })
         networkRequst[i++]= content;
       })
      }
      sidebar.setObject('');
      sidebar.setObject(networkRequst);

    });

  });


// devtool -> background -> content

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
