/*
    Injected into all AP pages and modifies discussion sections based
    on users that have been tagged, marked for hiding, or chickenified.
*/


// Regex patterns for chickenifying discussion posts
var loword_regex = /\b[a-z]+\w*\b(?![^<]*>)/g;
var capsword_regex = /\b[A-Z]+\w*\b(?![^<]*>)/g;

var user_regex = /user_([0-9]*)/;

// Converts text of element to 'chickens'. Caps retained, numbers and punctuation retained.
function chickenify(elem) {
    old_text = $(elem).html()
    $(elem).html($(elem).html().replace(loword_regex, "chicken"));
    $(elem).html($(elem).html().replace(capsword_regex, "Chicken"));
    new_text = $(elem).html()

    // Click text to toggle between original and chickenified
    $(elem).click([old_text, new_text], function(event) {
            ($(elem).html() === event.data[1]) ? 
                   $(elem).html(event.data[0]) : $(elem).html(event.data[1]);
        });

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


(function() {
    // Only run if we are on a page with discussion messages
    if (document.getElementById('messages')) {

        // load everything from syncStorage
        chrome.storage.sync.get(null, function(result) {
            settings = result;
        
            tagged_users = settings.taggedUsers;
            chicken_users = settings.chickenUsers;

            // TODO: should only be within id messages
            // (try next + selector)
            $('.discussion_post_name').each(function(index) {
                var user_str = user_regex.exec($(this).html());
                if(user_str) {
                    user = user_str[1];
                }

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