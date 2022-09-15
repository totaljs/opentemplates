FUNC.formatrow = function(row, index, max) {
	var reguid = /^\d{14,}[a-z]{3}[01]{1}|^\d{9,14}[a-z]{2}[01]{1}a|^\d{4,18}[a-z]{2}\d{1}[01]{1}b|^[0-9a-f]{4,18}[a-z]{2}\d{1}[01]{1}c$/;
	var keys = Object.keys(row);
	var builder = [];

	builder.push('<td><span class="doc-row">' + index + '</span></td>');

	for (var i = 0; i < keys.length; i++) {

		var key = keys[i];
		var val = row[key];
		var format = '{0}';
		var fv;

		switch (typeof(val)) {
			case 'string':

				if (reguid.test(val))
					format = '<span class="doc-uid">{0}</span>';
				else
					format = '<span class="doc-string">{0}</span>';

				break;
			case 'number':
				format = '<span class="doc-number">{0}</span>';
				/*
				if ((val + '').indexOf('.') != -1)
					val = val.format(4);
				else
					val = val.format(0);
				*/
				break;
			case 'boolean':
				format = '<span class="doc-boolean">{0}</span>';
				break;
			case 'object':

				if (val == null) {
					format = '<span class="doc-null">{0}</span>';
					val = 'null';
				} else if (val instanceof Date) {
					format = '<span class="doc-date">{0}</span>';
					isdate = true;
					val = val.format(fv);
				} else {
					format = '<span class="doc-object">{0}</span>';
					val = JSON.stringify(val);
				}
				break;
		}

		if (max && val.length > max)
			val = val.substring(0, max) + '...';

		builder.push('<td>' + key + ': ' + format.format(Thelpers.encode(val)) + '</td>');
	}

	return builder.join('');
};

FUNC.formatjson = function(obj) {
	var reguid2 = /^\d{14,}[a-z]{3}[01]{1}|^\d{9,14}[a-z]{2}[01]{1}a|^\d{4,18}[a-z]{2}\d{1}[01]{1}b|^[0-9a-f]{4,18}[a-z]{2}\d{1}[01]{1}c|^[0-9a-z]{4,18}[a-z]{2}\d{1}[01]{1}d$/;
	obj.HTML = undefined;
	return JSON.stringify(obj, null, '\t').replace(/\t.*?\:\s/g, function(text) {
		return '<span class="doc-object">' + text + '</span>';
	}).replace(/\/span>false/g, function() {
		return '/span><span class="doc-string">false</span>';
	}).replace(/\/span>null/g, function() {
		return '/span><span class="doc-null">null</span>';
	}).replace(reguid2, function(text) {
		return '<span class="doc-uid">' + text + '</span>';
	});
};
