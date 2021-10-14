# Upcoming Shows: Spotify Sync Google
A Google Apps Script app that syncs upcoming/past show playlists in Spotify with a Google Spreadsheet.


Built upon [Nico Welles](https://github.com/welles)'s [SpotifySyncGoogle](https://github.com/welles/SpotifySyncGoogle) Google Script.

## Info

This Google Script app takes in a list of artists and dates on a "main" sheet and then assembles three playlists on Spotify. The idea being to make playlists out of a concert calendar. The Upcoming Playlist comprises of events still in the future, with the closest event at the top of the playlist. The Past Playlist is events that have already happened, with the most recent at the top. The All Playlist is all the events descending from oldest to newest.

You will need to manually create the three playlists in Spotify and set their IDs as environmental variables in the setScriptProperties() function. You will also have to do this with the Spotify API's Client ID/Secret and Refresh Token.

Each playlist has two corresponding sheets: Current and Log. Current is the current listing of the playlist while Log is a log of what's been added and removed.

There is a menu that shows up in the Google spreadsheet labeled "Spotify." There you will find setup functions that will set the environmental variables and create/format the sheets, individual sync and reset options for each playlist, and sync/reset all. There is a 6 minute maximum runtime for non-business Google users (30 minutes for Business users). If you hit this limit you may need to run a function again. This can easily happen with the sync/reset all options. 

Resetting a playlist means removing every song on the playlist. This could take a while. Note the note above about maximum runtime. The Resize Current Sheets' Rows option resizes the Current sheets if they get whacked up.

In the Main sheet, putting an `x` (or anything) in the Headliner or Skip columns will affect its processing. Marking the Headliner option adds two songs from the artist to a playlist, while marking the Skip column will skip the artist entirely. If Spotify gets confused and returns the wrong artist, that artist will likely be skipped automatically. If that happens and you notice an artist is missing, get the Artist ID from an Artist's Spotify url: `https://open.spotify.com/artist/<THIS STRING OF CHARACTERS IS THE ARTIST ID>` and place it in the Override w/ Artist ID column. If a date is missing, an artist will be skipped. If there is a date but both the artist's name and override column are blank, the artist will be skipped.

![MainSheet](https://user-images.githubusercontent.com/34581105/160218075-20721bea-cb8f-4065-bc71-299d231439aa.png)


Last but not least, I have all the code separated into different scripts. If you want to copy a single file in instead of manually creating the scripts and pasting in their code, use the OneBigScriptToCopy.gs file. Obviously do one or the other when putting the code into Google Scripts and not both.


## Set Up


| Step      | Description |
| ----------- | ----------- |
| 1. Create a Blank Spreadsheet      | [Click here to create an empty spreadsheet.](https://sheet.new)       |
| 2. Input Code    | In the menu bar and of the spreadsheet, go to Extensions > Apps Script. In the code editor that pops up, select all and paste in the contents of OneBigScriptToCopy.gs. The file will be called Code.gs.       |
|3. Locate the environmental varibles function | It's at the top. It's called `function setScriptProperties()`. You will need to fill in `CLIENT_ID`, `CLIENT_SECRET`, `REFRESH_TOKEN`, `UPCOMING_PLAYLIST_ID`, `PAST_PLAYLIST_ID`, `ALL_PLAYLIST_ID`. |
|4. Create Spotify playlists and copy their playlist IDs | Go to the [Spotify web player](https://open.spotify.com/collection/playlists). Until Spotify inevitably messes with their UI for no good reason other than giggles, there is a Create Playlist option in the left sidebar. Name the playlists whatever you want, but copy the playlist ID out of the url in your browser's url bar when you go to one. Looks like this: `https://open.spotify.com/playlist/<THIS STRING OF CHARACTERS IS THE PLAYLIST ID>`. Copy the IDs into your environment variables function. So for the Upcoming Playlist, past it here: `scriptProperties.setProperty('UPCOMING_PLAYLIST_ID', 'PASTE THE PLAYLIST ID HERE BETWEEN THE SINGLE QUOTES');` Rinse repeat for all three. Yes I could have probably automated this, but I do not care enough. |
| 5. Sign up for Spotify's API and copy Client ID/Secret | This is where it's going to start getting a little complicated. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications). Log in. Accept their Terms of Service. Click the "Create An App" button. Name it whatever you want, put whatever you want into the description. In the page that follows, locate the Client ID and SHOW CLIENT SECRET under the title/description section on the left. Copy the Client ID into `scriptProperties.setProperty('CLIENT_ID', 'PASTE THE CLIENT ID HERE BETWEEN THE SINGLE QUOTES');` and after clicking SHOW CLIENT SECRET, the Client Secret into `scriptProperties.setProperty('CLIENT_SECRET', 'PASTE THE CLIENT SECRET HERE BETWEEN THE SINGLE QUOTES');`|
| 6. Get the refresh token | You're going to have to get the refresh token by doing the Oauth handshake somehow. Personally, I used this [Postman template](https://www.postman.com/postman/workspace/published-postman-templates/documentation/583-26c04ffa-4b20-f362-9d33-44b392af3a97) because it was easy. You'll have to sign up/download the app if you're not familiar but once you do, you can import this template into your workspace and it'll prefill most of the auth options. Google Script does have Oauth ability but you have to get approved and it takes a few days. So, if you're going the Postman route, in the same Spotify app page from step 5, click on the EDIT SETTINGS button and paste in `https://oauth.pstmn.io/v1/browser-callback`, if you're going to use the Postman website, or `https://www.getpostman.com/oauth2/callback`, if you're going to use the Postman app, into the Redirect URIs text entry box. Click Add. Click Save at the bottom. | 
| 7. Use Postman to handshake | Once you've saved the redirect url in the Spotify app and have signed up for Postman, follow these instructions: Open Postman, under a new request, click on the Authorization tab, select OAuth 2.0 on the left under Type and fill in these values: |


| Field      | Value |
| ----------- | ----------- |
| Token Name: | Anything your heart desires |
| Grant Type: | Authorization Code |
| Callback URL: | https://www.getpostman.com/oauth2/callback for the app, https://oauth.pstmn.io/v1/browser-callback for the browser |
| Auth URL: | https://accounts.spotify.com/authorize |
| Access Token URL: | https://accounts.spotify.com/api/token |
| Client ID: | Client ID from earlier |
| Client Secret: | Client Secret from earlier |
| Scope: | playlist-modify-public playlist-read-collaborative user-top-read playlist-read-private playlist-modify-private |

| Step (Cont)      | Description (Cont) |
| ----------- | ----------- |
| 7. Use Postman to handshake | Should look like this: <img width="300" alt="Postman Auth 1" src="https://user-images.githubusercontent.com/34581105/160216176-92be9961-d4c8-4d76-95db-96432bcbc249.png"> |
| 8. Complete OAuth Flow and get refresh token | Click on Get New Access Token (orange button at the bottom), go through the OAuth flow. Should look like this: <img width="300" alt="Postman Auth 2" src="https://user-images.githubusercontent.com/34581105/160216248-e58d9adf-b24a-4b04-8c30-68ba2819ab68.png">. Follow the steps. If everything goes right, this screen should pop up: <img width="300" alt="Postman Auth 3" src="https://user-images.githubusercontent.com/34581105/160216612-18f074c2-1d00-4124-93be-2d4d37460484.png">. Copy the refresh token you would see under the block box and paste it into `scriptProperties.setProperty('REFRESH_TOKEN', 'PASTE THE REFRESH TOKEN HERE BETWEEN THE SINGLE QUOTES');`|
| 9. Initialize the sheet | Hard part is done. Make sure you've saved the script editor, exit out and go back to the spreadsheet. Refresh the page. In the Spotify menu that pops up in the menu bar (it make take a second), go to the Set Up submenu and click the init option. You'll have an auth screen pop up, just follow the prompts. When you get to the scary "Google hasn’t verified this app" screen, click on `Advanced` (it's small, gray and looks like a link) and click `Go to Whatever your app is called (unsafe)`. Keep going through the prompts. Once you're finished, go to the Set Up submenu and click the init option again. Once that's finished, you can start filling in artists and dates on the Main page. When you're done, go back to the Spotify menu and click the Sync Playlists. Note my note from earlier about maximum runtime. |
| 10. (Optional) Time-based Triggers for Syncing | You can set time-based triggers in the Script Editor if you would like. I would do the Sync Playlists and Resize Current Rows functions. It's the little clock icon on the left of the script editor. |


