const server = require('./ghost-server')(3000);

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
	path: '/test/([a-zA-Z0-9]{1,})/([a-zA-Z0-9]{1,})',
	query: ['name', 'city'],
	handler: (req, res) => {
		res.render('/test.html', {
			name: req.query.name,
			city: req.query.city
		});
	}
}, {
	method: 'GET',
	path: '/404',
	handler: (req, res) => {
		res.render('/404.html');
	}
}]);

server.start();
