const fs = require("fs");
const path = require("path");

const spotifyAuth = require("../routes/spotifyAuth");
const spotifyController = require("./spotifyController");

var userPreferences = null;
var availablePlaylists = [];

function getUserFilePath () {
	return path.join(__dirname, "..", "user-preferences", `${spotifyAuth.user.id}.config.json`);
}

function loadUser () {
	if (!fs.existsSync(getUserFilePath()))
		fs.copyFileSync(path.join(__dirname, "..", "user-preferences", "default.config.json"), getUserFilePath());

	userPreferences = JSON.parse(fs.readFileSync(getUserFilePath()));
	updateAvailablePlaylists();
}

function updateUsersPlaylistPreferences (toIgnore, searchOrder) {
	userPreferences.ignored_playlists = toIgnore;
	userPreferences.playlists_search_order = searchOrder;
	fs.writeFileSync(getUserFilePath(), JSON.stringify(userPreferences, null, "\t"));

	updateAvailablePlaylists();
}

async function updateAvailablePlaylists () {
	let playlists = await spotifyController.getPlaylists();

	// Skip ignored playlist
	playlists = playlists.filter(playlist => !isPlaylistIgnored(playlist));

	// Sort playlists according to user's preferences
	sortPlaylists(playlists);

	availablePlaylists = playlists;
}

function isPlaylistIgnored (playlist) {
	return userPreferences.ignored_playlists.indexOf(playlist.id) !== -1;
}

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
	updateAvailablePlaylists, isPlaylistIgnored, sortPlaylists
};
