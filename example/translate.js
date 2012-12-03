/*
 * # locale library usage examples
 *
 * ## locale.js: i18n for Node.js and browser
 * 
 * @author Dmitry A. Chleck <dmitrychleck@gmail.com>
 * @version 1.0.0
 */

// Import and init the library
var locale = require('..');
locale.init('./');

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
  w(__('This is %% percent symbol. This is placeholder with %s((name).', 'ignored '));
  // Placeholders with additional arguments
  w(__('My %s(1) is faster then your %s(2)!', 'SSD', 'HDD'));
  // Placeholders with array
  w(__('My %s(1) is faster then your %s(2)!', [ 'Kawasaki', 'Segway' ]));
  // Placeholders with object
  w(__('My %s(1) is faster then your %s(2)!', { 1: 'Core i7', 2: '486DX' }));
  // Both names and order
  w(__('Let\'s count in English: %s, %s, %s(4) and %s.', 'one', 'two', 'four', 'three'));
  // Plural forms
  w(__(['Inbox: %n unreaded message.', 'Inbox: %n unreaded messages.'], 1));
  w(__(['Inbox: %n unreaded message.', 'Inbox: %n unreaded messages.'], 12));
  w(__(['Inbox: %n unreaded message.', 'Inbox: %n unreaded messages.'], 22));
  // All-in-one
  w(__([
    '%n developer from our team uses %s(1) with %s(2).# Comment 1',
    '%n developers from our team uses %s(1) with %s(2).# Comment 2'
    ], 1, 'C', 'vim'
  ));
  w(__([
    '%n developer from our team uses %s(1) with %s(2).# Comment 3',
    '%n developers from our team uses %s(1) with %s(2).# Comment 4'
    ], 3, [ 'Python', 'PyCharm' ]
  ));
  w(__([
    '%n developer from our team uses %s(1) with %s(2).# Multiline\ncomment',
    '%n developers from our team uses %s(1) with %s(2).# Another\nmultiline\ncomment'
    ], 7, { '1': 'Node.js', '2': 'Sublime Text 2' }
  ));
  // No args - empty string
  w(__());
}

// Some support functions

// The short way message
function w(s) { console.log(s); }
