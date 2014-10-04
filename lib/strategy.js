'use strict';

var passport = require('passport-strategy'),
    util = require('util'),
    yub = require('yub'),
    debug_passport = false;

var lookup = function(obj, field) {
    if (!obj) {
        return null;
    }
    var chain = field.split(']').join('').split('[');
    for (var i = 0, len = chain.length; i < len; i++) {
        var prop = obj[chain[i]];
        if (typeof(prop) === 'undefined') {
            return null;
        }
        if (typeof(prop) !== 'object') {
            return prop;
        }
        obj = prop;
    }
    return null;
};

var Strategy = function(options, verify) {

    if (debug_passport) console.log('New YUBICO Strategy');

    if (typeof options == 'function') {
        verify = options;
        options = {};
    }

    if (!verify) {
        throw new TypeError('Yubico Strategy requires a verify callback');
    }

    this._yubicoAPIKey = options.yubicoAPIKey;
    this._yubicoClientId = options.yubicoClientId;
    this._yubicoPasswordField = options.yubicoPasswordField || 'yubikey';
    this._passwordField = options.passwordField || 'password';
    this._usernameField = options.usernameField || 'username';

    passport.Strategy.call(this);

    this.name = 'yubico';
    this._passReqToCallback = options.passReqToCallback;

    this._verify = verify;
};

util.inherits(Strategy, passport.Strategy);

Strategy.prototype.authenticate = function(req, options) {

    var _self = this || {};

    if (debug_passport) console.log('Entered YUBICO authentication');

    _self.req = req;
    _self.user = req.user;
    _self.options = options || {};

    _self.yubicoPassword = lookup(_self.req.body, _self._yubicoPasswordField) || lookup(_self.req.query, _self._yubicoPasswordField);
    _self._password = lookup(_self.req.body, _self._passwordField) || lookup(_self.req.query, _self._passwordField);
    _self._username = lookup(_self.req.body, _self._usernameField) || lookup(_self.req.query, _self._usernameField);

    if (!_self._yubicoClientId || !_self._yubicoAPIKey) {
        if (debug_passport) console.log('Missing API Credentials');
        return _self.fail({
            message: options.missingAPIMessage || 'Missing API Credentials'
        }, 400);
    }

    if (!_self.yubicoPassword) {
        if (debug_passport) console.log('Failed on NO Yubico Password');
        return _self.fail({
            message: options.missingYubikeyPassword || 'Missing yubikey password'
        }, 400);
    }

    _self.verified = function(user, err, info) {

        if (!err) {
            if (debug_passport) console.log('Verified user');
            return _self.success(user, info);
        } else {
            if (debug_passport) console.log('Failed to verify user');
            _self.req.user = null;
            return _self.error(err);
        }
    };

    if (debug_passport) console.log('Ready to test YUBICO auth');

    try {

        yub.init(_self._yubicoClientId, _self._yubicoAPIKey);

        yub.verify(_self.yubicoPassword, function(err, data) {

            if (debug_passport) console.log(err, data)

            if (err) {
            	if (debug_passport) console.log('Error returned from Yubico servers: '+err);
                return _self.fail({
                    message: 'Error returned from YUBICO servers: ' + err
                });
            } else {
                if ('OK' !== data.status.toString()) {
                	if (debug_passport) console.log('Status !OK: '+data.status);
                    return _self.fail({
                        message: 'Error from YUBICO servers: ' + data.status
                    });
                } else if (!data.signatureVerified) {
                    return _self.fail({
                        message: 'Signature not VERIFIED'
                    });
                } else if (!data.nonce) {
                    return _self.fail({
                        message: 'Nonce not VERIFIED'
                    });
                } else if (!data.valid) {
                    return _self.fail({
                        message: 'Invalid response from YUBICO'
                    });
                } else {
                    _self._serial = data.serial;
                    _self._identity = data.identity;

                    try {

                        if (_self._passReqToCallback) {

                            _self._verify(_self.req, _self._username, _self._password, _self._serial, _self._identity, _self.verified);

                        } else {

                            _self._verify(_self._username, _self._password, _self._serial, _self._identity, _self.verified);
                        }

                    } catch (ex) {
                        if (debug_passport) console.log('Exploded YUBICO auth');
                        return _self.error(ex);

                    }
                }
            }
        });

    } catch (ex) {
        return _self.fail({
            message: 'Error thrown talking to YUBICO servers: ' + ex
        });
    }
};

module.exports = Strategy;
