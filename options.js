/* Storage object needs to hold:
    - taggedUsers: {userid: text}
    - ignoreUsers: [userid]
    - chickenUsers: [userid] 
*/

//populate()
// populate data data
function populate() {
    var hideUsers = ['4380', '470'];
    var chickenUsers = ['100', '5029'];
    var taggedUsers = {'100': 'old guy', '44': 'old guy'};

    var settings = {hideUsers: hideUsers, 
                    chickenUsers: chickenUsers,
                    taggedUsers: taggedUsers}

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

function loadOptions() {

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

//document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);