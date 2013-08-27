(function($){
	$("#ichat_camera_div").after("<div class=\"ichat_gf_block\"><span id=\"infotext\">Рассылка остановлена</span><br /><code id=\"infohelp\" title=\"Отправлено <- ожидает\">0 &lt;- 0</code></div>");

	var runned=false,
		info=$("#infohelp"),
		tinfo=$("#infotext"),
		key="find-bride-chat-2-"+name,
		storage=localStorage.getItem(key),
		queue=[],//Очередь на отправку
		SaveStorage=function()
		{
			try
			{
				localStorage.setItem(key,JSON.stringify(storage));
			}
			catch(e)
			{
				if(e==QUOTA_EXCEEDED_ERR)
					alert("Локальное хранилище переполнено");
			}
		},
		Status=function(sent)
		{
			info.text(sent+" <- "+queue.length);
		},

		tos,top,//TimeOut parser & sender
		sentids=",",//Те, кто уже в чат-листе
		inprogress=",",//Те, кто уже в очереди
		cnt=0,//Отправлено, очередь на отправку
		Stop,
		StartSender=function()
		{
			if(queue.length>0)
			{
				var mess=queue.shift(),
					Send=function()
					{
						$.post(
							location.protocol+"//"+location.hostname+"/ichat_set_mess.php",
							{
								correct_user:mess.id,
								text:mess.t
							},
							function(r)
							{
								mess.F(r.status=="OK");
							},
							"json"
						).fail(function(){ mess.F(false) });
					};
					
				$.get(location.protocol+"//"+location.hostname+"/search/man_profile/all/"+mess.id,function(r){
					r=r.replace(/<img[^>]+>/ig,"");
					var name= r.match(/<td> First name <\/td>\r\n\s+<td><strong>([^<]+)<\/strong>/);
					mess.t=mess.t.replace(/{name}/ig,name ? $.trim(name[1]) : login);
					
					if(storage.goal=="contacts")
						Send();
					else
						$.post(
							location.protocol+"//"+location.hostname+"/ichat_set_contacts.php",
							{
								correct_user:mess.id,
								action:"Add to contacts"
							},
							function()
							{
								Send();
								var script=document.createElement("script");
								script.text="ichatGetContacts();";
								document.head.appendChild(script).parentNode.removeChild(script);
							}
						).fail(function(){ mess.F(false) });

				}).fail(function(){ mess.F(false) });
			}

			if(runned)
				if(storage.goal!="online" && queue.length==0)
				{
					Stop();
					alert("Рассылка завершена");
				}
				else
					tos=setTimeout(StartSender,parseInt(Math.random()*6000)+4000);
		},

		Parse4Send=function(r,page)
		{
			if(queue.length>0)
			{
				tos=setTimeout(function(){ Parse4Send(r,page); },1000);
				return;
			}
		
			$("<div>").html(r.replace(/<img[^>]+>/ig,"")).find(".search_result").each(function(){
				var a=$("a:first",this),
					id=parseInt(a.prop("href").match(/\/(\d+)/)[1]),
					login=a.text(),
					age=parseInt($(this).html().match(/>(\d+) y\.o\.<\/td>/i)[1]);

				if(storage.af<=age && age<=storage.at && inprogress.indexOf(","+id+",")==-1 && sentids.indexOf(","+id+",")==-1 && !(id in storage.black))
				{
					inprogress+=id+",";

					queue.push({
						id:id,
						t:storage.text.replace(/{login}/ig,login).replace(/{age}/ig,age),
						F:function(success)
						{
							if(success)
							{
								sentids+=id+",";
								++cnt;
							}
							Status(cnt);
						}
					});
					if(runned)
						Status(cnt);
				}
			}).end().remove();

			if(runned)
			{
				page=r.indexOf(">next &gt;&gt;<")==-1 ? 1 : page+1;
				top=setTimeout(function(){
					if(runned)
						$.post(
							location.protocol+"//"+location.hostname+"/ichat_get_contacts.php",
							{
								correct_user:0
							},
							function(r_)
							{
								$("<div>").html(r_.general.data.replace(/onclick/g,"data-o")).find(".ichat_loaddata_item").each(function(){
									var id=parseInt($("span:first",this).data("o").match(/(\d+)/)[1])+",";
									if(sentids.indexOf(","+id+","))
										sentids+=id+",";
								}).end().remove();
								
								if(runned)
									$.post(
										location.protocol+"//"+location.hostname+"/ichat_get_online.php",
										{
											page:page
										},
										function(r2)
										{
											Parse4Send(r2,page);
										}
									);
							},
							"json"
						);
				},1000);
			}
		};
	Stop=function()
	{
		if(runned)
		{
			runned=false;
			clearTimeout(tos);
			clearTimeout(top);
			sentids=",";
			inprogress=",";
			queue=[];
		}
		Status(cnt);
		tinfo.text("Рассылка остановлена").css("color","");
	};

	storage=storage ? $.parseJSON(storage)||{} : {};
	if(typeof storage.black=="undefined")
		storage={black:{},goal:"online",af:30,at:100,text:""};

	MessHandle=function(obj,sender,CB)
	{
		switch(obj.type)
		{
			case "init":
				CB({
					name:name,
					runned:runned,
					storage:storage
				});
			break;
			case "save":
				storage=obj.storage;
				SaveStorage();
			break;
			case "start":
				if(!runned)
				{
					runned=true;
					sentids=",";
					inprogress=",";
					if(storage.goal=="online")
					{
						$.post(
							location.protocol+"//"+location.hostname+"/ichat_get_contacts.php",
							{
								correct_user:0
							},
							function(r)
							{
								$("<div>").html(r.general.data).find(".ichat_loaddata_item_span").each(function(){
									sentids+=parseInt($(this).prop("onclick").match(/(\d+)/)[1])+",";
								}).end().remove();

								if(runned)
									$.post(
										location.protocol+"//"+location.hostname+"/ichat_get_online.php",
										{
											page:1
										},
										function(r2)
										{
											Parse4Send(r2,1);
										}
									);
							},
							"json"
						);
					}
					else
					{
						$.post(
							location.protocol+"//"+location.hostname+"/ichat_get_contacts.php",
							{
								correct_user:0
							},
							function(r)
							{
								$("<div>").html(r.general.data).find(".ichat_loaddata_item_span").each(function(){
									var id=parseInt($(this).prop("onclick").match(/(\d+)/)[1]);
									if(id>0 && inprogress.indexOf(","+id+",")==-1 && sentids.indexOf(","+id+",")==-1 && !(id in storage.black))
									{
										inprogress+=id+",";

										queue.push({
											id:id,
											t:storage.text.replace(/{login}/ig,$("span span:last",this).html()),
											F:function(success){
												if(success)
												{
													sentids+=id+",";
													++cnt;
												}
												Status(cnt);
											}
										});
										Status(cnt);
									}
								}).end().remove();
							},
							"json"
						);
					}

					StartSender();
					if(runned)//Рассылка могла стопануться так и не начавшись
						tinfo.text("Идет рассылка").css("color","green");
				}
				CB(true);
			break;
			case "stop":
				Stop();
				CB(true);
			break;
		}
	}
})(jQuery);