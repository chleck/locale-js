/*
 * # locale library usage examples
 *
 * ## locale.js: i18n for Node.js and browser
 * 
 * @author Dmitry A. Chleck <dmitrychleck@gmail.com>
 * @version 1.1.0
 * @url https://github.com/chleck/locale-js
 */

// Import and init the library
var locale = require('..');
locale.init('./i18n');

w('# LOCALE LIBRARY DEMO:');

// Create i18n for base language (English)
var i18n = new locale.i18n('');

// Pull __() to locals
__ = i18n.__;

w('## English:');
demo();

// Switch to Russian
i18n.to('ru');

w('## Russian:');
demo();

// THE END

// !!! Usage of translation functions
function demo() {
  // Translate phrase
  w(__('Hello!'));
  // Comment for translator
  w(__('Hello!# This is comment.'));
  // Phrase with id 
  w(__('Hello!#another_hello'));
  // Phrase with id and comment
  w(__('Hello!#another_hello2 Please translate this another way.'));
  // Phrase with # but not comment
  w(__('There is ## in this phrase but it is not comment.'));
  // This phrase will not be translated - missing in translation.
  w(__('Hello?'));
  // Escapes for placeholders
  w(__('This is %% percent symbol.'));
  // Placeholders with additional arguments
  w(__('My %(0)s is faster then your %(1)s!', 'SSD', 'HDD'));
  // Placeholders with array
  w(__('My %(0)s is faster then your %(1)s!', [ 'Kawasaki', 'Segway' ]));
  // Placeholders with object
  w(__('My %(0)s is faster then your %(1)s!', { 0: 'Core i7', 1: '486DX' }));
  // Both names and order
  w(__('Let\'s count in English: %s, %s, %(3)s and %s.', 'one', 'two', 'four', 'three'));
  // Plural forms
  w(__(['Inbox: %n unreaded message.', 'Inbox: %n unreaded messages.'], 1));
  w(__(['Inbox: %n unreaded message.', 'Inbox: %n unreaded messages.'], 12));
  w(__(['Inbox: %n unreaded message.', 'Inbox: %n unreaded messages.'], 22));
  // All-in-one
  w(__([
    '%n developer from our team uses %(0)s with %(1)s.# Comment 1',
    '%n developers from our team uses %(0)s with %(1)s.# Comment 2'
    ], 1, 'C', 'vim'
  ));
  w(__([
    '%n developer from our team uses %(0)s with %(1)s.# Comment 3',
    '%n developers from our team uses %(0)s with %(1)s.# Comment 4'
    ], 3, [ 'Python', 'PyCharm' ]
  ));
  w(__([
    '%n developer from our team uses %(0)s with %(1)s.# Multiline\ncomment',
    '%n developers from our team uses %(0)s with %(1)s.# Another\nmultiline\ncomment'
    ], 7, { 0: 'Node.js', 1: 'Sublime Text 2' }
  ));
  // No args - empty string
  w(__());
}

// Some support functions

// The short way message
function w(s) { console.log(s); }
