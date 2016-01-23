/*
 * # node.js layer
 *
 * ## locale.js: i18n for Node.js and browser
 * 
 * @author Dmitry A. Chleck <dmitrychleck@gmail.com>
 * @url https://github.com/chleck/locale-js
 */

var locale = require('./i18n').locale;

var fs    = require('fs')
  , path  = require('path');

// Load JSON from file
function loadJson(file, from) {
  try {
    return JSON.parse(fs.readFileSync('./' + path.join(from, file + '.json')));
  } catch(e) {}
}

// Save original init() function
var i18n_init = locale.init;

// # Library initialization
locale.init = function(path) {
  // Path to locale folder
  path = path || './i18n';
  // Try to load config
  var cfg = loadJson('i18n', path) || {};
  // Base language of translation (translate from)
  i18n_init(cfg.base, cfg.rule);
  // Load translations
  for(var lang in cfg.targets) {
    lang = cfg.targets[lang];
    console.log(lang);
    // Try to load translation for each configured language
    var tmp = loadJson(lang, path);
    console.log(tmp);
    // Add translation if success
    if(tmp) locale.add(lang, tmp);
  }
}

module.exports = locale;
