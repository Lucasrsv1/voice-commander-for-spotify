const spotifyAuth = require("./spotifyAuth");
const spotifyControllerRoutes = require("./spotifyControllerRoutes");
const userPreferences = require("../voice-commander/userPreferences");

module.exports.configura = function (router) {
	router.get('/', function (req, res) {
		res.json({ message: 'Voice Commander for Spotify' });
	});

	router.get('/v1/timestamp', function (req, res) {
		res.status(200).json({ timestamp: Math.floor(new Date().valueOf() / 1000) });
	});

	// ========== SPOTIFY_AUTHENTICATION ========== //

	router.get('/v1/login/', spotifyAuth.login);
	router.get('/v1/login/callback', spotifyAuth.loginCallback);
	router.get('/v1/login/user', spotifyAuth.getLoggedUser);
	router.get('/v1/logout', spotifyAuth.logout);

	// ========== SPOTIFY_CONTROLLER ========== //

	router.get('/v1/playlists', spotifyAuth.ensureAuthorized, spotifyControllerRoutes.getPlaylists);
	router.post('/v1/playlists', spotifyAuth.ensureAuthorized, spotifyControllerRoutes.updateUsersPlaylistPreferences);

	router.get('/v1/playlist/tracks', spotifyAuth.ensureAuthorized, spotifyControllerRoutes.getPlaylistTracks);

	// ===== PLAYBACK ===== //

	router.post('/v1/playback/play', spotifyAuth.ensureAuthorized, spotifyControllerRoutes.play);

	// ===== PREFERENCES ===== //

	router.get('/v1/preferences/user', spotifyAuth.ensureAuthorized, userPreferences.getUserPreferences)
};
