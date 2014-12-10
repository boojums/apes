/*
    Injected into the front page of AP to add a link that will open
    all unread favorites in new tabs.
*/


// regex for 'unread: n', which only shows up if there are unread favorites
// catches anything that isn't 0
var regex = /unread\:[1-9]/;

// first see if we are on a page with unread favorites
if(regex.test(document.body.innerText)) {
    
    // TODO: chain with jquery instead
    favtable = document.getElementsByClassName('favlist')[0];
    lastrow = favtable.getElementsByClassName('morestuff')[0]; 
    console.log(lastrow);
    cell = lastrow.cells[0];

    var newcontent = document.createElement('a');
    newcontent.text = 'open all';
    newcontent.href = 'javascript:void(0)';
    newcontent.id = 'openall'

    newcontent.addEventListener("click", function() {

        // Find user id's of unread favorites, listed between unread and 'more logs' link
        // Do not want all 'user_n' links as that would include Noisy Logs, etc.
        var chunk = String(document.body.innerHTML.match(/unread[\s\S]*more logs/));    
        var users = chunk.match(/user_[0-9]*/g);
    
        // the regex produced a match, so notify background script
        // and attempt to send it the array of users 
        chrome.runtime.sendMessage({"user_list": users}, function(response) {});
    });
    console.log(newcontent);
    cell.appendChild(document.createTextNode(" | "));
    cell.appendChild(newcontent);
} else {
    console.log('nothing to see here...')
}
