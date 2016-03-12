/*
    Injected into all AP pages and modifies discussion sections based
    on users that have been tagged or chickenified.

    Also handles magic DOMA link pasting.
*/


// Regex patterns for chickenifying discussion posts
var loword_regex = /\b[a-z]+\w*\b(?![^<]*>)/g;
var capsword_regex = /\b[A-Z]+\w*\b(?![^<]*>)/g;

var user_regex = /user_([0-9]*)/;


// Converts text of an element to 'chickens'. 
// Caps retained, numbers and punctuation retained, for awesomeness.
function chickenify(elem) {
    var old_text = $(elem).html()
    $(elem).html($(elem).html().replace(loword_regex, "chicken"));
    $(elem).html($(elem).html().replace(capsword_regex, "Chicken"));
    var new_text = $(elem).html()

    // Click text to toggle between original and chickenified
    $(elem).on("click", [old_text, new_text], function(event) {
        ($(elem).html() === event.data[1]) ? 
               $(elem).html(event.data[0]) : $(elem).html(event.data[1]);
    });

}


// Revert to original text and remove click event
function unchickenify(elem) {
    var events = jQuery._data($(elem)[0], "events");
    var text = events['click'][0]['data'][0];
    $(elem).html(text);
    $(elem).unbind('click');
}


// Add tag under username in discussion posts
function show_tag(elem, tag) {
    var field = $(elem).find('.tag');
    if (field.length > 0) {
        $(field[0]).html(tag);
    } else {
        $(elem).append(
            $('<div/>')
                .attr("class", "tag")
                .html(tag)
                .css("color", "#aaaaaa"  )
                .css("fontSize", "11px")
        );
        $(elem).next().css("min-height", "2.2em");
    }
}

// Basic template for tag dialog
function dialog_content(user) {
        var content = "Tag: <input id='tag-user-field' type=text size=12></input>";
        content += "<br />Chickenify<input id='chickenify' type=checkbox></input>";
        return content;
}


// Load current tage and chicken status into tag dialog
function update_dialog(user) {
    chrome.storage.sync.get(null, function(result) {
        if (result.hasOwnProperty("chickenUsers")) {
            chickenUsers = result.chickenUsers;
            if (chickenUsers.indexOf(user) != -1) {
                $('#chickenify').prop("checked", true);        }
        }
        if (result.hasOwnProperty("taggedUsers")) {
            if (user in result.taggedUsers) {
                tag = result.taggedUsers[user];
                $('#tag-user-field').val(tag);
            }
        }
    });
}


// Adds a tag icon before username, click opens dialog for 
// changing a tag or chickenifying a user's posts.
function add_tag_icon(elem, user) {
    var tagid = "tag-" + user;
    var tag = $("<span>").attr("class", "fa fa-tag")
               .attr("id", tagid)
               .css("color", "#aaaaaa")
               .prependTo(elem);

    tag.click(function() {
        $('<div />').html("Tag me").dialog({
            title: "Tag User " + user,
            open: function() {
                $(this).html(dialog_content(user));
            },
            closeOnEscape: true,
            buttons: {
                Cancel: function() {
                    $(this).dialog("destroy");
                },
                Save: function(event) {
                    var checked = $('#chickenify').prop('checked');
                    var tag = $('#tag-user-field').val();
                    save_tag(user, checked, tag); 
                    $(this).dialog("destroy");
                }
            },
            position: {
                my: "left top",
                at: "right bottom",
                of: tag
            }
        });
        update_dialog(user);
        return false;   
    });
}


// Run when page loads to find all users who needs tags or whose
// text should be chickenified.
(function() {
    if (!document.getElementById('messages')) {
        return;
    }
    chrome.storage.sync.get(null, function(result) {
        var settings = result;
        var tagged_users = settings.taggedUsers || {};
        var chicken_users = settings.chickenUsers || [];

        $('#messages .discussion_post_name').each(function() {
            var user_str = user_regex.exec($(this).html());
            if (user_str == null) {
                return;
            }

            add_tag_icon(this, user_str[1]);

            if (user_str) {
                var user = user_str[1];
            }

            if (chicken_users.indexOf(user) != -1) {
                chickenify($(this).next());
            }

            if (user in tagged_users) {
                var tag = tagged_users[user];
                show_tag(this, tag);
            }
        });
    });
})();


// Save chickenify and tag info from user dialog on discussion page.
function save_tag(user, checked, tag) {
    var selector = '#messages .discussion_post_name:has(a[href$="' + user +'"])';
    var msgs = $(selector);

    chrome.storage.sync.get(null, function(result) {
        var chickenUsers = result.chickenUsers || [];
        var index = chickenUsers.indexOf(user);

        var taggedUsers = result.taggedUsers || {};

        // Add user to chickenify list if not already there
        if (checked) {
            if (index < 0) { 
                chickenUsers.push(user);
                chrome.storage.sync.set({'chickenUsers':chickenUsers});
                msgs.each(function() {
                    chickenify($(this).next()); 
                });            
            }
        // Remove user from list if there
        } else { 
            if (index > -1) {
                chickenUsers.splice(index, 1);
                chrome.storage.sync.set({'chickenUsers':chickenUsers});
                msgs.each(function() {
                    unchickenify($(this).next()); 
                });            
            }            
        }

        // TODO: check for bad things
        // add/change user's tag
        msgs.each(function() {
            show_tag($(this), tag);
        });
        taggedUsers[user] = tag;
        chrome.storage.sync.set({'taggedUsers':taggedUsers});
    });
}


// Borrowed from: 
// https://gist.github.com/srsudar/e9a41228f06f32f272a2
function insertTextAtCursor(text) {
    var el = document.activeElement;
    var val = el.value;
    var endIndex;
    var range;
    var doc = el.ownerDocument;
    if (typeof el.selectionStart === 'number' &&
        typeof el.selectionEnd === 'number') {
        endIndex = el.selectionEnd;
        el.value = val.slice(0, endIndex) + text + val.slice(endIndex);
        el.selectionStart = el.selectionEnd = endIndex + text.length;
    } else if (doc.selection !== 'undefined' && doc.selection.createRange) {
        el.focus();
        range = doc.selection.createRange();
        range.collapse(false);
        range.text = text;
        range.select();
    }
}


// Convert a link to a DOMA map to a thumbnail image that links to that map page.
$('textarea').bind('paste', function(e) {
    e.preventDefault();
    var pasted = e.originalEvent.clipboardData.getData('text');
    var element = this;
    var doma_re = /(http[s]?:\/\/[\S]+\/doma\/)show_map\.php\?user=[\w]+&map=([0-9]+)/;
    var match = doma_re.exec(pasted);
    if (match != null) {
        var url = match[1];
        var mapnum = match[2];
        var img_url = url + 'map_images/' + mapnum;
        var img_block = '<a href='+pasted+'><img src='+img_url+'.thumbnail.jpg></a>';
        insertTextAtCursor(img_block);
    } else {
        insertTextAtCursor(pasted);
    }
});
