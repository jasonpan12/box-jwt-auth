// Load required libraries
const fs = require('fs'); // Read files from filesystem
const request = require('request'); // Make HTTP Requests
const jwt = require('jsonwebtoken'); // Make JWT
const crypto = require('crypto'); // Crypto stuff, but make random string for JTI
const yargs = require('yargs'); // read in arguments, i.e. "user" to specify user id
const _ = require('lodash');

// Read in config.json from developer console
var boxConfig = JSON.parse(fs.readFileSync('config.json'));

// Read in arguments
const argv=yargs.argv;

// Create your JWT
var boxJWTEnt = () => {
  var token = jwt.sign(
    { // Claims aka Payload defined here. Use https://developer.box.com/v2.0/docs/construct-jwt-claim-manually#section-6-constructing-the-claims for reference.
      iss: boxConfig.boxAppSettings.clientID,
      sub: boxConfig.enterpriseID,
      box_sub_type: "enterprise",
      aud: "https://api.box.com/oauth2/token",
      jti: crypto.randomBytes(20).toString('hex'),
      exp: Math.floor(Date.now() / 1000) + (60)
    },
    { // key info goes here
      key: boxConfig.boxAppSettings.appAuth.privateKey,
      passphrase: boxConfig.boxAppSettings.appAuth.passphrase
    },
    { // kid, alg, and typ made automagically
      algorithm: "RS256",
      header: { kid: boxConfig.boxAppSettings.appAuth.publicKeyID },
    }
  );
  return token;
};

var boxJWTUser = () => {
  var token = jwt.sign(
    { // Claims aka Payload defined here. Use https://developer.box.com/v2.0/docs/construct-jwt-claim-manually#section-6-constructing-the-claims for reference.
      iss: boxConfig.boxAppSettings.clientID,
      sub: _.toString(argv.id),
      box_sub_type: argv._[0],
      aud: "https://api.box.com/oauth2/token",
      jti: crypto.randomBytes(20).toString('hex'),
      exp: Math.floor(Date.now() / 1000) + (60)
    },
    { // key info goes here
      key: boxConfig.boxAppSettings.appAuth.privateKey,
      passphrase: boxConfig.boxAppSettings.appAuth.passphrase
    },
    { // kid, alg, and typ made automagically
      algorithm: "RS256",
      header: { kid: boxConfig.boxAppSettings.appAuth.publicKeyID },
    }
  );
  return token;
};

var getAccessToken = (jwt) => {
  var options = {
      method: "POST",
      url: "https://api.box.com/oauth2/token",
      headers: {
          'content-type': 'application/x-www-form-urlencoded'
      },
      form: {
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          client_id: boxConfig.boxAppSettings.clientID,
          client_secret: boxConfig.boxAppSettings.clientSecret,
          assertion: jwt
      }
  };
  request(options, function (error, response, body) {
  console.log('statusCode:', response && response.statusCode);
  console.log('body:', body);
});
};

// call the functions now.
if (argv._[0]) { // if any argument exists, i.e. "user", get user token
  getAccessToken(boxJWTUser());
} else { // if not, assume enterprise token
  getAccessToken(boxJWTEnt());
}
