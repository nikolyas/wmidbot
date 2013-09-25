var status_obj;
var nss = 0;
var interval;
var request_man = [];
var user;
var receiver;
var status = 0;
var blist = [];
var photo = '';

$.get('//www.dream-marriage.com/members/options.php',function(s){
	var href = $(s).find('.account_options_links li:eq(1) a').attr('href');
	user = href.replace(/[^0-9]+/ig,"");
	$.get('//www.dream-marriage.com/'+user+'.html',function(d){
		receiver = $(d).find('.profile-button-email').parent().attr('onclick').replace(/[^0-9]+/ig,"");
		var name = $(d).find('.profile_name p:eq(0)').text().split(',')[0];
		localStorage.setItem("receiver", receiver);
		localStorage.setItem("user", user);
	});
});

if(window.location.href.indexOf('dream-marriage.com') > 1){
	if($.cookie('sinc')==null){
		var date = new Date();
		var minutes = 60;
		date.setTime(date.getTime() + (minutes * 60 * 1000));
		$.cookie('sinc', "true", { expires: date, path: '/' });
		var ts = Math.round((new Date()).getTime() / 1000);
		var s = 0;
		
		$.getJSON('http://www.dream-marriage.com/chat/ajax.php?ts='+ts+'&pid='+$.cookie('user_id')+'&__tcAction=onlineListRequest',function(d){
			var ret = Math.round(d[0].data.length/15);
			for(i=0;i<ret;i++){
				$.get('http://www.dream-marriage.com/russian-women-gallery.php?all=men&online_dropdown=1&page='+i+'&ini='+i,function(data){
					
					
					$(data).find('.dmcontent>table:eq(0)>tbody>tr>td').each(function(){
						var name_men = $(this).find('tr:eq(0) td:eq(1) a').text();
						var age_men = $(this).find('tr:eq(1) td:eq(1)').text();
						var id_men = $(this).find('tr:eq(4) td:eq(1)').text();
						var id_receiver_str = $(this).find('tr:eq(5) td a:eq(1)').attr('href');
						var id_receiver = id_receiver_str.replace(/[^0-9]+/ig,"");
						var obj = {};
						obj.id_men = id_men;
						obj.name_men = name_men;
						obj.age_men = age_men;
						obj.id_receiver = id_receiver;
						request_man.push(obj);
					});
					s++;
					if(s==ret){
						var date = new Date();
						var minutes = 60;
						date.setTime(date.getTime() + (minutes * 60 * 1000));
						$.cookie('sinc', "true", { expires: date, path: '/' });
						localStorage.setItem("online", JSON.stringify(request_man));
					}
				});
				
			}
			
		});
	}
	if($.cookie('sincfv'+user)==null){
		var date = new Date();
		var minutes = 120;
		date.setTime(date.getTime() + (minutes * 60 * 1000));
		$.cookie('sincfv'+user, "true", { expires: date, path: '/' });
		var ts = Math.round((new Date()).getTime() / 1000);
		var s = 0;
		var ar_fav = [];
		$.get('http://www.dream-marriage.com/members/my_favorites.php?all=1',function(d){
			$(d).find('#favList .groups').each(function(i,v){
				var name = $(v).find('.la').html();
				var age = $(v).find('.lc').html();
				var id = $(v).find('.lc:eq(3)').html();
				var receiver = $(v).find('.details tr:last a:eq(1)').attr('href').replace(/[^0-9]+/ig,"");
				var obj = {};
				obj.id_men = id;
				obj.name_men = name;
				obj.age_men = age;
				obj.id_receiver = receiver;
				ar_fav.push(obj);
				localStorage.setItem("fav"+user, JSON.stringify(ar_fav));
			});
		});
	}
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	
	switch(request.command){
		case 'get_man':
			window.location.href = '#/'+request.object;
		break;
		case 'get_contact':
			$('body').append('<a href="#" onclick="$(\'.get_contacts\').html(JSON.stringify(chat.chatcontacts.contacts));" class="get_contacts" style="display:none;"></a>');
			$('.get_contacts').click();
			sendResponse({contact: $('.get_contacts').html()});
		break;
		case 'get_user': 
			
			
		break;
		case 'start_send': 
			var obj = status_obj = request.object[0];
			if(obj.speed==0){
				var speed = 3000;
			}else if(obj.speed==1){
				var speed = 1000;
			}else if(obj.speed==2){
				var speed = 500;
			}
			interval = setInterval(function(){
				
				if(obj.list[nss]){
					if(obj.list[nss].age>=(obj.age_from-0)&&obj.list[nss].age<=(obj.age_to-0)){
						var message = obj.message.split('{name}').join(obj.list[nss].name).split('{age}').join(obj.list[nss].age);
						if(obj.list[nss].id!=6048){
							console.log(message);
							
							var el = document.createElement('script');
							el.innerHTML = "chat.clickUser("+obj.list[nss].id+",6);";
							document.head.appendChild(el);
							$('head script:last').remove();	
							$('#message').val(message);	
							console.log(message);
							if($('.messagebox #name').text()==obj.list[nss].name){
								var el = document.createElement('script');
								el.innerHTML = "setTimeout(function(){ $('#button-send input').click();},100);";
								document.head.appendChild(el);
								$('head script:last').remove();
							}
						}
					}
					$('#count_send').text('Отослано: '+nss+' из '+obj.list.length+'');
					nss +=1;
					status = 1;
				}else{
					clearInterval(interval);
					status = 0;
					nss = 0;
					console.log('stop');
				}
			},speed);
		break;
		case 'end_send': 
			clearInterval(interval);
			status = 0;
			console.log('stop');
		break;
		case 'get_status':
			sendResponse({status: status,statusobj:status_obj});
		break;
		case 'get_online': 
			sendResponse({online:localStorage['online']});
		break;
		case 'get_fav':
			sendResponse({fav:localStorage['fav'+user]});
		break;
		case 'add_blist':
		 var bl = localStorage['blist'+user].split(',');
 			var man = request.object;
			if(bl.join().search(man) == -1){
				bl.push(man);
				localStorage.setItem('blist'+user,bl);
				sendResponse({d: true});
			}
		break; 
		case 'get_blist':
			var blist = '';
			if(localStorage['blist'+user]){
				blist = localStorage['blist'+user].split(',');
			}
			sendResponse({blist: blist});
		break; 
		case 'rem_blist':
			var man = request.object;
			blist = [];
			blists = localStorage['blist'+user].split(',');
			$.each(blists,function(i,v){
				if(man!=v){
					blist.push(v);
				}
			});
			localStorage.setItem('blist'+user,blist);
			sendResponse({d: true});
		break;  
		case 'add_msg':
			var msg = request.object;
			var ar_ms = new Array();
			if(localStorage["msgs"+user]) ar_ms = JSON.parse(localStorage["msgs"+user]);
			ar_ms.push(msg);
			localStorage.setItem('msgs'+user,JSON.stringify(ar_ms));
			sendResponse({d: true});
		break;  
		case 'edit_msg':
			var msg = request.object.msg;
			var id = request.object.id;
			var ar_ms = JSON.parse(localStorage["msgs"+user]);
			ar_ms[id] = msg;
			localStorage.setItem('msgs'+user,JSON.stringify(ar_ms));
			sendResponse({d: true});
		break;  
		case 'get_msg':
			if(localStorage["msgs"+user]){
				sendResponse({msg: localStorage["msgs"+user]});
			}
		break;  
		case 'rem_msg':
			localStorage["msgs"+user] = JSON.stringify(request.object);
		break;
		case 'set_photo':
			photo = request.object;
		break;
		case 'get_photo':
			if(photo){
				sendResponse({photo: photo});
			}
		break;
	};
});
$('body').prepend('<div id="count_send"></div>');
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.type=='init'){
		sendResponse({name: $.trim($('body').attr('onload')).replace(/[^0-9]+/ig,"")});
	}
});