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
	path: '/test/[num]/[alnum]',
	query: ['name', 'city'],
	handler: (req, res) => {
		res.render('/test.html', {
			name: req.query.name,
			city: req.query.city
		});
	}
}, {
	method: 'GET',
	path: '/user/[alpha]',
	query: ['username'],
	handler: (req, res) => {
		res.send({
			name: req.query.username
		}, 200);
	}
}]);

server.start();
