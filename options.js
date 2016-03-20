/* Storage object needs to hold:
    - taggedUsers: [{userid: text}]
    - chickenUsers: [userids]
    - logMessages: [{messagid: count}]
    - trackLog: userid
*/

/*
<div>Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
*/

// populate data for debugging
function populate() {
    var chickenUsers = ['100', '5029'];
    var taggedUsers = {'100': 'Canadian', '44': 'wise man', '6265': 'skier'};
    var logMessages = {                       
                        1012930: 5,
                        1011447: 2,
                        1012324: 12,
                        1011445: 2 
                      };

    var trackLog = 470;

    var settings = {chickenUsers: chickenUsers,
                    taggedUsers: taggedUsers,
                    trackLog: trackLog,
                    logMessages: logMessages}
    console.log("populating:");
    console.log(settings);

    chrome.storage.sync.set(settings, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
            }, 
            1500);
    });
}

// Lookup username from:
// from: http://attackpoint.org/jsonuserinfo.jsp?userid=470
// and update fields where it occurs
function insertUsername(user) {
    $.getJSON( "http://attackpoint.org/jsonuserinfo.jsp", {
            "userid": user
        }, 
        function(data) {
            // TODO: error checking
            $("#chicken-"+user).prev().text(data.username);
            $("#tag-username-"+user).text(data.username);
            $("#tracked-log").text(data.username);
        });
}

// TODO: just make one function...
function showChickenStatus(statusText) {
    var status = $("#chicken-status");
    status.text(statusText);   
    setTimeout(function() {
        status.text('');
        }, 
        1500);
}

function showTaggedStatus(statusText) {
    var status = $("#tagged-status");
    status.text(statusText);   
    setTimeout(function() {
        status.text('');
        }, 
        1500);
}

function showFlagStatus(statusText) {
    var status = $('#status');
    status.text(statusText);
    setTimeout(function() {
        status.text('');
        },
        1500);
}

function loadOptions() {
    console.log('loading options');
    chrome.storage.sync.get(null, function(result) {
        var chickenUsers = result.chickenUsers || [];
  
        var userString = '';        
        for (var i in chickenUsers) {
            userString += '<tr><td>' + chickenUsers[i] + '</td>' +
                '<td class="remove-chicken" id="chicken-' + chickenUsers[i] + '" style="color:grey">' + 
                '[x]</td></tr>';
        }
        $('#chicken-users > tbody:last').append(userString);
        for (i in chickenUsers) {
            insertUsername(chickenUsers[i]);
        }

        var taggedUsers = result.taggedUsers || {};
        userString = '';
        for (var usernum in taggedUsers) {
            userString += '<tr><td id="tag-username-'+usernum+'">' + usernum + '</td>' +
            '<td><input class="tag-field" type="text" id="tag-'+usernum+'" value="' + taggedUsers[usernum] + '"></input></rd>' + 
            '<td class="remove-tagged" id="tagged-' + usernum + '" style="color:grey">' + 
                '[x]</td></tr>';
        }
        $('#tagged-users > tbody:last').append(userString);
        for (usernum in taggedUsers) {
            insertUsername(usernum);
        }

        var trackLog = result.trackLog || false;
        if (trackLog) {
            console.log(trackLog);
            insertUsername(trackLog);
            $('#tracked-log-field').val(trackLog);
        }
    });
}


// Action to add a tagged user on click
$("#add-tagged-user").click(function() {
    // TODO: validation of user
    var usernum = $("#tagged-user-field").val();
    chrome.storage.sync.get('taggedUsers', function(result) {
        var taggedUsers = result.taggedUsers || {};
        if (taggedUsers.hasOwnProperty(usernum)) {
            var statusText = "User " + usernum + " is already tagged.";
        } else {
            taggedUsers[usernum] = 'change me';
            chrome.storage.sync.set({'taggedUsers':taggedUsers});

            var userString = '<tr><td id="tag-username-'+usernum+'">' + usernum + '</td>' +
                '<td><input class="tag-field" type="text" id="tag-'+usernum+'" value="' + taggedUsers[usernum] + '"></input></rd>' + 
                '<td class="remove-tagged" id="tagged-' + usernum + '">' + 
                    '[x]</td></tr>';
            $('#tagged-users > tbody:last').append(userString);
            insertUsername(usernum);

            var statusText = "User " + usernum + " tagged.";
        }
        showTaggedStatus(statusText);
    });

    $("#tagged-user-field").val("");
});

// Action to save edited tag
$(document).on("change", ".tag-field", function(event) {
    
    // Save edited tag
    var usernum = $(event.target).attr('id').slice(4);
    chrome.storage.sync.get('taggedUsers', function(result) {
        var taggedUsers = result.taggedUsers || {};
        taggedUsers[usernum] = $(event.target).val();
        chrome.storage.sync.set({'taggedUsers':taggedUsers});

        var statusText = "Tag updated.";
        showTaggedStatus(statusText);
    });

});

// Make sure new tagged users are removable on click
$(document).on("click", ".remove-tagged", function(event) {
    //remove user from list and update the storage list
    var usernum = $(event.target).attr('id').slice(7); 

    chrome.storage.sync.get('taggedUsers', function(result) {
        var taggedUsers = result.taggedUsers;

        delete taggedUsers[usernum];
        chrome.storage.sync.set({'taggedUsers':taggedUsers});
        $(event.target).parent().remove();

        var statusText = "User " + usernum + " untagged.";
        showTaggedStatus(statusText);
    });
});


// Action to add a chicken user on click
$("#add-chicken-user").click(function() {
    // TODO: validation of user
    var user = $("#chicken-user-field").val();
    chrome.storage.sync.get('chickenUsers', function(result) {
        chickenUsers = result.chickenUsers || [];
        if (chickenUsers.indexOf(user) != -1) {
            var statusText = "User " + user + " already chickenified.";
        } else {
            chickenUsers.push(user);
            chrome.storage.sync.set({'chickenUsers': chickenUsers});
            var userString = '<tr><td>' + user + '</td>' +
                    '<td class="remove-chicken" id="chicken-' + user + '">' + 
                    '[x]</rd></tr>';
            $('#chicken-users > tbody:last').append(userString);
            insertUsername(user);

            var statusText = "User " + user + " chickenified.";
        }
        showChickenStatus(statusText);
    });

    $("#chicken-user-field").val("");
});


// Action to follow log on click
$("#flag").change(function() {
        var statusText = "Following your log";
        showFlagStatus(statusText);
});

// Make sure new chicken users are removable on click
$(document).on("click", ".remove-chicken", function(event) {
    //remove user from list and update the storage list
    var usernum = $(event.target).attr('id').slice(8); 

    chrome.storage.sync.get('chickenUsers', function(result) {
        var chickenUsers = result.chickenUsers;

        var index = chickenUsers.indexOf(usernum);
        if (index > -1) {
            chickenUsers.splice(index, 1);
        }
        chrome.storage.sync.set({'chickenUsers':chickenUsers});
        $(event.target).parent().remove();

        var statusText = "User " + usernum + " unchickenified.";
        showChickenStatus(statusText);
    });
});

document.addEventListener('DOMContentLoaded', loadOptions);
// Populate storage For debugging
$("#add-track-log").on("click", function() {
    var trackLog = $("#tracked-log-field").val();
    console.log(trackLog);
    // TODO: validate tracklog value
    chrome.storage.sync.set({'trackLog': trackLog})
});

$("#populate").click(populate);
$("#clear").on("click", function() {
    chrome.storage.sync.clear();
});

// Function uses AP's own lastreadmessages function to 
// see if message has been read, but this has many issues, not ideal
// Problem with this technique is that you need the message numbers to check,
// so you need to load the whole page and parse out the message id's anyway.
/*
(function worker() {
    $.ajax({
        url: "http://www.attackpoint.org/jsonlastreadmsgs.jsp?t=" + new Date().getTime(),
        cache: false,
        crossDomain: true,
        dataType: "json",
        type: "POST",
        data: {messageids: 1014164},
        xhrFields: { 
            withCredentials: true},

        success: function(data) {
            console.log(data)
        },
        
        complete: function() {
            // schedule next request for 10 minutse for now
            //setTimeout(worker, 600000)
        }
    });
})();
*/
