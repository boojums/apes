/* Storage object needs to hold:
    - taggedUsers: {userid: text}
    - ignoreUsers: [userid]
    - chickenUsers: [userid]
TODO: separate this one out:
    - pages: {url: info:(obj/crc)}
*/

// TODO: Use a db for storage instead? sloppy to have to retrieve all and then replace all
// TODO: css for options.html so that links to remove are clicky
// TODO: make this a popup instead?
// TODO: move ajax to background.js
// TODO: reorganize storage to make more sense?

//userinfo from: http://attackpoint.org/jsonuserinfo.jsp?userid=470


// Function uses AP's own lastreadmessages function to 
// see if function has been read, but this has many issues, not ideal
// Problem with this technique is that you need the message numbers to check,
// so you need to load the whole page and parse out the message id's anyway.
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


//populate()
// populate data 
function populate() {
    var hideUsers = ['4380'];
    var chickenUsers = ['100', '5029'];
    var taggedUsers = {'100': 'Canadian', '44': 'wise man', '6265': 'skier'};
    var pages = {"http://www.attackpoint.org/log.jsp/user_2820":
                {1012930: 5,
                        1011447: 2,
                        1012324: 12,
                        1011445: 2}
                }

    var settings = {hideUsers: hideUsers, 
                    chickenUsers: chickenUsers,
                    taggedUsers: taggedUsers,
                    pages: pages}

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
        //console.log(result);
            
        var chickenUsers = result.chickenUsers;
        var chickenTable = document.getElementById('chickenTable');
        
        for (var i=0; i<chickenUsers.length; i++) {
            var row = chickenTable.insertRow(0);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);

            cell1.innerHTML = chickenUsers[i];
            cell2.innerHTML = '';

            var a = document.createElement('a');
            a.text = 'x';
            //a.href = 'options.html';
            //a.href = 'javascript:void(0)';
            a.id = '111';
            //console.log(a);
            a.addEventListener("click", function() {
                //console.log(event.toElement.id);
            })
            cell2.appendChild(a);
            //console.log(cell2);
        }
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