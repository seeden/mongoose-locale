'use strict';

module.exports = function localePlugin (schema, options) {
	//prepare arguments
	options = options || {};

	schema.eachPath(function(path, config) {
		if(config.schema) {
			config.schema.plugin(localePlugin, options);
			return;
		}

		if (!config.options.locale) {
			return;
		}

		//clean actual path
		delete config.options.locale;
		
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

		//add i18n
		var pathParts = path.split('.'),
			property = pathParts.pop();

		pathParts.push('i18n', property);

		var i18nPath = pathParts.join('.');

		schema.virtual(i18nPath).get(function() { 
			var _this = this;
			return {
				get: function(locale, defaultValue, defaultFirst) {
					return _this.getPropertyLocalised(path, locale, defaultValue, defaultFirst);
				},
				set: function(value, locale) {
					return _this.setPropertyLocalised(path, value, locale);
				}
			};
		});
	});

	schema.methods.getPropertyLocalised = function(property, locale, defaultValue, defaultFirst) {
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

		return defaultFirst && prop.length ? prop[0].value : defaultValue;		
	};

	schema.methods.setPropertyLocalised = function(property, value, locale) {
		var prop = this.get(property);
		if(!prop || !prop.length) {
			prop = [{
				lg: locale,
				value: value
			}];
		} else {
			var exists = false;
			for(var i=0; i<prop.length; i++) {
				var item = prop[i];

				if(item.lg !== locale) {
					continue;
				}

				item.value = value;
				exists = true;
				break;
			}

			if(!exists) {
				prop.push({
					lg: locale,
					value: value
				});
			}
		}

		this.markModified(property);
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