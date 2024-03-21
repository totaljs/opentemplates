exports.install = function() {
	ROUTE('+GET  /setup/*', setup);
};

function setup() {

	var self = this;

	if (self.user.openplatform && !self.user.iframe && self.query.openplatform) {
		self.cookie(CONF.op_cookie, self.query.openplatform, NOW.add('12 hours'));
		self.redirect(self.url);
		return;
	}

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