/**
 * @author Michael Brown
 */
var myApp = myApp || {};
myApp.globals = myApp.globals || {};

myApp.globals.trollsFiltered = 0;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	// read `newIconPath` from request and read `tab.id` from sender
	console.log("listener called");
	myApp.globals.trollsFiltered++;
	chrome.browserAction.setBadgeText({
		text : myApp.globals.trollsFiltered.toString()
	});
});

$(function() {
		chrome.browserAction.setBadgeText({
		text: ""
	});
});