// Load required libraries
const fs = require('fs'); // Read files from filesystem
const request = require('request'); // Make HTTP Requests
const jwt = require('jsonwebtoken'); // Make JWT
const crypto = require('crypto'); // Crypto stuff, but make random string for JTI
const yargs = require('yargs'); // read in arguments, i.e. "user" to specify user id
const _ = require('lodash'); // process data types 'n such

// Read in config.json from developer console
var boxConfig = JSON.parse(fs.readFileSync('config.json'));

// Read in arguments
const argv=yargs
  .options({ // allow description of commands/parameters
    i: { //user command has user property under it, which is an obj
      describe: 'The user ID to use for the access token',
      demand: false, // no user requirement
      alias: 'id', // allow use of -i flag instead of --user
      string: true // force input to be a string
    }
  })
  .help() // allow help flag to be used
  .argv;
var option = argv.i; //command is first index / first argument passed
// console.log(argv); use this to debug arguments being passed in
// debugger;

// Set box_sub_type based on whether command exists or not
var subType = (option) => {
  if (option) { // if command exists, make box_sub_type user
    return 'user';
  } else { // if not, assume enterprise
    return 'enterprise';
  }
};

// Same idea, but with sub
var sub = (option) => {
  if (option) { // if a command exists, take the id as sub value
    return option; // don't need to lodash to string this because string is true in command options
  } else { // if not, assume enterprise id from config file
    return boxConfig.enterpriseID;
  }
};

// Create your JWT
var boxJWT = () => {
  var token = jwt.sign(
    { // Claims aka Payload defined here. Use https://developer.box.com/v2.0/docs/construct-jwt-claim-manually#section-6-constructing-the-claims for reference.
      iss: boxConfig.boxAppSettings.clientID,
      sub: sub(option),
      box_sub_type: subType(option),
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

// Make HTTP Request to /token endpoint
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
      },
      json: true
  };
  request(options, function (error, response, body) {
  console.log('statusCode:', response && response.statusCode);
  console.log('body:');
  console.log(JSON.stringify(body, undefined, 2));
});
};

// call the function now
getAccessToken(boxJWT());
