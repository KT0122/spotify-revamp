var express = require('express');
var exp = express()
var app = express.Router();
var querystring = require('querystring');

/*
 * Spotify API setup
 * IMPORTANT: When commiting code, be careful not to leak the credentials. Use this instead:
  const CLIENTID = 'yourClientID'
  const CLIENTSECRET ='yourClientSecret'
  const URI = 'yourURI'
 */
  const CLIENTID = 'yourClientID'
  const CLIENTSECRET ='yourClientSecret'
  const URI = 'yourURI'

var SpotifyWebApi = require('spotify-web-api-node');
scopes = ['streaming','user-read-private', 'user-read-email','user-top-read', 'user-read-playback-state',
'user-modify-playback-state']

var spotifyApi = new SpotifyWebApi({
  clientId: CLIENTID,
  clientSecret: CLIENTSECRET,
  redirectUri: URI + '/callback'
});



exp.use(express.static(__dirname + '/public'));


/*
 * Redirects users to Spotify's login page
 */
app.get('/login', function(req, res) {
  var html = spotifyApi.createAuthorizeURL(scopes)
  res.redirect(html+"&show_dialog=true")  
});


/*
 * Retrieves user's tokens 
 */
app.get('/callback', async (req,res) => {
  const { code } = req.query;
  try {
    var data = await spotifyApi.authorizationCodeGrant(code)
    const { access_token, refresh_token } = data.body;
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);
    res.redirect('/#' +
          querystring.stringify({
            access_token: spotifyApi.getAccessToken(),
            refresh_token: spotifyApi.getRefreshToken()
          }))
  } catch(err) {
    res.redirect('/#/error/invalid token');
  }

});

exp.use("/", app);
exp.listen(process.env.port || 8080);

console.log("Running at Port 8080");
