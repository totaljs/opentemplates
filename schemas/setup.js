NEWSCHEMA('Token', function(schema) {
	schema.define('name', String, true);
	schema.define('token', String, true);
	schema.define('profiles', '[String]');
});

NEWSCHEMA('Setup', function(schema) {

	schema.define('name', String, true);
	schema.define('token', String, true);
	schema.define('path', String, true);
	schema.define('tokens', '[Token]');
	schema.define('log', Boolean);
	schema.define('log_requests', Boolean);
	schema.define('totalapi', String);
	schema.define('allow_tms', Boolean);
	schema.define('secret_tms', String);
	schema.define('resend', '[String]');
	schema.define('disconnected', Boolean);

	schema.setSave(function($, model) {

		if (!PREF.path) {
			var path = model.path;
			CONF.directory_databases = path;
			if (path[0] === '~')
				path = path.substring(1);
			else
				path = PATH.root(path);
			PATH.mkdir(path);
		}

		for (var key in model)
			PREF.set(key, model[key]);

		LOADCONFIG({ name: model.name, allow_tms: model.allow_tms, secret_tms: model.secret_tms, totalapi: model.totalapi });
		$.success();
		FUNC.preparetokens();
		MAIN.socket && MAIN.socket.sendmeta();
	});

	schema.setRead(function($) {

		var data = CLONE(PREF);

		// if (data.tokens) {
		// 	for (var token of data.tokens)
		// 		token.stats = MAIN.stats[token.token];
		// }

		data.profiles = [];

		for (var key in MAIN.db.profiles) {
			var item = MAIN.db.profiles[key];
			data.profiles.push({ id: key, name: item.name });
		}

		data.is = !!PREF.path;
		$.callback(data);
	});

	schema.setList(function($) {
		F.Fs.readdir(PATH.databases(), function(err, items) {
			var arr = [];

			for (var item of items) {
				if (item.substring(0, 7) === 'textdb-') {
					var name = item.substring(7);
					var index = name.lastIndexOf('_');
					var ex = index === -1 ? '' : name.substring(index + 1);
					var id = ex === 'h' || ex === 'm' || ex === 'w' || ex === 'y' || ex === 'd' ? name.substring(0, index) : name;
					arr.push({ name: id, id: name });
				}
			}

			arr.wait(function(item, next) {
				U.ls2(PATH.databases('textdb-' + item.id), function(files) {
					item.size = 0;
					item.count = files.length;
					for (var file of files) {
						item.size += file.stats.size;
						if (!item.dtupdated || item.dtupdated < file.stats.mtime)
							item.dtupdated = file.stats.mtime;
					}
					next();
				});
			}, function() {

				var merge = [];

				for (var item of arr) {

					if (item.id !== item.name) {
						var stats = merge.findItem('name', item.name);
						if (stats) {

							stats.size += item.size;
							stats.count += item.count;

							if (stats.dtupdated < item.dtupdated)
								stats.dtupdated = item.dtupdated;

						} else {
							item.stats = true;
							item.type = 'stats';
							merge.push(item);
						}
					} else {
						item.type = 'db';
						merge.push(item);
					}
				}

				for (var key in MAIN.inmemorydb) {
					var session = MAIN.inmemorydb[key];
					merge.push({ id: key, type: 'inmemory', name: key, dtupdated: session.dtupdated, dtread: session.dtread, count: Object.keys(session.items).length });
				}

				$.callback(merge);
			});
		});
	});

	schema.addWorkflow('consumption', function($) {
		var data = {};
		var consumption = F.consumption;
		if (consumption) {
			data.memory = consumption.memory;
			data.usage = consumption.usage;
		} else {
			data.memory = 0;
			data.usage = 0;
		}
		$.callback(data);
	});

});