// Copyright (c) 2014 Cristina Luis


// TODO: add listener (to background?) for changes to storage once tagging implemented in-place
// chrome.storage.onChanged.addListener(function(changes, namespace) {

// debugging
var checkloguser = 470;

function getDiscussionURL(userid) {
    var base_url = 'http://attackpoint.org/discussion-rss.jsp/refs-8.xxxx/user_xxxx';
    url = base_url.replace(/xxxx/g, userid);
    return url
}

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

    var checkstring = 'attackpoint.org/log.jsp/user_' + String(checkloguser);
    if (tab.url.search(checkstring) > 0)  {
        chrome.storage.sync.get(null, function(result) {
            if (result.hasOwnProperty('trackLog')) {
                chrome.browserAction.setBadgeText({text: ''});    
                discussionsurl = getDiscussionURL(result.trackLog);
                updateCommentTable(discussionsurl);
            }
        });
    }

    // TODO: this is a mess! 
    // Check if the page is for a discussion being followed
    // If so, update storage and clear badge
    message_re = /attackpoint\.org\/discussionthread\.jsp\/message_(\d+)/
    var match = message_re.exec(tab.url);
    if (match != null) { 
        message_id = match[1]
        chrome.storage.sync.get(null, function(result) {
            if (result.hasOwnProperty('logMessages')) {
                var oldtable = result.logMessages;
            }
            if (oldtable.hasOwnProperty(match[1])) {
                chrome.browserAction.setBadgeText({text: ''});    
                updateCommentTable(result.Tracklog);
            }
        });
    }
});


// TODO: just one function with worker?
// Ajax request that fetches comments from RSS feed and updates the 
// comment table with the messageIDs and number of messages 
function updateCommentTable(discussionsurl) {    
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
// Might be possible to just get the top item and check that -- that should 
// always change if there is a cahnge to any discussion
(function worker() {
    chrome.storage.sync.get("trackLog", function(result) {
        var userid = result.trackLog;
        if (userid !== undefined) {

        }

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
                //setTimeout(worker, 6000)
            }
        });
    });
})();


/////////////////
// Click toolbar icon
/////////////////
chrome.browserAction.onClicked.addListener(function(tab) {
    // TODO: go to discussions url
    chrome.tabs.create({url: 'http://www.attackpoint.org/'})
    //chrome.runtime.openOptionsPage()
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
