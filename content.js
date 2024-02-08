var currentPlayingSong = "";
var lastPlayingSong = "";

var songPlayTime = 0.0;

var token;
var refreshToken;

var clientId = "6b71231841e2457480410c0c5a90d3b6";

var refresh = false;

//localStorage.setItem("token", ""your token)
//localStorage.setItem("refreshToken", "Your refresh token")

refreshToken = localStorage.getItem("refreshToken");
token = localStorage.getItem("token");

var weights = localStorage.getItem("weights");

setInterval(async () => {
  songPlayTime += 0.2;
  const anchorElement = document.querySelector(
    'a[data-testid="context-item-link"]'
  );
  if (anchorElement) {
    const songTitle = anchorElement.textContent.trim();
    await updateCurrentSong(songTitle);
    // You can perform further actions with the song title here
  } else {
    console.log("No song currently playing.");
  }
}, 200);

async function updateCurrentSong(songTitle) {
  if (songTitle == currentPlayingSong) {
    return;
  }
  currentPlayingSong = songTitle;
  var randomNumber = Math.floor(Math.random() * 10) + 1;
  await listeningToNewSong();
}

async function listeningToNewSong() {
  if (refresh) {
    return;
  }
  refresh = true;
  if (currentPlayingSong == lastPlayingSong) {
    songPlayTime = 0.0;
  }
  lastPlayingSong = currentPlayingSong;
  var queueTracks = await getUseQue();
  getNextSong(queueTracks);
}

function getNextSong(queue) {
  queue.queue.forEach((element) => {
    console.log(element);
  });
  console.log(queue.queue[2].name);
}

function getSongWeight() {}

async function getUseQue() {
  var queue;
  try {
    var response = await fetch("https://api.spotify.com/v1/me/player/queue", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status == "401") {
      console.log("throwing new error");
      throw new Error(response.status);
    }
    queue = await response.json();
  } catch (Error) {
    if (Error.message == 401) {
      await refreshAccessToken();
      return await getUseQue();
    }
  }
  return queue;
}

async function refreshAccessToken() {
  console.log(refreshToken);
  var response = await fetch("http://localhost:5107/api/refreshtoken", {
    method: "POST",
    body: JSON.stringify({ refreshToken: refreshToken }),
  });
  var result = await response.json();

  localStorage.setItem("token", result["access_token"]);
  token = result["access_token"];
  return;
}
