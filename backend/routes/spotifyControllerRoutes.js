const utils = require("../utils/utils");
const spotifyController = require("../voice-commander/spotifyController");
const userPreferences = require("../voice-commander/userPreferences");

/**
 * Retrieve user's playlists
 * @param {HttpRequest} req
 * @param {HttpResponse} res
 */
async function getPlaylists (req, res) {
	try {
		let result = await spotifyController.getPlaylists();
		result = result.map(playlist => {
			playlist.not_ignored = !userPreferences.isPlaylistIgnored(playlist);
			return playlist;
		});

		userPreferences.sortPlaylists(result);
		res.status(200).json(result);
	} catch (error) {
		utils.handleInternalErro(res, error);
	}
}

/**
 * Retrieve the tracks of a playlist
 * @param {HttpRequest} req
 * @param {HttpResponse} res
 */
async function getPlaylistTracks (req, res) {
	try {
		if (!req.query.playlistId)
			res.status(400).json({ message: "Parameter 'playlistId' is missing" });

		let result = await spotifyController.getPlaylistTracks(req.query.playlistId);
		res.status(200).json(result);
	} catch (error) {
		utils.handleInternalErro(res, error);
	}
}

/**
 * Save user's playlists preferences, such as ignored playlists and playlists order
 * @param {HttpRequest} req
 * @param {HttpResponse} res
 */
function updateUsersPlaylistPreferences (req, res) {
	try {
		if (!req.body.toIgnore)
			return res.status(400).json({ message: "Parameter 'toIgnore' is missing" });

		if (!req.body.searchOrder)
			return res.status(400).json({ message: "Parameter 'searchOrder' is missing" });

		userPreferences.updateUsersPlaylistPreferences(req.body.toIgnore, req.body.searchOrder);
		res.status(200).json({});
	} catch (error) {
		utils.handleInternalErro(res, error);
	}
}

module.exports = {
	getPlaylists, getPlaylistTracks,
	updateUsersPlaylistPreferences
};
