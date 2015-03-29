/* Storage object needs to hold:
    - taggedUsers: {userid: text}
    (- ignoreUsers: [userid])
    - chickenUsers: [userid]
TODO: separate this one out:
    - pages: {url: info:(obj/crc)}
*/

// TODO: make this a popup instead?
// TODO: checkboxes, save instead of immediate change?

//userinfo from: http://attackpoint.org/jsonuserinfo.jsp?userid=470

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

// TODO: look up username from:
//      http://attackpoint.org/userprofile.jsp/user_470
function loadOptions() {
    chrome.storage.sync.get(null, function(result) {
        var chickenUsers = result.chickenUsers;
        
        var userString = '';        
        for (var user in chickenUsers) {
            userString += '<tr><td>' + chickenUsers[user] + '</td>' +
                '<td class="remove-chicken" id="chicken-' + chickenUsers[user] + '">' + 
                '[x]</rd></tr>';
        }
        $('#chicken-users > tbody:last').append(userString);

        $('.remove-chicken').click(function() {
            //remove user from list and update the storage list
            var usernum = $(this).attr('id').slice(8); 
            var index = chickenUsers.indexOf(usernum);
            if (index > -1) {
                chickenUsers.splice(index, 1);
            }
            chrome.storage.sync.set({'chickenUsers':chickenUsers});
            // TODO: remove entire table row
            $(this).remove();
        });
        
        var taggedUsers = result.taggedUsers;
        userString = '';
        for (user in taggedUsers) {
            userString += '<tr><td>' + user + '</td><td>' + taggedUsers[user] + '</rd></tr>';
        }
        $('#tagged-users > tbody:last').append(userString);

    });
}

function saveOptions() {
    var select = document.getElementById("taggedUsers");
    var taggedUsers = select.children[select.selectedIndex].value;
    console.log(taggedUsers)
    chrome.storage.sync.set({'taggedUsers':taggedUsers});
    // chrome.storage.sync.set({'taggedUsers': taggedUsers}, function() {
    //     // Update status to let user know options were saved.
    //     var status = document.getElementById('status');
    //     status.textContent = 'Options saved.';
    //     setTimeout(function() {
    //         status.textContent = '';
    //         }, 
    //         1500);
    //});

    chrome.storage.sync.get('taggedUsers', function(result) {
        if(result.taggedUsers) {
            console.log(result.taggedUsers);
        } else {
            console.log('something wrong')
        }
    });
}

function eraseOptions() {
    chrome.storage.sync.removeItem("taggedUsers");
    location.reload();
}

document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('save').addEventListener('click', saveOptions);
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
