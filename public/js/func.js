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
		model = PARSE(body.substring(beg + 25, end).trim());
		body = body.substring(0, beg) + body.substring(end + 9);
	}

	try {
		if (strhelpers)
			new Function('Thelpers', strhelpers)(helpers);
	} catch (e) {
		console.error('Tangular error', e);
	}

	var output = {};
	output.helpers = helpers;
	output.template = Tangular.compile(body.trim());
	output.model = model;
	return output;
};