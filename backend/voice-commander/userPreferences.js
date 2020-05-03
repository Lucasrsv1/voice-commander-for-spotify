const fs = require("fs");
const path = require("path");
const spotifyAuth = require("../routes/spotifyAuth");

var userPreferences = null;

/**
 * Find current user's preferences JSON file
 * @returns {string}
 */
function getUserFilePath () {
	return path.join(__dirname, "..", "user-preferences", `${spotifyAuth.user.id}.config.json`);
}

/**
 * Load current user's preferences
 */
function loadUser () {
	if (!fs.existsSync(getUserFilePath()))
		fs.copyFileSync(path.join(__dirname, "..", "user-preferences", "default.config.json"), getUserFilePath());

	userPreferences = JSON.parse(fs.readFileSync(getUserFilePath()));
	require("../voice-commander/index").loadAvailablePlaylists();
}

/**
 * Update and safe current user's preferences
 * @param {string[]} toIgnore identifiers of the playlists that must be ignored
 * @param {string[]} searchOrder identifiers of the playlists in the order they must be searched
 */
function updateUsersPlaylistPreferences (toIgnore, searchOrder) {
	userPreferences.ignored_playlists = toIgnore;
	userPreferences.playlists_search_order = searchOrder;
	fs.writeFileSync(getUserFilePath(), JSON.stringify(userPreferences, null, "\t"));

	require("../voice-commander/index").loadAvailablePlaylists();
}

/**
 * Determine whether a playlist must be ignored according to current user's preferences
 * @param {string} playlist identifier of the playlist
 * @returns {boolean} if `true` the playlist must be ignored
 */
function isPlaylistIgnored (playlist) {
	return userPreferences.ignored_playlists.indexOf(playlist.id) !== -1;
}

/**
 * Sort a list of playlists according to current user's preferences
 * @param {SpotifyApi.PlaylistObjectSimplified} playlists array of playlists to be sorted
 */
function sortPlaylists (playlists) {
	playlists.sort((playlistA, playlistB) => {
		let a = userPreferences.playlists_search_order.indexOf(playlistA.id);
		let b = userPreferences.playlists_search_order.indexOf(playlistB.id);

		// Pull ignored playlists to the bottom os the list
		if (!playlistA.not_ignored) return 1;
		if (!playlistB.not_ignored) return -1;

		if (a === -1 || playlistA.ignored) return 1;
		if (b === -1 || playlistB.ignored) return -1;

		return a > b ? 1 : (b > a ? -1 : 0);
	});
}

module.exports = {
	loadUser, updateUsersPlaylistPreferences,
	isPlaylistIgnored, sortPlaylists
};
