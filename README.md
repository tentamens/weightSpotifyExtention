a browser extension that adds weights to your songs that update dynamically depending on how long you listen
and skips songs depending on the weight

To run you will need three things 
* The front end: https://github.com/tentamens/weightSpotifyFrontend
* The backend: https://github.com/tentamens/weightSpotifyBackend
* The extension current repo

for the backend 
* add your Spotify client-id secret-id to the variables at the top
* dotnet build
* dotnet run

for the frontend
   just launch with live server ( you only need this once)

for the extension 
   Go to chrome://extensions press load unpacked and pick the directory of the source code

how before you can use the extension you need to get your token and refresh the token
* Launch the backend and frontend
* Click the button on the front-end which will redirect you
* Copy the token and the refresh-token from the response into lines 14 and 15 in content.js of the extension

now to use the extension
* With the token and refresh-token added run the extension once by going to https://open.spotify.com/
* Then delete those lines and refresh the extension in chrome://extensions

Now you're all set!

known issues
trying to skip back to a song that got skipped sorta breaks some things (it keeps running the weight just is add in a weird way)
if you try to play a different song it may skip it (not too much I can do)
you may get rate limited by Spotify by skipping (I may try to add skipping the songs by the browser in the future)
you always have to have a Spotify tab open (can't do anything about this I need it to check the currently playing song)
