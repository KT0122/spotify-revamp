var express = require('express');
var exp = express()
var app = express.Router();
var request = require('request')
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
scopes = ['user-read-private', 'user-read-email','user-top-read']

var spotifyApi = new SpotifyWebApi({
  clientId: CLIENTID,
  clientSecret: CLIENTSECRET,
  redirectUri: URI + '/callback'
});


/*
 * EJS and variables setup
 */
var tracks = " ";
var artists = " ";

exp.use(express.static(__dirname + '/public'));

// Initialize empty EJS variables here
app.get('/',function(req,res){
  res.render( 'index',{userData:"", playlist:"", tracksData:"", artistsData:"", authCode:""});
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
    res.redirect('/#' +
          querystring.stringify({
            access_token: spotifyApi.getAccessToken(),
            refresh_token: spotifyApi.getRefreshToken()
          }))
  } catch(err) {
    res.redirect('/#/error/invalid token');
  }

});
        // var params = getHashParams();

        //     $.ajax({
        //         url: 'https://api.spotify.com/v1/me/tracks',
        //         headers: {
        //           'Authorization': 'Bearer ' + access_token
        //         },
        //         success: function(response) {
        //           console.log(response);
        //           for(var i=0; i<response.length; i++) {
        //             outputSongs(response,i);
        //           }
        //         }
        //     });

        // function outputSongs(item,i) {                
        //     $('#showSongs').append(                
        //       "<div class="grid-item">"+
        //          "<a href=" + item[i]["uri"] + "<img id='pl-img' src=" + item[i]["album"]["images"][0] + "</a> " +
        //          "<strong>" + item[i]["name"] + "</strong>"+
        //       "</div>"
        //     );
        // }
// app.get('/refresh_token', function(req, res) {

// // When our access token will expire
// var tokenExpirationEpoch;

// // First retrieve an access token
// spotifyApi.authorizationCodeGrant(req.query.code).then(
//   function(data) {
//     // Set the access token and refresh token
//     spotifyApi.setAccessToken(data.body['access_token']);
//     spotifyApi.setRefreshToken(data.body['refresh_token']);

//     // Save the amount of seconds until the access token expired
//     tokenExpirationEpoch =
//       new Date().getTime() / 1000 + data.body['expires_in'];
//     console.log(
//       'Retrieved token. It expires in ' +
//         Math.floor(tokenExpirationEpoch - new Date().getTime() / 1000) +
//         ' seconds!'
//     );
//   },
//   function(err) {
//     console.log(
//       'Something went wrong when retrieving the access token!',
//       err.message
//     );
//   },
// );

// // Continually print out the time left until the token expires..
// var numberOfTimesUpdated = 0;

// setInterval(function() {
//   console.log(
//     'Time left: ' +
//       Math.floor(tokenExpirationEpoch - new Date().getTime() / 1000) +
//       ' seconds left!'
//   );

//   // OK, we need to refresh the token. Stop printing and refresh.
//   if (++numberOfTimesUpdated > 5) {
//     clearInterval(this);

//     // Refresh token and print the new time to expiration.
//     spotifyApi.refreshAccessToken().then(
//       function(data) {
//         tokenExpirationEpoch =
//           new Date().getTime() / 1000 + data.body['expires_in'];
//         console.log(
//           'Refreshed token. It now expires in ' +
//             Math.floor(tokenExpirationEpoch - new Date().getTime() / 1000) +
//             ' seconds!'
//         );

//         res.redirect('/#' +
//           querystring.stringify({
//             access_token: spotifyApi.getAccessToken(),
//             refresh_token: spotifyApi.getRefreshToken()
//           }))
//       },
//       function(err) {
//         console.log('Could not refresh the token!', err.message);
//       }
//     );
//   }
// }, 1000);

// });

// /*
//  * Query Parameters for retrieving top songs and artists
//  */

//  // The number of entities to return. Default: 20. Minimum: 1. Maximum: 50
//   const limit = 50;

//  // Valid values: 
//  // long_term (calculated from several years of data and including all new data as it becomes available)
//  // medium_term (approximately last 6 months), 
//  // short_term (approximately last 4 weeks).
//   const timeRange = 'medium_term';

// // Getting user's top artists
//   var options = {
//     url: 'https://api.spotify.com/v1/me/top/artists'+'?limit='+limit+"&time_range="+timeRange,
//     headers: { 'Authorization': 'Bearer ' + spotifyApi.getAccessToken()},
//     json: true
//   };
//   request.get(options, function(error, response, body) {
//     artists = body;
//   });

// // Getting user's top tracks
//   options.url = 'https://api.spotify.com/v1/me/top/tracks'+'?limit='+limit+"&time_range="+timeRange;
//   request.get(options, function(error, response, body) {
//     tracks = body;
//   });
//  res.header('User', spotifyApi.getAccessToken())


// /*
//  * Profile's data
//  * TO-DO: Add most functions here to retrieve data and display it back  
//  */
//    var user;
//    var id;
//    var playlist;
// app.get('/profile', function(req, res) {
//     spotifyApi.refreshAccessToken().then(
//   function(data) {
//     console.log('The access token has been refreshed!');

//     // Save the access token so that it's used in future calls
//     spotifyApi.setAccessToken(data.body['access_token']);
//     res.header('User', spotifyApi.getAccessToken())
//   },
//   function(err) {
//     console.log('Could not refresh access token', err);
//   }
// );

//   spotifyApi.getMe()
//     .then(function(data) {
//       user = data.body;
//       id = data.body.id;

//     // Get a user's playlists
//     spotifyApi.getUserPlaylists(id)
//       .then(function(data) {
//         playlist = data.body;
//         var stringCode = spotifyApi.getAccessToken()
//       // Display variables back to index
//       res.render('index', {userData:user, playlist: playlist,
//                        tracksData: tracks, artistsData: artists, authCode: stringCode});
//       },function(err) {
//         console.log('Something went wrong!', err);
//     });

//     }, function(err) {
//       console.log('Something went wrong!', err);
//   });
 
  
// });



exp.use("/", app);
exp.listen(process.env.port || 8080);

console.log("Running at Port 8080");
