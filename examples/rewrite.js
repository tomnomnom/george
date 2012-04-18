var george = require('../george');

george.rewriteUrl(
  'http://example.com/css/light.css', 
  'http://example.com/css/dark.css'
);

george.listen(7070);
