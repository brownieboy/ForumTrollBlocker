/**
 * @author mikey
 *  Main application file.
 */

var myFilter = myFilter || {};
myFilter.functions = myFilter.functions || {};
myFilter.globals = myFilter.globals || {};
myFilter.globals.trollImg = chrome.extension.getURL("images/foot19.png");
myFilter.globals.trollImgLarge = chrome.extension.getURL("images/foot38.png");

// The main filter list.  An array of Author names to check off as Trolls.
// Note that trolls like Owlnet help themselves to anew user name each time
// he's banned.  So, he migh be Owlnet, Owllnet, Owlllnet and so on.  In that case,
// I specify the name as a two part array - "owl" and "net" - and let the isTroll()
// function check to see if both of those name chunks are in the Author name.
// myFilter.globals.filterList = [["william farrel"], ["owl", "net"], ["toddbottom"], ["loverock", "davidson"]];

myFilter.functions.isTroll = function(authorOriginal) {
	// Loop throuh the master filter list, which is an array of arrays (see above).
	var author = authorOriginal.toLowerCase();
	var isMember;
	if (!myFilter.globals.filterList) {
		return false;
	}
	// Outer loop - the array of troll names to check against
	myFilter.globals.filterList.some(function(memberArray) {
		isMember = true;
		//	console.log("memberArray = " + memberArray);
		memberArray.forEach(function(member) {
			//	console.log("Processing member " + member);
			// Inner loop - the individual parts of the troll's name is an array too,
			// although that array may have only one member.  We return true if
			// *every part* of the troll's name is containe within the author's name.
			if (author.indexOf(member.replace(/^\s+|\s+$/g, '').toLowerCase()) === -1) {
				// If only one part of the troll's name is not in the author's name
				// then we don't have a match.
				isMember = false;
			}
		});
		if (isMember) {
			return true;
		}
	});
	return isMember;
};

myFilter.functions.processTrolls = function($authors) {
	// Loop through all the authors and check them off against our master troll list
	// via the isTroll() function.
	var author;
	$authors.each(function(index, $author) {
		author = $($author).html();
		if (myFilter.functions.isTroll(author.toLowerCase())) {
			// If author is a troll, then we block the parent div that has the
			// ".commentWrapper" class.  You can change this ".comment" and it
			// will block any thread on which the blocked author has commented,
			// but that's handing too much power to those idiots, IMHO.
			console.log("Stomping on designated troll " + author);
			// $($author).parents(".commentWrapper").hide("slow");
			$($author).parents(".commentWrapper").html('<span style="font-size: 90%"><img src="' + myFilter.globals.trollImg + '"> <i>Troll ' + author + ' stomped on<\/i><\/span>');
			// send message to background script
			chrome.runtime.sendMessage({
				"operation" : "trollBlocked"
			});
		}
	});
};

$(function() {
	console.log("Forum troll stomper started");
	$("body").append('<div id="divNoTrollsMessage" title="No Trolls Defined"><div style="float:left; margin-top:10px"><img src="' + myFilter.globals.trollImgLarge + '"><\/div><div style="float:left; width:220px; margin-left:15px; margin-top:5px"><p>Forum Troll Stomper is running on this site, but you have not defined any trolls.  You\'re just wasting CPU cycles!<\/p><p>Please define some trolls or disable the extension.<\/div><\/div>');

	chrome.runtime.sendMessage({
		"operation" : "appLoaded"
	});
	chrome.storage.sync.get('forumBlockerSettings', function(settings) {
		var trollsDefined = ( typeof settings.forumBlockerSettings !== "undefined") ? true : false;
		trollsDefined = trollsDefined ? (( typeof settings.forumBlockerSettings.trollList !== "undefined") ? true : false) : false;
		if (trollsDefined) {
			var currentID, newValues;
			var processedArray = [];
			var tempArray = [];
			var hasTrolls = false;
			// Get trolls from the Chrome storage.  Process the multi-part names, which are
			// comma-delimited strings, into an array of arrays.
			$.each(settings.forumBlockerSettings.trollList["zdnetTrollList"], function(index, value) {
				if (value.indexOf(",") > -1) {
					processedArray.push(value.split(","));
					hasTrolls = true;
				} else {
					if (value !== "") {
						tempArray = [];
						tempArray.push(value);
						processedArray.push(tempArray);
						hasTrolls = true;
					}
				}
			});
			myFilter.globals.filterList = processedArray;
			console.log("Forum Troll Stomper retrieved troll list: " + JSON.stringify(myFilter.globals.filterList));
			if (hasTrolls) {
				myFilter.functions.processTrolls($("#comments .author"));
				// waitForKeyElements runs on Ajax loaded data, so it gets triggered
				// by the Previous and Next buttons, instead of just when the DOM is
				// first loaded.runtim
				// We want to monitor all divs with the "author" class that are inside
				// the id="comments" block.
				waitForKeyElements("#comments .author", myFilter.functions.processTrolls);
			}
		} else {
			//	alert("Forum Troll Stomper is running on this site, but you have not defined any trolls.  You're just wasting CPU cycles!  Please define some trolls or disable the extension.")
			console.log("launching jqueryui.dialog()");
			$("#divNoTrollsMessage").dialog({
				buttons : [{
					text : "OK",
					click : function() {
						$(this).dialog("close");
					}
				}]
			});
		}
	});
});
