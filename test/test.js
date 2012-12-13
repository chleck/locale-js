/*
 * # locale library test suite
 *
 * ## locale.js: i18n for Node.js and browser
 * 
 * @author Dmitry A. Chleck <dmitrychleck@gmail.com>
 * @version 1.0.0
 * @url https://github.com/chleck/locale-js
 */

var locale  = require('..');

var i18n, __, tmp;

describe('Test suite for locale library', function() {

  describe('Configure:', function() {

    it('Library initialization', function() {
      locale.init('./test/i18n');
    })

    it('Add translation', function() {
      locale.add('zz', { 'Hello!': 'Bzzzz!' });
    })

    it('Set target language', function() {
      locale.to('ru');
    })

    it('Get target language', function() {
      locale.to().should.equal('ru');
    })

    it('Create i18n object', function() {
      i18n = new locale.i18n();
    })

    it('Create i18n object for remote translation', function() {
      i18n = new locale.i18n(null);
    })

  })

  describe('Pass through (no translation):', function() {

    it('Switch to pass trough mode', function() {
      locale.to('');
      __ = locale.__;
    })

    it('Simple', function() {
      __('Hello!').should.equal('Hello!');
    })

    it('Plural', function() {
      __(['Message.', 'Messages.'], 1).should.equal('Message.');
      __(['Message.', 'Messages.'], 2).should.equal('Messages.');
    })

  })

  describe('Translate:', function() {

    it('Switch to Russian', function() {
      locale.to('ru');
      __ = locale.__;
    })

    it('Simple', function() {
      __('Hello!').should.equal('Привет!');
    })

    it('Plural', function() {
      __(['Message.', 'Messages.'], 1).should.equal('Сообщение.');
      __(['Message.', 'Messages.'], 2).should.equal('Сообщения.');
      __(['Message.', 'Messages.'], 5).should.equal('Сообщений.');
    })

  })

  describe('Translate to unknown language:', function() {

    it('Switch to German', function() {
      locale.to('de');
      __ = locale.__;
    })

    it('Simple', function() {
      __('Hello!').should.equal('Hello!');
    })

    it('Plural', function() {
      __(['Message.', 'Messages.'], 1).should.equal('Message.');
      __(['Message.', 'Messages.'], 2).should.equal('Messages.');
    })

  })

  describe('Translate with i18n object:', function() {

    it('Create i18n object for Russian', function() {
      i18n = new locale.i18n('ru');
      __ = i18n.__;
    })

    it('Simple', function() {
      __('Hello!').should.equal('Привет!');
    })

    it('Plural', function() {
      __(['Message.', 'Messages.'], 1).should.equal('Сообщение.');
      __(['Message.', 'Messages.'], 2).should.equal('Сообщения.');
    })

  })

  describe('Placeholders:', function() {

    it('%n', function() {
      locale.to('');
      __ = locale.__;
      __(['%n message.', '%n messages.'], 1).should.equal('1 message.');
      __(['%n message.', '%n messages.'], 2).should.equal('2 messages.');
    })

    it('%s with additional args', function() {
      __('%s %s!', 'Hello', 'world').should.equal('Hello world!');
    })

    it('%s with array args', function() {
      __('%s %s!', [ 'Hello', 'world' ]).should.equal('Hello world!');
    })

    it('%(n)s with additional args', function() {
      __('%(0)s %(1)s!', 'Hello', 'world').should.equal('Hello world!');
    })

    it('%(n)s with array args', function() {
      __('%(0)s %(1)s!', [ 'Hello', 'world' ]).should.equal('Hello world!');
    })

    it('%(key)s with map args', function() {
      __('%(one)s %(two)s!', { one: 'Hello', two: 'world' }).should.equal('Hello world!');
    })

    it('mixed %s and %(n)s with additional args', function() {
      __('%(1)s %s!', 'world', 'Hello').should.equal('Hello world!');
    })

    it('mixed %s and %(n)s with array args', function() {
      __('%(1)s %s!', [ 'world', 'Hello' ]).should.equal('Hello world!');
    })

  })

  describe('Remote translation:', function() {

    it('Turn on remote translation mode', function() {
      locale.to(null);
      __ = locale.__;
    })

    it('Create object containing remote translation data', function() {
      tmp = {
        data: 'Some data...',
        array: [ 1, 2, 3, 4, 5 ],
        msg: __(['%n message.', '%n messages.'], 1)
      };
    })

    it('Translate object', function() {
      locale.to('');
      locale.tr(tmp);
      tmp.msg.should.equal('1 message.');
      tmp.data.should.equal('Some data...');
    })

  })

});