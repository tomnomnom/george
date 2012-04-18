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

    var buffer = '';
    proxyResponse.on('data', function(chunk) {
      buffer += chunk;
    });

    proxyResponse.on('end', function() {
      callbacks.response.forEach(function(fn){
        fn(proxyResponse);
      });

      clientResponse.writeHead(proxyResponse.statusCode, proxyResponse.headers);
      clientResponse.end(buffer);
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

