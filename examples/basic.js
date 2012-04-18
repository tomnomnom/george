var george = require('../george');

// Log the URL being requested
george.on('request', function(request){
  console.log(request.url);
});

george.on('response', function(response){
  // Globally replace "monospace" with "sans-serif" in the response body
  response.body = response.body.replace(/monospace/g, 'sans-serif');

  // Change the content-type to be text/plain
  response.headers['content-type'] = 'text/plain';
});

// Start George listening on port 7070
george.listen(7070);
