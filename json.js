// Load required libraries
const fs = require('fs'); // Read files from filesystem
const request = require('request'); // Make HTTP Requests
const jwt = require('jsonwebtoken'); // Make JWT
const crypto = require('crypto'); // Crypto stuff, but make random string for JTI

// Read in config.json from developer console
var boxConfig = JSON.parse(fs.readFileSync('config.json'));

// Create your JWT
var boxJWT = () => {
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

var getEnterpriseToken = (jwt) => {
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

// Actually call the functions now.
getEnterpriseToken(boxJWT());
