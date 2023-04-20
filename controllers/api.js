exports.install = function() {

	ROUTE('+POST    /', http, [60 * 5000], 1024); // 5 min. timeout + 1024 kB data
	ROUTE('+POST    /api/upload/', upload, 1024);
	ROUTE('+GET     /profiles/', profiles);

	// Index
	ROUTE('GET /', index);
	ROUTE('FILE /download/*.*', download);
};

function index() {
	if (CONF.token)
		this.plain(CONF.name);
	else
		this.redirect('/setup/');
}

function profiles() {

	var $ = this;

	if (!$.user.sa && !$.user.profiles) {
		$.invalid(401);
		return;
	}

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
		obj.templates = [];

		for (var key in item.templates) {
			var tmp = item.templates[key];
			var sub = {};
			sub.id = key;
			sub.name = tmp.name;
			sub.reference = item.reference + '/' + tmp.reference;
			var a = MAIN.cache[sub.reference];
			if (a && a.ttemplate)
				sub.model = a.ttemplate.model;
			obj.templates.push(sub);
		}
		arr.push(obj);
	}

	$.json(arr);
}

function http() {

	var $ = this;
	var payload = $.body;

	if (typeof(payload.data) === 'string' && payload.data.isJSON())
		payload.data = payload.data.parseJSON(true);

	FUNC.render(payload, $);
}

function upload() {

	var $ = this;
	var file = $.files[0];

	if (file) {
		file.fs('files', UID(), $.successful(function(response) {
			response.url = $.hostname('/download/{id}.{ext}'.args(response));
			$.json(response);
		}));
	} else
		$.json(null);

}

function download(req, res) {
	var filename = req.split[1];
	var index = filename.lastIndexOf('.');
	res.filefs('files', filename.substring(0, index), !!req.query.download);
}