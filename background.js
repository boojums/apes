// Copyright (c) 2014 Cristina Luis

// TODO: use a badge on browserAction:
// browserAction.setBadgeText and browserAction.setBadgeBackrgoundColor


// For use with a page action, shows when AP is the current page
// 
/*
function checkForAP(tabId, changeInfo, tab) {
    if (tab.url.indexOf("attackpoint.org") > -1) {
        // ... show the page action.
        chrome.browserPage.show(tabId);
    }
}
*/

// Listen for any changes to the URL of any tab.
//chrome.tabs.onUpdated.addListener(checkForAP);

chrome.browserAction.setBadgeText({text: ''});

// Generate crc32 table for use in crc32 for changed pages
// see: http://stackoverflow.com/questions/18638900/javascript-crc32
var makeCRCTable = function(){
    var c;
    var crcTable = [];
    for(var n =0; n < 256; n++){
        c = n;
        for(var k =0; k < 8; k++){
            c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
}

// Return crc for a given string. Uses makeCRCTable
var crc32 = function(str) {
    var crcTable = window.crcTable || (window.crcTable = makeCRCTable());
    var crc = 0 ^ (-1);

    for (var i = 0; i < str.length; i++ ) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }

    return (crc ^ (-1)) >>> 0;
};

// Parses out the message number and how many comments there are for 
// the 'recent comments' table block on a log page.
// Returns an array of objects with }msg: x num: n}
var parseCommentTable = function(html) {
    // matches message_1234567>blahblahblah<td>3
    // captures message id# and number of messages in thread
    re = /message_(\d+)">(?:.*?)\s*<td>(\d+)/g

    var data = {};
    html.replace(re, function(match, p1, p2) {
        data[p1] = parseInt(p2);
    });

    return data;
}

// TODO: change name to be more intuitive
// Compare two comment tables from a log to check if they 
// are the same. 
// Returns true if they are the same.
var compareCommentTables = function(oldtable, newtable) {
    // Only need to check that all the new discussions exist --
    // (older messages can 'roll off' the page) and have the same
    // number of messages
    for (var disc in newtable) {
        if (newtable.hasOwnProperty(disc)) {
            if (oldtable[disc] != newtable[disc]) {
                console.log(oldtable[disc]);
                return false;
            }
        }
    }
    return true;
}

var logurl = "http://www.attackpoint.org/log.jsp/user_540";
//var logurl = "http://attackpoint.org";

var element = document.createElement("iframe"); 
element.setAttribute('id', 'myframe');
element.setAttribute('height', 1000);
element.setAttribute('width', 1000);
document.body.appendChild(element);


(function reloadiframe() {
    element.src = logurl;
    console.log('done loading')
    setTimeout(reloadiframe, 20000);
})();


// ajax requests for log page to see if there are new comments
// TODO: take url as arg, either call checking function
// or retrieve url's tables here
(function worker() {
    $.ajax({
        url: logurl,
        cache: false,
        crossDomain: true,

        xhrFields: { 
            withCredentials: true},

        success: function(data) {
            if(logurl.search('log.jsp')) {
                //console.log(data);
                var table = parseCommentTable(data);
                //console.log(table);
                // get old table
                chrome.storage.sync.get(null, function(result) {
                    //console.log(result);
                    var oldtable = result.pages[logurl];
                    console.log(oldtable);
                    /*
                    var same = compareCommentTables(oldtable, table);
                    console.log(same)
                    if(!same) {
                    // save new table if different
                    // check current page (or use counter?)
                    // need to keep track of how man? or just a generic badge?
                        chrome.browserAction.setBadgeText({text: 'x'});
                    
                    } */
                });
            } else if(url.search('discussionthread.jsp')) {
                //compare CRCs here
            }
        },
        
        complete: function() {
            // schedule next request for 10 minutse for now
            //setTimeout(worker, 600000)
        }
    });
})();


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

// Called when user clicks to open all unread favorites
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

