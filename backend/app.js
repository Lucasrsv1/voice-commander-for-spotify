require('console-stamp')(console, '[HH:MM:ss.l]');

const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const configRouter = require('./routes/routes');
const cors = require('cors');

const servingFrontend = false;

var app = express();
var router = express.Router();

app.set('port', (process.env.PORT || 4400));

app.use('/api', router);

router.use(cors({ exposedHeaders: ['x-access-token'] }));
router.use(bodyParser.json({ limit: '10mb' }));
configRouter.configura(router);

if (servingFrontend) {
	app.use(express.static("./frontend"));

	// Send all other requests to index.html
	app.get('/*', function (req, res) {
		res.sendFile(path.join(__dirname + '/frontend/index.html'));
	});
}

// Configura diretórios de logs
if (!fs.existsSync("logs"))
	fs.mkdirSync("logs");

app.listen(app.get('port'), function () {
	console.log('Node app is running on port', app.get('port'));
});
