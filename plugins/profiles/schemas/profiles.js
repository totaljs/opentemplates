NEWSCHEMA('Profiles', function(schema) {

	schema.action('list', {
		name: 'List of profiles',
		permissions: 'profiles',
		action: function($) {

			var db = MAIN.db.profiles;
			var arr = [];

			for (var key in db) {
				var item = db[key];
				var obj = {};
				obj.id = item.id;
				obj.name = item.name;
				obj.icon = item.icon;
				obj.color = item.color;
				obj.reference = item.reference;
				obj.count = item.count;
				obj.dtrender = item.dtrender;
				arr.push(obj);
			}

			arr.quicksort('name');
			$.callback(arr);
		}
	});

	schema.action('read', {
		name: 'Read profile',
		params: 'id:UID',
		permissions: 'profiles',
		action: function($) {
			var params = $.params;
			var db = MAIN.db.profiles;
			var item = db[params.id];
			if (item) {
				var obj = {};
				obj.id = item.id;
				obj.name = item.name;
				obj.icon = item.icon;
				obj.color = item.color;
				obj.reference = item.reference;
				obj.html = item.html;
				obj.templates = {};

				for (var key in item.templates) {
					var tmp = item.templates[key];
					var sub = {};
					sub.id = key;
					sub.name = tmp.name;
					sub.group = tmp.group;
					sub.count = tmp.count;
					sub.dtrender = tmp.dtrender;
					sub.reference = item.reference + '/' + tmp.reference;
					obj.templates[key] = sub;
				}

				$.callback(obj);
			} else
				$.invalid('@(Profile not found)');
		}
	});

	schema.action('meta', {
		name: 'Read a metadata of the profile',
		params: 'id:UID',
		permissions: 'profiles',
		action: function($) {
			var params = $.params;
			var db = MAIN.db.profiles;
			var item = db[params.id];
			if (item) {
				var model = {};
				model.id = item.id;
				model.color = item.color;
				model.icon = item.icon;
				model.reference = item.reference;
				$.callback(model);
			} else
				$.invalid('@(Profile not found)');
		}
	});

	schema.action('create', {
		name: 'Create profile',
		input: '*name, reference, html, icon:Icon, color:Color',
		permissions: 'profiles',
		action: function($, model) {

			var db = MAIN.db.profiles;
			model.id = UID();
			model.templates = {};
			db[model.id] = model;
			$.success(model.id);

			MAIN.db.save();
			FUNC.refresh();
		}
	});

	schema.action('update', {
		name: 'Update profile',
		input: '*name, reference, icon:Icon, color:Color',
		params: '*id:UID',
		permissions: 'profiles',
		action: function($, model) {

			var params = $.params;
			var db = MAIN.db.profiles[params.id];

			if (db) {
				COPY(model, db);
				$.success(params.id);
				MAIN.db.save();
				FUNC.refresh();
			} else
				$.invalid('@(Profile not found)');

		}
	});

	schema.action('remove', {
		name: 'Remove profile',
		params: '*id:UID',
		permissions: 'profiles',
		action: function($) {

			var params = $.params;
			var db = MAIN.db.profiles;

			if (db[params.id]) {
				delete db[params.id];
				MAIN.db.save();
				$.success(params.id);
			} else
				$.invalid('@(Profile not found)');

		}
	});

	schema.action('clone', {
		name: 'Clone profile',
		params: '*id:UID',
		permissions: 'profiles',
		action: function($) {

			var params = $.params;
			var db = MAIN.db.profiles;

			if (db[params.id]) {

				var model = CLONE(db[params.id]);
				model.id = UID();
				model.name += ' (CLONED)';
				model.reference += '_cloned';
				model.count = 0;
				model.dtrender = null;

				var templates = {};

				for (var key in model.templates) {
					var template = model.templates[key];
					template.id = UID();
					template.profileid = model.id;
					template.count = 0;
					template.dtrender = null;
					templates[template.id] = template;
				}

				model.templates = templates;
				db[model.id] = model;

				MAIN.db.save();
				FUNC.refresh();

				$.success(model.id);

			} else
				$.invalid('@(Profile not found)');

		}
	});

	schema.action('html', {
		name: 'Update HTML content',
		input: 'html:String',
		params: '*id:UID',
		permissions: 'profiles',
		action: function($, model) {
			var params = $.params;
			var db = MAIN.db.profiles[params.id];
			if (db) {
				db.html = model.html;
				MAIN.db.save();
				FUNC.refresh();
				$.success(params.id);
			} else
				$.invalid('@(Profile not found)');
		}
	});

	schema.action('export', {
		name: 'Export profile',
		params: '*id:UID',
		permissions: 'profiles',
		action: function($) {
			var params = $.params;
			var db = MAIN.db.profiles[params.id];
			if (db) {
				$.callback(db);
			} else
				$.invalid('@(Profile not found)');
		}
	});

	schema.action('import', {
		name: 'Import profile',
		input: '*id, *name, reference, html, icon:Icon, color:Color, *templates:Object',
		permissions: 'profiles',
		action: function($, model) {
			MAIN.db.profiles[model.id] = model;
			MAIN.db.save();
			FUNC.refresh();
			$.success();
		}
	});

	schema.action('logs', {
		name: 'Logs',
		permissions: 'profiles',
		action: function($) {
			DB().list('nosql/logs').autoquery($.query, 'id,profile,template,output,data:Object,dtcreated:Date,duration:Number,error').sort('dtcreated').callback($);
		}
	});


});