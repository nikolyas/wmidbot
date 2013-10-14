var status_obj;
var status = 0;
var n = 0;
var interval;
var mans_invite = [];
var blist = [];
var online = [];

var on_man = [];

/*setTimeout(function(){
if($.cookie('online')==undefined&&$('#user-info p:eq(1)').text()!=''){
	$('body').append('<div id="shadow" style="position:fixed;top:0;left:0;right:0;bottom:0; background:#fff;opacity:0.9;z-index:9999;"></div><div style="position:fixed;top:200px; left:50%;margin-left:-294px;font-size:30px;color:#333;z-index:99999;font-family:arial;" id="text_load">Wait there is a synchronization of online...</div>');
	
}
},3000);*/

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	switch(request.command){
		case 'get_invites':
			sendResponse({mans:mans_invite});
			mans_invite = [];
		break;
		case 'get_man':
			window.location.href = '#/'+request.object;
		break;
		case 'set_online':
			localStorage.setItem('online',request.object);
		break;
		case 'get_online':
			sendResponse({online:localStorage['online']});
		break;
		case 'set_contacts':
			localStorage.setItem('contacts',request.object);
		break;
		case 'get_contacts':
			sendResponse({contacts:localStorage['contacts']});
		break;
		case 'set_pisal':
			if(request.object){
				var pisal = request.object.split(',');
				var pi_arr = [];
				if(localStorage['pisal_list'+$.cookie('user_id')]){
					pi_arr = JSON.parse(localStorage['pisal_list'+$.cookie('user_id')]);
				}
				if(pisal.length>0){
					console.log(pi_arr);
					$.each(pisal,function(i,v){
						if(pi_arr.join().search($.trim(v)) == -1){
							pi_arr.push($.trim(v));
						}
					});
					localStorage.setItem('pisal_list'+$.cookie('user_id'),JSON.stringify(pi_arr));
				}
			}
		break;
		case 'get_pisal':
			sendResponse({pisal:localStorage['pisal_list'+$.cookie('user_id')]});
		break;
		case 'rem_pisal':
			var pisal = JSON.parse(request.object);
			if(localStorage['pisal_list'+$.cookie('user_id')]){
				var lac_pisal = JSON.parse(localStorage['pisal_list'+$.cookie('user_id')]);
				var pi_arr = [];
				$.each(lac_pisal,function(i,v){
					if(pisal.join().search($.trim(v)) == -1){
						pi_arr.push($.trim(v));
					}
				});
				localStorage.setItem('pisal_list'+$.cookie('user_id'),JSON.stringify(pi_arr));
			}
		break;
		case 'set_emul':
		break;
		case 'get_user': 
				$.cookie('user_id', $('#user-info p:eq(1)').text(), { domain: '.globalcompanions.com', path: '/' });
				sendResponse({user: $('#user-info p:eq(1)').text()});
		break;
		case 'start_send': 
			var postlist = [];
			var obj = status_obj = request.object[0];
			if(obj.speed==0){
				var speed = 3000;
			}else if(obj.speed==1){
				var speed = 1000;
			}else if(obj.speed==2){
				var speed = 500;
			}
			var online_l = JSON.parse(localStorage['online']);
			if(obj.list==0){
				postlist = online_l;
			}else if(obj.list==1){
				postlist = [];
				var postlist = JSON.parse(localStorage['contacts']);
			}else if(obj.list==2){
				postlist = [];
				var pisal_l = JSON.parse(localStorage['pisal_list'+$.cookie('user_id')]);
				$.each(pisal_l,function(i,v){
					$.each(online_l,function(index,val){
						if(v==val['id_pub']){
							postlist.push(val);
						}
					});
				});
			}
			var loc_b = localStorage['blist'+$.cookie('user_id')];
			var loc_blist = [];
			if(loc_b){ loc_blist = JSON.parse(loc_b);}
			console.log(obj);
			interval = setInterval(function(){
				if(postlist[n]){
					console.log(postlist[n]);
					if(postlist[n].age>=(obj.age_from-0)&&postlist[n].age<=(obj.age_to-0)){
					if((postlist[n].country==obj.country)||obj.country==0){
						var message = obj.message.split('{name}').join(postlist[n].name).split('{age}').join(postlist[n].age);
						if(postlist[n].id!=6){
						if(loc_blist.join().search(postlist[n].id_pub) == -1){
						if((obj.vip==1&&postlist[n].vip==true)||obj.vip==0){
						if((obj.fake==1&&postlist[n].photo==true)||obj.fake==0){
							console.log(message);
								$.post("http://point.globalcompanions.com/send-message/"+postlist[n].id,{tag:postlist[n].id,source:'lc',message:message},function(d){});
						}
						}
						}
						}
					}
					}
					n +=1;
					status = 1;
					$('#count_send').text('Отослано: '+n+' из '+postlist.length+'');
				}else{
					clearInterval(interval);
					status = 0;
					n = 0;
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
		case 'add_blist':
			if(request.object){
				var blist = request.object.split(',');
				var pi_arr = [];
				if(localStorage['blist'+$.cookie('user_id')]){
					pi_arr = JSON.parse(localStorage['blist'+$.cookie('user_id')]);
				}
				if(blist.length>0){
					$.each(blist,function(i,v){
						if(pi_arr.join().search($.trim(v)) == -1){
							pi_arr.push($.trim(v));
						}
					});
					localStorage.setItem('blist'+$.cookie('user_id'),JSON.stringify(pi_arr));
				}
			}
		break; 
		case 'get_blist':
			var loc_blist = localStorage['blist'+$.cookie('user_id')];
			if(loc_blist){
			if(loc_blist.indexOf('[')==-1){ loc_blist = '['+loc_blist+']'; localStorage.setItem('blist'+$.cookie('user_id'), loc_blist);}
			blist = JSON.parse(loc_blist);
			}
			sendResponse({blist: loc_blist});
		break; 
		case 'rem_blist':
			var blist = JSON.parse(request.object);
			console.log(blist);
			if(localStorage['blist'+$.cookie('user_id')]){
				var lac_pisal = JSON.parse(localStorage['blist'+$.cookie('user_id')]);
				var pi_arr = [];
				$.each(lac_pisal,function(i,v){
					if(blist.join().search($.trim(v)) == -1){
						pi_arr.push($.trim(v));
					}
				});
				localStorage.setItem('blist'+$.cookie('user_id'),JSON.stringify(pi_arr));
			}
		break; 
		
	};
});

$('body').prepend('<div id="chat_act"><b>Active chats</b><ul><div align="center" style="padding:10px;">No chat</div></ul></div><div id="count_send"></div>');

/*setInterval(function(){
	var local = window.location.hash;
	if(local){
		local = local.replace(/[^0-9]+/ig,"");
		var loc_att = localStorage['attentions'+$.cookie('user_id')];
		if(loc_att){ 
			loc_att = JSON.parse(loc_att);
			$('#halk').remove();
			if(loc_att.join().search(local)!=-1){
				$('body').append('<div id="halk" style="position: absolute;top: 159px;right: 293px;font-size: 21px;color: #F00;z-index: 99;">Бесплатный</div>');
			}
		}
	}
},2000);
setInterval(function(){
	$.getJSON('http://chat.svadba.com/updates/attentions/everyone/',function(s){
		
		if(s!=null){
			var loc_att = localStorage['attentions'+$.cookie('user_id')];
			if(loc_att){ loc_att = JSON.parse(loc_att);}else{ loc_att = [];}
			
			$.each(s[0].updates,function(i,v){
				if(loc_att.join().search(v.member['id'])<0){
					if(v['total-lifetime']>0){
						loc_att.push(v.member['id']);
						localStorage.setItem('attentions'+$.cookie('user_id'),JSON.stringify(loc_att));
					}
				}else{
					if(v['total-lifetime']==0){
						var loc_att_repl = [];
						$.each(loc_att,function(index,val){
							if(val!=v.member['id']){
								loc_att_repl.push(val);
							}
						});
						localStorage.setItem('attentions'+$.cookie('user_id'),JSON.stringify(loc_att_repl));
					}
				}
			});
		}
	});
},2000);
*/
var mans_chat = [];
setInterval(function(){
	var girl = $('#user-info p:eq(1)').text();
	$.getJSON('http://point.globalcompanions.com/updates/status+unreads/everyone/',function(s){
		request = s;
		if(typeof(request)!=null){ 
		for(i=0;i<request.length;i++){
			if(request[i].type=='status'||request[i].type=='unreads'){

				for(s=0;s<request[i].updates.length;s++){
					if(request[i].updates[s].__type=='communication-status-notification:urn:com.anastasiadate.chat'){
						var chats = '';
						if(request[i].updates[s].girl.chats.length>=3){
							clearInterval(interval);
							status = 0;
						}
						for(c=0;c<request[i].updates[s].girl.chats.length;c++){
							console.log(request[i].updates[s].girl.chats);
							var public_name = '';
							var public_id = '';
							public_name = request[i].updates[s].girl.chats[c]['client-id'];
							/*for(var sd in status_obj){
								if(request[i].updates[s].girl.chats[c]['client-id']==status_obj[sd].id){
									public_name = status_obj[sd].name;
									break;
								}
							}*/

							var smiles = ['O:)',':)',';)'];
							var msg = smiles[Math.floor(Math.random()*smiles.length)];
							$.get('http://chat.svadba.com/chat/#/'+request[i].updates[s].girl.chats[c]['client-id'],function(ss){ console.log('get_man');});
							
							var client = request[i].updates[s].girl.chats[c]['client-id'];

							if(mans_chat.length>0){
								if (mans_chat.join().search(client) == -1) {
									setTimeout(function(){ 
										if(window.location.hash!='#/'+client){
											$.post("http://chat.svadba.com/send-message/"+client,{tag:client,source:'lc',message:msg},function(ss){ console.log('post'); });
										}
									},30000);
									mans_chat.push(client);
									$('.au').remove();
									$('body').append('\
									<audio controls style="position:relative;z-index:9999;" class="au" autoplay>\
										<source src="https://wmid.googlecode.com/git/svadba/au.ogg" type="audio/ogg; codecs=vorbis">\
										<source src="https://wmid.googlecode.com/git/svadba/au.mp3" type="audio/mpeg">\
										Тег audio не поддерживается вашим браузером. <a href="audio/music.mp3">Скачайте музыку</a>.\
									</audio>');
								}
							}else{
								setTimeout(function(){ 
									if(window.location.hash!='#/'+client){
										$.post("http://chat.svadba.com/send-message/"+client,{tag:client,source:'lc',message:msg},function(ss){ console.log('post');	});
									}
								},30000);
								
								mans_chat.push(request[i].updates[s].girl.chats[c]['client-id']);
								$('.au').remove();
								$('body').append('\
								<audio controls style="position:relative;z-index:9999;" class="au" autoplay>\
										<source src="https://wmid.googlecode.com/git/svadba/au.ogg" type="audio/ogg; codecs=vorbis">\
										<source src="https://wmid.googlecode.com/git/svadba/au.mp3" type="audio/mpeg">\
										Тег audio не поддерживается вашим браузером. <a href="audio/music.mp3">Скачайте музыку</a>.\
									</audio>');
							}
							var status = 'chat';
							if(request[i].updates[s].girl.chats[c]['video-allowed']==true){
								status = 'video_chat';
								
							}
							
							var active = '';
							if(request[i].updates[s].girl.chats[c]['client-id']==window.location.hash.split('#/').join('')){
								active = 'active';
							}
							chats += '<li class="cl '+active+'" onclick="window.location.href=\'#/'+request[i].updates[s].girl.chats[c]['client-id']+'\'" id="m_'+request[i].updates[s].girl.chats[c]['client-id']+'" rel = "'+request[i].updates[s].girl.chats[c]['client-id']+'"><span class="ics '+status+'"></span> '+public_name+'</li>';
							mans_invite.push({id:request[i].updates[s].girl.chats[c]['client-id']}); 
						}
						if(chats!=''){
						$('#chat_act ul').html(chats);
						}else{
						$('#chat_act ul').html('<div align="center" style="padding:10px;">Нет чатов</span>');
						}
						$('.chat_act li').click(function(){
							window.location.href="#/"+$(this).attr('rel');
						});
						$('#chat_act ul li').click(function(){
							$('#chat_act ul li').removeClass('active');
							$(this).addClass('active');
						});
					}
					if(request[i].updates[s].__type=='unread-message-notification:urn:com.anastasiadate.chat'){
						if(request[i].updates[s].member.id!=girl){
							$('#chat_act ul #m_'+request[i].updates[s].member.id+' span').addClass('message');
						}
					}
				}
			}

		}
		}
	});
	
},2000);
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.type=='init'){
		sendResponse({name: $('#user-info p:eq(1)').text()});
	}
});