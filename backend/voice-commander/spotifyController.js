const spotifyAuth = require("../routes/spotifyAuth");

/**
 * Handle pagination on a call to the spotify API endpoint returning the full results
 * @param {function (): Promise<any>} apiCall function that calls the Spotify API
 * @returns {Promise<Array<any>>}
 */
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
	let fields = "limit,next,items(track(name,id,album(name,id,images),artists))";
	return paginationHandler(async (offset) => {
		let tracks = await spotifyAuth.spotifyApi.getPlaylistTracks(playlistId, { offset, fields });

		tracks.body.items = tracks.body.items.map(item => {
			item.track.artists = item.track.artists.map(a => ({ id: a.id, name: a.name }));
			return item.track;
		});

		return tracks.body;
	});
}

/**
 * Search tracks on Spotify
 * @param {string} searchQuery search query to be used
 * @returns {Promise<Response<SpotifyApi.SearchResponse>>}
 */
function searchTracks (searchQuery) {
	return spotifyAuth.spotifyApi.searchTracks(searchQuery);
}

/**
 * Retrieve information about the current playback status
 * @returns {Promise<SpotifyApi.CurrentPlaybackResponse>}
 */
async function getPlaybackState () {
	return (await spotifyAuth.spotifyApi.getMyCurrentPlaybackState()).body;
}

/**
 * Play the specified track
 * @param {string} trackId track identifier
 * @param {string} [contextUri] uri of the album or playlist that the track is part of
 * @returns {Promise<any>}
 */
async function playTrack (trackId, contextUri) {
	return spotifyAuth.spotifyApi.play({
		context_uri: contextUri,
		offset: { uri: `spotify:track:${trackId}` }
	});
}

/**
 * Add the specified track to the queue
 * @param {string} trackId track identifier
 * @returns {Promise<any>}
 */
async function addTrackToQueue (trackId) {
	return spotifyAuth.spotifyApi.addTrackToQueue(`spotify:track:${trackId}`);
}

module.exports = {
	getPlaylists, getPlaylistTracks, searchTracks,
	getPlaybackState, playTrack, addTrackToQueue
};
