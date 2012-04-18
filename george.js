var http = require('http');

var callbacks = {
  'request': [],
  'response': []
};

var server = http.createServer(function(clientRequest, clientResponse) {

  callbacks.request.forEach(function(fn){
    fn(clientRequest);
  });

  var proxy = http.createClient(80, clientRequest.headers.host);
  var proxyRequest = proxy.request(
      clientRequest.method,
      clientRequest.url,
      clientRequest.headers
  );

  proxyRequest.on('response', function (proxyResponse) {

    proxyResponse.body = '';
    proxyResponse.on('data', function(chunk) {
      proxyResponse.body += chunk;
    });

    proxyResponse.on('end', function() {
      callbacks.response.forEach(function(fn){
        fn(proxyResponse);
      });

      // Set correct content-length to enable re-writing of content
      proxyResponse.headers['content-length'] = proxyResponse.body.length;

      clientResponse.writeHead(proxyResponse.statusCode, proxyResponse.headers);
      clientResponse.end(proxyResponse.body);
    });

  });

  clientRequest.on('end', function() {
    proxyRequest.end();
  });

});

// Event binder
exports.on = function(type, callback){
  callbacks[type].push(callback);
};

// Start george
exports.listen = function(port){
  port = port || 7070;
  server.listen(port);
};

