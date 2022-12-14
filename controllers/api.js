exports.install = function() {

	ROUTE('+POST    /', http, [60 * 5000], 1024); // 5 min. timeout + 1024 kB data

	// Index
	ROUTE('GET /', index);
};

function index() {
	if (PREF.token)
		this.plain(MAIN.name + ' v' + MAIN.version);
	else
		this.redirect('/setup/');
}


function http() {

	var $ = this;
	var payload = $.body;

	if (typeof(payload.data) === 'string' && payload.data.isJSON())
		payload.data = payload.data.parseJSON(true);

	if (PREF.log_requests)
		FUNC.audit($, payload);

	FUNC.render(payload, $);
}