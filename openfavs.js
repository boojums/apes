/*
    Injected into the front page of AP to add a link that will open
    all unread favorites in new tabs.
*/

// regex for 'unread: n', which only shows up if there are unread favorites
// catches anything that isn't 0
var unreadregex = /unread\:[1-9]/;

// TODO: clean this up, use jquery perhaps?

// first see if we are on a page with unread favorites
if(unreadregex.test(document.body.innerText)) {
    
    favtable = document.getElementsByClassName('favlist')[0];
    lastrow = favtable.getElementsByClassName('morestuff')[0]; 
    cell = lastrow.cells[0];

    var newcontent = document.createElement('a');
    newcontent.text = 'open all';
    newcontent.href = '#';
    newcontent.id = 'openall'

    newcontent.addEventListener("click", function() {

        // Find user ids of unread favorites, listed between unread and 'more logs' link
        // Do not want all 'user_n' links as that would include Noisy Logs, etc.
        var chunk = String(document.body.innerHTML.match(/unread[\s\S]*more logs/));    
        var users = chunk.match(/user_[0-9]*/g);
    
        // The regex produced a match, so notify background script
        // and attempt to send it the array of users 
        chrome.runtime.sendMessage({"user_list": users}, function(response) {});
    });

    cell.appendChild(document.createTextNode(" | "));
    cell.appendChild(newcontent);
} else {
    if (debug) {
        console.log('nothing to see here...');
    }
}
