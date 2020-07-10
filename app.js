var express = require('express');
var exp = express()
var app = express.Router();

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
scopes = ['user-read-private', 'user-read-email']

var spotifyApi = new SpotifyWebApi({
  clientId: CLIENTID,
  clientSecret: CLIENTSECRET,
  redirectUri: URI + '/callback'
});


/*
 * EJS and variables setup
 */
exp.set('view engine', 'ejs');
exp.use(express.static(__dirname + '/public'));

// Initialize empty EJS variables here
app.get('/',function(req,res){
  res.render( 'index',{userData:"", playlist:""});
});


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

    res.redirect(URI + '/profile');
  } catch(err) {
    res.redirect('/#/error/invalid token');
  }
});


/*
 * Profile's data
 * TO-DO: Add most functions here to retrieve data and display it back  
 */
app.use('/profile', function(req, res, next) {

  spotifyApi.getMe()
    .then(function(data) {
      res.locals.user = data.body;
      res.locals.id = data.body.id;
      next()
    }, function(err) {
      console.log('Something went wrong!', err);
  });

});

app.use('/profile', function(req, res, next) {
  // Get a user's playlists
  spotifyApi.getUserPlaylists(res.locals.id)
    .then(function(data) {
      res.locals.playlist = data.body;
      next()
    },function(err) {
      console.log('Something went wrong!', err);
  });

});

app.use('/profile', function(req, res, next) {
  // Display variables back to index
  console.log("Retrieved playlists ", res.locals.playlist);
  res.render('index', {userData: res.locals.user, playlist: res.locals.playlist});

});

exp.use("/", app);
exp.listen(process.env.port || 8080);

console.log("Running at Port 8080");
