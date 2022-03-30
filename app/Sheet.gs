function iterateThroughRows(timePeriod="All") {
  var scriptProperties = PropertiesService.getScriptProperties();
  var spreadSheetId = scriptProperties.getProperty("SPREADSHEET_ID");
  var mainSheetName = scriptProperties.getProperty("MAIN_SHEET_NAME");

  var spreadSheet = SpreadsheetApp.openById(spreadSheetId);
  var currentSheet = spreadSheet.getSheetByName(mainSheetName);
  var data = currentSheet.getDataRange().getValues();
  data.shift(); // Get rid of header row

  var todayDate = Utilities.formatDate(new Date(), "EST", "yyyy-MM-dd"); 

  returnArtists = []

  if (timePeriod == 'Upcoming') {
    data.forEach(function (row) {
      if(row[1] && (row[2].length > 0 || row[5].length > 0)){
        if (row[4].length == 0.0){
          showDate = Utilities.formatDate(row[1], "GMT", "yyyy-MM-dd");
          if(showDate >= todayDate) {
            artistInfo = {
                artist: row[2],
                headliner: (row[3].length == 0.0 ? false : true),
                idBackUp: (row[5].length == 0.0 ? false : row[5]),

            };
            returnArtists = returnArtists.concat(artistInfo);
          };
        };
      };
    });
  } else if (timePeriod == 'Past'){
    data.forEach(function (row) {
      if(row[1] && (row[2].length > 0 || row[5].length > 0)){
        if (row[4].length == 0.0){
          showDate = Utilities.formatDate(row[1], "GMT", "yyyy-MM-dd");
          if(showDate < todayDate) {
            artistInfo = {
                artist: row[2],
                headliner: (row[3].length == 0.0 ? false : true),
                idBackUp: (row[5].length == 0.0 ? false : row[5]),
            };
            returnArtists = returnArtists.concat(artistInfo);
          };
        };
      };
    });
    returnArtists.reverse();
  } else { // Both Upcoming and Past i.e "All"
    data.forEach(function (row) {
      if(row[1] && (row[2].length > 0 || row[5].length > 0)){
        if (row[4].length == 0.0){
            artistInfo = {
                artist: row[2],
                headliner: (row[3].length == 0.0 ? false : true),
                idBackUp: (row[5].length == 0.0 ? false : row[5]),
            };
            returnArtists = returnArtists.concat(artistInfo);
        };
      };
    });
  };
  return returnArtists;
}

function updateCurrentSongListSheet(spreadSheetId, likedSongs, currentSheetName) {
  var spreadSheet = SpreadsheetApp.openById(spreadSheetId);
  var currentSheet = spreadSheet.getSheetByName(currentSheetName);

  currentSheet.clearContents();

  var maxRows = currentSheet.getMaxRows();
  if (maxRows < likedSongs.length) {
    currentSheet.insertRows(1, likedSongs.length - maxRows);
  }
  else if (likedSongs.length < maxRows) {
    currentSheet.deleteRows(1, maxRows - likedSongs.length);
  }

  var currentSongs = [];

  for (var i = 0; i < likedSongs.length; i++) {
    var song = likedSongs[i];
    var date = Utilities.formatDate(new Date(), "GMT-05:00", "yyyy-MM-dd HH:mm"); // "yyyy-MM-dd'T'HH:mm:ss'Z'"
    
    var songInfo = [
      `=IMAGE(\"${song.album.images[0].url}\")`,
      song.name,
      song.artists[0].name,
      song.album.name,
      date,
      // Utilities.formatDate(new Date(song.added_at), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"),
      song.id,
      `=HYPERLINK(\"https://open.spotify.com/track/${song.id}\";\"Link\")`
    ];
    
    currentSongs.push(songInfo);
  }

  currentSheet.getRange(1, 1, likedSongs.length, 7).setValues(currentSongs);
}

function addSheetEntriesForAddedSongs(spreadSheetId, addedSongs, logSheetName) {
  var spreadSheet = SpreadsheetApp.openById(spreadSheetId);
  var logSheet = spreadSheet.getSheetByName(logSheetName);

  for (var i = 0; i < addedSongs.length; i++) {
    var song = addedSongs[i];
    var date = Utilities.formatDate(new Date(), "GMT-05:00", "yyyy-MM-dd HH:mm"); // "yyyy-MM-dd'T'HH:mm:ss'Z'"
    var songInfo = [
      "Added",
      `=IMAGE(\"${song.album.images[0].url}\")`,
      song.name,
      song.artists[0].name,
      song.album.name,
      date,
      // Utilities.formatDate(new Date(song.added_at), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"),
      song.id,
      `=HYPERLINK(\"https://open.spotify.com/track/${song.id}\";\"Link\")`
    ];
    logSheet.appendRow(songInfo);
  }
}

function addSheetEntriesForRemovedSongs(spreadSheetId, removedSongs, logSheetName) {
  var spreadSheet = SpreadsheetApp.openById(spreadSheetId);
  var logSheet = spreadSheet.getSheetByName(logSheetName);

  for (var i = 0; i < removedSongs.length; i++) {
    var song = removedSongs[i];
    var date = Utilities.formatDate(new Date(), "GMT-05:00", "yyyy-MM-dd HH:mm"); // "yyyy-MM-dd'T'HH:mm:ss'Z'"
    var songInfo = [
      "Removed",
      `=IMAGE(\"${song.track.album.images[0].url}\")`,
      song.track.name,
      song.track.artists[0].name,
      song.track.album.name,
      date,
      // Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"),
      song.track.id,
      `=HYPERLINK(\"https://open.spotify.com/track/${song.track.id}\";\"Link\")`
    ];
    logSheet.appendRow(songInfo);
  }
}
