exports.install = function() {

	ROUTE('+GET    /setup/');

	// API
	ROUTE('API    @setup    +save                                 *Setup           --> save');
	ROUTE('API    @setup    -read                                 *Setup           --> read');
	ROUTE('API    @setup    -list                                 *Setup           --> list');
	ROUTE('API    @setup    -usage                                *Setup           --> consumption');
	ROUTE('API    @setup    -clients                              *Setup           --> clients');

	ROUTE('API    @setup    -profiles_list                        *Profiles        --> list');
	ROUTE('API    @setup    -profiles_read/{id}                   *Profiles        --> read');
	ROUTE('API    @setup    +profiles_save                        *Profiles        --> save');
	ROUTE('API    @setup    -profiles_remove/{id}                 *Profiles        --> remove');
	ROUTE('API    @setup    -profiles_clone/{id}                  *Profiles        --> clone');
	ROUTE('API    @setup    -logs                                 *Logs            --> list');
	ROUTE('API    @setup    -logs_clear                           *Logs            --> remove');

	ROUTE('API    @setup    -templates_list/{profileid}           *Templates       --> list');
	ROUTE('API    @setup    -templates_read/{profileid}/{id}      *Templates       --> read');
	ROUTE('API    @setup    +templates_save                       *Templates       --> save');
	ROUTE('API    @setup    -templates_remove/{profileid}/{id}    *Templates       --> remove');
	ROUTE('API    @setup    -templates_clone/{profileid}/{id}     *Templates       --> clone');

	ROUTE('API    @setup    -config_read/{id}                     *Config          --> read');
	ROUTE('API    @setup    +config_save                          *Config          --> save');

	ROUTE('API    @setup    -extensions_list                      *Extensions      --> list');
	ROUTE('API    @setup    +extensions_save                      *Extensions      --> save');
	ROUTE('API    @setup    -extensions_remove/{id}               *Extensions      --> remove');
	ROUTE('API    @setup    -extensions_download/{id}             *Extensions      --> download');
	ROUTE('API    @setup    -extensions_readme/{id}               *Extensions      --> readme');

	ROUTE('+GET   /setup/backup/{id}/                             *Profiles/Backup --> make');
	ROUTE('+POST  /setup/restore/', restore, ['upload'], 1024 * 10);

	ROUTE('+SOCKET /setup/', setup, 1024);
	ROUTE('+POST   /setup/', update, ['upload'], 1024 * 10);
};

function setup() {
	var $ = this;
	$.api('setup');
	$.autodestroy(() => MAIN.wapi = null);
	MAIN.wapi = $;
}

function update() {
	var $ = this;
	var file = $.files[0];

	if (!$.user.sa) {
		$.invalid(401);
		return;
	}

	if (!F.isBundle) {
		$.invalid('@(Available for bundled version only)');
		return;
	}

	if (file && file.extension === 'bundle') {
		file.move(F.Path.join(PATH.root(), '../bundles/app.bundle'), function(err) {
			if (err) {
				$.invalid(err);
			} else {
				$.success();
				setTimeout(() => F.restart(), 1000);
			}
		});
	} else
		$.invalid('Invalid file');
}

function restore() {

	var $ = this;

	if (!$.user.sa) {
		$.invalid(401);
		return;
	}

	var file = $.files[0];
	var id = GUID(10);
	var dir = PATH.tmp(id);

	F.Fs.mkdir(dir, function() {
		RESTORE(file.path, dir, function(err, response) {
			if (response) {
				var filename = PATH.join(dir, 'meta.json');
				F.Fs.readFile(filename, function(err, response) {
					if (response) {
						var meta = response.toString('utf8').parseJSON(true);
						MAIN.db.profiles[meta.id] = meta;
						MAIN.db.save();
						FUNC.refresh();
						$.success();
					} else
						$.invalid(err);
					PATH.rmdir(dir);
				});
			} else {
				PATH.rmdir(dir);
				$.invalid('@(Invalid backup file)');
			}
		});
	});

}