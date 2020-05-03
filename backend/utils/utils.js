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

/**
 * Wait until a certain condition is met to execute an action
 * @param {function (): boolean} condition condition checker
 * @param {function (): any} action action to be exeuted when `condition` returns `true`
 * @param {number} [timeout] maximum waiting time
 * @param {function (): any} [timeoutFunction] action to be executed if time runs out
 * @param {number} [interval] condition checking interval
 * @param {number} [timePassed] time since started wating
 */
function _waitForIt (condition, action, timeout, timeoutFunction, interval, timePassed) {
	if (!interval) interval = 100;
	if (!timePassed) timePassed = 0;

	if (!timeout || timePassed <= timeout) {
		if (condition())
			action();
		else
			setTimeout(_waitForIt, interval, condition, action, timeout, timeoutFunction, interval, timePassed + interval);
	} else if (typeof timeoutFunction === "function") {
		timeoutFunction();
	}
}

/**
 * Wait until a certain condition is met
 * @param {function (): boolean} condition condition checker
 * @param {number} [timeout] maximum waiting time
 * @param {number} [interval] condition checking interval
 * @returns {Promise<void>} promise resolved when `condition` is met ou rejected in case of a timeout
 */
function waitForIt (condition, timeout, interval) {
	return new Promise((resolve, reject) => {
		_waitForIt(condition, resolve, timeout, reject, interval);
	});
}

function handleInternalErro (res, error) {
	log.error(error);
	console.error(error);
	res.status(500).json(error);
}

module.exports = { generateRandomString, handleInternalErro, waitForIt };
