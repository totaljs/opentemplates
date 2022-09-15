NEWSCHEMA('Logs', function(schema) {

	schema.setList(function($) {
		var builder = NOSQL('logs').find2().take(50);
		$.query.id && builder.where('profileid', $.query.id);
		builder.callback($.callback);
	});

	schema.setRemove(function($) {
		NOSQL('logs').clear().callback(function() {
			MAIN.wapi && MAIN.wapi.send({ TYPE: 'logs' });
			$.success();
		});
	});

});