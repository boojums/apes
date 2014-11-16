var hide_user = '4380';
var tagged_user = '2732';
var chicken_user = '44';
var user_regex = /user_[0-9]*/;
var word_regex = /\b\w+\b/g;
var capWord_regex = /\b[A-Z]+\w*\b/g;
var lowWord_regex = /\b[a-z]+\w*\b/g;

var msgs = document.getElementById('messages').
			getElementsByClassName('discussion_post');

//console.log(msgs.length);

for (var i=0; i<msgs.length; i++) {
	var user_element = msgs[i].getElementsByClassName("discussion_post_name")[0];
	var user = user_element.innerHTML.match(/user_[0-9]*/)[0].slice(5);
	
	// TODO: just hide the text, not their entire existance
	if (user == hide_user) {
		if (msgs[i].style.display == 'none') {
			msgs[i].style.display = 'inherit';
		} else {
			msgs[i].style.display = 'none';
		}
	}
	
	if (user == tagged_user) {
		var tagged = user_element.getElementsByClassName('tag')[0];
		if (!tagged) {
			var newcontent = document.createElement("div");
			newcontent.className = 'tag';
			newcontent.style.color = "#999999";
			//change to be tiny text, etc.
			newcontent.innerHTML = 'awesome';
			console.log(newcontent)
			user_element.appendChild(newcontent)
		}
	}

	// TODO: write chickenify() to handle all the searching and replacing
	if (user == chicken_user) {
		post = msgs[i].getElementsByClassName("discussion_post_body")[0];
		old_text = post.innerHTML
		//new_text = old_text.replace(/[a]/, "chicken");
		new_text = old_text.replace(capWord_regex, "Chicken");
		console.log(new_text);
		new_text = new_text.replace(lowWord_regex, "chicken");
		post.innerHTML = new_text
	}
	
}



/*
(C) www.dhtmlgoodies.com, September 2005
*/	
function showHideAnswer()
{
	var numericID = this.id.replace(/[^\d]/g,'');
	var obj = document.getElementById('a' + numericID);
	if(obj.style.display=='block'){
		obj.style.display='none';
	}else{
		obj.style.display='block';
	}		
}


function initShowHideContent()
{
	var divs = document.getElementsByTagName('DIV');
	for(var no=0;no<divs.length;no++){
		if(divs[no].className=='question'){
			divs[no].onclick = showHideAnswer;
		}	
	
	}	
}

//window.onload = initShowHideContent;
