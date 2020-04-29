const log = require("../utils/log");
const voiceCommander = require("../voice-commander/index");
const spotifyController = require("../voice-commander/spotifyController");

/**
 * Retrieve user's playlists
 * @param {HttpRequest} req
 * @param {HttpResponse} res
 */
async function getPlaylists (req, res) {
	try {
		let result = await spotifyController.getPlaylists();
		result = result.map(playlist => {
			playlist.not_ignored = !voiceCommander.isPlaylistIgnored(playlist);
			return playlist;
		});

		voiceCommander.sortPlaylists(result);
		res.status(200).json(result);
	} catch (error) {
		log.error(error);
		console.error(error);
		res.status(500).json(error);
	}
}

module.exports = { getPlaylists };
