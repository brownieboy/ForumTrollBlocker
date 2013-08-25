/**
 * @author Michael Brown
 */
var mySettings = mySettings || {};
mySettings.functions = mySettings.functions || {};
mySettings.globals = mySettings.globals || {};

mySettings.functions.saveSettings = function() {
	var settings = {};
	settings.trollList = {};
	var trollListSource;
	var $trollLists = $("textarea.trollList");
	$.each($trollLists, function(index, value) {
		trollListSource = $(value).val().split(/\n/);
		settings.trollList[$(value).attr("id")] = trollListSource;
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
			try {
				newValues = settings.forumBlockerSettings.trollList[currentID];
				$(value).val(newValues);
			} catch(e) {
				console.log("Trapped error " + e);
			};
		});
	});

	$("#butSaveSettings").click(function() {
		mySettings.functions.saveSettings();
	});
});
