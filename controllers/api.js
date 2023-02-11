exports.install = function() {

	ROUTE('+POST    /', http, [60 * 5000], 1024); // 5 min. timeout + 1024 kB data

	// Index
	ROUTE('GET /', index);
};

function index() {
	if (CONF.token)
		this.plain(CONF.name);
	else
		this.redirect('/setup/');
}


function http() {

	var $ = this;
	var payload = $.body;

	if (typeof(payload.data) === 'string' && payload.data.isJSON())
		payload.data = payload.data.parseJSON(true);

	FUNC.render(payload, $);
}