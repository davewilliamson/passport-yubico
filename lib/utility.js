'use strict';

var yub = require('yub'),
    debug_passport = true;

var Utility = function(options) {

    var _self = this || {};

    if (debug_passport) console.log('New YUBICO utility');

    if (!options.yubicoAPIKey) throw new Error('A YUBICO API Key is required');
    if (!options.yubicoClientId) throw new Error('A YUBICO Client Id is required');

    _self._yubicoAPIKey = options.yubicoAPIKey;
    _self._yubicoClientId = options.yubicoClientId;

    _self.getCredentials = function(yubicoPassword, cb) {

        if (!yubicoPassword || typeof yubicoPassword !== 'string') throw new Error('The YUBICO password must be passed as the first parameter of this call');
        if (!cb || typeof cb !== 'function') throw new Error('A callback function must be the second parameter of this call');

        yub.init(_self._yubicoClientId, _self._yubicoAPIKey);

        yub.verify(yubicoPassword, function(err, data) {

        	if (debug_passport) console.log(err, data);
            
            if (err) return cb(err);
            
            if ('OK' !== data.status.toString()) {
                return cb(new Error(data.status.toString()));
            } else if (!data.signatureVerified) {
                return cb(new Error('Signature not VERIFIED'));
            } else if (!data.nonce) {
                return cb(new Error('Nonce not VERIFIED'));
            } else if (!data.valid) {
                return cb(new Error('Invalid response from YUBICO'));
            } else {
                return cb(null, {
                    serial: '' + data.serial,
                    identity: '' + data.identity
                });
            }
        });
    };
};

module.exports = Utility;
