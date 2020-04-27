module.exports.configura = function (router) {
	router.get('/', function (req, res) {
		res.json({ message: 'Voice Commander for Spotify' });
	});

	router.get('/v1/timestamp', function (req, res) {
		res.status(200).json({ timestamp: moment().unix() });
	});
};
