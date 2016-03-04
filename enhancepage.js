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
    if ($(elem).hasClass('tag')) {
        return;
    }
    var newcontent = document.createElement("div");
    newcontent.className = 'tag';
    newcontent.style.color = "#aaaaaa";
    newcontent.style.fontSize = "11px";
    newcontent.innerHTML = tag;
    $(elem).append(newcontent)
}

// TODO: load current tag and chicken status
function dialog_content(user) {
    var content = "Tag: <input id='tag-user-field' type=text size=12></input>";
    content += "<br />Chickenify<input id='chickenify' type=checkbox></input>";
    return content;
}


// TODO: make it clickable to add a tag and/or chickenify
// TODO: try css/html5 modal dialog boxes instead
function add_tag_icon(elem, user) {
    var tagid = "tag-" + user;
    var tag = $("<span>").attr("class", "fa fa-tag")
               .attr("id", tagid)
               .css("color", "#aaaaaa")
               .prependTo(elem);

    tag.click(function() {
        $('<div />').html("Tag me").dialog({
            modal: true,
            title: "Tag User " + user,
            open: function() {
                $(this).html(dialog_content(user));
            },
            buttons: {
                Save: function(event) {
                    save_tag(user);
                    $('#tag-user-field').val('');
                    $('#chickenify').val('');
                    $(this).dialog("close");
                }
            },
            position: {
                my: "left center",
                at: "left center"
            }
        });
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
        var tagged_users = settings.taggedUsers;
        var chicken_users = settings.chickenUsers;

        // TODO: should only be within id messages
        // (try next + selector)
        $('.discussion_post_name').each(function(index) {
            var user_str = user_regex.exec($(this).html());
            if (user_str == null) {
                return;
            }

            add_tag_icon(this, user_str[1]);

            if (user_str) {
                var user = user_str[1];
            } // TODO: um, else don't do stuff...?

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


// TODO: save tag text
function save_tag(user) {
    console.log(user);
    console.log($('#tag-user-field').val());
    console.log($('#chickenify').prop('checked'));
    if ($('#chickenify').prop('checked')) {
        console.log('chicken true');
        chrome.storage.sync.get('chickenUsers', function(result) {
            chickenUsers = result.chickenUsers;
            chickenUsers.push(user);
            chrome.storage.sync.set({'chickenUsers':chickenUsers});
        });
    } else {
        chrome.storage.sync.get('chickenUsers', function(result) {
            chickenUsers = result.chickenUsers;
            console.log(chickenUsers);
            var index = chickenUsers.indexOf(user);
            console.log(index);
            if (index > -1) {
                chickenUsers.splice(index, 1);
                chrome.storage.sync.set({'chickenUsers':chickenUsers});
            }            
        })
    }
}


// TODO?: Action to add tag 
$(document).on("click", "#tag-user-field", function(event) {
});


// TODO?: Action to chickenify a user
$(document).on("click", "#chickenify", function(event) {
});

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
