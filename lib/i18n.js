/*
 * # i18n library
 *
 * ## locale.js: i18n for Node.js and browser
 * 
 * @author Dmitry A. Chleck <dmitrychleck@gmail.com>
 * @url https://github.com/chleck/locale-js
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
      // Check deferred mode
      return to === null ? json : translate(json, to);
    }

    // # Translate deferred objects
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
    return sprintf(result, args.args, args.n);
  }

  /*

    %[(<name>)][<flag>][<width>][.<precision>]<type>
    <name> argument name or number
    <flag>  ' ', '+', '-'
    <type> 'n', 's' 'd', 'e', 'b', 'h', x', 'X'

  */
  // Format message
  function sprintf(format, args, n) {
    var c
      , i      = 0
      , number = 0
      , ph
      , res    = [];

    while(next()) {
      if(c == '%') placeholder(); else res.push(c);
    }

    return res.join('');

    function next() {
      c = format[i++];
      return c;
    }

    function placeholder() {
      ph = {};
      switch(next()) {
        // End of format
        case undefined:
        break;
      case '%':
        res.push('%');
        break;
      case '(':
          name();
          break;
        default:
          i--;
          flag();
      }
    }

    function name() {
      var from = i;
      while(next()) {
        if(c == ')') {
          ph.name = format.substring(from, i - 1);
          flag();
          break;
        }
      }
    }

    function flag() {
      ph.flags = '';
      while(next() && ' +-'.indexOf(c) >= 0) ph.flags += c;
      // If not EOS
      if(c) {
        // Step back
        i--;
        width();
      }
    }

    function width() {
      ph.width = '';
      while(next() && '0123456789'.indexOf(c) >= 0) ph.width += c;
      // If not EOS
      if(c) {
        ph.width *= 1;
        if(c == '.') precision(); else type();
      }
    }

    function precision() {
      ph.precision = '';
      while(next() && '0123456789'.indexOf(c) >= 0) ph.precision += c;
      // If not EOS
      if(c) {
        ph.precision = Number(ph.precision);
        if(ph.precision < 0) ph.precision = 0;
        type();
      }
    }

    function type() {
      var value   = ''
        , sign    = '';

      ph.type = c;

      // Special handling for %n
      if(ph.type == 'n') {
        ph.type = 'd';
        var arg = n;
      } else {
        var arg = (ph.name ? args[ph.name] : args[number++]) || '';
      }

      // Numeric
      if('debhxX'.indexOf(ph.type) >= 0) {
        // NaN if bad value
        if(typeof arg != 'number') arg = NaN;
        // Sign for NaN
        if(isNaN(arg)) {
          // ' ' and '+' flags - no sign for NaN but save alignment
          if(ph.flags.indexOf(' ') >= 0 || ph.flags.indexOf('+') >= 0) sign = ' ';
        }
        // For negative
        else if(arg < 0) {
          // Set sign for negative
          sign = '-';
        }
        // For positive
        else {
          // ' ' flag - space before non-negative value
          if(ph.flags.indexOf(' ') >= 0) sign = ' ';
          // '+' flag - plus before non-negative value, overrides a space if both are used
          if(ph.flags.indexOf('+') >= 0) sign = '+';
        }
        arg = Math.abs(arg);
      }

      switch(ph.type) {
        case 's':
          value = arg;
          // ' ' flag - replace empty value with space
          if(!value && ph.flags.indexOf(' ') >= 0) value = ' ';
          if(ph.precision) value = value.substr(0, ph.precision);
          break;
        case 'd':
          // Precision
          value = sign + (ph.precision ? arg.toFixed(ph.precision) : arg.toString());
          break;
        case 'e':
          value = sign + arg.toExponential(ph.precision ? ph.precision : 6);
          break;
        case 'b':
          value = sign + Math.round(arg).toString(2) + 'b';
          break;
        case 'h':
          value = sign + Math.round(arg).toString(16).toUpperCase() + 'h';
          break;
        case 'x':
          value = sign + '0x' + Math.round(arg).toString(16);
          break;
        case 'X':
          value = sign + '0x' + Math.round(arg).toString(16).toUpperCase();
          break;
        default:
          // Unknown type - ignore this ph
          return;
      }

      // Padding
      var s = '';
      for(var delta = ph.width - value.length; delta > 0; delta--)
        s += ' ';
      // '-' flag - left or right alignment
      if(ph.flags.indexOf('-') >= 0) value += s; else value = s + value;

      res.push(value);
    }
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
