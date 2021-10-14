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
