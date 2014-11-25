/**
 * @author mikey
 *  Main application file.
 *  2013
 */

var myFilter = myFilter || {};
myFilter.functions = myFilter.functions || {};
myFilter.globals = myFilter.globals || {};
myFilter.globals.trollImg = chrome.extension.getURL("images/foot19.png");
myFilter.globals.trollImgLarge = chrome.extension.getURL("images/foot38.png");

// The main filter list.  An array of Author names to check off as Trolls.
// Note that trolls like Owlnet help themselves to a new user name each time
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
			if (author.indexOf(member.toLowerCase()) === -1) {
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

myFilter.functions.processTrolls = function($authors, hideTrollFunc) {
	// Loop through all the authors and check them off against our master troll list
	// via the isTroll() function.
	var author;
	$authors.each(function(index, $author) {
		author = $($author).html();
		author = author.trim();
		if (author.indexOf('href') > 0) {
			// Authors are sometimes an "a" tag, with href pointing to their profile page. In that case
			// we need to get the html() out of the"a" tag.
			authorAnchor = $(author).html();
			author = authorAnchor.trim();
		}

		if (myFilter.functions.isTroll(author.toLowerCase())) {
			// If author is a troll, then we block the parent div that has the
			// ".commentWrapper" class.  You can change this ".comment" and it
			// will block any thread on which the blocked author has commented,
			// but that's handing too much power to those idiots, IMHO.
			console.log("Stomping on designated troll " + author);
			// send message to background script
			myFilter.functions.hideTrollFunc($author, author);
			// Use call back to do the actual blocking
			chrome.runtime.sendMessage({
				"operation" : "trollBlocked"
			});
		}
	});
};

$(function() {
	console.log("Forum troll stomper started");
	var url = parseURL(window.location.hostname);
	// Defined in parseURL.js library
	var domainFull = url.host.toLowerCase();
	var domainFullArray = domainFull.split(".");
	var domain = domainFullArray[0] === "www" ? domainFullArray[1] : domainFullArray[0];
	chrome.runtime.sendMessage({
		"operation" : "appLoaded"
	});

	chrome.storage.sync.get('forumBlockerSettings', function(settings) {
		$("body").append('<div id="divNoTrollsMessage" style="display:none" title="No Trolls Defined"><div style="float:left; margin-top:10px"><img src="' + myFilter.globals.trollImgLarge + '"><\/div><div style="float:left; width:220px; margin-left:15px; margin-top:5px"><p>Forum Troll Stomper is running on this site, but you have not defined any trolls.  You\'re just wasting CPU cycles!<\/p><p>Please define some trolls or disable the extension.<\/div><\/div>');

		var trollsDefined = false;

		if ( typeof settings.forumBlockerSettings !== "undefined") {
			if ( typeof settings.forumBlockerSettings.trollList !== "undefined") {
				if ( typeof settings.forumBlockerSettings.trollList[domain + "TrollList"] !== "undefined") {
					if (settings.forumBlockerSettings.trollList[domain + "TrollList"].length > 0) {
						trollsDefined = true;
					} else {// Data in new format.
						if ('currentTrolls' in settings.forumBlockerSettings.trollList[domain + "TrollList"]) {
							trollsDefined = true;
						}
					}
				}
			}
		}

		// MB 07/10/2013 - Convert old data format to new.
		if (trollsDefined) {
			if (!('currentTrolls' in settings.forumBlockerSettings.trollList[domain + "TrollList"])) {
				var tempObj = {};
				tempObj.currentTrolls = settings.forumBlockerSettings.trollList[domain + "TrollList"];
				settings.forumBlockerSettings.trollList[domain + "TrollList"] = tempObj;
			}
		}

		try {
			if ($.inArray(domain, settings.forumBlockerSettings.trollsEnabled) === -1) {
				console.log(domain + " is not enabled for Troll Stomper.  Exiting now...");
				return;
			}
		} catch(e) {
			console.log("Error loading settings.  Assuming " + domain + " is not enabled for Troll Stomper.  Exiting now...");
			return;
		}

		if (trollsDefined) {
			var currentID, newValues;
			var processedArray = [];
			var tempArray = [];
			var hasTrolls = false;

			$(document).on('click', "a.aTrollPeek", function(e) {
				// e.PreventDefault();
				if ($(this).html() === "troll peek") {
					$(this).html("troll hide");
					myFilter.functions.trollPeek(this);
				} else {
					$(this).html("troll peek");
					myFilter.functions.trollUnpeek(this);
				}
				return false;
			});

			var authorsSelect;
			// CSS selector text

			// Setup functions and selectors based on our current domain/site.
			var getTrollString = function(author) {
				return '<span class="spanBlocked"><img src="' + myFilter.globals.trollImg + '"> <i>Stomped on troll ' + author + '<\/i>. <a href="#" class="aTrollPeek">troll peek</a><\/span>';
			};
			//			var trollWrap = function($element, author) {
			//				$element.wrap('<div class="trollWrapper"\/>').hide();
			//				$element.parents(".trollWrapper").prepend(getTrollString(author));
			//			};
			var trollPeek = function($wrapperElement) {
            	$wrapperElement.show('blind');
			};
			var trollHide = function($wrapperElement) {
              	$wrapperElement.hide('blind', null, 200);

			};

			switch(domain) {
				case "zdnet":
					authorsSelect = "#comments .author";
					myFilter.functions.hideTrollFunc = function($author, author) {
						$($author).parents(".commentWrapper").wrap('<div class="trollWrapper"\/>').hide();
						$($author).parents(".trollWrapper").prepend(getTrollString(author));
					};
					myFilter.functions.trollPeek = function(authorElement) {
                      	var $trollWrapperElement = $(authorElement).parent().parent();
                      	var $wrapperElement = $trollWrapperElement.find(".commentWrapper");
                      	trollPeek($wrapperElement);
					};
					myFilter.functions.trollUnpeek = function(authorElement) {
                        var $trollWrapperElement = $(authorElement).parent().parent();
                      	var $wrapperElement = $trollWrapperElement.find(".commentWrapper");
                      	trollHide($wrapperElement);
					};
					break;
				// case "pcpro":
					// // PCPro does their comments in two different ways.  They maybe in a userComments id
					// // (news item comments) or a commentList class (blog post comments) each with its own
					// // HTML layout.  We have to cater for both of those.
					// if ($("#userComments").length > 0) {// News item page
						// authorsSelect = "#userComments span.bold";
						// myFilter.functions.hideTrollFunc = function($author, author) {
							// $($author).parents("p").prev("p").prev("h4").before('<div class="trollWrapper"><div class="commentWrapper"><\/div><\/div>');
							// $($author).parents("p").prev("p").prev("h4").prev(".trollWrapper").prepend(getTrollString(author));
							// var $commentWrapper = $($author).parents("p").prev("p").prev("h4").prev(".trollWrapper").find(".commentWrapper");
							// $($author).parents("p").prev("p").prev("h4").appendTo($commentWrapper);
							// $($author).parents("p").prev("p").appendTo($commentWrapper);
							// $($author).parents("p").appendTo($commentWrapper);
							// $commentWrapper.hide();
						// };
						// myFilter.functions.trollPeek = function(authorElement) {
                      	  	// var $trollWrapperElement = $(authorElement).parent().parent();
                      		// var $wrapperElement = $trollWrapperElement.find(".commentWrapper");
                      		// trollPeek($wrapperElement);
						// };
						// myFilter.functions.trollUnpeek = function(authorElement) {
                 			// var $trollWrapperElement = $(authorElement).parent().parent();
              	        	// var $wrapperElement = $trollWrapperElement.find(".commentWrapper");
	                      	// trollHide($wrapperElement);
						// };
// 
					// } else {// Blog post page
						// authorsSelect = ".commentlist span.bold";
						// myFilter.functions.hideTrollFunc = function($author, author) {
							// $($author).parents("li").wrap('<div class="trollWrapper"\/>').hide();
							// $($author).parents("li").parents(".trollWrapper").prepend(getTrollString(author));
						// };
						// myFilter.functions.trollPeek = function(wrapperElement) {
							// trollPeek($(wrapperElement).parents(".trollWrapper"), "> li");
						// };
						// myFilter.functions.trollUnpeek = function(wrapperElement) {
							// trollHide($(wrapperElement).parents(".trollWrapper"), "> li");
						// };
					// }
					// break;
/*				case "computerworld":
					authorsSelect = ".dsq-commenter-name";
					myFilter.functions.hideTrollFunc = function($author, author) {
						$($author).parents(".dsq-comment-body").html('<span style="font-size: 90%"><img src="' + myFilter.globals.trollImg + '"> <i>Troll ' + author + ' stomped on<\/i><\/span>');
					};
					break; */
				case "cnet":
				case "nymag":
					authorsSelect = ".fyre-comment-username";
					myFilter.functions.hideTrollFunc = function($author, author) {
                    	$($author).parents(".fyre-comment-wrapper").wrap('<div class="trollWrapper"\/>').hide();
						$($author).parents(".trollWrapper").prepend(getTrollString(author));
					};
					myFilter.functions.trollPeek = function(authorElement) {
                        var $trollWrapperElement = $(authorElement).parents('.trollWrapper');
                      	var $wrapperElement = $trollWrapperElement.find(".fyre-comment-wrapper");
                      	trollPeek($wrapperElement);
					};
					myFilter.functions.trollUnpeek = function(authorElement) {
                        var $trollWrapperElement = $(authorElement).parents('.trollWrapper');
                      	var $wrapperElement = $trollWrapperElement.find(".fyre-comment-wrapper");
                      	trollHide($wrapperElement);
					};
					break;
			}

			// Get trolls from the Chrome storage.  Process the multi-part names, which are
			// comma-delimited strings, into an array of arrays.
			$.each(settings.forumBlockerSettings.trollList[domain + "TrollList"].currentTrolls, function(index, value) {
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
				//	myFilter.functions.processTrolls($(authorsSelect));
				// waitForKeyElements runs on Ajax loaded data, so it gets triggered
				// by the Previous and Next buttons, instead of just when the DOM is
				// first loaded.
				// We want to monitor all divs with the "author" class that are inside
				// the id="comments" block.
				waitForKeyElements(authorsSelect, myFilter.functions.processTrolls);
			}
		} else {
			$("#divNoTrollsMessage").dialog({
				minWidth : 350,
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
