/* Storage object needs to hold:
    - taggedUsers: {userid: text}
    - ignoreUsers: [userid]
    - chickenUsers: [userid]
    - pages: {url: info:(obj/crc)}
*/

// TODO: css for options.html so that links to remove are clicky
// TODO: make this a popup instead?
// TODO: move ajax to background.js
// TODO: reorganize storage to make more sense?



//populate()
// populate data 
function populate() {
    var hideUsers = ['4380', '470'];
    var chickenUsers = ['100', '5029'];
    var taggedUsers = {'100': 'Canadian', '44': 'wise man'};
    var pages = {"http://www.attackpoint.org/log.jsp/user_2820":
                {1012930: 6,
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