'use strict';

module.exports = function localePlugin (schema, options) {
	//prepare arguments
	if(!options) {
		options = {};
	}

	schema.eachPath(function(path, config) {
		if (!config.options.locale) {
			return;
		}

		//clean actual path
		delete(config.options.locale);
		schema.remove(path);

		var nested = {
			lg    : { type: String },
			value : config.options
		};

		schema.path(path, nested);
	});
};