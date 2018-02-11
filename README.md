Node.js example of JWT Auth
===================

A quick demonstration of JWT creation and authorization on the [Box Content API](https://developers.box.com/docs/).
Full description of Box's JWT requirements are available in the [manual JWT creation instructions](https://developer.box.com/v2.0/docs/construct-jwt-claim-manually).

Includes:

- Reading in a config.json file
- JWT Creation
- A POST to https://api.box.com/
- Logic for accepting arguments via yargs

Basic Usage
-----------

1. Download [node.JS](https://nodejs.org/en/)

1. Download your config file obtained from [Section 1 of Box's JWT Guide](https://developer.box.com/v2.0/docs/authentication-with-jwt#section-1-generate-an-rsa-keypair-in-the-developer-console) 
  1. Rename the config file from "xxx_xxx_config.json" to just "config.json" and put it in the home directory of this repository wherever you've downloaded it.

1. Complete step 2 of the JWT Guide. 

1. At step 3, you can use this instead to test getting access tokens.

Run this from the home directory of this repository to install the dependencies
```js
npm install
```
Run this to execute the code. An access token for the service account will be returned.
```js
node json.js
```
To specify a user token, add an argument "user" and then a value for the user ID, like so
```js
node json.js user --id=user_id_here
```
