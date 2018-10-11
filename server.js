const http = require('http');

class GhostServer {
	constructor(port) {
		if (typeof port === 'undefined' || parseInt(port) === 'NaN' || parseInt(port) <= 0) {
			this.port = 8080;
		} else {
			this.port = parseInt(port);
		}
		this.routes = [];
		this.server = null;
	}

	route(config) {
		var self = this;
		const { method, path, handler } = config;

		if (!method || !path || !handler) {
			console.log('Error: Invalid route config format');
			return;
		} else {
			self.routes[path] = { method, handler };
		}

		console.log(self.routes);
	}

	handleRequest(req, res, routes) {
		var self = this;
		console.log(`Handling incoming request ${req.method} ${req.url}...`);

		// If route is not defined
		if (!self.routes[req.url]) {
			res.writeHead(404, {'Content-Type': 'text/html'});
			res.write(`404: ${req.method} ${req.url} ( invalid path )`);
			res.end();
		}
		// If method does not match
		else if (self.routes[req.url].method !== req.method) {
			console.log('handleRequest: invalid method');
			res.writeHead(404, {'Content-Type': 'text/html'});
			res.write(`404: ${req.method} ${req.url} ( invalid method )`);
			res.end();
		} else if (!self.routes[req.url].handler) {
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write(`200: ${req.method} ${req.url}`);
			res.end();
		} else {
			!self.routes[req.url].handler(req, res);
		}
	}

	start() {
		var self = this;

		// Create the server
		self.server = http.createServer((req, res) => {
			self.handleRequest(req, res, self.routes);
		});

		// Run the server
		self.server.listen(self.port, (error) => {
			if (error) {
				return console.error(error);
			}
			console.log(`HTTP server is up and running on port ${self.port}`);
		});
	}
}

server = new GhostServer(8080);

server.route({
	method: 'GET',
	path: '/',
	handler: (req, res) => {
		res.end('Hello World !');
	}
});

server.start();
