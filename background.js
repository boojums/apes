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

// ajax requests for log page to see if there are new comments
// TODO: take url as arg, either call checking function
// or retrieve url's tables here
(function worker() {
    $.ajax({
        url: logurl,
        success: function(data) {
            if(logurl.search('log.jsp')) {
                var table = parseCommentTable(data);
                console.log(table);
                // get old table
                chrome.storage.sync.get(null, function(result) {
                    //console.log(result);
                    var oldtable = result.pages[logurl];
                    console.log(oldtable);
                    var result = compareCommentTables(oldtable, table);
                    console.log(result)
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

