// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'logSong') {
      console.log(`Song logged:`, request.songTitle);
      // You can perform any necessary actions with the song information here
    }
  });
  
  chrome.webNavigation.onCompleted.addListener((details) => {
    if (details.url.startsWith('https://open.spotify.com/')) {
      console.log('Spotify tab loaded. Hello, world!');
    }
  });
  