/*

SetUp.gs

*/

function setScriptProperties() {
    var scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.setProperty('CLIENT_ID', 'PASTE THE CLIENT ID HERE BETWEEN THE SINGLE QUOTES');
    scriptProperties.setProperty('CLIENT_SECRET', 'PASTE THE CLIENT SECRET HERE BETWEEN THE SINGLE QUOTES');
    scriptProperties.setProperty('REFRESH_TOKEN', 'PASTE THE REFRESH TOKEN HERE BETWEEN THE SINGLE QUOTES');
    scriptProperties.setProperty('SPREADSHEET_ID', SpreadsheetApp.getActiveSpreadsheet().getId());

    scriptProperties.setProperty('UPCOMING_PLAYLIST_ID', 'PASTE THE PLAYLIST ID HERE BETWEEN THE SINGLE QUOTES');
    scriptProperties.setProperty('UPCOMING_LOG_SHEET_NAME', 'UPCOMING LOG');
    scriptProperties.setProperty('UPCOMING_CURRENT_SHEET_NAME', 'UPCOMING CURRENT');

    scriptProperties.setProperty('PAST_PLAYLIST_ID', 'PASTE THE PLAYLIST ID HERE BETWEEN THE SINGLE QUOTES');
    scriptProperties.setProperty('PAST_LOG_SHEET_NAME', 'PAST LOG');
    scriptProperties.setProperty('PAST_CURRENT_SHEET_NAME', 'PAST CURRENT');

    scriptProperties.setProperty('ALL_PLAYLIST_ID', 'PASTE THE PLAYLIST ID HERE BETWEEN THE SINGLE QUOTES');
    scriptProperties.setProperty('ALL_LOG_SHEET_NAME', 'ALL LOG');
    scriptProperties.setProperty('ALL_CURRENT_SHEET_NAME', 'ALL CURRENT');

    scriptProperties.setProperty('MAIN_SHEET_NAME', 'MAIN');
}

function onOpen( ){
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Spotify')
    .addItem('Sync Upcoming Playlist', 'syncUpcoming')
    .addItem('Sync Past Playlist', 'syncPast')
    .addItem('Sync All Playlist', 'syncTheAllPlaylist')
    .addSeparator()
    .addItem('Sync Playlists', 'syncPlaylists')
    .addItem("Resize Current Sheets' Rows ", 'rowSizer')
    .addSeparator()
    .addSubMenu(ui.createMenu('Set Up')
        .addItem('Init', 'init')
        .addSeparator()
        .addItem('Set Script Properties', 'setScriptProperties')
        .addItem('Set Sheets', 'setUpSheets'))
    .addSubMenu(ui.createMenu('Advanced Options')
        .addItem('Reset Upcoming Playlist', 'resetUpcoming')
        .addItem('Reset Past Playlist', 'resetPast')
        .addItem('Reset All Playlist', 'resetTheAllPlaylist')
        .addSeparator()
        .addItem('Reset Playlists', 'resetPlaylists'))
    .addSeparator()
    .addItem('Scrape', 'scrape')
    .addToUi();
}

function init(){
  setScriptProperties();
  setUpSheets();
}

function setUpSheets(){
  var scriptProperties = PropertiesService.getScriptProperties();
  var spreadsheet = SpreadsheetApp.openById(scriptProperties.getProperty("SPREADSHEET_ID"));
  var mainSheetName = scriptProperties.getProperty("MAIN_SHEET_NAME");

  var upcomingLogSheetName = scriptProperties.getProperty("UPCOMING_LOG_SHEET_NAME");
  var upcomingCurrentSheetName = scriptProperties.getProperty("UPCOMING_CURRENT_SHEET_NAME");
  var pastLogSheetName = scriptProperties.getProperty("PAST_LOG_SHEET_NAME");
  var pastCurrentSheetName = scriptProperties.getProperty("PAST_CURRENT_SHEET_NAME");
  var allLogSheetName = scriptProperties.getProperty("ALL_LOG_SHEET_NAME");
  var allCurrentSheetName = scriptProperties.getProperty("ALL_CURRENT_SHEET_NAME");
   
  if (spreadsheet.getSheetByName(mainSheetName) == null){
    spreadsheet.insertSheet(mainSheetName);
    var mainSheet = spreadsheet.getSheetByName(mainSheetName);
    
    mainSheet.setRowHeight(1, 48);
    mainSheet.setRowHeights(2, 999, 28);
    mainSheet.setColumnWidth(1, 25);
    mainSheet.setColumnWidth(2, 153);
    mainSheet.setColumnWidth(3, 298);
    mainSheet.setColumnWidth(4, 155);
    mainSheet.setColumnWidth(5, 100);
    mainSheet.setColumnWidth(6, 238);
    mainSheet.setColumnWidth(7, 25);
    mainSheet.setColumnWidth(8, 200);
    mainSheet.getRange("B2:1000").setNumberFormat("m/d/yy (ddd)");

    var bold = SpreadsheetApp.newTextStyle().setBold(true).build();
    var largeFontSize = SpreadsheetApp.newTextStyle().setFontSize(18).build();
    var headerTitles = {
      "Date": mainSheet.getRange('B1'),
      "Artist": mainSheet.getRange('C1'),
      "Headliner": mainSheet.getRange('D1'),  
      "Skip": mainSheet.getRange('E1'),
    };
    for (const [key, value] of Object.entries(headerTitles)) {
      value.setRichTextValue(SpreadsheetApp.newRichTextValue()
                            .setText(`${key}`)
                            .setTextStyle(bold)
                            .setTextStyle(largeFontSize)
                            .build()
      );
    }

    var smallFontSize = SpreadsheetApp.newTextStyle().setFontSize(6).build();
    var hiddenColor = SpreadsheetApp.newTextStyle().setForegroundColor(standardColorObject.light_cornflower_blue_3).build();
    mainSheet.getRange('F1').setRichTextValue(SpreadsheetApp.newRichTextValue()
                            .setText("Override w/ Artist ID  .")
                            .setTextStyle(bold)
                            .setTextStyle(0, 11, smallFontSize)
                            .setTextStyle(11, 24, largeFontSize)
                            .setTextStyle(23, 24, hiddenColor)
                            .build()
    );

    mainSheet.getRange('B1:F1').setFontFamily("Merriweather").setBackgroundColor(standardColorObject.light_cornflower_blue_3);
    mainSheet.getRange("B1:F1000").setHorizontalAlignment("center").setVerticalAlignment("middle");

    var playlistLinks = {
      "Upcoming Playlist": 
        [
          mainSheet.getRange('H2'),
          `https://open.spotify.com/playlist/${scriptProperties.getProperty("UPCOMING_PLAYLIST_ID")}`
        ],
      "Past Playlist": 
        [
          mainSheet.getRange('H3'),
          `https://open.spotify.com/playlist/${scriptProperties.getProperty("PAST_PLAYLIST_ID")}`
        ],
      "All Playlist": 
        [
          mainSheet.getRange('H4'),
          `https://open.spotify.com/playlist/${scriptProperties.getProperty("ALL_PLAYLIST_ID")}`
        ],
    };
    for (const [key, value] of Object.entries(playlistLinks)) {
      value[0].setRichTextValue(SpreadsheetApp.newRichTextValue()
                            .setText(`${key}`)
                            .setLinkUrl(value[1])
                            .build()
      );
    }
    mainSheet.getRange("H:H").setHorizontalAlignment("right").setFontFamily("Merriweather");
    // mainSheet.getRange('H:H');

    var conditionalRulesRange = mainSheet.getRange("B2:F1000");
    var beforeRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied("=AND($B2 < TODAY(), if(ISBLANK($B2), false, true))")
    .setBackground(standardColorObject.light_orange_3)
    .setRanges([conditionalRulesRange])
    .build();
    var afterRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied("=AND($B2 >= TODAY(), if(ISBLANK($B2), false, true))")
    .setBackground(standardColorObject.light_green_3)
    .setRanges([conditionalRulesRange])
    .build();

    var rules = mainSheet.getConditionalFormatRules();
    rules.push(beforeRule);
    rules.push(afterRule);
    mainSheet.setConditionalFormatRules(rules);

    // Bottom on Header - Dashed
    mainSheet.getRange("B1:F1").setBorder(null, null, true, null, false, false, "black", SpreadsheetApp.BorderStyle.DASHED);
    // Left/Right on Header - Medium Solid
    mainSheet.getRange("B1:F1").setBorder(null, true, null, true, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    // Top on Header - Thick Solid
    mainSheet.getRange("B1:F1").setBorder(true, null, null, null, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_THICK);
    // Left/Right on Body - Medium Solid
    mainSheet.getRange("B2:F1000").setBorder(null, true, null, true, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    // Bottom on Last Row - Thick Solid
    mainSheet.getRange("B1000:F1000").setBorder(null, null, true, null, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_THICK);
  mainSheet.setFrozenRows(1);
  }

  if (spreadsheet.getSheetByName(upcomingCurrentSheetName) == null){
    spreadsheet.insertSheet(upcomingCurrentSheetName);
    upcomingCurrentSheet = spreadsheet.getSheetByName(upcomingCurrentSheetName);
    upcomingCurrentSheet.deleteRows(1, 999);
    upcomingCurrentSheet.deleteColumns(7,19);
    upcomingCurrentSheet.setColumnWidth(1, 90);
    upcomingCurrentSheet.setColumnWidth(2, 200);
    upcomingCurrentSheet.setColumnWidth(3, 200);
    upcomingCurrentSheet.setColumnWidth(4, 200);
    upcomingCurrentSheet.setColumnWidth(5, 120);
    upcomingCurrentSheet.setColumnWidth(6, 215);
    upcomingCurrentSheet.setColumnWidth(7, 43);
  }
  if (spreadsheet.getSheetByName(upcomingLogSheetName) == null){
    spreadsheet.insertSheet(upcomingLogSheetName);
    upcomingLogSheet = spreadsheet.getSheetByName(upcomingLogSheetName);
    upcomingLogSheet.deleteRows(1, 999);
    upcomingLogSheet.deleteColumns(8,18);
    upcomingLogSheet.setColumnWidth(3, 200);
    upcomingLogSheet.setColumnWidth(4, 200);
    upcomingLogSheet.setColumnWidth(5, 200);
    upcomingLogSheet.setColumnWidth(6, 120);
    upcomingLogSheet.setColumnWidth(7, 215);
    upcomingLogSheet.setColumnWidth(8, 43);
  }

  if (spreadsheet.getSheetByName(pastCurrentSheetName) == null){
    spreadsheet.insertSheet(pastCurrentSheetName);
    pastCurrentSheet = spreadsheet.getSheetByName(pastCurrentSheetName);
    pastCurrentSheet.deleteRows(1, 999);
    pastCurrentSheet.deleteColumns(7,19);
    pastCurrentSheet.setColumnWidth(1, 90);
    pastCurrentSheet.setColumnWidth(2, 200);
    pastCurrentSheet.setColumnWidth(3, 200);
    pastCurrentSheet.setColumnWidth(4, 200);
    pastCurrentSheet.setColumnWidth(5, 120);
    pastCurrentSheet.setColumnWidth(6, 215);
    pastCurrentSheet.setColumnWidth(7, 43);
  }
  if (spreadsheet.getSheetByName(pastLogSheetName) == null){
    spreadsheet.insertSheet(pastLogSheetName);
    pastLogSheet = spreadsheet.getSheetByName(pastLogSheetName);
    pastLogSheet.deleteRows(1, 999);
    pastLogSheet.deleteColumns(8,18);
    pastLogSheet.setColumnWidth(3, 200);
    pastLogSheet.setColumnWidth(4, 200);
    pastLogSheet.setColumnWidth(5, 200);
    pastLogSheet.setColumnWidth(6, 120);
    pastLogSheet.setColumnWidth(7, 215);
    pastLogSheet.setColumnWidth(8, 43);
  }

  if (spreadsheet.getSheetByName(allCurrentSheetName) == null){
    spreadsheet.insertSheet(allCurrentSheetName);
    allCurrentSheet = spreadsheet.getSheetByName(allCurrentSheetName);
    allCurrentSheet.deleteRows(1, 999);
    allCurrentSheet.deleteColumns(7,19);
    allCurrentSheet.setColumnWidth(1, 90);
    allCurrentSheet.setColumnWidth(2, 200);
    allCurrentSheet.setColumnWidth(3, 200);
    allCurrentSheet.setColumnWidth(4, 200);
    allCurrentSheet.setColumnWidth(5, 120);
    allCurrentSheet.setColumnWidth(6, 215);
    allCurrentSheet.setColumnWidth(7, 43);
  }
  if (spreadsheet.getSheetByName(allLogSheetName) == null){
    spreadsheet.insertSheet(allLogSheetName);
    allLogSheet = spreadsheet.getSheetByName(allLogSheetName);
    allLogSheet.deleteRows(1, 999);
    allLogSheet.deleteColumns(8,18);
    allLogSheet.setColumnWidth(3, 200);
    allLogSheet.setColumnWidth(4, 200);
    allLogSheet.setColumnWidth(5, 200);
    allLogSheet.setColumnWidth(6, 120);
    allLogSheet.setColumnWidth(7, 215);
    allLogSheet.setColumnWidth(8, 43);
  }

  if (spreadsheet.getSheetByName("Sheet1")) {
    spreadsheet.deleteSheet(spreadsheet.getSheetByName("Sheet1"));
  }
  rowSizer()
}

function rowSizer(){
  var scriptProperties = PropertiesService.getScriptProperties();
  var spreadsheet = SpreadsheetApp.openById(scriptProperties.getProperty("SPREADSHEET_ID"));
  var currentSheets = {
    "Upcoming Current": spreadsheet.getSheetByName(scriptProperties.getProperty("UPCOMING_CURRENT_SHEET_NAME")),
    "Past Current":  spreadsheet.getSheetByName(scriptProperties.getProperty("PAST_CURRENT_SHEET_NAME")),
    "All Current": spreadsheet.getSheetByName(scriptProperties.getProperty("ALL_CURRENT_SHEET_NAME")),
  };
  for (const [key, value] of Object.entries(currentSheets)) {
    var lastRow = value.getLastRow();
    if(lastRow){
      value.setRowHeights(1, lastRow, 90);
      value.getRange(1, 1, lastRow, 7).setHorizontalAlignment("center").setVerticalAlignment("middle").setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    } else {
      value.setRowHeight(1, 90);
      value.getRange(1, 1, 1, 7).setHorizontalAlignment("center").setVerticalAlignment("middle").setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP); 
    }
    Logger.log(`${key} Rows Resized`);
  }
}

/* Google Hex Colors courtesy of https://yagisanatode.com/2019/08/06/google-apps-script-hexadecimal-color-codes-for-google-docs-sheets-and-slides-standart-palette/
*/

var standardColorObject = {
  black:"#000000",
  dark_grey_4:"#434343",
  dark_grey_3:"#666666",
  dark_grey_2:"#999999",
  dark_grey_1:"#b7b7b7",
  grey:"#cccccc",
  light_grey_1:"#d9d9d9",
  light_grey_2:"#efefef",
  light_grey_3:"#f3f3f3",
  white:"#ffffff",
  red_berry:"#980000",
  red:"#ff0000",
  orange:"#ff9900",
  yellow:"#ffff00",
  green:"#00ff00",
  cyan:"#00ffff",
  cornflower_blue:"#4a86e8",
  blue:"#0000ff",
  purple:"#9900ff",
  magenta:"#ff00ff",
  light_red_berry_3:"#e6b8af",
  light_red_3:"#f4cccc",
  light_orange_3:"#fce5cd",
  light_yellow_3:"#fff2cc",
  light_green_3:"#d9ead3",
  light_cyan_3:"#d0e0e3",
  light_cornflower_blue_3:"#c9daf8",
  light_blue_3:"#cfe2f3",
  light_purple_3:"#d9d2e9",
  light_magenta_3:"#ead1dc",
  light_red_berry_2:"#dd7e6b",
  light_red_2:"#ea9999",
  light_orange_2:"#f9cb9c",
  light_yellow_2:"#ffe599",
  light_green_2:"#b6d7a8",
  light_cyan_2:"#a2c4c9",
  light_cornflower_blue_2:"#a4c2f4",
  light_blue_2:"#9fc5e8",
  light_purple_2:"#b4a7d6",
  light_magenta_2:"#d5a6bd",
  light_red_berry_1:"#cc4125",
  light_red_1:"#e06666",
  light_orange_1:"#f6b26b",
  light_yellow_1:"#ffd966",
  light_green_1:"#93c47d",
  light_cyan_1:"#76a5af",
  light_cornflower_blue_1:"#6d9eeb",
  light_blue_1:"#6fa8dc",
  light_purple_1:"#8e7cc3",
  light_magenta_1:"#c27ba0",
  dark_red_berry_1:"#a61c00",
  dark_red_1:"#cc0000",
  dark_orange_1:"#e69138",
  dark_yellow_1:"#f1c232",
  dark_green_1:"#6aa84f",
  dark_cyan_1:"#45818e",
  dark_cornflower_blue_1:"#3c78d8",
  dark_blue_1:"#3d85c6",
  dark_purple_1:"#674ea7",
  dark_magenta_1:"#a64d79",
  dark_red_berry_2:"#85200c",
  dark_red_2:"#990000",
  dark_orange_2:"#b45f06",
  dark_yellow_2:"#bf9000",
  dark_green_2:"#38761d",
  dark_cyan_2:"#134f5c",
  dark_cornflower_blue_2:"#1155cc",
  dark_blue_2:"#0b5394",
  dark_purple_2:"#351c75",
  dark_magenta_2:"#741b47",
  dark_red_berry_3:"#5b0f00",
  dark_red_3:"#660000",
  dark_orange_3:"#783f04",
  dark_yellow_3:"#7f6000",
  dark_green_3:"#274e13",
  dark_cyan_3:"#0c343d",
  dark_cornflower_blue_3:"#1c4587",
  dark_blue_3:"#073763",
  dark_purple_3:"#20124d",
  dark_magenta_3:"#4c1130"
};

/*

Auth.gs

*/

function getAccessToken() {
  var url = "https://accounts.spotify.com/api/token";
  var scriptProperties = PropertiesService.getScriptProperties();
  var clientId = scriptProperties.getProperty("CLIENT_ID");
  var clientSecret = scriptProperties.getProperty("CLIENT_SECRET");
  var refreshToken = scriptProperties.getProperty("REFRESH_TOKEN");

  var payload = {
    "grant_type": "refresh_token",
    "refresh_token": refreshToken,
  };
  var params =
  {
    method: "POST",
    headers: { "Authorization": "Basic " + Utilities.base64Encode(clientId + ":" + clientSecret) },
    payload: payload,
  };

  var data = getJsonResult(url, params);
  return data.access_token;
}

function getJsonResult(url, params) {
  //Override HTTP exception handling
  params.muteHttpExceptions = true;

  var response;
  var responseMessage;
  var tries = 0;

  do {
    tries++;
    try {
      response = UrlFetchApp.fetch(url, params);
      responseMessage = response.getResponseCode();
    }
    catch(exception) {
      response = null;
      responseMessage = exception;
    }    

    if (!isSuccess(response)) {
      Logger.log("Request [" + params.method + "] \"" + url + "\" failed with error \"" + responseMessage + "\". (Attempt #" + tries + ")");

      Utilities.sleep(5000);
    }
  }
  while (!isSuccess(response) && tries < 10)

  if (!isSuccess(response)) {
    throw "Request [" + params.method + "] \"" + url + "\" was not able to complete after " + tries + " attempts!";
  }

  var json = response.getContentText();
  // Logger.log(json);

  var data = JSON.parse(json);

  return data;
}

function isSuccess(response) {
  if (response != null && response.getResponseCode() >= 200 && response.getResponseCode() < 300) {
    return true;
  }

  return false;
}

/*

Sheet.gs

*/

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

/*

API.gs

*/

function getArtistTopTracks(accessToken,artistID){
    var url = "https://api.spotify.com/v1/artists/" + artistID + "/top-tracks?country=US";
    var params =
    {
      method: "GET",
      headers: { "Authorization": "Bearer " + accessToken },
    };

    var data = getJsonResult(url, params);
    Utilities.sleep(100);
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
    Utilities.sleep(100);
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
    Utilities.sleep(100);
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

/*

Main.gs

*/

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
        Utilities.sleep(100);
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
        Utilities.sleep(100);
      }
    }
    Logger.log("Playlist Editing Complete");
}

/*

Fuzzy.gs

*/

//https://gist.github.com/andrei-m/982927/0efdf215b00e5d34c90fdc354639f87ddc3bd0a5
function levenshtein_distance(a, b){
	var tmp;
	if (a.length === 0) { return b.length; }
	if (b.length === 0) { return a.length; }
	if (a.length > b.length) { tmp = a; a = b; b = tmp; }

	var i, j, res, alen = a.length, blen = b.length, row = Array(alen);
	for (i = 0; i <= alen; i++) { row[i] = i; }

	for (i = 1; i <= blen; i++) {
		res = i;
		for (j = 1; j <= alen; j++) {
			tmp = row[j - 1];
			row[j - 1] = res;
			res = Math.min(tmp + (b[i - 1] !== a[j - 1]), res + 1, row[j] + 1);
		}
		row[j - 1] = res; // This was the missing line
	}
	return res;
}
