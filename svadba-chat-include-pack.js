var status_obj;
var status = 0;
var n = 0;
var interval;
var mans_invite = [];
var blist = [];

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	switch(request.command){
		case 'get_invites':
			sendResponse({mans:mans_invite});
			mans_invite = [];
		break;
		case 'get_man':
			window.location.href = '#/'+request.object;
		break;
		case 'set_emul':
		console.log(request.object);
			if(request.object=='mobile'){
				window.location.href = 'http://m.svadba.com/';
			}else{
				window.location.href = 'http://chat.svadba.com/';
			}
		break;
		case 'get_user': 
			if(window.location.host=='m.svadba.com'){
				sendResponse({user: $.cookie('user_id')});  
			}else{
				//localStorage.setItem('uid',$('#user-info p:eq(1)').text());
				//$.cookie('user_id', $('#user-info p:eq(1)').text(), { path: '/' });
				$.cookie('user_id', $('#user-info p:eq(1)').text(), { domain: '.svadba.com', path: '/' });
				sendResponse({user: $('#user-info p:eq(1)').text()});
			}
			
			
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
				if(obj.list[n]){
					console.log(obj.list[n]);
					if(obj.list[n].age>=(obj.age_from-0)&&obj.list[n].age<=(obj.age_to-0)){
					if((obj.list[n].country==obj.country)||obj.country==0){
						var message = obj.message.split('{name}').join(obj.list[n].name).split('{age}').join(obj.list[n].age).split('{country}').join(obj.list[n].country);
						if(obj.list[n].id!=6){
							console.log(message);
							if(window.location.host.indexOf('m.svadba.com') > -1){
								$.post("http://m.svadba.com/chat-with/"+obj.list[n].id+"/message",{message:message},function(d){});
							}else{
								$.post("http://chat.svadba.com/send-message/"+obj.list[n].id,{tag:obj.list[n].id,source:'lc',message:message},function(d){});
							}
						}
					}
					}
					$('#count_send').text('Отослано: '+n+' из '+obj.list.length+'');
					n +=1;
					status = 1;
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
			var man = request.object;
			if(blist.join().search(man) == -1){
				blist.push(man);
				localStorage.setItem('blist'+$.cookie('user_id'),blist);
				sendResponse({d: true});
			}
		break; 
		case 'get_blist':
			if(localStorage['blist'+$.cookie('user_id')]){
				blist = localStorage['blist'+$.cookie('user_id')].split(',');
			}
			sendResponse({blist: blist});
		break; 
		case 'rem_blist':
			var man = request.object;
			blist = [];
			blists = localStorage['blist'+$.cookie('user_id')].split(',');
			$.each(blists,function(i,v){
				if(man!=v){
					blist.push(v);
				}
			});
			localStorage.setItem('blist'+$.cookie('user_id'),blist);
			sendResponse({d: true});
		break; 
		
	};
});

if(window.location.host.indexOf('m.svadba.com') > -1){
	$('body').prepend('<div id="count_send"></div><style>#wrapper { overflow:visible!important;} .log-form-body { min-height:auto!important;}#contactScroll { -webkit-transform:translate3d(0px, 0px, 0px) scale(1)!important;}#count_send { color:#FFF!important; top:11!important; z-index:119999999; position:fixed!important;}</style>');
}else{
	$('body').prepend('<div id="chat_act"><b>Активные чаты</b><ul><div align="center" style="padding:10px;">Нет чатов</div></ul></div><div id="count_send"></div>');
}
var mans_chat = [];
setInterval(function(){
	var girl = $('#user-info p:eq(1)').text();
	$.getJSON('http://chat.svadba.com/updates/status+unreads/everyone/',function(s){
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