NEWSCHEMA('Templates', function(schema) {

	schema.action('list', {
		name: 'List of templates',
		params: '*profileid:UID',
		permissions: 'profiles',
		action: function($) {

			var params = $.params;
			var db = MAIN.db.profiles[params.profileid];

			if (db) {

				var arr = [];

				for (var key in db.templates) {
					var item = db.templates[key];
					var obj = {};
					obj.id = item.id;
					obj.profileid = item.profileid;
					obj.icon = item.icon;
					obj.name = item.name;
					obj.group = item.group;
					obj.color = db.color;
					obj.count = db.count;
					obj.dtrender = db.dtrender;
					obj.reference = (db.reference || db.id) + '/' + (item.reference || item.id);
					arr.push(obj);
				}

				arr.quicksort('name');

				var data = {};
				data.items = arr;
				data.layout = db.html;
				$.callback(data);
			} else
				$.invalid('@(Profile not found)');
		}

	});

	schema.action('read', {
		name: 'Read template',
		params: '*profileid:UID, *id:UID',
		permissions: 'profiles',
		action: function($) {
			var params = $.params;
			var db = MAIN.db.profiles[params.profileid];
			if (db) {
				var item = db.templates[params.id];
				if (item)
					$.callback(item);
				else
					$.invalid('@(Template not found)');
			} else
				$.invalid('@(Profile not found)');
		}
	});

	schema.action('create', {
		name: 'Create template',
		input: '*name, reference, group, html, icon:Icon',
		params: '*profileid:UID',
		permissions: 'profiles',
		action: function($, model) {

			var params = $.params;
			var db = MAIN.db.profiles[params.profileid];

			if (!db) {
				$.invalid('@(Profile not found)');
				return;
			}

			model.id = UID();
			db.templates[model.id] = model;
			$.success(model.id);

			MAIN.db.save();
			FUNC.refresh();
		}
	});

	schema.action('update', {
		name: 'Update template',
		input: '*name:String, reference:String, group:String, icon:Icon',
		params: '*profileid:UID, *id:UID',
		permissions: 'profiles',
		action: function($, model) {

			var params = $.params;
			var db = MAIN.db.profiles[params.profileid];

			if (!db) {
				$.invalid('@(Profile not found)');
				return;
			}

			var item = db.templates[params.id];

			if (!item) {
				$.invalid('@(Template not found)');
				return;
			}

			COPY(model, item);
			$.success(params.id);

			MAIN.db.save();
			FUNC.refresh();

		}
	});

	schema.action('remove', {
		name: 'Remove template',
		params: '*profileid:UID, *id:UID',
		permissions: 'profiles',
		action: function($) {

			var params = $.params;
			var db = MAIN.db.profiles[params.profileid];

			if (db) {
				if (db.templates[params.id]) {
					delete db.templates[params.id];
					MAIN.db.save();
					$.success(params.id);
				} else
					$.invalid('@(Template not found)');
			} else
				$.invalid('@(Profile not found)');

		}
	});

	schema.action('clone', {
		name: 'Clone template',
		params: '*profileid:UID, *id:UID',
		permissions: 'profiles',
		action: async function($) {

			var params = $.params;
			var db = MAIN.db.profiles[params.profileid];

			if (!db) {
				$.invalid('@(Profile not found)');
				return;
			}

			var item = db.templates[params.id];
			if (!item) {
				$.invalid('@(Template not found)');
				return;
			}

			item = CLONE(item);
			item.id = UID();
			item.name += ' (CLONED)';
			item.reference += '_cloned';
			item.count = 0;
			item.dtrender = null;
			db.templates[item.id] = item;

			MAIN.db.save();
			FUNC.refresh();

			$.success(item.id);

		}
	});

	schema.action('html', {
		name: 'Update HTML content',
		input: 'html:String',
		params: '*profileid:UID, *id:UID',
		permissions: 'profiles',
		action: function($, model) {
			var params = $.params;
			var db = MAIN.db.profiles[params.profileid];
			if (db) {
				var item = db.templates[params.id];
				if (item) {
					item.html = model.html;
					MAIN.db.save();
					FUNC.refresh();
					$.success(params.id);
				} else
					$.invalid('@(Template not found)');
			} else
				$.invalid('@(Profile not found)');
		}
	});

	schema.action('export', {
		name: 'Export template',
		params: '*profileid:UID, *id:UID',
		permissions: 'profiles',
		action: function($) {
			var params = $.params;
			var db = MAIN.db.profiles[params.profileid];
			if (db) {
				var template = db.templates[params.id];
				if (template)
					$.callback(template);
				else
					$.invalid('@(Template not found)');
			} else
				$.invalid('@(Profile not found)');
		}
	});

	schema.action('import', {
		name: 'Import template',
		params: '*profileid:UID',
		input: '*id, *name, reference, html, group, icon:Icon, color:Color',
		permissions: 'profiles',
		action: function($, model) {
			var params = $.params;
			var db = MAIN.db.profiles[params.profileid];
			if (db) {
				db.templates[model.id] = model;
				MAIN.db.save();
				FUNC.refresh();
				$.success();
			} else
				$.invalid('@(Profile not found)');
		}
	});

	schema.action('print', {
		name: 'Print to file',
		input: '*html, type:{pdf|docx|jpg}',
		permissions: 'profiles',
		action: function($, model) {
			TotalAPI('print', { type: model.type, html: model.html }, $.controller);
			$.controller.cancel();
		}
	});

});