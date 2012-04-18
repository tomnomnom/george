var george = require('./george');

// Log the URL being requested
george.on('request', function(request){
  console.log(request.url);
});

george.on('response', function(response){
  response.headers['content-type'] = 'text/plain';
});

// Start George listening on port 7070
george.listen(7070);
