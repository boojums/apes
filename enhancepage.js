/*
    Injected into all AP pages and modifies discussion sections based
    on users that have been tagged, marked for hiding, or chickenified.
*/

var user_regex = /user_[0-9]*/;
var word_regex = /\b\w+\b/g;
var capWord_regex = /\b[A-Z]+\w*\b/g;
var lowWord_regex = /\b[a-z]+\w*\b/g;

// Only run if we are on a page with discussion messages
if (document.getElementById('messages')){

    // load everything from syncStorage
    chrome.storage.sync.get(null, function(result) {
        settings = result;
        console.log(settings);
    
        tagged_users = settings.taggedUsers;
        hide_users = settings.hideUsers;
        chicken_users = settings.chickenUsers;

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

    });
}

//window.onload = initShowHideContent;
