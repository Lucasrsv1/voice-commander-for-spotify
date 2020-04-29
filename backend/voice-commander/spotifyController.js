const spotifyAuth = require("../routes/spotifyAuth");

/**
 * Retrieve user's playlists
 * @returns {Promise<SpotifyApi.PlaylistObjectSimplified[]>}
 */
async function getPlaylists () {
	let offset = 0;
	let result = [];
	let playlists;

	do {
		playlists = await spotifyAuth.spotifyApi.getUserPlaylists({ offset: offset });
		result = result.concat(playlists.body.items);
		offset += playlists.body.limit;
	} while (playlists.body.next);

	return result;
}

module.exports = { getPlaylists };
