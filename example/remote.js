/*
 * # locale library usage examples: remote translation
 *
 * ## locale.js: i18n for Node.js and browser
 * 
 * @author Dmitry A. Chleck <dmitrychleck@gmail.com>
 * @version 1.1.0
 * @url https://github.com/chleck/locale-js
 */

http = require('http');

// Import and init the library
var locale = require('..');
locale.init('./i18n');
var i18n = new locale.i18n(null);

var __ = i18n.__;

// Start HTTP server on 127.0.0.1:8080
http.createServer(function (req, res) {
  // Make JSON with i18n fields
  var json = {
    'title': __('Hello!'),
    'msg': __(['The following error occurred during processing:', 'The following errors occurred during processing:'], 1),
    'error': [ __('Hello!'), __('Email %s is invalid. Please enter valid email.', '%#$@gmail.com') ],
    'session': 'jsahfkjsdfsdhiudfshiuh'
  };
  // and submit it to HTTP client
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(json, null, '  '));
}).listen(8080, '127.0.0.1');

// Get JSON from HTTP server
http.get({ host:'127.0.0.1', port:8080, path:'/', agent:false }, function (res)
{
  var data = '';
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    data += chunk;
  });
  res.on('end', function(){
    var json
      , i18n = new locale.i18n('');
    // Translate to base language (English)
    json = JSON.parse(data);
    i18n.tr(json);
    console.log('\nEnglish:\n', JSON.stringify(json, null, '  '));
    // Translate to Russian
    json = JSON.parse(data);
    i18n.to('ru');
    i18n.tr(json);
    console.log('\nRussian:\n', JSON.stringify(json, null, '  '));
    // Exit
    process.exit(0);
  });
});
