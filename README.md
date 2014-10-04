#Passport-Yubico

A Yubico provider for the passport authentication library.

## Features

The Yubikey authentication facility returns a serial number for the Yubikey device, and a generated identity value.  The values can be used alone to identify and authenticate a user (i.e. __instead of a user identifier and password);__ or can be used alongside a username OR password to make a fairly secure, but minimal impact authentication system;  or can be used with a username AND password to make a highly secure web site.

You could also use a normal user identifier and password to allow logins, but then use the Yubikey authentication to access more sensitive areas of the site.

---

  ![Bitcoin Donations Welcome](https://blockchain.info//Resources/loading-large.gif)

[1HPaCHrbZtrvoVoEdH1mFqqY5jwVHcXVK3](bitcoin://1HPaCHrbZtrvoVoEdH1mFqqY5jwVHcXVK3
)


  ![Bitcoin Donations Welcome](https://blockchain.info/qr?data=1HPaCHrbZtrvoVoEdH1mFqqY5jwVHcXVK3&size=125)

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


