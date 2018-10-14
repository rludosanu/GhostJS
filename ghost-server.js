const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const mustache = require('mustache');

String.prototype.replaceAll = function replaceAll(list) {
	var target = this;
	var keys = Object.keys(list);

	for (i = 0 ; i < keys.length ; i++) {
		target = target.split(keys[i]).join(list[keys[i]]);
	}
	return target;
};

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
		this.pathRegExp = {
			'[alpha]': '([a-zA-Z]+)',
			'[alphamin]': '([a-z]+)',
			'[alphamaj]': '([A-Z]+)',
			'[num]': '([0-9]+)',
			'[alnum]': '([a-zA-Z0-9]+)',
			'[alnummin]': '([a-z0-9]+)',
			'[alnummaj]': '([A-Z0-9]+)'
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

			self.routes[path][method] = {
				handler: handler,
				query: (routes[i].hasOwnProperty('query')) ? routes[i].query : null
			};
			console.log(`Adding new route handler: ${method} ${path}`);
		}
	}

	render(server, template, datas = null) {
		let self = this;
		let directoryname = path.dirname(template);
		let filename = path.basename(template);
		let pathname = null;
		let extension = null;

		// URL rewriting
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

	parseRequest(request) {
		let self = this;
		let keys = Object.keys(self.routes);

		for (let i = 0 ; i < keys.length ; i++) {
			let key = keys[i];
			let path = RegExp(`^${key.replaceAll(self.pathRegExp)}$`);

			if (path.test(request.url)) {
				let query = request.url.match(path).reduce((a, c) => typeof c === 'string' ? a.concat([c]) : a, []).slice(1);
				let callback = self.routes[key][request.method].handler;

				if (callback) {
					query = self.routes[key][request.method].query.reduce((a, c, i) => {
					  a[c] = query[i];
					  return a;
					}, []);
				}

				return {
					query: query,
					callback: callback
				}
			}
		}

		return {
			query: null,
			callback: null
		};
	}

	handleRequest(request, response) {
		let self = this;
		let { query, callback } = self.parseRequest(request);

		request.query = query;
		response.render = self.render.bind(response, self);

		if (callback) {
			callback(request, response);
		} else {
			self.render.bind(response, self)(request.url);
		}
	}

	start() {
		let self = this;

		console.log('Creating HTTP server');
		self.server = http.createServer((req, res) => {
			console.log(`Handling request: ${req.method} ${req.url}`);
			self.handleRequest(req, res);
		});

		self.server.listen(self.port, (error) => {
			if (error) {
				return console.error(error);
			}
			console.log(`HTTP server is up and running on port ${self.port}`);
		});
	}
}

module.exports = function(options) {
	return new GhostServer(options);
}
