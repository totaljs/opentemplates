exports.icon = 'ti ti-folders';
exports.name = '@(Profiles)';
exports.position = 1;
exports.permissions = [{ id: 'profiles', name: 'Profiles' }];
exports.visible = user => user.sa || user.permissions.includes('profiles');
exports.import = 'import.html';
exports.routes = [
	{ url: '/profiles/{id}/', html: 'detail' }
];

exports.install = function() {

	// Profiles
	ROUTE('+API     /api/            -profiles                             *Profiles    --> list');
	ROUTE('+API     /api/            -profiles_read/{id}                   *Profiles    --> read');
	ROUTE('+API     /api/            -profiles_meta/{id}                   *Profiles    --> meta');
	ROUTE('+API     /api/            -profiles_clone/{id}                  *Profiles    --> clone');
	ROUTE('+API     /api/            +profiles_create                      *Profiles    --> create');
	ROUTE('+API     /api/            +profiles_update/{id}                 *Profiles    --> update');
	ROUTE('+API     /api/            -profiles_remove/{id}                 *Profiles    --> remove');
	ROUTE('+API     /api/            +profiles_html/{id}                   *Profiles    --> html');
	ROUTE('+API     /api/            -profiles_export/{id}                 *Profiles    --> export');
	ROUTE('+API     /api/            +profiles_import                      *Profiles    --> import');
	ROUTE('+API     /api/            -profiles_logs                        *Profiles    --> logs');

	// Templates
	ROUTE('+API     /api/            -templates/{profileid}                *Templates   --> list');
	ROUTE('+API     /api/            -templates_read/{profileid}/{id}      *Templates   --> read');
	ROUTE('+API     /api/            -templates_clone/{profileid}/{id}     *Templates   --> clone');
	ROUTE('+API     /api/            +templates_create/{profileid}         *Templates   --> create');
	ROUTE('+API     /api/            +templates_update/{profileid}/{id}    *Templates   --> update');
	ROUTE('+API     /api/            -templates_remove/{profileid}/{id}    *Templates   --> remove');
	ROUTE('+API     /api/            +templates_html/{profileid}/{id}      *Templates   --> html');
	ROUTE('+API     /api/            -templates_export/{profileid}/{id}    *Templates   --> export');
	ROUTE('+API     /api/            +templates_import/{profileid}         *Templates   --> import');

	ROUTE('+POST    /api/printer/                                          *Templates   --> print');

};