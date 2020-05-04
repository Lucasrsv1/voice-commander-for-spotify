const stringSimilarity = require('string-similarity');

const spotifyController = require("./spotifyController");
const userPreferences = require("./userPreferences");
const utils = require("../utils/utils");

/**
 * Are the playlists being loaded now?
 * @type {boolean}
 */
var isLoadingData = false;

/**
 * User's enabled playlists
 * @type {SpotifyApi.PlaylistObjectSimplified[]}
 */
var availablePlaylists = [];

/**
 * Load the user's playlists taking the user's preferences into account
 * @returns {Promise<void>}
 */
async function loadAvailablePlaylists () {
	isLoadingData = true;
	try {
		let playlists = await spotifyController.getPlaylists();

		// Skip ignored playlist
		playlists = playlists.filter(playlist => !userPreferences.isPlaylistIgnored(playlist));

		// Sort playlists according to user preferences
		userPreferences.sortPlaylists(playlists);

		availablePlaylists = playlists;
		await _loadAvailableTracks();
	} catch (error) {
		console.error(error);
		setTimeout(loadAvailablePlaylists, 5000);
	}
}

/**
 * Load tracks of user's playlists
 * @returns {Promise<void>}
 */
async function _loadAvailableTracks () {
	isLoadingData = true;
	for (let playlist of availablePlaylists)
		playlist.tracks = await spotifyController.getPlaylistTracks(playlist.id);

	isLoadingData = false;
}

/**
 * Compare values from the track information and the user's input
 * @param {string} reference text of the field being compared received from Spotify
 * @param {string} input part of user's transcript that is associated to the field being compared
 * @param {boolean} removeParentheses if `true` allow a less strict comparison
 * @returns {number} comparison coefficient
 */
function _compareStrings (reference, input, removeParentheses) {
	let strictCoefficient = stringSimilarity.compareTwoStrings(reference.toLowerCase(), input);
	if (!removeParentheses)
		return strictCoefficient;

	reference = reference.toLowerCase().replace(/\((.*?)\)/g, "");
	return Math.max(strictCoefficient, stringSimilarity.compareTwoStrings(reference, input));
}

/**
 * Filter a set of tracks based on the user's input
 * @param {SpotifyApi.PlaylistTrackObject[]} tracks tracks of interest
 * @param {string} song song's name from user's input
 * @param {string} artist artist's name from user's input
 * @param {string} album album's name from user's input
 * @param {string} separator term between song and artist in the user's input
 * @returns {Array<{ track: SpotifyApi.PlaylistTrackObject, coefficient: number, strictCoefficient: number }>}
 */
function _filterTracks (tracks, song, artist, album, separator) {
	let possibleSongs = [];
	for (let track of tracks) {
		// In order to filter songs keeping those that may include some
		// extra information about the track in the title, the `nameSimilarity` coefficient
		// doesn't take in consideration any parentheses in the track's title.
		// So a track with the title "Let Me Go (feat. Chad Kroeger)" would also be evaluated as "Let Me Go".

		// In order to sort tracks by the most relevant,
		// the `strictNameSimilarity` coefficient is used. This way, the track
		// most similar to the user's input will be at the top of the list.

		let nameSimilarity = _compareStrings(track.name, song, true);
		let strictNameSimilarity = _compareStrings(track.name, song);

		let albumSimilarity = -1;
		let artistSimilarity = -1;
		let noSeparatorSimilarity = -1;
		let strictNoSeparatorSimilarity = -1;

		if (album)
			albumSimilarity = _compareStrings(track.album.name, album);

		if (artist) {
			artistSimilarity = track.artists.reduce((coeficient, a) => {
				let similarity = _compareStrings(a.name, artist);
				return Math.max(coeficient, similarity);
			}, 0);

			noSeparatorSimilarity = _compareStrings(track.name, `${song} ${separator} ${artist}`, true);
			strictNoSeparatorSimilarity = _compareStrings(track.name, `${song} ${separator} ${artist}`);
		}

		// Find coefficient's average

		let weight = 3;
		let sumCoefficients = 3 * (nameSimilarity > noSeparatorSimilarity ? nameSimilarity : noSeparatorSimilarity);
		let strictSumCoefficients = 3 * (strictNameSimilarity > strictNoSeparatorSimilarity ? strictNameSimilarity : strictNoSeparatorSimilarity);

		if (album) {
			sumCoefficients += 2 * albumSimilarity;
			strictSumCoefficients += 2 * albumSimilarity;
			weight += 2;
		}

		if (artist) {
			sumCoefficients += artistSimilarity;
			strictSumCoefficients += artistSimilarity;

			if (nameSimilarity > noSeparatorSimilarity)
				weight++;

			// A total mismatch of artist must be enough to remove the track, if it is being used
			if (artistSimilarity < 0.2 && nameSimilarity > noSeparatorSimilarity)
				sumCoefficients = 0;
		}

		let finalCoefficient = sumCoefficients / weight;
		let strictFinalCoefficient = strictSumCoefficients / weight;

		// console.log(`'${track.name}', '${track.album.name}', '${track.artists.map(a => a.name).join(", ")}'`);
		// console.log("\t", nameSimilarity, albumSimilarity, artistSimilarity, noSeparatorSimilarity);
		// console.log("\t\tFINAL:", finalCoefficient, "|", strictFinalCoefficient);

		// Tracks that match the user's input at least 70% in the non-strict comparison will be allowed
		if (finalCoefficient > 0.69) {
			possibleSongs.push({
				track: track,
				coefficient: finalCoefficient,
				strictCoefficient: strictFinalCoefficient
			});
		}
	}

	return possibleSongs;
}

/**
 * Identify what song the user ordered and play it
 * @param {string} song song's name from user's input
 * @param {string} artist artist's name from user's input
 * @param {string} album album's name from user's input
 * @param {string} separator term between song and artist in the user's input
 * @param {boolean} onlyAddToQueue add a song to the queue instead of playing it now
 * @returns {Promise<{ played: boolean, tracks: SpotifyApi.PlaylistTrackObject[]> }>} songs that match the command
 */
async function play (song, artist, album, separator, onlyAddToQueue) {
	// Wait until all the playlists and tracks are loaded, if necessary
	await utils.waitForIt(() => !isLoadingData, 10000);

	let possibleSongs = [];
	for (let playlist of availablePlaylists) {
		possibleSongs = possibleSongs.concat(
			_filterTracks(playlist.tracks, song, artist, album, separator).map(song => {
				song.uri = playlist.uri;
				return song;
			})
		);
	}

	try {
		// If no tracks from user's playlists matched the user's input
		// search on Spotify for possible tracks according to song and, if specified, artist
		if (possibleSongs.length === 0) {
			let queries = artist ? [`track:${song} artist:${artist}`, `track:${song}`] : [`track:${song}`];
			for (let searchStr of queries) {
				let data = await spotifyController.searchTracks(searchStr);
				let tracks = data.body.tracks.items.map(track => ({
					album: {
						id: track.album.id,
						name: track.album.name,
						uri: track.album.uri
					},
					artists: track.artists.map(a => ({
						id: a.id,
						name: a.name
					})),
					id: track.id,
					name: track.name
				}));

				possibleSongs = possibleSongs.concat(
					_filterTracks(tracks, song, artist, album, separator).map(song => {
						song.uri = song.track.album.uri;
						return song;
					})
				);

				if (possibleSongs.length > 0)
					break;
			}
		}
	} catch (error) {
		console.error(error);
	}

	// Sort matched tracks by most relevant and best fit
	possibleSongs.sort((a, b) => {
		let byCoefficient = a.coefficient > b.coefficient ? -1 : (a.coefficient < b.coefficient ? 1 : 0);
		let byStrictCoefficient = a.strictCoefficient > b.strictCoefficient ? -1 : (a.strictCoefficient < b.strictCoefficient ? 1 : 0);
		return byCoefficient !== 0 ? byCoefficient : byStrictCoefficient;
	});

	let played = false;
	try {
		// Play the track that is most likely to be the one the user ordered
		let songToPlay = possibleSongs.length > 0 ? possibleSongs[0] : null;
		if (songToPlay) {
			if (onlyAddToQueue)
				await spotifyController.addTrackToQueue(songToPlay.track.id);
			else
				await spotifyController.playTrack(songToPlay.track.id, songToPlay.uri);

			played = true;
		}
	} catch (error) {
		console.error(error);
	}

	return {
		played: played,
		tracks: possibleSongs.map(song => song.track),
		current_context: await spotifyController.getPlaybackState()
	};
}

module.exports = { loadAvailablePlaylists, play };
