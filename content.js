var currentPlayingSong = "";
var lastPlayingSong = "";

var songPlayTime = 0.0;

var token;
var refreshToken;

var clientId = "6b71231841e2457480410c0c5a90d3b6";

var refresh = false;

var isSkippingSongs = false;

//localStorage.setItem("token", ""your token)
//localStorage.setItem("refreshToken", "Your refresh token")

refreshToken = localStorage.getItem("refreshToken");
token = localStorage.getItem("token");

var weights = localStorage.getItem("weights");

if (weights == null) {
  weights = {};
}

setInterval(async () => {
  songPlayTime += 0.2;
  const anchorElement = document.querySelector(
    'a[data-testid="context-item-link"]'
  );
  if (anchorElement) {
    const songTitle = anchorElement.textContent.trim();
    await updateCurrentSong(songTitle);
  } else {
    console.log("No song currently playing.");
  }
}, 200);

async function updateCurrentSong(songTitle) {
  if (songTitle == currentPlayingSong) {
    return;
  }
  currentPlayingSong = songTitle;
  await listeningToNewSong();
}

async function listeningToNewSong() {
  if (refresh) {
    return;
  }
  refresh = true;
  if (currentPlayingSong == lastPlayingSong) {
    songPlayTime = 0.0;
    return;
  }
  calcNewWieght(currentPlayingSong);
  lastPlayingSong = currentPlayingSong;
  var queueTracks = await getUseQue();
  await getNextSong(queueTracks);
}

function calcNewWieght(songName) {
  if (isSkippingSongs) {
    return;
  }

  if (!songName in weights) {
    weights[songName] = 8;
    return;
  }

  if (songPlayTime > 30.0) {
    weights[songName] = weights[songName] + 2;
    checkIf0or10(songName);
    return;
  }

  if (songPlayTime < 5.0) {
    weights[songName] = weights[songName] - 2;
    checkIf0or10(songName);
    return;
  }

  if (songPlayTime < 30.0) {
    weights[songName] = weights[songName] - 1;
    checkIf0or10(songName);
    return;
  }
}

function checkIf0or10(songName) {
  if (weights[songName] < 1) {
    weights[songName] = 1;
  }

  if (weights[songName] > 10) {
    weights[songName] = 10;
  }
  localStorage.setItem("weights", JSON.stringify(weights));
}

async function getNextSong(queue) {
  var songToPlay;
  var songPicked = false;
  var songIndex = 0;
  queue.queue.every((element, v) => {
    var isSongPicked = calcSongWeight(element);

    if (!isSongPicked) {
      return true;
    }
    songToPlay = element;
    songPicked = true;
    songIndex = v + 1;
    return false;
  });
  if (!songPicked) {
    noSongPicked();
  }
  currentPlayingSong = songToPlay;
  await makeSkips(songIndex);
}

async function makeSkips(numberOfSkips) {
  isSkippingSongs = true;
  for (let i = 0; i < numberOfSkips; i++) {
    setTimeout(async () => {
      await makeSkipCalls();
      `$`;
    }, 20);
  }
  isSkippingSongs = false;
}

async function makeSkipCalls() {
  await fetch("https://api.spotify.com/v1/me/player/next", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function noSongPicked() {
  console.log("No song picked");
  return;
  //cry
}

function calcSongWeight(songName) {
  console.log("hello world");
  if (!songName in weights) {
    weights[songName] = 8;
  }
  const songWeight = weights[songName];
  var randomNumber = Math.floor(Math.random() * 10) + 1;
  console.log(randomNumber);
  if (randomNumber >= songWeight) {
    return false;
  }

  return true;
}

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

