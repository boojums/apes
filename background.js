// Copyright (c) 2014 Cristina Luis

// Called when the url of a tab changes.
function checkForAP(tabId, changeInfo, tab) {
    // If the string 'attackpoint.org' is found in the tab's URL...
    if (tab.url.indexOf("attackpoint.org") > -1) {
        // ... show the page action.
        chrome.pageAction.show(tabId);
    
        chrome.tabs.executeScript(null, 
            {file:"contentscript.js"});
    }
}

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForAP);

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
chrome.pageAction.onClicked.addListener(function(tab) {
    openOrFocusOptionsPage();
});

function onRequest(request, sender, sendResponse) {

};

//listen for the content script to send a message to this page
chrome.extension.onRequest.addListener(onRequest);

