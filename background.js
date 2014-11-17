// Copyright (c) 2014 Cristina Luis


// Called when the url of a tab changes.
function checkForAP(tabId, changeInfo, tab) {
    // If the string 'attackpoint.org' is found in the tab's URL...
    if (tab.url.indexOf("attackpoint.org") > -1) {
        // ... show the page action.
        chrome.browserAction.show(tabId);
    }
}

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForAP);

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

