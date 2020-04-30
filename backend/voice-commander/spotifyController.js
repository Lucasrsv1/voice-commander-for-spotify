const spotifyAuth = require("../routes/spotifyAuth");

async function paginationHandler (apiCall) {
	let data;
	let offset = 0;
	let result = [];

	do {
		data = await apiCall(offset);

		result = result.concat(data.items);
		offset += data.limit;
	} while (data.next);

	return result;
}

/**
 * Retrieve user's playlists
 * @returns {Promise<SpotifyApi.PlaylistObjectSimplified[]>}
 */
function getPlaylists () {
	return paginationHandler(async (offset) => {
		let playlists = await spotifyAuth.spotifyApi.getUserPlaylists({ offset });
		return playlists.body;
	});
}

/**
 * Retrieve the tracks of a playlist
 * @param {string} playlistId playlist identifier
 * @returns {Promise<SpotifyApi.PlaylistTrackObject[]>}
 */
async function getPlaylistTracks (playlistId) {
	let fields = "limit,next,items(track(name,id,album(name,id),artists))";
	return paginationHandler(async (offset) => {
		let tracks = await spotifyAuth.spotifyApi.getPlaylistTracks(playlistId, { offset, fields });

		tracks.body.items = tracks.body.items.map(item => {
			item.track.artists = item.track.artists.map(a => ({ id: a.id, name: a.name }));
			return item.track;
		});

		return tracks.body;
	});
}

module.exports = { getPlaylists, getPlaylistTracks };
