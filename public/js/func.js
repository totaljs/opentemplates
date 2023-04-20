FUNC.parsetemplate = function(body) {

	var helpers = {};
	var model = EMPTYOBJECT;
	var output = {};
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

		try {
			model = JSON.parse(body.substring(beg + 25, end).trim(), function(key, value) {
				return typeof(value) === 'string' && value.isJSONDate() ? new Date(value) : value;
			});
		} catch (e) {
			output.error = e;
			model = {};
			SETTER('notify/warning', 'Invalid model: ' + e.message);
		}

		body = body.substring(0, beg) + body.substring(end + 9);
	}

	try {
		if (strhelpers)
			new Function('Thelpers', strhelpers)(helpers);
	} catch (e) {
		output.error = e;
		SETTER('notify/warning', 'Invalid helpers: ' + e.message);
	}

	output.helpers = helpers;
	try {
		output.template = Tangular.compile(body.trim());
	} catch (e) {
		SETTER('notify/warning', 'Invalid template: ' + e.message);
		output.template = () => '';
	}
	output.model = model;
	return output;
};