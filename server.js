const server = require('./ghost-server')({
	port: 3000,
	debug: true
});

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
		console.log(req.cookies);
		res.render('/test.html');
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
