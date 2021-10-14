function getArtistTopTracks(accessToken,artistID){
    var url = "https://api.spotify.com/v1/artists/" + artistID + "/top-tracks?country=US";
    var params =
    {
      method: "GET",
      headers: { "Authorization": "Bearer " + accessToken },
    };

    var data = getJsonResult(url, params);
    return data['tracks'];
}

function getArtistName(accessToken,artistID){
    var url = "https://api.spotify.com/v1/artists/" + artistID;
    var params =
    {
      method: "GET",
      headers: { "Authorization": "Bearer " + accessToken },
    };

    var data = getJsonResult(url, params);
    return data['name'];
}

function getArtistID(accessToken,artistName){
    var artists = [];

    var killswitch = 0;

    do {
      var url = "https://api.spotify.com/v1/search?q=" + artistName + "&type=artist&limit=1&offset=" + artists.length;
      var params =
      {
        method: "GET",
        headers: { "Authorization": "Bearer " + accessToken },
      };

      var data = getJsonResult(url, params);

      killswitch++;

      artists = artists.concat(data);
    }
    while (artists.length < data.total && killswitch < 1);
    return (artists[0]['artists']['items'].length ? artists[0]['artists']['items'][0]['id'] : false);
}

function addSongToPlaylist(accessToken, songUri, playlistId) {
  var payload =
  {
    position: 0,
    uris: [songUri]
  };

  var url = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks";
  var params =
  {
    method: "POST",
    headers: { "Authorization": "Bearer " + accessToken },
    payload: JSON.stringify(payload)
  };

  var data = getJsonResult(url, params);
}

function removeSongFromPlaylist(accessToken, songUri, playlistId) {
  var payload =
  {
    tracks: [{uri: songUri}]
  };

  var url = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks";
  var params =
  {
    method: "DELETE",
    headers: { "Authorization": "Bearer " + accessToken },
    payload: JSON.stringify(payload)
  };

  var data = getJsonResult(url, params);
}

function getPlaylistSongs(accessToken, playlistId) {
  var playlistSongs = [];

  do {
    var url = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks?offset=" + playlistSongs.length;
    var params =
    {
      method: "GET",
      headers: { "Authorization": "Bearer " + accessToken },
    };

    var data = getJsonResult(url, params);

    playlistSongs = playlistSongs.concat(data.items);
  }
  while (playlistSongs.length < data.total);

  return playlistSongs;
}

// Unused for the right now, from the original library: https://github.com/welles/SpotifySyncGoogle
function getLikedSongs(accessToken) {
  var likedSongs = [];

  var killswitch = 0;

  do {
    var url = "https://api.spotify.com/v1/me/tracks?offset=" + likedSongs.length;
    var params =
    {
      method: "GET",
      headers: { "Authorization": "Bearer " + accessToken },
    };

    var data = getJsonResult(url, params);
    Logger.log(data)

    killswitch++;

    likedSongs = likedSongs.concat(data.items);
  }
  while (likedSongs.length < data.total && killswitch < 1);

  return likedSongs;
}
