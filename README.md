#Passport-Yubico

A Yubico provider for the passport authentication library.

[![NPM](https://nodei.co/npm/passport-yubico.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/passport-yubico/)

[![endorse](https://api.coderwall.com/davewilliamson/endorsecount.png)](https://coderwall.com/davewilliamson)

## Features

The Yubikey authentication facility returns a serial number for the Yubikey device, and a generated identity value.  The values can be used alone to identify and authenticate a user (i.e. __instead of a user identifier and password);__ or can be used alongside a username OR password to make a fairly secure, but minimal impact authentication system;  or can be used with a username AND password to make a highly secure web site.


---

### To Install

	npm install passport-yubico

#### You require an API Key and client ID from [Yubico](http://www.yubico.com/): 

# [https://upgrade.yubico.com/getapikey/](https://upgrade.yubico.com/getapikey/)

---
### To Use

The Yubikey needs a single input field:

	<input type="text" name="yubikey">

The name of the field is also configurable (yubicoPasswordField) in the options:

	var __options__ = {

		yubicoAPIKey: '{your API Key}',

		yubicoClientId: '{your client ID}',

		usernameField: 'username',

		passwordField: 'password',

		yubicoPasswordField: 'yubikey',

		passReqToCallback: true
	};


To use the passport plugin, you add the following entry:

	YubicoStrategy = require('passport-yubico').Strategy;

	passport.use('yubico', new YubicoStrategy(__options__, 

		function(req, username, password, serial, identity, done) {

			/* 
			 * Get your user, and confirm password if required
			 * 
			 * Then check the users Yubikey...
			 *
			 */

			if(user.yubicoKeys[serial] === identity){

				done(user, null);

			} else {

				done(null, 'Not confirmed');
			}

		}

	));

In the above example, we have a user record that has an additional information for the users Yubikey(s), below is an example of this user record as a JSON object...

	{
		id: '1234567890',

		username: 'testuser',

		password: 'testpassword',

		yubicoKeys:{

			'1234567': 'ccabfedddeaccdfabbe'

		},

		firstName: 'Joe',

		lastName: 'Bloggs'
	}


---
###The last piece of the Jigsaw...
Or should that be the first? Before you can check the Yubikeys credentials, you need to be able to retrieve them from the Yubico servers and store them somewhere for later verification, for this there is a Utility module within the passport-yubico library.  To use this.....

	var YubicoUtility = require('passport-yubico').Utility;

	var yubicoUtility = new YubicoUtility({

		yubicoAPIKey: '{your API Key}',

		yubicoClientId: '{your client ID}',
	});

	yubicoUtility.getCredentials({yubikey password from form}, function(err, data) {

		if (!err && data) {

			console.log('Serial: ' + data.serial);

			console.log('Identity: ' + data.identity);

			/*
			 * This is where you would store the credentials to the users record e.g.:
			 *
			 * user.yubicoKeys = user.yubicoKeys || {};
			 *
			 * user.yubicoKeys[data.serial] = data.identity
			 *
			 */

		} else if (err) {

			console.error('Lookup returned Error: ' + err);

		} else {

			console.error('No data returned');

		}

		return next(err);
	});

This functionality is typically placed on the users account page that allows the user to add a Yubico key as part of their authentication process.


---
#Want to say thank you?  A bit coin donation is always welcome ;-)

[1HPaCHrbZtrvoVoEdH1mFqqY5jwVHcXVK3](bitcoin://1HPaCHrbZtrvoVoEdH1mFqqY5jwVHcXVK3)
====



