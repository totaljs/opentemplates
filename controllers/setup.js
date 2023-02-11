exports.install = function() {
	ROUTE('+GET    /setup/*', setup);
	ROUTE('+POST   /setup/',  update, ['upload'], 1024 * 10);
};

function setup() {

	var self = this;
	var plugins = [];

	for (var key in F.plugins) {
		var item = F.plugins[key];
		if (self.user.sa || !item.visible || item.visible(self.user)) {
			var obj = {};
			obj.id = item.id;
			obj.routes = item.routes;
			obj.position = item.position;
			obj.name = TRANSLATOR(self.user.language || '', item.name);
			obj.icon = item.icon;
			obj.import = item.import;
			plugins.push(obj);
		}
	}

	plugins.quicksort('position');
	self.view('index', plugins);
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