FUNC.refresh = function() {
	MAIN.cache = {};
	for (var key in MAIN.db.profiles) {

		var profile = MAIN.db.profiles[key];
		var obj = {};

		obj.layout = FUNC.parsetemplate(profile.html || '{{ value | raw }}');

		for (var key2 in profile.templates) {
			var template = profile.templates[key2];
			var id = key + '/' + key2;

			MAIN.cache[id] = { profile: profile, template: template };
			id = (profile.reference || profile.id) + '/' + (template.reference || template.id);
			try {

				obj.template = FUNC.parsetemplate(template.html || '');
				if (obj.layout && obj.layout.helpers) {
					for (var key in obj.layout.helpers)
						obj.template.helpers[key] = obj.layout.helpers[key];
				}

				MAIN.cache[id] = { profile: profile, template: template, tlayout: obj.layout, ttemplate: obj.template };

			} catch (e) {
				console.log(profile.name, e);
			}
		}
	}
};

FUNC.render = function(model, $) {

	var raw = model;
	model = CONVERT(model, 'id:String, html:String, data:Object, output:String');

	if (!model.id) {
		$.invalid('Invalid template ID');
		return;
	}

	// model.id {String} a path to the template REF_PROFILE/REF_TEMPLATE or ID_PROFILE/ID_TEMPLATE
	// model.html {String} optional, a custom HTML body
	// model.data {Object} optional, additional data for the template

	var meta = MAIN.cache[model.id];
	if (meta) {

		if ($.user && !$.user.sa) {
			var access = MAIN.tokens[$.user.token];
			if (access) {
				if (access.profiles && !access.profiles[meta.profile.id]) {
					$.invalid('Invalid permissions');
					return;
				}
			}
		}

		NOW = new Date();

		if (meta.profile.count)
			meta.profile.count++;
		else
			meta.profile.count = 1;

		if (meta.template.count)
			meta.template.count++;
		else
			meta.template.count = 1;

		meta.profile.dtrender = NOW;
		meta.template.dtrender = NOW;

		var html = model.html || model.body;
		var data = model.data || {};

		if (typeof(data) !== 'object')
			data = {};

		if (html) {
			html = meta.tlayout.template({ value: html }, meta.tlayout.model, meta.tlayout.helpers);
		} else {
			html = meta.ttemplate.template({ value: data }, meta.tlayout.model, meta.ttemplate.helpers);
			html = meta.tlayout.template({ value: html }, meta.tlayout.model, meta.tlayout.helpers);
		}

		var arg = {};

		arg.meta = meta;
		arg.model = model;
		arg.html = html;

		TRANSFORM('render', arg, function() {

			DB().insert('nosql/logs', { profileid: meta.profile.id, templateid: meta.template.id, profile: meta.profile.name, template: meta.template.name, output: model.output || 'html', model: raw, dtcreated: NOW });

			switch (model.output) {
				case 'pdf':
				case 'jpg':
				case 'png':
				case 'docx':
					TotalAPI('print', { type: model.output, html: arg.html }, $);
					break;
				default:
					$.content(arg.html, 'text/html');
					break;
			}
		});

	} else
		$.invalid('Template not found');
};

FUNC.parsetemplate = function(body) {

	var helpers = {};
	var model = EMPTYOBJECT;
	var strhelpers = '';
	var beg = body.indexOf('<scr' + 'ipt>');
	var end;

	// helpers
	if (beg !== -1) {
		end = body.indexOf('</scr' + 'ipt>', beg + 8);
		strhelpers = body.substring(beg + 8, end).trim();
		body = body.substring(0, beg) + body.substring(end + 9);
	}

	// model
	beg = body.indexOf('<scr' + 'ipt type="text/json">');
	if (beg !== -1) {
		end = body.indexOf('</scr' + 'ipt>', beg + 8);
		model = (body.substring(beg + 25, end).trim()).parseJSON(true);
		body = body.substring(0, beg) + body.substring(end + 9);
	}

	if (strhelpers)
		new Function('Thelpers', strhelpers)(helpers);

	var output = {};
	output.helpers = helpers;
	output.template = Tangular.compile(body.trim());
	output.model = model;
	return output;
};