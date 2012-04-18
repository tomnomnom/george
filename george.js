var http = require('http');

var callbacks = {
  'request': [],
  'response': []
};

var urlRewrites = {};

var server = http.createServer(function(clientRequest, clientResponse) {

  // Request hooks
  callbacks.request.forEach(function(fn){
    fn(clientRequest);
  });

  // For now we need to force identity encoding as gzip et al are not supported
  clientRequest.headers['accept-encoding'] = 'identity';

  // TODO: regex match
  if (urlRewrites[clientRequest.url] != undefined){
    clientRequest.url = urlRewrites[clientRequest.url];

    // Find the host portion of the new URL and use it to set the host header
    var hostHeader = clientRequest.url.replace(/https?:\/\//, '').replace(/\/.*/, '');
    clientRequest.headers.host = hostHeader;
  }

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

// URL rewriting
exports.rewriteUrl = function(search, replacement){
  urlRewrites[search] = replacement;
};

