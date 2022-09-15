FUNC.transationlog = function(query) {
	F.Fs.appendFile(PATH.databases(query.db + '.log'), JSON.stringify(query) + '\n', NOOP);
};

FUNC.checksum = function(id) {
	var sum = 0;
	for (var i = 0; i < id.length; i++)
		sum += id.charCodeAt(i);
	return sum.toString(36);
};

FUNC.preparetokens = function() {

	MAIN.tokens = {};

	if (PREF.tokens) {
		for (var token of PREF.tokens) {

			var obj = CLONE(token);
			if (obj.profiles && obj.profiles.length) {
				var tmp = {};
				for (var db of obj.profiles)
					tmp[db] = 1;
				obj.profiles = tmp;
			} else
				obj.profiles = null;

			MAIN.tokens[obj.token] = obj;
		}
	}

	if (MAIN.socket) {
		for (var key in MAIN.socket.connections) {
			var client = MAIN.socket.connections[key];
			if (client.user.token !== PREF.token) {
				var session = MAIN.tokens[client.user.token];
				if (session)
					client.user = session;
				else
					client.close(4001);
			}
		}
	}

};

FUNC.refresh = function() {
	MAIN.cache = {};
	for (var key in MAIN.db.profiles) {

		var profile = MAIN.db.profiles[key];
		var obj = {};

		try {
			obj.template = Tangular.compile(profile.html);
			obj.helpers = new Function('return ' + profile.helpers)();
			obj.secondary = profile.secondary ? new Function('return ' + profile.secondary)() : EMPTYOBJECT;
		} catch (e) {}

		for (var key2 in profile.templates) {
			var template = profile.templates[key2];
			var id = key + '/' + key2 + (template.language ? ('/' + template.language) : '');
			MAIN.cache[id] = { profile: profile, template: template };
			id = (profile.reference || profile.id) + '/' + (template.reference || template.id) + (template.language ? ('/' + template.language) : '');
			try {
				MAIN.cache[id] = { profile: profile, template: template, tlayout: obj.template, ttemplate: Tangular.compile(template.html), helpers: obj.helpers, secondary: obj.secondary };
			} catch (e) {}
		}
	}
};

FUNC.saveconfig = function() {
	var config = {};
	for (var item of F.extensions)
		config[item.id] = item.config;
	F.Fs.writeFile(PATH.databases('extensions.json'), JSON.stringify(config), NOOP);
};

function savemeta(db) {
	F.Fs.writeFile(PATH.databases('meta_' + db + '.json'), JSON.stringify(MAIN.meta[db] || EMPTYOBJECT), NOOP);
}

FUNC.savemeta = function(db) {
	setTimeout2(db, savemeta, 10000, 10, db);
};

FUNC.render = function(model, $) {

	var raw = model;
	model = CONVERT(model, 'id:String, html:String, data:Object, language:String, output:String');

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
			data.body = html;
			html = meta.tlayout(data, meta.secondary, meta.helpers);
		} else {
			html = meta.ttemplate(data, meta.secondary, meta.helpers);
			data.body = html;
			html = meta.tlayout(data, meta.secondary, meta.helpers);
		}

		var arg = {};

		arg.meta = meta;
		arg.model = model;
		arg.html = html;

		TRANSFORM('render', arg, function() {

			NOSQL('logs').insert({ profileid: meta.profile.id, templateid: meta.template.id, profile: meta.profile.name, template: meta.template.name, output: model.output || 'html', model: raw, dtcreated: NOW }).callback(() => MAIN.wapi && MAIN.wapi.send({ TYPE: 'logs', profileid: meta.profile.id }));

			switch (model.output) {
				case 'pdf':
				case 'jpg':
				case 'png':
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

FUNC.audit = function(client, msg) {
	msg.token = client.user.token;
	msg.ua = client.ua;
	msg.ip = client.ip;
	msg.dtcreated = new Date();
	F.Fs.appendFile(PATH.databases('audit.log'), JSON.stringify(msg) + '\n', NOOP);
};