function syncPlaylists() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var spreadSheetId = scriptProperties.getProperty("SPREADSHEET_ID");
  var accessToken = getAccessToken();

  // Upcoming
  var upcomingArtists = iterateThroughRows(timePeriod="Upcoming");
  var savedUpcomingPlaylistId = scriptProperties.getProperty("UPCOMING_PLAYLIST_ID");
  var upcomingLogSheetName = scriptProperties.getProperty("UPCOMING_LOG_SHEET_NAME");
  var upcomingCurrentSheetName = scriptProperties.getProperty("UPCOMING_CURRENT_SHEET_NAME");
  runSync(spreadSheetId,accessToken,upcomingArtists,savedUpcomingPlaylistId,upcomingLogSheetName,upcomingCurrentSheetName);

  // Past
  var pastArtists = iterateThroughRows(timePeriod="Past");
  var savedPastPlaylistId = scriptProperties.getProperty("PAST_PLAYLIST_ID");
  var pastLogSheetName = scriptProperties.getProperty("PAST_LOG_SHEET_NAME");
  var pastCurrentSheetName = scriptProperties.getProperty("PAST_CURRENT_SHEET_NAME");
  runSync(spreadSheetId,accessToken,pastArtists,savedPastPlaylistId,pastLogSheetName,pastCurrentSheetName);

  // All Playlist
  var allPlaylistArtists = iterateThroughRows();
  var savedAllPlaylistId = scriptProperties.getProperty("ALL_PLAYLIST_ID");
  var allLogSheetName = scriptProperties.getProperty("ALL_LOG_SHEET_NAME");
  var allCurrentSheetName = scriptProperties.getProperty("ALL_CURRENT_SHEET_NAME");
  runSync(spreadSheetId,accessToken,allPlaylistArtists,savedAllPlaylistId,allLogSheetName,allCurrentSheetName);
}

function resetPlaylists(){
  var scriptProperties = PropertiesService.getScriptProperties();
  var accessToken = getAccessToken();
  var spreadSheetId = scriptProperties.getProperty("SPREADSHEET_ID");

  // Upcoming
  var savedUpcomingPlaylistId = scriptProperties.getProperty("UPCOMING_PLAYLIST_ID");
  var upcomingCurrentSheetName = scriptProperties.getProperty("UPCOMING_CURRENT_SHEET_NAME");
  resetPlaylist(spreadSheetId, accessToken, savedUpcomingPlaylistId, upcomingCurrentSheetName);

  // Past
  var savedPastPlaylistId = scriptProperties.getProperty("PAST_PLAYLIST_ID");
  var pastCurrentSheetName = scriptProperties.getProperty("PAST_CURRENT_SHEET_NAME");
  resetPlaylist(spreadSheetId, accessToken, savedPastPlaylistId, pastCurrentSheetName);
  
  
  // All Playlist
  var savedAllPlaylistId = scriptProperties.getProperty("ALL_PLAYLIST_ID");
  var allCurrentSheetName = scriptProperties.getProperty("ALL_CURRENT_SHEET_NAME");
  resetPlaylist(spreadSheetId, accessToken, savedAllPlaylistId, allCurrentSheetName);
}

function syncUpcoming() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var accessToken = getAccessToken();
  var spreadSheetId = scriptProperties.getProperty("SPREADSHEET_ID");
  
  var upcomingArtists = iterateThroughRows(timePeriod="Upcoming");
  var savedUpcomingPlaylistId = scriptProperties.getProperty("UPCOMING_PLAYLIST_ID");

  var upcomingLogSheetName = scriptProperties.getProperty("UPCOMING_LOG_SHEET_NAME");
  var upcomingCurrentSheetName = scriptProperties.getProperty("UPCOMING_CURRENT_SHEET_NAME");

  Logger.log("Upcoming Playlist Sync Starting");
  runSync(spreadSheetId,accessToken,upcomingArtists,savedUpcomingPlaylistId,upcomingLogSheetName,upcomingCurrentSheetName);
  Logger.log("Upcoming Playlist Sync Complete");
}

function resetUpcoming(){
  var scriptProperties = PropertiesService.getScriptProperties();
  var accessToken = getAccessToken();
  var spreadSheetId = scriptProperties.getProperty("SPREADSHEET_ID");

  var savedUpcomingPlaylistId = scriptProperties.getProperty("UPCOMING_PLAYLIST_ID");
  var upcomingCurrentSheetName = scriptProperties.getProperty("UPCOMING_CURRENT_SHEET_NAME");

  Logger.log("Upcoming Playlist Reset Starting");
  resetPlaylist(spreadSheetId, accessToken, savedUpcomingPlaylistId, upcomingCurrentSheetName);
  Logger.log("Upcoming Playlist Reset Complete");
}

function syncPast() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var accessToken = getAccessToken();
  var spreadSheetId = scriptProperties.getProperty("SPREADSHEET_ID");

  var pastArtists = iterateThroughRows(timePeriod="Past");
  var savedPastPlaylistId = scriptProperties.getProperty("PAST_PLAYLIST_ID");  

  var pastLogSheetName = scriptProperties.getProperty("PAST_LOG_SHEET_NAME");
  var pastCurrentSheetName = scriptProperties.getProperty("PAST_CURRENT_SHEET_NAME");

  Logger.log("Past Playlist Sync Starting");
  runSync(spreadSheetId,accessToken,pastArtists,savedPastPlaylistId,pastLogSheetName,pastCurrentSheetName);
  Logger.log("Past Playlist Sync Complete");
}

function resetPast() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var accessToken = getAccessToken();
  var spreadSheetId = scriptProperties.getProperty("SPREADSHEET_ID");

  var savedPastPlaylistId = scriptProperties.getProperty("PAST_PLAYLIST_ID");
  var pastCurrentSheetName = scriptProperties.getProperty("PAST_CURRENT_SHEET_NAME");

  Logger.log("Past Playlist Reset Starting");
  resetPlaylist(spreadSheetId, accessToken, savedPastPlaylistId, pastCurrentSheetName);
  Logger.log("Past Playlist Reset Complete");
}

function syncTheAllPlaylist() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var accessToken = getAccessToken();
  var spreadSheetId = scriptProperties.getProperty("SPREADSHEET_ID");
  
  var allPlaylistArtists = iterateThroughRows();
  var savedAllPlaylistId = scriptProperties.getProperty("ALL_PLAYLIST_ID");

  var allLogSheetName = scriptProperties.getProperty("ALL_LOG_SHEET_NAME");
  var allCurrentSheetName = scriptProperties.getProperty("ALL_CURRENT_SHEET_NAME");

  Logger.log("All Playlist Sync Starting");
  runSync(spreadSheetId,accessToken,allPlaylistArtists,savedAllPlaylistId,allLogSheetName,allCurrentSheetName);
  Logger.log("All Playlist Sync Complete");
}

function resetTheAllPlaylist(){
  var scriptProperties = PropertiesService.getScriptProperties();
  var accessToken = getAccessToken();
  var spreadSheetId = scriptProperties.getProperty("SPREADSHEET_ID");
  
  var savedAllPlaylistId = scriptProperties.getProperty("ALL_PLAYLIST_ID");
  var allCurrentSheetName = scriptProperties.getProperty("ALL_CURRENT_SHEET_NAME");

  Logger.log("All Playlist Reset Starting");
  resetPlaylist(spreadSheetId, accessToken, savedAllPlaylistId, allCurrentSheetName);
  Logger.log("All Playlist Reset Complete");
}

function runSync(spreadSheetId, accessToken, artists, playlistId, logSheetName, currentSheetName){
  var topTracks = getTopTracks(accessToken, artists);
  var savedSongs = getPlaylistSongs(accessToken, playlistId);

  Logger.log("Saved Songs: " + savedSongs.length);

  var addedSongs = topTracks.filter(s => !savedSongs.map(x => x.track.id).includes(s.id)).reverse();

  Logger.log("Added Songs: " + addedSongs.length);

  // for (var i = 0; i < addedSongs.length; i++) {
  //   Logger.log("Adding \"%s\" by %s to saved songs...", addedSongs[i].name, addedSongs[i].artists[0].name);
    
  //   addSongToPlaylist(accessToken, addedSongs[i].uri, playlistId);

  //   Utilities.sleep(5000);
  // }

  var removedSongs = savedSongs.filter(s => !topTracks.map(x => x.id).includes(s.track.id));

  Logger.log("Removed Songs: " + removedSongs.length);

  // for (var i = 0; i < removedSongs.length; i++) {
  //   Logger.log("Removing \"%s\" by %s from saved songs...", removedSongs[i].track.name, removedSongs[i].track.artists[0].name);
    
  //   removeSongFromPlaylist(accessToken, removedSongs[i].track.uri, playlistId);

  //   // This is a nifty idea but I'm deleting it for the moment. If you want it, add the savedArchivePlaylistId back in as a parameter function, save the playlist id as a env variable and uncomment this.
  //   // addSongToPlaylist(accessToken, removedSongs[i].track.uri, savedArchivePlaylistId);
    
  //   Utilities.sleep(5000);
  // }

  syncTracks(accessToken,playlistId,getTopTracksURIs(topTracks));

  if (addedSongs.length > 0) {
    Logger.log("Adding added songs to sheet...");

    addSheetEntriesForAddedSongs(spreadSheetId, addedSongs, logSheetName);
  }

  if (removedSongs.length > 0) {
    Logger.log("Adding removed songs to sheet...");

    addSheetEntriesForRemovedSongs(spreadSheetId, removedSongs, logSheetName);
  }

  if (addedSongs.length > 0 || removedSongs.length > 0) {
    Logger.log("Updating current songs list sheet...");

    updateCurrentSongListSheet(spreadSheetId, topTracks, currentSheetName);
  }

  Logger.log("Finished successfully!");
}

function resetPlaylist(spreadSheetId, accessToken, playlistId, currentSheetName){
  var removedSongs = getPlaylistSongs(accessToken, playlistId);

  Logger.log("Removed Songs: " + removedSongs.length);

  for (var i = 0; i < removedSongs.length; i++) {
    Logger.log("Removing \"%s\" by %s from saved songs...", removedSongs[i].track.name, removedSongs[i].track.artists[0].name);
    removeSongFromPlaylist(accessToken, removedSongs[i].track.uri, playlistId);    
    Utilities.sleep(5000);
  }

  var spreadSheet = SpreadsheetApp.openById(spreadSheetId);
  var currentSheet = spreadSheet.getSheetByName(currentSheetName);
  currentSheet.clearContents();
}

function getTopTracks(accessToken,artists){
  var topTracks = [];
  artists.forEach(function(value, index, array) {
    var artistName = (value['idBackUp'] ? getArtistName(accessToken, value['idBackUp']).toLowerCase() : value['artist'].toLowerCase());
    var artistID = (value['idBackUp'] ? value['idBackUp'] : getArtistID(accessToken, encodeURIComponent(value['artist'])));

    if (artistID){
      var artistTopTracks = getArtistTopTracks(accessToken,artistID);

      var trackIndex = 1;
      if(value['headliner']){
        trackIndex = 0;
      }

      while (trackIndex < 2) {
        trackIndex++;
        if (artistTopTracks[trackIndex]) {
          if(levenshtein_distance(artistTopTracks[trackIndex]['artists'][0]['name'].toLowerCase(), artistName) <= 2){
            topTracks = topTracks.concat(artistTopTracks[trackIndex]);
          } else {
            artistTopTracks.splice(trackIndex);
            trackIndex--;
          }
        } 
      }
  };
  Logger.log("Artist no. " + index + ", " + topTracks.length + " total tracks loaded.")
  });
  return topTracks;
}

function getTopTracksURIs(topTracks){
  var topTracksURIs = [];
  topTracks.forEach(function (track) {
    topTracksURIs = topTracksURIs.concat("spotify%3Atrack%3A" + track.id + "%2C");
  });
  return topTracksURIs;
}

function syncTracks(accessToken, playlistID, rangeArray){
    Logger.log("Playlist Editing Starting");

    var size = 30;
    var arrayOfArrays = [];
    for (var i = 0; i < rangeArray.length; i+=size) {
        arrayOfArrays.push(rangeArray.slice(i,i+size));
    }

    for (var p = 0; p < arrayOfArrays.length; p++) {
      if ( p == 0) {
        var payload = {
          range_start: 1,
          insert_before: 1,
          range_length: 30,
        };

        var orderedTracks = "";
        arrayOfArrays[p].forEach(function (track) {
            orderedTracks = orderedTracks.concat(track);
        });

        var url = "https://api.spotify.com/v1/playlists/" + playlistID + "/tracks?uris=" +  orderedTracks;        
        var params =
        {
          method: "PUT",
          headers: { "Authorization": "Bearer " + accessToken },
          payload: JSON.stringify(payload)
        };
        getJsonResult(url, params);
      }
       else {
        var orderedTracks = "";
        arrayOfArrays[p].forEach(function (track) {
            orderedTracks = orderedTracks.concat(track);
        });

        var url = "https://api.spotify.com/v1/playlists/" + playlistID + "/tracks?uris=" +  orderedTracks;
        var params =
        {
          method: "POST",
          headers: { "Authorization": "Bearer " + accessToken },
        };
        getJsonResult(url, params);
      }
    }
    Logger.log("Playlist Editing Complete");
}
