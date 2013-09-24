var WMID = {
	send: function(command, object, callback){
		chrome.tabs.getSelected(null, function(tab) {
		  chrome.tabs.sendMessage(tab.id, {command: command, object:object}, callback);
		});
	}
};

var EWMID = {
	init: function(){
		setTimeout(function(){
		EWMID.get_blecklist();
		WMID.send('get_status','',function(response){ 
		setTimeout(function(){
			if(response.statusobj){
				EWMID.var_important_age_from = response.statusobj.age_from;
				EWMID.var_important_age_to = response.statusobj.age_to;
				if(response.statusobj.type==0){
					EWMID.get_online();
				}else if(response.statusobj.type==1){
					EWMID.get_online();
					setTimeout(EWMID.get_contacts,500);
				}
				$('#text_ms').html(response.statusobj.message);
			}else{
				EWMID.get_contacts();
				EWMID.get_online();
			}
			if(response.status==0){
				$('#start_send').show();
				$('#end_send').hide();
			}else if(response.status==1){
				$('#start_send').hide();
				$('#end_send').show();
			}
			if(response.statusobj){
				$('#speed option:selected').removeAttr('selected');
				$('#speed').val(response.statusobj.speed+1);
			}
		},200);
		});
		EWMID.get_active();
		EWMID.build_popover();
		EWMID.get_info();
		},200);
		setTimeout(function(){
		$('#up_online').click(function(){
			$(this).addClass('animate');
			EWMID.get_online();
			$('#typeSend option:selected').removeAttr('selected');
			$('#typeSend option:eq(0)').attr('selected','selected');
		});
		$('#blecklist_link').click(function(){
			$('.home').hide();
			$('.blecklist').fadeIn();
		});
		$('.back').click(function(){
			$('.Sector').hide();
			$('.home').fadeIn();
		});
		$('#age_from').change(function(){
			var val = $(this).val();
			$('#age_to option').removeAttr('disabled');
			$('#age_to option').each(function(){
				if($(this).val()<val&&$(this).val()>0){ $(this).attr('disabled','disabled')}
			});
		});
		$('#age_to').change(function(){
			var val = $(this).val();
			$('#age_from option').removeAttr('disabled');
			$('#age_from option').each(function(){
				if($(this).val()>val&&$(this).val()>0){ $(this).attr('disabled','disabled')}
			});
		});
		$('#typeSend').change(function(){
			var index = $(this).find('option:selected').index();
			if(index==0){
				EWMID.get_online();
			}else if(index==1){
				EWMID.get_contacts();
			}
		});
		$('#start_send').click(function(){
			EWMID.start_send();
		});
		$('#end_send').click(function(){
			EWMID.end_send();
		});
		},500);
	},
	end_send: function(){
		$('#start_send').show();
		$('#end_send').hide();
		WMID.send('end_send','',function(response){ 
			console.log(response);
		});
	},
	start_send:function(){
		EWMID.get_message(function(m){
			if(m!=''&&m!='Hi {name}!'){
				$('#start_send').hide();
				$('#end_send').show();
				var oblect_send = [];
				var typeSend = $('#typeSend option:selected').index();
				var speed = $('#speed option:selected').index();
				var age_from = $('#age_from option:selected').val();
				var age_to = $('#age_to option:selected').val();
				var list;
				if(typeSend==0){
					list = EWMID.var_online;
				}else if(typeSend==1){
					list = EWMID.var_contacts;
				}
				oblect_send.push({message:m,speed:speed,age_from:age_from,age_to:age_to,list:list,type:typeSend});
				console.log(oblect_send);
				WMID.send('start_send',oblect_send,function(response){ 
					console.log(response);
				});
			}else{
				alert('Напишите сообщение!');
			}
		});
	},
	build_popover:function(){
		$('textarea[get-popover=true]').each(function(){
			$(this).after('<div class="popover" style="display:none; top:'+$(this).position().top+'px;left:'+($(this).position().left-180)+'px"><div class="arrow"></div>'+$(this).attr('text-popover')+'</div>');
			$(this).focus(function(){
				$(this).next('.popover').fadeIn();
			});
			$(this).blur(function(){
				$(this).next('.popover').fadeOut();
			});
		});
	},
	var_age_from: 100,
	var_age_to: 0,
	var_important_age_from: 0,
	var_important_age_to: 0,
	var_online: [],
	var_blecklist: [],
	var_contacts: [],
	var_activechat:0,
	vat_activemail:0,
	get_message: function(call){
		var message = $('#text_ms').val();
		call(message);
	},
	get_info: function(){
		$.getJSON("https://raw.github.com/liginet/wmidbot2/master/dream/info.js",EWMID.set_info);
	},
	get_blecklist: function(){
		WMID.send('get_blist_chat','',function(response){ EWMID.set_blecklist(response.blist);});
	},
	get_online: function(){
		$('#up_online').addClass('animate');
		WMID.send('get_online','',function(res){
			EWMID.set_online(res.online);
		});
	},
	get_active:function(){
		$.getJSON("https://raw.github.com/liginet/wmidbot2/master/dream/man.js",function(d){ 
		var co = 0;
			$.each(d,function(i,v){
				if(v['id_dream']==WMID.user_id){
					co = 1;
					EWMID.set_activechat(v['day_active_chat']);
					EWMID.set_activemail(v['day_active']);
				}
			});
			if(co==0){
				EWMID.set_activechat(0);
				EWMID.set_activemail(0);
			}
		});
	},
	get_contacts: function(){ 
		WMID.send('get_contact','',EWMID.set_contacts);
	},
	set_info: function(e){
		$('.message').html(e.text).show();
		if(e.type==1){
			$('.message').addClass('red');
		}
		if(e.news==1){
			$('.message').prepend('<b style="color:#F00">NEW</b> ');
		}
	},
	set_contacts: function(s){
		s = JSON.parse(s.contact);
		EWMID.var_age_from = 100;
		EWMID.var_age_to = 0;
		if(s!=null){
				EWMID.var_contacts = new Array();
				for(var k in s){
					var member = s[k];
					if(EWMID.var_blecklist.join().search(member['id']) == -1){
						if(EWMID.var_important_age_from>0&&EWMID.var_important_age_to>0){
							EWMID.var_age_from = EWMID.var_important_age_from;
							EWMID.var_age_to = EWMID.var_important_age_to;
						}else{
							if((member['age']-0)<EWMID.var_age_from&&(member['age']-0)>0){ EWMID.var_age_from = member['age']-0;}
							if((member['age']-0)>EWMID.var_age_to&&(member['age']-0)<100){ EWMID.var_age_to = member['age']-0;}
						}
						EWMID.var_contacts.push({id:member['id'],name:member['displayname'],age:member['age']});
					}
				}
			$('#typeSend option:eq(0)').removeAttr('selected');
			$('#typeSend option:eq(1)').text('Contact ('+EWMID.var_contacts.length+')').attr('selected','selected');
			EWMID.set_age();
		}
	},
	set_blecklist: function(d){
		EWMID.var_blecklist = [];
		EWMID.var_blecklist = d;
		$('#blecklist').html('');
		if(d.length==0){
			$('#blecklist').html('<div style="text-align:center;">Нет в черном списке никого</div><div class="clear10"></div>');
		}
		$.each(d,function(i,v){
			$('#blecklist').prepend('<li><img src="http://dream-marriage-profilephotos.s3.amazonaws.com/im'+v+'_small.jpg"> ID: '+v+' <a href="#" rel="'+v+'" class="remove_blecklist fr">удалить</a></li>');
		});
		$('.remove_blecklist').click(function(){
			var id = $(this).attr('rel');
			WMID.send('rem_blist_chat',id,function(response){});	
			$(this).parent('li').remove();
		});
		$('#add_bleck').click(function(){
			var id = $('#bleck_txt').val();
			if(id){
				WMID.send('add_blist_chat',id,function(response){
					EWMID.get_blecklist();
					$('#bleck_txt').val('');
				});
			}
		});

	},
	set_online: function(d){
		d = JSON.parse(d);
		EWMID.var_age_from = 100;
		EWMID.var_age_to = 0;
		EWMID.var_online = [];
		$.each(d,function(i,v){
			if(EWMID.var_blecklist.join().search(v['id_men']) == -1){
				if(EWMID.var_important_age_from>0&&EWMID.var_important_age_to>0){
					EWMID.var_age_from = EWMID.var_important_age_from;
					EWMID.var_age_to = EWMID.var_important_age_to;
				}else{
					if((v['age_men']-0)<EWMID.var_age_from&&(v['age_men']-0)>0){ EWMID.var_age_from = v['age_men']-0;}
					if((v['age_men']-0)>EWMID.var_age_to&&(v['age_men']-0)<100){ EWMID.var_age_to = v['age_men']-0;}
				}
				var cop = 0;
				for(var x in EWMID.var_contacts){
					if(v['id_men']==EWMID.var_contacts[x].id){ cop = 1;}
				}
				if(cop==0){
					EWMID.var_online.push({id:v['id_men'],receiver:v['id_receiver'],name:v['name_men'],age:v['age_men']});
				}
			}
		});
		$('#tx_online').text(EWMID.var_online.length);
		$('#up_online').removeClass('animate');
		$('#typeSend option:eq(0)').attr('selected','selected');
		$('#typeSend option:eq(1)').removeAttr('selected');
		EWMID.set_age();
	},
	set_activechat: function(d){
		$('#active_day').text(d);
		EWMID.var_activechat = d;
		if(EWMID.var_activechat=='0'){
			$('.what_chat').text('чате');
			$('.rightColumn').hide();
			$('.rightColumn.no_act').show();
		}
	},
	set_activemail:function(d){
		EWMID.var_activemail = d;
		$('#activemob_day').text(d);
	},
	set_age: function(){
		$('#age_from, #age_to').html('');
		for(i=EWMID.var_age_from;i<=EWMID.var_age_to;i++){
			$('#age_from').append('<option value="'+i+'">'+i+'</option>');
			$('#age_to').prepend('<option value="'+i+'">'+i+'</option>');
		}
	}
};
EWMID.init();