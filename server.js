const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const mustache = require('mustache');

class GhostServer {
	constructor(port) {
		if (typeof port === 'undefined' || parseInt(port) === 'NaN' || parseInt(port) <= 0) {
			this.port = 8080;
		} else {
			this.port = parseInt(port);
		}
		this.staticRoutes = {};
		this.routes = {};
		this.server = null;
		this.mimeTypes = {
		  '.ico': 'image/x-icon',
		  '.html': 'text/html',
		  '.js': 'text/javascript',
		  '.json': 'application/json',
		  '.css': 'text/css',
		  '.png': 'image/png',
		  '.jpg': 'image/jpeg',
		  '.wav': 'audio/wav',
		  '.mp3': 'audio/mpeg',
		  '.svg': 'image/svg+xml',
		  '.pdf': 'application/pdf',
		  '.doc': 'application/msword',
		  '.eot': 'appliaction/vnd.ms-fontobject',
		  '.ttf': 'aplication/font-sfnt'
		};
	}

	router(routes) {
		let self = this;

		for (let i = 0 ; i < routes.length ; i++) {
			let { method, path, handler } = routes[i];

			if (!method || !path || !handler) {
				continue;
			}

			if (!Object.keys(self.routes).includes(path)) {
				self.routes[path] = {};
			}

			self.routes[path][method] = handler;
			console.log(`Adding new route handler: ${method} ${path}`);
		}
	}

	render(server, template, datas = null) {
		let self = this;
		let directoryname = path.dirname(template);
		let filename = path.basename(template);
		let pathname = null;
		let extension = null;

		if (Object.keys(server.staticRoutes).includes(directoryname)) {
			pathname = path.join(__dirname, server.staticRoutes[directoryname], filename);
		} else {
			pathname = path.join(__dirname, template);
		}

		console.log(`Fetching file: ${pathname}`);

		fs.exists(pathname, function (exist) {
			if (!exist) {
				self.statusCode = 404;
				self.end(`File '${filename}' not found!`);
				return;
			}

			if (fs.statSync(pathname).isDirectory()) {
				pathname += '/index.html';
			}

			extension = path.extname(pathname);

			fs.readFile(pathname, function(error, content) {
				if (error) {
					self.statusCode = 500;
					self.end(`Error getting the file '${filename}': ${error}.`);
				} else {
					self.setHeader('Content-type', server.mimeTypes[extension] || 'text/plain');
					if (extension === '.html' && datas !== null && Object.keys(datas).length !== 0) {
						self.end(mustache.render(content.toString(), datas));
					} else {
						self.end(content);
					}
				}
			});
		});
	}

	use(path, directory) {
		this.staticRoutes[path] = directory;
		console.log(`Adding new directory alias: ${path} => ${directory}`)
	}

	handleRequest(request, response) {
		let self = this;

		response.render = self.render.bind(response, self);
		if (
			self.routes
			&& self.routes[request.url]
			&& self.routes[request.url][request.method]
		) {
			self.routes[request.url][request.method](request, response);
		} else {
			self.render.bind(response, self)(request.url);
		}
	}

	start() {
		let self = this;

		// Create the server
		console.log('Creating HTTP server');
		self.server = http.createServer((req, res) => {
			console.log(`Handling request: ${req.method} ${req.url}`);
			self.handleRequest(req, res);
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

server = new GhostServer();

server.use('/', 'views');

server.use('/css', 'css');

server.router([{
	method: 'GET',
	path: '/',
	handler: (req, res) => {
		res.render('/', { message: 'Hello World !' });
	}
}, {
	method: 'GET',
	path: '/test',
	handler: (req, res) => {
		res.render('/test.html');
	}
}]);

server.start();
