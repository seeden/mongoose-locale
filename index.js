'use strict';

module.exports = function localePlugin (schema, options) {

	//prepare arguments
	options = options || {};
	var opts_lang = options.lang_override || 'lg',
			opts_value = options.value_override || 'value';

	schema.eachPath(function(path, config) {
		if (config.schema) {
			config.schema.plugin(localePlugin, options);
			return;
		}

		if (!config.options.locale) {
			return;
		}

		var nested = [{}];

		if (!config.options.track) {
			nested[0]._id = false;
		}

		//clean actual path
		delete config.options.locale;
		delete config.options.track;

		if (Array.isArray(config.options.type)) {
			config.options = config.options.type.length
				? config.options.type[0]
				: schema.constructor.Types.Mixed;
		}

		nested[0][opts_lang] = { type: String };
		nested[0][opts_value] = config.options;

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

		if (!prop || !prop.length) {
			return defaultValue;
		}

		for (var i = 0; i < prop.length; i++) {
			if (prop[i][opts_lang] === locale) {
				return prop[i][opts_value];
			}
		}

		return defaultFirst && prop.length ? prop[0][opts_value] : defaultValue;
	};

	schema.methods.setPropertyLocalised = function(property, value, locale) {
		var prop = this.get(property);

		if (!prop || !prop.length) {
			var item = {};
			item[opts_lang] = locale;
			item[opts_value] = value;
			prop.set(0, item);
		} else {

			var exists = false;

			for (var i = 0; i < prop.length; i++) {

				if(prop[i][opts_lang] !== locale) {
					continue;
				}

				var item = {};
				item[opts_lang] = locale;
				item[opts_value] = value;
				prop.set(i, item);

				exists = true;
				break;
			}

			if (!exists) {
				var item = {};
				item[opts_lang] = locale;
				item[opts_value] = value;
				prop.push(item);
			}
		}

	};

	schema.methods.hasPropertyLocale = function(property, locale) {
		var locales = this.getPropertyLocales(property);

		if (locales.indexOf(locale) !== -1) {
			return true;
		}

		return false;
	};

	schema.methods.removePropertyLocale = function(property, locale) {
		var prop = this.get(property);

		if (!prop || !prop.length) {
			return false
		}

		var value = {};
		value[opts_lang] = locale
		prop.pull(value);

		return true;
	};

	schema.methods.getPropertyLocales = function(property) {
		var prop = this.get(property),
				locales = [];

		if (!prop || !prop.length) {
			return locales;
		}

		for (var i = 0; i < prop.length; i++) {
			locales.push(prop[i][opts_lang]);
		}

		return locales;
	};

	schema.methods.comparePropertyLocales = function(property, locale, locale_comp) {
		var prop = this.get(property);
		var track, track_comp;

		if (!prop || !prop.length) {
			return false;
		}

		for (var i = 0; i < prop.length; i++) {
			if (prop[i]._id && prop[i][opts_lang] == locale) {
				track = prop[i]._id.getTimestamp();
			}

			if (prop[i]._id && prop[i][opts_lang] == locale_comp) {
				track_comp = prop[i]._id.getTimestamp();
			}
		}

		if (track >= track_comp) {
			return true;
		}

		return false;
	};

};