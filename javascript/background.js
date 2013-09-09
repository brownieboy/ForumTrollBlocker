/**
 * @author Michael Brown
 */
var myApp = myApp || {};
myApp.globals = myApp.globals || {};

myApp.globals.trollsFiltered = 0;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	// read `newIconPath` from request and read `tab.id` from sender
  try {
    switch (request.operation) {
        case 'trollBlocked':
            console.log("trollBlocked message sent");
        	myApp.globals.trollsFiltered++;
        	chrome.browserAction.setBadgeText({
		      text : myApp.globals.trollsFiltered.toString()
        	});
        break;
      case 'appLoaded':
            console.log("appLoaded message sent");
        chrome.browserAction.setBadgeText({
        	text: ""
        }); 
    }
  }
  catch(e) {
    console.log('chrome.runtime.onMessage.addListener trapped error: ' + e);
  }
});

chrome.browserAction.onClicked.addListener(function(tab) {
  // Open options page in its own tab.
  chrome.tabs.create({'url': chrome.extension.getURL('options.html')}, function(tab) {
  });
});

/*
console.log("Setting badge to empty");
chrome.browserAction.setBadgeText({
	text: ""
});
*/
