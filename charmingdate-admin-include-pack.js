(function($){
	$("h2:first").prepend( $("<div>").css({"font-size":"2em"}).width("500px").html("<span id=\"infostatus\">Рассылка</span>: <code id=\"infohelp\" title=\"Отправлено <- ожидает\">неизвестно</code>") );

	var runned=false,
		key="charmingdate-admin-"+name,
		storage,
		message,
		LoadStorage=function()
		{
			storage=localStorage.getItem(key);
			storage=storage ? $.parseJSON(storage)||{} : {};
			message=("active" in storage && storage.active in storage) ? storage[storage.active] : false;
		},
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

		tos,top,//TimeOut parser & sender
		ibp=500,//Интервал перехода между страницами
		iws=1000,//Интервал между отправками
		queue=[],//Очередь на отправку
		inprogress=",",//Те, кто уже в очереди
		cnt=0,//Отправлено
		oldgoal,//Прошлая цель
		nextpage=false,//Следующая страница, которая должна быть обработана
		Stop,

		senders=[],//Отправители

		info=$("#infohelp"),
		infostatus=$("#infostatus"),
		Status=function(sent)
		{
			info.text(sent+" <- "+queue.length);
		},

		StartSender=function()
		{
			if(queue.length>0)
			{
				var mess=queue.shift();
				$.post(
					"/clagt/admire/send_admire_mail2_old.php",
					{
						greet:storage.situation,
						body:mess.t,
						attachfilephoto:"",
						provision:"Y",
						hidden:"",
						title:"",
						body_cn:"",
						sendmailsub_save:"Send",
						sendtimes:0,
						womanid:storage.sender,
						manid:mess.id
					},
					function(r)
					{
						if(r.indexOf("Bad Request, Please try later.")!=-1)
						{
							Stop();
							alert("Видимо, превышен лимит отправки.");
						}
						else if(r.indexOf("Maximum amount of admirer mails sent by one lady in 24")!=-1)
						{
							Stop();
							alert("Эта девушка уже достигла лимита отправленных писем. Выберите другую.");
						}
						else
							mess.F(r.indexOf("Your Admirer Mail has been sent successfully!")!=-1);
					}
				).always(function(){
					if(runned)
						tos=setTimeout(StartSender,iws);
				});
			}
			else if(runned)
				tos=setTimeout(StartSender,iws);
		},
		Parse4Send=function(r)
		{
			if(queue.length>0)
			{
				tos=setTimeout(function(){ Parse4Send(r); },1000);
				return;
			}

			var body=r.replace(/<script[^>]*>|<\/script>/g,""),
				ind1=body.indexOf("<body"),
				ind2=body.indexOf(">",ind1+1),
				ind3=body.indexOf("</body>",ind2+1);
			body=body.substring(ind2+1,ind3);
			body=body.replace(/(src="[^"]+")/ig,"data-$1");
			body=$("<div>").html(body);

			body.find("table:eq(21)").find("tr:gt(0)").each(function(){
				var id=$.trim($("td:eq(2)",this).text()),
					repl={
						name:$.trim($("td:eq(3)",this).text()),
						age:parseInt($("td:eq(4)",this).text())
					};

				if(message.sent.indexOf(","+id+",")==-1 && inprogress.indexOf(","+id+",")==-1 && !(id in storage.black) && !((id+" "+storage.sender) in storage.black2))
				{
					inprogress+=id+",";

					var s=message.title,
						t=message.text;

					$.each(repl,function(k,v){
						var R=new RegExp("{"+k+"}","ig");
						s=s.replace(R,v);
						t=t.replace(R,v);
					});
					queue.push({
						id:id,
						s:s,
						t:t,
						F:function(success){
							if(success)
							{
								message.sent+=id+",";
								message.cnt++;
								SaveStorage();
							}
							Status(message.cnt);
						}
					});
					if(runned)
						Status(message.cnt);
				}
			});

			if(runned)
			{
				var next=body.find("table:eq(22) img:eq(2)").parent();
				if(next.is("a"))
				{
					nextpage=next.attr("href");
					top=setTimeout(function(){
						$.get(nextpage,Parse4Send);
					},ibp);
				}
			}
			body.remove();
		},
		StartParser=function()
		{
			if(nextpage)
				$.get(nextpage,Parse4Send);
			else
			{
				var first=$("table:eq(22) img:eq(0)").parent();
				if(first.is("a"))
				{
					nextpage=first.attr("href");
					$.get(nextpage,Parse4Send);
				}
				else
					Parse4Send("<body>"+$("body").html()+"</body>");
			}
		};

	Stop=function()
	{
		if(runned)
		{
			runned=false;
			clearTimeout(tos);
			clearTimeout(top);
		}
		infostatus.text("Рассылка остановлена").css("color","");
	};

	LoadStorage();
	if(!("black" in storage))
		storage={last:1,active:0,black:{},black2:{},writers:{},goal:"search",sender:"",situation:1};

	$("<div>").load("/clagt/woman/women_profiles_posted.php?groupshow=4&listnum=1000 #DataGrid1",function(){
	
		$(this).find("tr:gt(0)").find("td:eq(2) a").each(function(){
			senders.push( $(this).text() );
		});
		senders=senders.sort();
		$(this).remove();
	});

	oldgoal=storage.goal;
	MessHandle=function(obj,sender,CB)
	{
		switch(obj.type)
		{
			case "init":
				CB({
					name:name,
					runned:runned,
					senders:senders,
					storage:storage
				});
			break;
			case "setstatus":
				Status(obj.sent);
			break;
			case "save":
				storage=obj.storage;
				SaveStorage();
			break;
			case "start":
				if(!runned)
				{
					LoadStorage();
					if(message)
					{
						runned=true;
						if(oldgoal!=storage.goal)
						{
							inpogress=",";
							queue=[];
							cnt=0;
							oldgoal=storage.goal;
							nextpage=false;
						}
						switch(storage.goal)
						{
							case "writers":
								cnt=0;
								$.each(storage.writers,function(id){
									id=parseInt(id);
									if(id>0 && !(id in storage.black) && !((id+" "+storage.sender) in storage.black2) && message.sent.indexOf(","+id+",")==-1 && inprogress.indexOf(","+id+",")==-1)
									{
										inprogress+=id+",";
										queue.push({
											id:id,
											s:message.title,
											t:message.text,
											F:function(success){
												message.sent+=id+",";
												message.cnt++;

												if(success)
													++cnt;
												Status(cnt);

												if(queue.length==0)
												{
													Stop();
													alert("Рассылка завершена");
												}

												SaveStorage();//Только для учета отправленных
											}
										});
										Status(cnt);
									}
								});
							break;
							default:
								StartParser();
						}
						StartSender();

						if(runned)//Рассылка могла стопануться так и не начавшись
							infostatus.text("Идет рассылка").css("color","green");
					}
				}
				CB(runned);
			break;
			case "stop":
				Stop();
				CB(!runned);
			break;
		}
	};
	
})(jQuery);