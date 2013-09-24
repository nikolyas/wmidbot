init={};
ChatUser= {
	convert: function(dat){
 		init.name = dat.id
		console.log(init.name);
	}
};
eval($.trim($('head script:eq(14)').html()));