const spotifyController = require("./spotifyController");
const userPreferences = require("./userPreferences");

var loadingData = false;
var availablePlaylists = [];

async function loadAvailablePlaylists () {
	loadingData = true;
	let playlists = await spotifyController.getPlaylists();

	// Skip ignored playlist
	playlists = playlists.filter(playlist => !userPreferences.isPlaylistIgnored(playlist));

	// Sort playlists according to user's preferences
	userPreferences.sortPlaylists(playlists);

	availablePlaylists = playlists;
	await loadAvailableTracks();
}

async function loadAvailableTracks () {
	loadingData = true;
	for (let playlist of availablePlaylists)
		playlist.tracks = await spotifyController.getPlaylistTracks(playlist.id);

	loadingData = false;
}

module.exports = { loadAvailablePlaylists };
