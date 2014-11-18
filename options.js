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

// Generate crc32 table for use in crc32 for changed pages
// see: http://stackoverflow.com/questions/18638900/javascript-crc32
var makeCRCTable = function(){
    var c;
    var crcTable = [];
    for(var n =0; n < 256; n++){
        c = n;
        for(var k =0; k < 8; k++){
            c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
}

// Return crc for a given string. Uses makeCRCTable
var crc32 = function(str) {
    var crcTable = window.crcTable || (window.crcTable = makeCRCTable());
    var crc = 0 ^ (-1);

    for (var i = 0; i < str.length; i++ ) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }

    return (crc ^ (-1)) >>> 0;
};

// Parses out the message number and how many comments there are for 
// the 'recent comments' table block on a log page.
// Returns an array of objects with }msg: x num: n}
var parseCommentTable = function(html) {
    // matches message_1234567>blahblahblah<td>3
    // captures message id# and number of messages in thread
    re = /message_(\d+)">(?:.*?)\s*<td>(\d+)/g

    var data = {};
    html.replace(re, function(match, p1, p2) {
        data[p1] = parseInt(p2);
    });

    return data;
}

// Compare two comment tables from a log to check if they 
// are the same. 
// Returns true if they are the same.
var compareCommentTables = function(oldtable, newtable) {
    // Only need to check that all the new discussions exist --
    // (older messages can 'roll off' the page) and have the same
    // number of messages
    for (var disc in newtable) {
        if (newtable.hasOwnProperty(disc)) {
            if (oldtable[disc] != newtable[disc]) {
                console.log(oldtable[disc]);
                return false;
            }
        }
    }
    return true;
}

var logurl = "http://www.attackpoint.org/log.jsp/user_2820";

// ajax requests for log page to see if there are new comments
// TODO: take url as arg, either call checking function
// or retrieve url's tables here
(function worker() {
    $.ajax({
        url: logurl,
        success: function(data) {
            if(logurl.search('log.jsp')) {
                var table = parseCommentTable(data);
                console.log(table);
                // get old table
                chrome.storage.sync.get(null, function(result) {
                    //console.log(result);
                    var oldtable = result.pages[logurl];
                    console.log(oldtable);
                    var result = compareCommentTables(oldtable, table);
                    console.log(result)
                });
            } else if(url.search('discussionthread.jsp')) {
                //compare CRCs here
            }
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