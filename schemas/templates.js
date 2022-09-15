NEWSCHEMA('Templates', function(schema) {

	schema.define('id', UID);
	schema.define('profileid', UID, true);
	schema.define('icon', 'Icon');
	schema.define('name', String, true);
	schema.define('language', String);
	schema.define('reference', String);
	schema.define('html', String);
	schema.define('model', String);

	schema.setQuery(function($) {

		var profile = MAIN.db.profiles[$.id];

		if (!profile) {
			$.invalid(404);
			return;
		}

		var arr = [];

		if (profile.templates) {
			for (var key in profile.templates) {
				var item = profile.templates[key];
				var obj = {};
				obj.id = item.id;
				obj.profileid = item.profileid;
				obj.icon = item.icon;
				obj.name = item.name;
				obj.language = item.language;
				obj.color = profile.color;
				obj.reference = (profile.reference || profile.id) + '/' + (item.reference || item.id) + (item.language ? ('/' + item.language) : '');
				obj.dtcreated = item.dtcreated;
				obj.dtupdated = item.dtupdated;
				obj.sent = item.sent;
				arr.push(obj);
			}
			arr.quicksort('name');
		}

		var data = {};
		data.items = arr;
		data.layout = profile.html;
		$.callback(data);
	});

	schema.setRead(function($) {
		var item = MAIN.db.profiles[$.params.profileid];
		if (item) {
			var template = item.templates[$.params.id];
			if (template)
				$.callback(template);
			else
				$.invalid(404);
		} else
			$.invalid(404);
	});

	schema.setSave(function($, model) {

		var profile = MAIN.db.profiles[model.profileid];
		if (!profile) {
			$.invalid(404);
			return;
		}

		if (model.id) {
			var template = profile.templates[model.id];
			if (template) {
				template.icon = model.icon;
				template.name = model.name;
				template.language = model.language;
				template.reference = model.reference;
				template.html = model.html;
				template.model = model.model;
				template.dtupdated = NOW;
				delete MAIN.cache[model.id];
			} else {
				$.invalid(404);
				return;
			}
		} else {
			model.id = UID();
			model.dtcreated = NOW;
			model.sent = 0;
			profile.templates[model.id] = model;
		}

		FUNC.refresh();
		MAIN.db.save();
		$.success(model.id);
	});

	schema.addWorkflow('clone', function($) {

		var profile = MAIN.db.profiles[$.params.profileid];
		if (!profile) {
			$.invalid(404);
			return;
		}

		var template = profile.templates[$.params.id];
		if (template) {
			template = CLONE(template);
			template.id = UID();
			template.name += ' (CLONED)';
			template.reference += '_cloned';
			template.dtcreated = NOW;
			template.dtupdated = NOW;
			profile.templates[template.id] = template;
			FUNC.refresh();
			MAIN.db.save();
			$.success();
		} else
			$.invalid(404);

	});

	schema.setRemove(function($) {
		var item = MAIN.db.profiles[$.params.profileid];
		if (item) {
			delete item.templates[$.params.id];
			MAIN.db.save();
			FUNC.refresh();
			$.success();
		} else
			$.invalid(404);
	});

});