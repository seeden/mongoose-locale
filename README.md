mongoose-locale
==============

You can use this plugin when you need to use field for multiple languages.

## Example ##

Next schema will be converted

	{
		name: { type: String, trim: true, locale: true }
	}


into this schema

	{
		name: [{
			lg    : { type: String },
			value : { type: String, trim: true }
		}]
	}