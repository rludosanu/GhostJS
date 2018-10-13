# GhostJS

A minimalist web framework for Node.js inpired by Express.

## Hello World !

Create a `server.js` file that will be hosting the base code of your GhostJS instance.

```
// Define the port the server will be running on
const port = 3000;

// Create a server instance
const server = require('./ghost-server')(port);

// Define your index root
server.router([{
	method: 'GET',
	path: '/',
	handler: (req, res) => {
		res.render('/');
	}
});

// Start the server
server.start();
```

In the same directory create a `index.html` template file.

```
<!DOCTYPE html>
<html>
  <head>
    <title>Hello World !</title>
  </head>
  <body>
    <h1>Hello World !</h1>
  </body>
</html>
```

Run the server from your console.

```
$ node server.js
```

## Basic routing

Routing refers to determining how an application responds to a client request to a particular endpoint, which is a URI and a specific HTTP request method.

Each route can have one or more handler functions, which are executed when the route is matched.

Route definition takes the following generic structure:

```
{
	method: '[GET|POST|PUT|DELETE]',
	path: '/[*]',
	handler: (req, res) => {
		res.render('/[*]');
	}
}
```

To apply the previous definition, just call the `router` function like so:

```
// Define route
const route = {
	method: 'GET',
	path: '/hello',
	handler: (req, res) => {
		res.render('/hello.html');
	}
}

// Save route
server.router([route]);
```

## Advanced routing

### Anonymous query parameters

The `path` property of the route object is actually interpreted by the server as a RegExp.

For example, the following path `/user/profile/([a-zA-Z0-9]+)` could match `/user/profile/rludosanu` or `/user/profile/razvan` and so on.

The matched expression(s) are stored into an ordered array accessible via your handler parameter `request` at `request.query`.

```
{
  ...
  path: '/user/profile/([a-zA-Z0-9]+)',
  handler: (request, response) => {
    // This will print out the variable captured by the parenthesis in the RegExp
    console.log(request.query[0]);
  }
}
```

### Named query parameters

If you wish to explicitly name you parameters, it's also possible using an extra property named `query`.

```
{
  ...
  path: '/user/profile/([a-zA-Z0-9]+)',
  query: ['username'],
  handler: (request, response) => {
    // This will print out the variable captured by the parenthesis in the RegExp
    console.log(request.query.username);
  }
}
```

Note that the order of declaration matters and is read from left to right.

For example, if you call the URI `http://localhost/user/profile/rludosanu/Paris` with this configuration:

```
{
  ...
  path: '/user/profile/([a-zA-Z0-9]+)/([a-zA-Z0-9]+)',
  query: ['username', 'city'],
  handler: (request, response) => {
    console.log(request.query.username); // Prints out "rludosanu"
    console.log(request.query.city); // Prints out "Paris"
  }
}
```

## Virtual paths

To create a virtual path prefix (where the path does not actually exist in the file system) for files that are served , specify a mount path for the static directory, as shown below:

```
server.use('/css', 'src/stylesheets');
```

This means when you request the file `/css/bootstrap.css` the server will actually fetch the file located at `src/stylesheets/bootstrap.css` on your disk.
