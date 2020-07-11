var express = require('express');
var exp = express()
var app = express.Router();
var request = require('request')


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
scopes = ['user-read-private', 'user-read-email','user-top-read']

var spotifyApi = new SpotifyWebApi({
  clientId: CLIENTID,
  clientSecret: CLIENTSECRET,
  redirectUri: URI + '/callback'
});


/*
 * EJS and variables setup
 */
 let Tracks = class  {
  constructor(topTracks) {
    this._tracks = topTracks;
  }
  get tracks() {
    return this._tracks;
  }
  set tracks(x) {
    this._tracks = x;
  }
}

let Artists = class  {
  constructor(topArtists) {
    this._artists = topArtists;
  }
  get artists() {
    return this._artists;
  }
  set artists(x) {
    this._artists = x;
  }
}

var topTracks = new Tracks("");
var topArtists = new Artists("");

exp.set('view engine', 'ejs');
exp.use(express.static(__dirname + '/public'));

// Initialize empty EJS variables here
app.get('/',function(req,res){
  res.render( 'index',{userData:"", playlist:"", tracksData:"", artistsData:""});
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
  } catch(err) {
    res.redirect('/#/error/invalid token');
  }

/*
 * Query Parameters for retrieving top songs and artists
 */

 // The number of entities to return. Default: 20. Minimum: 1. Maximum: 50
  const limit = 50;

 // Valid values: 
 // long_term (calculated from several years of data and including all new data as it becomes available)
 // medium_term (approximately last 6 months), 
 // short_term (approximately last 4 weeks).
  const timeRange = 'medium_term';

// Getting user's top artists
  var options = {
    url: 'https://api.spotify.com/v1/me/top/artists'+'?limit='+limit+"&time_range="+timeRange,
    headers: { 'Authorization': 'Bearer ' + spotifyApi.getAccessToken()},
    json: true
  };
  request.get(options, function(error, response, body) {
    topArtists.artists = body;
  });

// Getting user's top tracks
  options.url = 'https://api.spotify.com/v1/me/top/tracks'+'?limit='+limit+"&time_range="+timeRange;
  request.get(options, function(error, response, body) {
    topTracks.tracks = body;
  });

 res.redirect('/profile');
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
      next();
    },function(err) {
      console.log('Something went wrong!', err);
  });

});


app.use('/profile', function(req, res, next) {

  console.log(topTracks.tracks.items[0].album);

  // Display variables back to index
  res.render('index', {userData: res.locals.user, playlist: res.locals.playlist,
                       tracksData: topTracks.tracks, artistsData: topArtists.artists});

});

exp.use("/", app);
exp.listen(process.env.port || 8080);

console.log("Running at Port 8080");
