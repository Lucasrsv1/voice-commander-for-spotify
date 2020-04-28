var winston = require('winston');

function formatter (args) {
	return "[" + new Date().toLocaleString() + '] ' + args.level + ': ' + args.message;
}

var info = new winston.Logger({
	levels: { info: 1 },
	transports: [
		new (winston.transports.File)({
			filename: "logs/info.log",
			level: 'info',
			color: 'blue',
			formatter: formatter,
			json: false
		})
	]
});

var warn = new winston.Logger({
	levels: { warn: 2 },
	transports: [
		new (winston.transports.File)({
			filename: "logs/warn.log",
			level: 'warn',
			color: 'yellow',
			formatter: formatter,
			json: false
		})
	]
});

var error = new winston.Logger({
	levels: { error: 3 },
	transports: [
		new (winston.transports.File)({
			filename: "logs/error.log",
			level: 'error',
			color: 'red',
			formatter: formatter,
			json: false
		})
	]
});

var exports = {
	info: function () {
		info.info(Array.from(arguments).join(" "));
	},
	warn: function () {
		warn.warn(Array.from(arguments).join(" "));
	},
	error: function () {
		error.error(
			Array.from(arguments).reduce((message, arg) => {
				message.push(arg instanceof Error ? `${arg.message} - ${arg.stack}` : arg);
				return message;
			}, []).join(' ')
		);
	},
	log: function (level, msg) {
		exports[level](msg);
	}
};

module.exports = exports;
