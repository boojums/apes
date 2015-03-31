/* Storage object needs to hold:
    - taggedUsers: {userid: text}
    (- ignoreUsers: [userid])
    - chickenUsers: [userid]
TODO: separate this one out:
    - pages: {url: info:(obj/crc)}
*/

// TODO: make this a popup instead?

// populate data for debugging
function populate() {
    var chickenUsers = ['100', '5029'];
    var taggedUsers = {'100': 'Canadian', '44': 'wise man', '6265': 'skier'};
    var pages = {"http://www.attackpoint.org/log.jsp/user_470":
                    {   
                        1012930: 5,
                        1011447: 2,
                        1012324: 12,
                        1011445: 2 
                    }
                }

    var settings = {chickenUsers: chickenUsers,
                    taggedUsers: taggedUsers,
                    pages: pages}
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
            $("#tag-"+user).prev().text(data.username);            
        });
}

function showChickenStatus(statusText) {
    var status = $("#chicken-status");
    status.text(statusText);   
    setTimeout(function() {
        status.text('');
        }, 
        1500);
}

function loadOptions() {
    chrome.storage.sync.get(null, function(result) {
        var chickenUsers = result.chickenUsers;
  
        var userString = '';        
        for (var i in chickenUsers) {
            userString += '<tr><td>' + chickenUsers[i] + '</td>' +
                '<td class="remove-chicken" id="chicken-' + chickenUsers[i] + '">' + 
                '[x]</td></tr>';
        }
        $('#chicken-users > tbody:last').append(userString);
        for (i in chickenUsers) {
            insertUsername(chickenUsers[i]);
        }

        var taggedUsers = result.taggedUsers;
        userString = '';
        for (var user in taggedUsers) {
            userString += '<tr><td>' + user + '</td><td id="tag-'+user+'">' + taggedUsers[user] + '</rd></tr>';
        }
        $('#tagged-users > tbody:last').append(userString);
        for (user in taggedUsers) {
            insertUsername(user);
        }

    });
}

function saveOptions() {

}

function eraseOptions() {

}

// Action to add a chicken user on click
$("#add-chicken-user").click(function() {
    // TODO: validation of user
    // TODO: check for duplicate user
    var user = $("#chicken-user-field").val();
    chrome.storage.sync.get('chickenUsers', function(result) {
        chickenUsers = result.chickenUsers;
        chickenUsers.push(user);
        chrome.storage.sync.set({'chickenUsers':chickenUsers});
        
        var userString = '<tr><td>' + user + '</td>' +
                '<td class="remove-chicken" id="chicken-' + user + '">' + 
                '[x]</rd></tr>';
        $('#chicken-users > tbody:last').append(userString);
        insertUsername(user);

        var statusText = "User " + user + " chickenified.";
        showChickenStatus(statusText);
    });

    $("#chicken-user-field").val("");
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
document.getElementById('save').addEventListener('click', saveOptions);
// Populate storage For debugging
$("#populate").click(populate);


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
