/*
 * # i18n library
 *
 * ## locale.js: i18n for Node.js and browser
 * 
 * @author Dmitry A. Chleck <dmitrychleck@gmail.com>
 * @version 1.0.0
 */

var locale = new function() {

  // Base language
  var base
    , rules;

  /*

   Translation dictionaries

   tr =
   {
     <lang>: {
       <key>: <translation>,
     },
     ...
   }
   , where:

   <lang> (string) - language key.
   Example: 'en' for English, 'ru' for Russian etc.

   <key>  (string) - translation key, the single or the first form of base language phrase.
   Example: 'Hello!' or 'There is %n object.'

   <translation> (string) or (Array) - translation phrase(s), string for single or array of string for plural.
   Example: 'Привет!' or [ 'Имеется %n объект.', 'Имеется %n объекта.', 'Имеется %n объектов.']

   */
  var tr = {};

  // Save context
  var self = this;

  // # Library initialization
  this.init = function(lang, rule) {
    base = lang || 'en';
    rules = {};
    rules[base] = Function('n', 'return ' + (rule || '(n == 1 ? 0 : 1)'));
  }

  // # Add translation
  this.add = function(lang, translation) {
    tr[lang] = translation;
    // Compile plural rule
    rules[lang] = Function('n', 'return ' + (translation[''] || '(n == 1 ? 0 : 1)'));
  }

  // # i18n objects constructor
  this.i18n = function(lang) {
    var self = this
      , to;

    to = lang === undefined ? '' : lang;

    // Get/set target language
    this.to = function(lang) {
      if(lang === undefined) return to;
      // Set lang to base language if empty string
      if(lang === '') lang = base || 'en';
      to = lang;
    }
  
    // # Translate
    this.__ = function() {
      var phrase, n;
      // Convert arguments to array
      var a = Array.prototype.slice.call(arguments);
      // Get phrase
      phrase = a.shift() || '';
      // Get n if plural
      if(Array.isArray(phrase)) n = a.shift();
      // Trim comments but save id
      if(n === undefined) {
        phrase = trimKey(phrase);
      } else {
        for(var i in phrase) {
          phrase[i] = trimKey(phrase[i]);
        }
      }
      // Pop array and object arguments
      if(typeof a[0] === 'object' || Array.isArray(a[0])) {
        a = a[0];
      }
      var json = { '__i18n': true, 'phrase': phrase, 'n': n, 'args': a };
      // Check remote mode
      return to === null ? json : translate(json, to);
    }

    // # Translate remote objects
    this.tr = function(obj) {
      if(typeof obj !== 'object') return;
      for(var o in obj) {
        if(obj[o].__i18n) obj[o] = translate(obj[o], to); else self.tr(obj[o]);
      }
    }

  } // End of i18n

  // Translate args to given language
  function translate(args, lang) {
    var result, f;
    // Empty result for empty phrase
    if(!args.phrase) return '';
    // Return translation
    try {
      if(args.n === undefined) {
        // Simple
        result = tr[lang][args.phrase] || trimPhrase(args.phrase);
      } else {
        // Plural
        f = rules[lang](args.n);
        result = tr[lang][args.phrase[0]][f];
      }
    } catch(e) {
      // Drop to base language if any error
      if(args.n === undefined) {
        // Base simple
        result = trimPhrase(args.phrase);
      } else {
        try {
          // Base plural
          f = rules[base](args.n);
          // Return right plural form
          result = trimPhrase(args.phrase[f]);
        } catch(e) {
          // Return first form if no plural rule
          result = trimPhrase(args.phrase[0]);
        }
      }
    }
    return fill(result, args.args, args.n);
  }

  // Fill string's placeholders with given args
  function fill(s, args, n) {
    var argc = 1                // Current %s argument position
      , chunks = s.split('%')   // String parts
      , result = [ chunks[0] ]; // Result buffer
    // If args is array, convert to object
    if(Array.isArray(args)) {
      var tmp = {};
      // Shift args numeration to start from 1
      args.unshift('');
      for(var k in args) tmp[k] = args[k];
      args = tmp;
    }
    // Fill placeholders
    for(var i = 1; i < chunks.length; i++) {
      var chunk = chunks[i];
      var arg = '';
      switch(chunk[0]) {
        // %% => %
        case undefined:
          // Push '%' and next chunk
          result.push('%');
          result.push(chunks[++i]);
          continue;
        // %n => n
        case 'n':
          arg = n;
          break;
        // %s => value from args
        case 's':
          // Get name if present
          var name = '';
          // '((' after %s - ignore name
          if(chunk[1] === '(') {
            if(chunk[2] === '(') {
              // %s(( - %s with screened '('' after it but not %s(name)
              chunk = chunk.substring(1);
            } else {
              // %s(name)
              name = chunk.substr(2, chunk.indexOf(')') - 2);
              // Cut (name) at begin of chunk
              chunk = chunk.substring(name.length + 2);
            }
          }
          if(name) arg = args[name]; else arg = args[argc++];
          break;
      }
      result.push(arg);
      result.push(chunk.substring(1));
    }
    return result.join('');
  }

  // Make dictionary key (phrase + id)
  function trimKey(phrase) {
    var i = 0;
    var c;
    // Search single '#'
    while(c = phrase[i++]) {
      if(c == '#') {
        if(phrase[i] == '#') i++; else break;
      }
    }
    var j = phrase.indexOf(' ', i);
    if(j < 0) j = phrase.length;
    var key = phrase.slice(0, i-1);
    var id = phrase.slice(i, j);
    if(id) key += '#' + id;
    return key;
  }

  // Trim id and comment
  function trimPhrase(phrase) {
    var i = 0;
    var c;
    // Search single '#'
    while(c = phrase[i++]) {
      if(c == '#') {
        if(phrase[i] == '#') i++; else break;
      }
    }
    return phrase.slice(0, i-1).replace(/##/g, '#');
  }

  // Create internal i18n object
  var i18n = new self.i18n();
  // Extend self with i18n's methods
  for(var k in i18n) {
    self[k] = i18n[k];
  }

} // End of locale namespace

// export locale if node.js
if(typeof exports === 'object') exports.locale = locale;
