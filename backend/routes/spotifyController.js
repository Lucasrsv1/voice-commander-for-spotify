const log = require("../utils/log");
const spotifyAuth = require("./spotifyAuth");

/**
 * Retrieve user's playlists
 * @param {HttpRequest} req
 * @param {HttpResponse} res
 */
async function getPlaylists (req, res) {
	let offset = 0;
	let result = [];
	let playlists;

	try {
		do {
			playlists = await spotifyAuth.spotifyApi.getUserPlaylists({ offset: offset });
			result = result.concat(playlists.body.items);
			offset += playlists.body.limit;
		} while (playlists.body.next);

		res.status(200).json(result);
	} catch (error) {
		log.error(error);
		console.error(error);
		res.status(500).json(error);
	}
}

module.exports = { getPlaylists };
