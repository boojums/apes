/*
    Injected into all AP pages and modifies discussion sections based
    on users that have been tagged, marked for hiding, or chickenified.
*/


// Regex patterns for chickenifying discussion posts
var word_regex = /\b\w+\b/g;
var capWord_regex = /\b[A-Z]+\w*\b/g;
var lowWord_regex = /\b[a-z]+\w*\b/g;

var user_regex = /user_([0-9]*)/;

// Converts text of element to 'chickens'. Caps retained, numbers and punctuation retained.
// TODO: click to return old text
function chickenify(elem) {
    old_text = $(elem).text();
    new_text = old_text.replace(capWord_regex, "Chicken");
    new_text = new_text.replace(lowWord_regex, "chicken");
    $(elem).text(new_text);
}

// Add tag under username in discussion posts
function show_tag(elem, tag) {
    // Don't do anything if it already has a tag
    if ($(elem).hasClass('#tag')) {
        return;
    }
    var newcontent = document.createElement("div");
    newcontent.className = 'tag';
    newcontent.style.color = "#aaaaaa";
    newcontent.style.fontSize = "11px";
    newcontent.innerHTML = tagged_users[user];
    $(elem).append(newcontent)
}

// TODO: just hide the text, not their entire existance?
// TODO: do not implement in version 1
function hide_post(elem) {

    //$(elem).next().toggle()
    
    // if (post.style.display == 'none') {
    //     post.style.display = 'inherit';
    // } else {
    //     //note: use following to leave gap where msg was
    //     //msgs[i].style.visibility = 'hidden' 
    //     post.style.display = 'none';
    // }
}


(function() {
    // Only run if we are on a page with discussion messages
    if (document.getElementById('messages')) {

        // load everything from syncStorage
        chrome.storage.sync.get(null, function(result) {
            settings = result;
            //console.log(settings);
        
            tagged_users = settings.taggedUsers;
            hide_users = settings.hideUsers;
            chicken_users = settings.chickenUsers;

            // TODO: should only be within id messages
            // (try next + selector)
            $('.discussion_post_name').each(function(index) {
                var user_str = user_regex.exec($(this).html());
                if(user_str) {
                    user = user_str[1];
                }
                
                // Keep out of v1
                //if (hide_users.indexOf(user) != -1) {
                //    hide_post(this);
                //}

                if (chicken_users.indexOf(user) != -1) {
                    chickenify($(this).next());
                }

                if (user in tagged_users) {
                    tag = tagged_users[user];
                    show_tag(this, tag);
                }
            });
        });
    }
})();