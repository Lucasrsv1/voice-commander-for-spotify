const request = require('request');
const querystring = require('querystring');
const SpotifyWebApi = require('spotify-web-api-node');

const log = require("../utils/log");
const utils = require("../utils/utils");

const CLIENT_ID = "CLIENT_ID";
const CLIENT_SECRET = "CLIENT_SECRET";
const REDIRECT_URI = "http://localhost:4400/api/v1/login/callback";
const SCOPE = [
	"user-read-private",
	"user-read-email",
	"user-read-playback-state",
	"user-modify-playback-state",
	"user-read-currently-playing",
	"playlist-read-collaborative",
	"playlist-read-private"
].join(' ');

const STATE_KEY = 'spotify_auth_state';

/**
 * @type {SpotifyApi.CurrentUsersProfileResponse} Store the logged user
 */
var loggedUser = null;

/**
 * @type {SpotifyWebApi} Store the Spotify Web API instance
 */
var spotifyApi = null;

/**
 * Check if the user is properly logged in
 * @returns {boolean} `true` if the user is logged in
 */
function isLogged () {
	return Boolean(loggedUser && loggedUser.id && spotifyApi && spotifyApi.getAccessToken());
}

/**
 * Retrieve basic information about the logged user
 * @param {HttpRequest} req
 * @param {HttpResponse} res
 */
function getLoggedUser (req, res) {
	res.status(200).json(loggedUser);
}

/**
 * Start the login process
 * @param {HttpRequest} req
 * @param {HttpResponse} res
 */
function login (req, res) {
	var state = utils.generateRandomString(16);
	res.cookie(STATE_KEY, state);

	let params = querystring.stringify({
		response_type: 'code',
		client_id: CLIENT_ID,
		scope: SCOPE,
		redirect_uri: REDIRECT_URI,
		state: state
	});

	// Requests authorization
	res.redirect('https://accounts.spotify.com/authorize?' + params);
}

/**
 * Receive feedback from Spotify and finish logging in
 * @param {HttpRequest} req
 * @param {HttpResponse} res
 */
function loginCallback (req, res) {
	var code = req.query.code || null;
	var state = req.query.state || null;
	var storedState = req.cookies ? req.cookies[STATE_KEY] : null;

	// Check the state parameter
	if (state === null || state !== storedState)
		return res.redirect('/login?' + querystring.stringify({ error: 'state_mismatch' }));

	res.clearCookie(STATE_KEY);
	var authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		form: {
			code: code,
			redirect_uri: REDIRECT_URI,
			grant_type: 'authorization_code'
		},
		headers: {
			'Authorization': 'Basic ' + (new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
		},
		json: true
	};

	// Requests refresh and access tokens
	request.post(authOptions, (error, response, body) => {
		if (error || response.statusCode !== 200)
			return res.redirect('/login?' + querystring.stringify({ error: 'invalid_token' }));

		// Instantiate the API wrapper
		spotifyApi = new SpotifyWebApi({
			clientId: CLIENT_ID,
			clientSecret: CLIENT_SECRET,
			redirectUri: REDIRECT_URI
		});

		// Set up tokens
		spotifyApi.setAccessToken(body.access_token);
		spotifyApi.setRefreshToken(body.refresh_token);

		// Use the access token to access the Spotify Web API
		spotifyApi.getMe().then(data => {
			// Save user's basic information
			loggedUser = data.body;

			// Load this user's preferences
			require("../voice-commander/index").loadUser();

			// Redirect the user to the home page
			res.redirect('/home');
		}, error => {
			log.error(error);
			console.log('Something went wrong!', error);
			res.redirect('/login?' + querystring.stringify({ error: 'cannot_get_user' }));
		});
	});
}

/**
 * Logout route
 * @param {HttpRequest} req
 * @param {HttpResponse} res
 */
function logout (req, res) {
	loggedUser = null;
	spotifyApi = null;
	res.status(200).json(true);
}

/**
 * Middleware to ensure that the user will only be able to access routes after logging in
 * @param {HttpRequest} req
 * @param {HttpResponse} res
 * @param {Function} next
 */
function ensureAuthorized (req, res, next) {
	if (isLogged()) {
		next();
	} else {
		res.status(401).json({ message: "Unauthorized. Please, log in." });
		res.end();
	}
}

module.exports = {
	login,
	loginCallback,
	getLoggedUser,
	logout,
	ensureAuthorized,
	get isLogged () {
		return isLogged();
	},
	get user () {
		return loggedUser;
	},
	get spotifyApi () {
		return spotifyApi;
	}
};
