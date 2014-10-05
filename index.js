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

	schema.methods.getPropertyLocalised = function(property, locale, defaultValue) {
		defaultValue = defaultValue || null;

		var prop = this.get(property);
		if(!prop || !prop.length) {
			return defaultValue;
		}

		for(var i=0; i<prop.length; i++) {
			if(prop[i].lg === locale) {
				return prop[i].value;
			}
		}

		return defaultValue;		
	};

	schema.methods.hasPropertyLocale = function(property, locale) {
		var locales = this.getPropertyLocales(property);

		if(locales.indexOf(locale)!==-1) {
			return true;
		}

		return false;
	};

	schema.methods.getPropertyLocales = function(property) {
		var prop = this.get(property),
			locales = [];

		if(!prop || !prop.length) {
			return locales;
		}

		for(var i=0; i<prop.length; i++) {
			locales.push(prop[i].lg);
		}

		return locales;
	};
};