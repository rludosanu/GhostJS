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

The `path` property of the route object is actually interpreted by the server as a RegExp and can take two forms. It can be a pure regular expression like `([a-zA-Z]+)` or a built-in shorthand like `[alpha]`.

For example, the following path `/user/profile/([a-zA-Z0-9]+)` (also written `/user/profile/[alnum]`) could match `/user/profile/rludosanu`,  `/user/profile/RazVan` or even `/user/profile/123`.

Here is a list of the currently supported shorthands.

```
{
  '[alpha]': '([a-zA-Z]+)', // Letters
  '[alphalow]': '([a-z]+)', // Lowercase letters
  '[alphaup]': '([A-Z]+)', // Uppercase letters
  '[num]': '(-?[0-9]+)', // Integers
  '[numpos]': '([1-9]+[0-9]*)', // Non-zero positive integers
  '[alnum]': '([a-zA-Z0-9]+)', // Letters and integers
  '[alnumlow]': '([a-z0-9]+)', // Lowercase letters and integers
  '[alnumup]': '([A-Z0-9]+)', // Uppercase letters and integers
  '[email]': '([\\w\\-]+(\\.[\\w\\-]+)*@([A-Za-z0-9-]+\\.)+[A-Za-z]{2,4})', // Email address
  '[token]': '([a-zA-Z0-9-_]+)', // Tokens
  '[date]': '([0-9]{4}-[0-9]{2}-[0-9]{2})' // Date (YYYY-MM-DD)
}
```
### Anonymous query parameters

The matched expression(s) are stored into an ordered array accessible via your handler parameter `request` at `request.query`.

```
{
  ...
  path: '/user/profile/[alnum]',
  handler: (request, response) => {
    // This will print out the variable captured by the parenthesis in the RegExp
    console.log(request.query[0]);
  }
}
```

### Named query parameters

If you wish to explicitly name you parameters, the route object can have an extra property named `query`. Note that the order of declaration matters and is read from left to right.

```
HTTP GET localhost/books/Hyperion/14

{
  ...
  path: '/books/[alpha]/[num]',
  query: ['title', 'page'],
  handler: (request, response) => {
    console.log(request.query.title); // Prints out "Hyperion"
    console.log(request.query.page); // Prints out "14"
  }
}
```

## Virtual paths

To create a virtual path prefix (where the path does not actually exist in the file system) for files that are served , specify a mount path for the static directory, as shown below:

```
server.use('/css', 'src/stylesheets');
```

This means when you request the file `/css/bootstrap.css` the server will actually fetch the file located at `src/stylesheets/bootstrap.css` on your disk.

## HTTP response

Two methods are available `render` and `send`, attached to the `response` object.

### Render

```
render( filepath: String [, parameters: Object] )
```

The `render` method renders a view and sends the rendered HTML string to the client. It takes an optional data parameter object and uses the `Mustache` templating library.

```
// This will send the html file index.html
handler: (req, res) => {
  res.render('/index.html');
}

// This will send the html file index.html rendered by Mustache
handler: (req, res) => {
  res.render('/index.html', { message: 'Hello World !' });
}
```

### Send

```
send( data: String|Object|Array [, status: Number [, type: String]] )
```

The `send` method sends a response with the correct content-type. If the parameter is a String object, the response is sent as is otherwise it is converted to a JSON string using JSON.stringify().

```
// Send a HTTP 200 OK 'text/html' response
res.send('<p>Hello World !</p>');

// Send a HTTP 404 NOT FOUND 'text/html' response
res.send('Page not found', 404);

// Send a HTTP 200 OK 'application/json' response
res.send({ message: 'Hello World !' }, 200, 'application/json');
```

## Cookies

By default, cookies are available as a string in the `request` object at `request.headers.cookie`. GhostJS parses it and generates a key:value array accessible at `request.cookies`.

```
{
  ...
  handler: (req, res) => {
    // This will output an array like [ username: 'rludosanu', token: 'sdf-23ksdfm-3msdf' ]
    console.log(req.cookies);
  }
}
```
