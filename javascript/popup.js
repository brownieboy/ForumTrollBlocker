/**
 * @author Michael Brown
 */
var mySettings = mySettings || {};
mySettings.functions = mySettings.functions || {};
mySettings.globals = mySettings.globals || {};

mySettings.functions.saveSettings = function() {
	var settings = {};
	settings.trollLists = [];
	var trollList, trollListSource;
	var $trollLists = $("textarea.trollList");
	$.each($trollLists, function(index, value) {
		trollListSource = $(value).val().split(/\n/);
		trollList = {};
		trollList[$(value).attr("id")] = trollListSource;
		settings.trollLists.push(trollList);
	});
	chrome.storage.sync.set({
		'forumBlockerSettings' : settings
	}, function() {
		// Notify that we saved.
		alert('Settings saved');
	});

};

$(function() {
	chrome.storage.sync.get('forumBlockerSettings', function(settings) {
		var $trollLists = $("textarea.trollList");
		var currentID, newValues;
		$.each($trollLists, function(index, value) {
			currentID = $(value).attr("id");
			newValues = settings.forumBlockerSettings.trollLists[currentID];
			$(value).val(newValues);
		});
	});

	$("#butSaveSettings").click(function() {
		mySettings.functions.saveSettings();
	});
});
