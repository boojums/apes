// Copyright (c) 2014 Cristina Luis


// TODO: add listener (to background?) for changes to storage once tagging implemented in-place
// chrome.storage.onChanged.addListener(function(changes, namespace) {

// debugging
var checkloguser = 470;
var discussionsurl = 'http://attackpoint.org/discussion-rss.jsp/refs-8.470/user_470';

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    var checkstring = 'attackpoint.org/log.jsp/user_' + String(checkloguser);
    if (tab.url.search(checkstring) > 0)  {
        chrome.browserAction.setBadgeText({text: ''});
        $.ajax({
            url: discussionsurl,
            cache: false,
            crossDomain: true,
            
            success: function(data) {
                var table = parseCommentXML(data);
                chrome.storage.sync.set({'logMessages': table});     
            }
        });
    }
});

// Start with a blank badge
chrome.browserAction.setBadgeText({text: ''});

// Compare two comment tables from a log to check if they 
// are the same. 
// Returns true if they are different.
var commentTableChanged = function(oldtable, newtable) {
    // Only need to check that all the new discussions exist --
    // (older messages can 'roll off' the page) and have the same
    // number of messages
    for (var disc in newtable) {
        if (oldtable.hasOwnProperty(disc)) {
            if (oldtable[disc] != newtable[disc]) {
                return true;
            }
        } else return true;
    }
    return false;
};

// Take the rss xml feed and pull out the message id's and number of comments
var parseCommentXML = function(xml) {
    re = /messageid=(\d+)#v(\d+)/g
    var data = {};
    text = $(xml).text();
    text.replace(re, function(match, p1, p2) {
        data[p1] = parseInt(p2);
    });

    return data;
};

// TODO: take url as arg, either call checking function
// Try using the rss feed to get discussion status instead of scraping the page
// Might be possible to just get the top item and check that -- that should 
// always change if there is a cahnge to any discussion
(function worker() {
    $.ajax({
        url: 'http://attackpoint.org/discussion-rss.jsp/refs-8.470/user_470',
        cache: false,
        crossDomain: true,
        
        success: function(data) {
            var table = parseCommentXML(data);
            chrome.storage.sync.get(null, function(result) {
                var oldtable = result.logMessages;                    
                if (commentTableChanged(oldtable, table)) {
                    chrome.browserAction.setBadgeText({text: 'c'});
                } 
            });
        },

        complete: function() {
            // schedule next request for 1 minute from now
            setTimeout(worker, 60000)
        }
    });
})();


/////////////////
// Options page
/////////////////
// from: http://adamfeuer.com/notes/2013/01/26/chrome-extension-making-browser-action-icon-open-options-page/
function openOrFocusOptionsPage() {
    var optionsURL = chrome.extension.getURL('options.html');
    chrome.tabs.query({}, function(extensionTabs) {
        var found = false;
        for (var i=0; i < extensionTabs.length; i++) {
            if (optionsURL == extensionTabs[i].url) {
                found = true;
                console.log("tab id: " + extensionTabs[i].id);
                chrome.tabs.update(extensionTabs[i].id, {"selected": true});
            }
        }
        if (found == false) {
            chrome.tabs.create({url: "options.html"});
        }
    });
}

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
    openOrFocusOptionsPage();
});

//////////////////////////
// Open all unreads
//////////////////////////
// Opens all unread favorites in separate tabs
// Message is sent from openfavs.js when user clicks on 'open all' link
function onRequest(request, sender, sendResponse) {
    
    var urls = request.user_list;
    
    //open urls in tabs
    for(i=0; i<urls.length; i++) {
        chrome.tabs.create({url: 'http://www.attackpoint.org/log.jsp/' + urls[i]}); }       
    
    //return nothing to let the connection be cleaned up.
    sendResponse({});
};

//listen for the content script to send a message to this page
chrome.runtime.onMessage.addListener(onRequest);
