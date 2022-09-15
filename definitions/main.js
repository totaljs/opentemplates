MAIN.version = 1;
MAIN.name = 'OpenTemplates';
MAIN.db = MEMORIZE('db');
MAIN.cache = {};
MAIN.tokens = {};

// Temporary, it's loaded automatically
MAIN.meta = {};

if (!MAIN.db.profiles)
	MAIN.db.profiles = {};

ON('ready', function() {
	PREF.name && LOADCONFIG({ name: PREF.name, allow_tms: PREF.allow_tms, secret_tms: PREF.secret_tms, totalapi: PREF.totalapi });
	FUNC.preparetokens();
	FUNC.refresh();
});