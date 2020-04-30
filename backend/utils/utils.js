const log = require("./log");

/**
 * Generates a random string containing numbers and letters
 * @param {number} length The length of the string
 * @return {string} The generated string
 */
function generateRandomString (length) {
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (var i = 0; i < length; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

function handleInternalErro (res, error) {
	log.error(error);
	console.error(error);
	res.status(500).json(error);
}

module.exports = { generateRandomString, handleInternalErro };
