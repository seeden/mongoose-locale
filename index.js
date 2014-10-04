'use strict';

module.exports = function localePlugin (schema, options) {
	//prepare arguments
	if(!options) {
		options = {};
	}

	schema.eachPath(function(path, config) {
		if(config.schema) {
			config.schema.plugin(localePlugin, options);
			return;
		}

		if (!config.options.locale) {
			return;
		}

		//clean actual path
		delete(config.options.locale);
		if(Array.isArray(config.options.type)) {
			config.options = config.options.type.length 
				? config.options.type[0]
				: schema.constructor.Types.Mixed;
		}

		var nested = [{
			_id   : false,
			lg    : { type: String },
			value : config.options
		}];

		//replace path
		schema.path(path, nested);
	});
};