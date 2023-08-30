/* only these query params are allowed for substitution */
const allowed_param_keys = [
	'chart_version',
];

/*!
 * Get an object value from a specific path
 * (c) 2018 Chris Ferdinandi, MIT License, https://gomakethings.com
 */
var get = function (obj, path, def) {

	/**
	 * If the path is a string, convert it to an array
	 * @param  {String|Array} path The path
	 * @return {Array}             The path array
	 */
	var stringToPath = function (path) {

		// If the path isn't a string, return it
		if (typeof path !== 'string') return path;

		// Create new array
		var output = [];

		// Split to an array with dot notation
		path.split('.').forEach(function (item) {

			// Split to an array with bracket notation
			item.split(/\[([^}]+)\]/g).forEach(function (key) {

				// Push to the new array
				if (key.length > 0) {
					output.push(key);
				}

			});

		});

		return output;

	};

	// Get the path as an array
	path = stringToPath(path);

	// Cache the current object
	var current = obj;

	// For each item in the path, dig into the object
	for (var i = 0; i < path.length; i++) {

		// If the item isn't found, return the default (or null)
		if (!current[path[i]]) return def;

		// Otherwise, update the current  value
		current = current[path[i]];

	}

	return current;

};

/*!
 * BASED ON
 * Get the URL parameters
 * (c) 2021 Chris Ferdinandi, MIT License, https://gomakethings.com
*/

function getParams (url = window.location, allowed_keys = []) {
	let params = {};
	new URL(url).searchParams.forEach(function (val, key) {
		if (allowed_keys.length == 0 || allowed_keys.includes(key)) {
			if (params[key] !== undefined) {
				if (!Array.isArray(params[key])) {
					params[key] = [params[key]];
				}
				params[key].push(val);
			} else {
				params[key] = val;
			}
		}
	});
	return params;
}


/*!
 * Replaces placeholders with real content
 * Requires get() - https://vanillajstoolkit.com/helpers/get/
 * (c) 2019 Chris Ferdinandi, MIT License, https://gomakethings.com
 */
var placeholders = function (template, data) {

	'use strict';

	// Check if the template is a string or a function
	template = typeof (template) === 'function' ? template() : template;
	if (['string', 'number'].indexOf(typeof template) === -1) throw 'PlaceholdersJS: please provide a valid template';

	// If no data, return template as-is
	if (!data) return template;

	// Replace our curly braces with data
	template = template.replace(/\{\{([^}]+)\}\}/g, function (match) {

		// Remove the wrapping curly braces
		match = match.slice(2, -2);

		// Get the value
		var val = get(data, match.trim());

		// Replace
		if (!val) return '{{' + match + '}}';
		return val;

	});

	return template;

};


/*
Let's start the party ...
*/
document.addEventListener("DOMContentLoaded", function(event) {
	// Only allow these params
  let params = getParams(window.location.href, allowed_param_keys);
  let codeblocks = document.querySelectorAll('pre code');

  if (codeblocks.length > 0) {
    codeblocks.forEach((codeblock) => {
      let template = codeblock.textContent;
      codeblock.textContent = placeholders(template, params);
    });
  }
});
