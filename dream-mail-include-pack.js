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
if($.trim($('.menubtn:eq(1)').text())!='Log-In'){
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
$('body').prepend('<div id="count_send"></div>');
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.object){
	var obj = status_obj = request.object[0];
	function gogogo(nss){
		console.log('statusstatus:',status);
		if(status==1){
		console.log(obj);
		$('#count_send').text('Не покидайте страницу во время рассылки! Отослано: '+nss+' из '+obj.list.length+'');
		if(obj.list[nss]){
			console.log(obj.list[nss]);
					/*$.get('//d.wmid.com.ua/index.php?get=message&man='+obj.list[nss].id+'&u='+user,function(d){
						var msg_o = JSON.parse(d);
						if(msg_o!=null){
						if(msg_o.message){
							
						message = msg_o.message.split('&lt;%name%&gt;').join(obj.list[nss].name);
						message = message.split('<%name%>').join(obj.list[nss].name);
						message = message.split('<p>').join('\n');
						message = message.split('</p>').join('\n');
						
						
						console.log('msg_o.attachment',msg_o.attachment);
						if((obj.list[nss].age-0)>=(obj.age_from-0)&&(obj.list[nss].age-0)<=(obj.age_to-0)){
						$.post("//d.wmid.com.ua/index.php?get=photo_url",{att:msg_o.attachment},function(string64){
							if(string64!=''){
								string64 = string64.replace(/\n/g,"");
								string64 = string64.replace(/\r/g,"");
								var blob = window.dataURLtoBlob && window.dataURLtoBlob(string64); 
							}
							console.log(blob);
							
							var xhr = new XMLHttpRequest();
							var reader = new FileReader();
							xhr.open("POST", "//www.dream-marriage.com/messaging/write.php?receiver="+obj.list[nss].receiver);	 
							var rand = Math.floor((Math.random()*1000000000)+1); 
							var formData = new FormData();
							formData.append("blockGirl", '0');
							formData.append("draftid", rand);
							formData.append("receiver", obj.list[nss].receiver);
							formData.append("sender", receiver);
							formData.append("replyId", '');
							formData.append("which_message", 'advanced_message');
							formData.append("plain_message", '');
							formData.append("message", message);
							if(blob){
								formData.append("attachment", blob, msg_o.file_name);
							}
							formData.append("__tcAction[send]", 'Send');
							
							var redir = 'inbox';
							xhr.onreadystatechange = function() {
								if(xhr.readyState == 4){
								if(xhr.responseText){
									ss = xhr.responseText.replace(/<script[^>]*>|<\/script>/g,"");
									 if($(ss)[1].innerText!='Message Inbox'){ redir = 'write';}
									 $.post('//d.wmid.com.ua/index.php?set=log',{index_arr:nss,from:user,to:obj.list[nss].id,name:obj.list[nss].name,cronid:obj.rand,mess:msg_o.id,redir:redir},function(s){ console.log(s);});
									 nss +=1;
									 gogogo(nss);
								  }
								}
							}
							console.log(formData);
							xhr.send(formData);
						});
						}else{
							nss +=1;
							gogogo(nss);
						}
						}
						}else{
							redir = 'write';
							var msss = '';
							if(msg_o!=null){
								msss = msg_o.id;
							}
							$.post('//d.wmid.com.ua/index.php?set=log',{index_arr:nss,from:user,to:obj.list[nss].id,name:obj.list[nss].name,cronid:obj.rand,mess:msss,redir:redir},function(s){ console.log(s);});
							nss +=1;
							gogogo(nss);
						}
					});*/
			
		}else{
			status = 0;
			$('#count_send').html('Рассылка закончена!');
			console.log('stop');
		}
		}
	}
	}
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
			status = 1;
			gogogo(0);
		break;
		case 'end_send':
			status = 0;
			$('#count_send').html('Рассылка остановлена!');
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
		case 'get_login': 
			sendResponse({login:'yes'});
		break;
	};
});
$('body').prepend('<div id="count_send"></div>');
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.type=='init'){
		sendResponse({name: $.trim($('body').attr('onload')).replace(/[^0-9]+/ig,"")});
	}
});
}else{
	chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
		switch(request.command){
			case 'get_login': 
				sendResponse({login:'no'});
			break;
		}
	});
}