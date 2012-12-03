# Locale for Javascript

# Features
---
* Multiple target languages (translate to)
* Any base language (translate from)
* Plural forms for any language
* Simultaneous support of multiple languages
* Flexible placeholders
* Remote translation

## It's simple
---
```javascript
// Translate
var who = 'world';
__('Hello, %s!', who);

// Translate plural
__([
  'There is %n item in your cart (total $%s).',
  'There are %n items in your cart (total $%s).'
  ], cart.items.length, cart.total
);
```
# Installation
---

Install node.js library:
```
npm install locale-js
```
or download minified library [i18n.min.js](https://raw.github.com/chleck/locale-js/master/i18n.min.js "Minified i18n.js") (for browser apps).

# Tools
---
See [locale-tools project](https://github.com/chleck/locale-tools "Tools for locale-js").

# API
---
- [Library import](#library-import)
- [Configuration](#configuration)
- [Creating i18n object](#creating-i18n-object)
- [Translation target](#translation-target)
- [Translation](#translation)
- [Strings format](#strings-format)
- [Remote translation](#remote-translation)

## Library import
---

### For node.js:
```javascript
var locale = require('locale-js');
```
### For browser:
```html
<script type="text/javascript" src="i18n.min.js"></script>
```
## Configuration
---

### Library initialization (browser):
```javascript
locale.init(base, rule)
```
, where:

- *base* (string) - id of application's base language;
- *rule* (string) - plural rule for base language.

You should use locale.add() to add translation for each used language.

### Library initialization (node.js):
```javascript
locale.init(path)
```
, where *path* is the path to the translation files.

This function searches for and loads all translations automatically.

### Example:
```javascript
// In browser:
locale.init('ru', '(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)');
// You can skip parameters if your base language is English
locale.init();
// In node.js app:
locale.init('./i18n/');
```
### Add translation:
```javascript
locale.add(lang, translation)
```
, where:

- *lang* (string) - language id;
- *translation* (object) - translation JSON.

## Creating i18n object
---

### Create translation object for the given target:
```javascript
new locale.i18n(target)
```
, where *target* (string or null) - 1) id of the target language, 2) empty string or 3) null.

Sets target language to base language if *target* is *''* (empty string).  
Enables remote translation mode if *target* is *null*.  

### Example:
```javascript
// Create translation object for Russian language
var i18n = new locale.i18n('ru');
// Create translation object for base language (no translation)
var i18n = new locale.i18n('');
// Create translation object for remote translation
var i18n = new locale.i18n(null);
// And pull up __() function to the local scope
var __ = i18n.__;
```
## Translation target
---

This methods are accessible for *locale* and *i18n* objects.

### Get current target:
```javascript
to()
```
Returns (string or null) current translation target.

### Set target:
```javascript
to(target)
```
, where *target* (string or null) - 1) id of target language, 2) empty string or 3) null.

Sets target language to base language if *target* is *''* (empty string).  
Switches i18n object to remote translation mode if *target* is *null*.  

### Example:
```javascript
// Set target language for library to German
locale.to('de');
// Create i18n object and set its target language to Russian
var i18n = new locale.i18n();
i18n.to('ru');
// Enable remote translation mode
i18n.to(null);
```
## Translation
---

This methods are accessible for *locale* and *i18n* objects.

### For simple form:
```javascript
__(phrase)
__(phrase, ...)
__(phrase, array)
__(phrase, object)
```
, where:

- *phrase* (string) - string for translation (can contains placeholders);
- *...* (mixed) - any number of additional args;
- *array* (Array) - array of args;
- *object* (object) - map of args.

Returns translated string or remote translation data (in case of remote translation target).

### For plural form:
```javascript
__(phrase, n)
__(phrase, n, ...)
__(phrase, n, array)
__(phrase, n, object)
```
, where:

- *phrase* (array) - array of strings each of them is a plural form for translation (can contains placeholders);
- *n* (numeric) - base number of plural form;
- *...* (mixed) - any number of additional args;
- *array* (Array) - array of args;
- *object* (object) - map of args.

Returns translated string or remote translation data (in case of remote translation target).

### Example:
```javascript
// Simple:

// Hello!
__('Hello!');
// Hello, anonymous!
__('Hello, %s!', 'anonymous');
// Hello, John Smith!
__('Hello, %s(2) %s(1)!', [ 'Smith', 'John' ]);
// Hello, Foo (bar)!
__('Hello, %s(name) (%s(login))!', { name: 'Foo', login: 'bar' });

// Plural:

// Inbox: 1 unreaded message.
__([ 'Inbox: %n unreaded message.', 'Inbox: %n unreaded messages.' ], 1);
// Inbox: 7 unreaded messages.
__([ '%s(1): %n unreaded message.', '%s(1): %n unreaded messages.' ], 7, 'Inbox');
// Anonymous, you have 365 unreaded messages in the "Spam" folder.
__([
    '%s(1), you have %n unreaded message in the "%s(2)" folder.',
    '%s(1), you have %n unreaded messages in the "%s(2)" folder.'
   ], 365, [ 'Anonymous', 'Spam' ]);
// The second way
__([
    '%s(login), you have %n unreaded message in the "%s(folder)" folder.',
    '%s(login), you have %n unreaded messages in the "%s(folder)" folder.'
   ], 365, { login: 'Anonymous', folder: 'Spam' });

// Remote:

// { __i18n: true, phrase: 'Hello!', n: undefined, args: {} }
__('Hello!');
```
See also: Remote translation.

## Strings format
---

### Phrase, id and comment

Each string consists of *phrase*, *id* and *comment*.
Both *id* and *comment* are optional, *id* separates from *phrase* by '#' sign, *comment* separates from *id* by space.
```
<phrase>[#<id>[ <comment>]]
```
*phrase* + *id* is unique key for translation dictionary. You can create several variants of translation of the same *phrase* using different *id*s.

Also you can place any useful info for translator to *comment*.

### Example:
```javascript
// No id, no comment
__('Hello!');
// Both id and comment
__('Hello!#another This is a comment for translator');
// Only id
__('Hello!#another');
// Only comment
__('Hello!# This is a comment for translator');
```
### Placeholders

Phrases can contains placeholders.

Placeholder's format is:

**%s** - fills with the next arg.  
**%s(id)** - fills with the *id* arg (arg number *id* for additional args or arg[id] for array and map args).  
**%n** - fills with base number of plural form (valid for plural form only).  

### Example:

See example of __() function.

### Special characters

Special characters are '#' and '%'. If you need it in your string you should type it twice.
```javascript
// 40%
__('%s%%', 40);
// It's # not a comment!
__('It\'s ## not a comment!);
```
Also you can use '(' character after placeholder. Type it twice too:
```javascript
// Order by name(asc)
__('Order by %s((asc)', 'name');
```
## Remote translation
---

### Search for remote translation data in the *obj* and replace it by translated string:
```javascript
i18n.tr(obj)
```
, where *obj* (object) - object for translation.

### Remote translation data structure:
```
{
  __i18n: true,
  phrase: <phrase>,
  n: <number>,
  args: <arguments>
}
```
See also: Creating i18n object.

### Example:
```javascript
// Server:

// Create i18n object for the remote mode
var i18n = new locale.i18n(null);
var __ = i18n.__();
submit({
  id: 832367,
  errno: 404,
  error: __('Path not found!')
});

// Client:

var i18n = new locale.i18n('ru');
var msg = receive();
i18n.tr(msg);
/*

  {
    id: 832367,
    errno: 404,
    error: 'Путь не найден!'
  }

*/
```