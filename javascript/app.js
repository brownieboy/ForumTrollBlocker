/**
 * @author mikey
 *  Main application file.
 */

var myFilter = myFilter || {};
myFilter.functions = myFilter.functions || {};
myFilter.globals = myFilter.globals || {};

// The main filter list.  An array of Author names to check off as Trolls.
// Note that trolls like Owlnet help themselves to anew user name each time
// he's banned.  So, he migh be Owlnet, Owllnet, Owlllnet and so on.  In that case,
// I specify the name as a two part array - "owl" and "net" - and let the isTroll()
// function check to see if both of those name chunks are in the Author name.
// myFilter.globals.filterList = [["william farrel"], ["owl", "net"], ["toddbottom"], ["loverock", "davidson"]];

myFilter.functions.isTroll = function(author) {
	// Loop throuh the master filter list, which is an array of arrays (see above).
	var isMember;
	console.log("isTroll: Retrieved filter list is " + JSON.stringify(myFilter.globals.filterList));
	if (!myFilter.globals.filterList) {
		console.log("isTroll: Retrieved filter list is undefined, exiting function.");
		return false;
	}
	// Outer loop - the array of troll names to check against
	myFilter.globals.filterList.some(function(memberValue) {
		isMember = true;
		var memberArray = [];
		console.log("memberValue = " + memberValue);
		if (!$.isArray(memberValue)) {
			memberArray.push(memberValue);
		}
		else {
			memberArray = memberValue;
		}
		
		console.log("memberArray = " + memberArray);
		memberArray.forEach(function(member) {
			console.log("Processing member " + member);
			// Inner loop - the individual parts of the troll's name is an array too,
			// although that array may have only one member.  We return true if
			// *every part* of the troll's name is containe within the author's name.
			if (author.indexOf(member) === -1) {
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
	console.log("processing trolls...");
	var author;
	$authors.each(function(index, $author) {
		author = $($author).html();
		if (myFilter.functions.isTroll(author.toLowerCase())) {
			// If author is a troll, then we block the parent div that has the
			// ".commentWrapper" class.  You can change this ".comment" and it
			// will block any thread on which the blocked author has commented,
			// but that's handing too much power to those idiots, IMHO.
			console.log("Blocking designated troll " + author);
			$($author).parents(".commentWrapper").hide("slow");
		}
	});
};


$(function() {
	console.log("Forum troll blocker started");
	chrome.storage.sync.get('forumBlockerSettings', function(settings) {
		var currentID, newValues;
		var processedArray;
		myFilter.globals.filterList = settings.forumBlockerSettings.trollList["zdnetTrollList"];
		console.log("Just retrieved filter list is " + JSON.stringify(myFilter.globals.filterList));
		myFilter.functions.processTrolls($("#comments .author"));

	});
		// waitForKeyElements runs on Ajax loaded data, so it gets triggered
// by the Previous and Next buttons, instead of just when the DOM is
// first loaded.
// We want to monitor all divs with the "author" class that are inside
// the id="comments" block.
waitForKeyElements("#comments .author", myFilter.functions.processTrolls);
});
