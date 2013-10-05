/**
 * @author Michael Brown
 */
var mySettings = mySettings || {};
mySettings.functions = mySettings.functions || {};
mySettings.globals = mySettings.globals || {};
mySettings.globals.trollImgLarge = chrome.extension.getURL("images/foot38.png");


mySettings.functions.saveSettings = function() {
	var settings = {};
	settings.trollsEnabled = [];
 	$('[name=sites]:checked').each(function() {
       settings.trollsEnabled.push($(this).val());
     });
  
	settings.trollList = {};
	var trollListSource;
	var $trollLists = $("textarea.trollList");
	$.each($trollLists, function(index, value) {
		trollListSource = $(value).val().split(/\n/);
      	trollListSource = trollListSource.filter(function(n){
          return n;  // Remove falsy values such as empty strings
        });
		settings.trollList[$(value).attr("id")] = trollListSource;
	});
	chrome.storage.sync.set({
		'forumBlockerSettings' : settings
	}, function() {
		// Notify that we saved.
	//	alert('Settings saved');
	    $("#divNoTrollsMessage").dialog({
			minWidth : 220,
			buttons : [{
				text : "OK",
				click : function() {
					$(this).dialog("close");
				}
			}]
		});
	});
};

$(function() {
   $("body").append('<div id="divNoTrollsMessage" style="display:none" title="Settings Saved"><div style="float:left; margin-top:10px"><img src="' + mySettings.globals.trollImgLarge + '"><\/div><div style="float:left; width:120px; margin-left:15px; margin-top:5px"><p>Settings saved.<\/div><\/div>');
		
	chrome.storage.sync.get('forumBlockerSettings', function(settings) {
      	console.log("getting options");
		var $trollLists = $("textarea.trollList");
		var currentID, newValues;
		
		// Set list of enabled sites field
  	    $.each(settings.forumBlockerSettings.trollsEnabled, function(index,value) {
			$('input[name=sites][value="' + value + '"]').attr("checked", true);
     	});
      
      // Set lists of trolls fields
		$.each($trollLists, function(index, value) {
			currentID = $(value).attr("id");
			try {
				newValues = settings.forumBlockerSettings.trollList[currentID];
				$(value).val(newValues.join("\n"));
			} catch(e) {
				console.log("Trapped error " + e);
			};
		});
	});

	$("#butSaveSettings").click(function() {
		mySettings.functions.saveSettings();
	});
	$("#mainTabs").tabs();
    $("#listsTabs").tabs().addClass("ui-tabs-vertical ui-helper-clearfix");
    $("#listsTabs li").removeClass("ui-corner-top").addClass("ui-corner-left");


	
});
