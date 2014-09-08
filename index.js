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

		var nested = [
			lg    : { type: String },
			value : config.options
		];

		//replace path
		schema.path(path, nested);
	});
};