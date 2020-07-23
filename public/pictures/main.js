
  /**
    * Obtains parameters from the hash of the URL
    * @return Object
    */
  function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }
  // Get user info
  var params = getHashParams();

  var access_token = params.access_token,
      refresh_token = params.refresh_token,
      error = params.error;
  
function find(){
  console.log('enetred find()');
  var searchType = $('#search-form').serializeArray()[0].value;
  var searchTerm = $('#search-form').serializeArray()[1].value;
  console.log('searched for: ' + searchType + ', ' + searchTerm);
  $('#search-results').html('<p><strong>'+searchType[0].toUpperCase()
    +searchType.slice(1)+ ' results for </strong>'+searchTerm)+'</p>';
  console.log('1 we out here');
  if (error) {
    alert('There was an error during the search process');
  } else if(access_token) {

    console.log('2 we in here');
    $.ajax({
        url: 'https://api.spotify.com/v1/search?q='+searchTerm+'&type='+searchType+'&limit=6&offset=0',
        type: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + access_token
        },
        success: function(response) { 
            console.log('3 we in here'); 
            console.log(response)
            var items;
            eval("items = response."+searchType+"s.items;");
            for(var i=0; i<items.length; i++) {
              displayIndividualResults(items, i, searchType);
            }
        }
    });

    function displayIndividualResults(items, i, type){
      console.log('4 we in here');
      var result = "<div class='result-item'>";
      var name = ("<a href='" + items[i].external_urls.spotify + "' target='_blank'>"
          + "<h3>"+items[i].name+"</h3></a>");
      var image, artists, owners;
      if (type === "album") {
        image = ("<a class='result-img' href='" + items[i].external_urls.spotify + "' target='_blank'>"
          + "<img id='pl-img' src=" + img + " alt='No image available'></a>");
        
        artists = "<h5>"
        items[i].artists.forEach(function(artist, index){
          artists += "<a href='"+artist.external_urls.spotify+"' target='_blank'>"+artist.name+"</a>, ";
          //if (index > 4) {result += ...; break;}
          });
        //Remove last comma
        artists = artists.substr(0, artists.length-2);
        artists += "</h5>";
        owners = "";
      } else if (type === "artist") {
        var img;
        if (items[i].images[0]) {
          img = items[i].images[0].url
        } else {
          img = "./noImage.png"
        }
        image = ("<a class='result-img' href='" + items[i].external_urls.spotify + "' target='_blank'>"
          + "<img src=" + img + " alt='No image available'></a>");
        
        artists = "";
        owners = "";
      } else if (type === "track") {
        console.log('entered track search');
        var img;
        if (items[i].album.images[0]) {
          img = items[i].album.images[0].url
        } else {
          img = "./noImage.png"
        }
        console.log('img set');
        image = ("<a class='result-img' href='" + items[i].external_urls.spotify + "' target='_blank'>"
          + "<img src=" + img + " alt='No image available'></a>");
        
        artists = "<h5>"
        items[i].artists.forEach(function(artist, index){
          artists += "<a href='"+artist.external_urls.spotify+"' target='_blank'>"+artist.name+"</a>, ";
          //if (index > 4) {result += ...; break;}
          });
        //Remove last comma
        artists = artists.substr(0, artists.length-2);
        artists += "</h5>";
        owners = "";
      } else if (type === "playlist") {
        var img;
        if (items[i].images[0]) {
          img = items[i].images[0].url
        } else {
          img = "./noImage.png"
        }
        image = ("<a class='result-img' href='" + items[i].external_urls.spotify + "' target='_blank'>"
          + "<img src=" + img + " alt='No image available'></a>");
        
        artists = "";
        owners = "<a href='"+items[i].owner.external_urls.display_name+"' tarbet='_blank'>"+items[i].owner.display_name+"</a>";
      } else {
        console.log('5 type = ' + type);
      }
      // 
      result += image + name + owners + artists + "</div>";
      $('#search-results').append(result);
    }
  $('#loggedin').hide();
  }
}
