

var user_regex = /user_[0-9]*/;
var word_regex = /\b\w+\b/g;
var capWord_regex = /\b[A-Z]+\w*\b/g;
var lowWord_regex = /\b[a-z]+\w*\b/g;


var regex = /unread\:[1-9]/;


//test the text of the body element against our regex
if(regex.test(document.body.innerText)) {
    
    favtable = document.getElementsByClassName('favlist')[0];
    lastrow = favtable.getElementsByClassName('morestuff')[0]; 
    console.log(lastrow);
    cell = lastrow.cells[0];
    //oldcontent = cell.innerHTML;
    //console.log(oldcontent);

    var newcontent = document.createElement('a');
    newcontent.text = 'open all';
    newcontent.href = 'javascript:void(0)';
    newcontent.addEventListener("click", function() {
        //favorites chunk
        var chunk = String(document.body.innerHTML.match(/unread[\s\S]*more logs/));
    
        //var users_regex = /user_[0-9]*/g;
        var users = chunk.match(/user_[0-9]*/g);
    
        // the regex produced a match, so notify background script
        // and attempt to send it the array of users 
        chrome.runtime.sendMessage({"user_list": users}, function(response) {});
    });
    console.log(newcontent);
    cell.appendChild(document.createTextNode(" | "));
    cell.appendChild(newcontent);
    
    
} else {
    //no match found - maybe some kind of alert should be triggered, or perhaps the icon shouldn't show
    // load everything from localStorage
    chrome.storage.local.get(null, function(result) {
        enhancePage(result);
    });

    function enhancePage(settings) {
        console.log(settings);
        tagged_users = settings.taggedUsers;
        hide_users = settings.hideUsers;
        chicken_users = settings.chickenUsers;

        // TODO: error checking here, this isn't always necessary
        var msgs = document.getElementById('messages').
                getElementsByClassName('discussion_post');

        for (var i=0; i<msgs.length; i++) {
            var user_element = msgs[i].getElementsByClassName("discussion_post_name")[0];
            var user = user_element.innerHTML.match(/user_[0-9]*/)[0].slice(5);
            
            // TODO: just hide the text, not their entire existance?
            if (hide_users.indexOf(user) != -1) {
                if (msgs[i].style.display == 'none') {
                    msgs[i].style.display = 'inherit';
                } else {
                    //note: use following to leave gap where msg was
                    //msgs[i].style.visibility = 'hidden' 
                    msgs[i].style.display = 'none';
                }
            } else {
                // TODO: add (t) link to name block to add tag to user
                if (user in tagged_users) {
                    var tagged = user_element.getElementsByClassName('tag')[0];
                    if (!tagged) {
                        var newcontent = document.createElement("div");
                        newcontent.className = 'tag';
                        newcontent.style.color = "#aaaaaa";
                        newcontent.style.fontSize = "11px";
                        newcontent.innerHTML = tagged_users[user];
                        user_element.appendChild(newcontent)
                    }
                }
                // TODO: write chickenify() to handle all the searching and replacing
                if (chicken_users.indexOf(user) != -1) {
                    post = msgs[i].getElementsByClassName("discussion_post_body")[0];
                    old_text = post.innerHTML
                    new_text = old_text.replace(capWord_regex, "Chicken");
                    new_text = new_text.replace(lowWord_regex, "chicken");
                    post.innerHTML = new_text
                }
            }
            
        }

    }
}

//window.onload = initShowHideContent;
