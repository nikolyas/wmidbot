chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
ChatUser= {
	convert: function(dat){
		sendResponse({name: dat.id});
	}
};
eval($.trim($('head script:eq(14)').html()));
});