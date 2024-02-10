var currentPlayingSong = "";
var lastPlayingSong = "";
var justSkippedSong = ".";

var songPlayTime = 0.0;

var token;
var refreshToken;

var clientId = "6b71231841e2457480410c0c5a90d3b6";

var isSkippingSongs = false;

//localStorage.setItem("token", ""your token)
//localStorage.setItem("refreshToken", "Your refresh token")

refreshToken = localStorage.getItem("refreshToken");
token = localStorage.getItem("token");

var weights = localStorage.getItem("weights");

console.log(weights);

weights = {};

if (weights == null) {
  weights = {};
  localStorage.setItem("weights", JSON.stringify(weights));
}

setInterval(async () => {
  songPlayTime += 0.2;
  if (isSkippingSongs) {
    return;
  }
  const anchorElement = document.querySelector(
    'a[data-testid="context-item-link"]'
  );
  if (anchorElement) {
    const songTitle = anchorElement.textContent.trim();
    await updateCurrentSong(songTitle);
  } else {
  }
}, 200);

async function updateCurrentSong(songTitle) {
  if (songTitle == currentPlayingSong) {
    return;
  }
  if (isSkippingSongs) {
    return;
  }
  if (currentPlayingSong == justSkippedSong) {
    currentPlayingSong = songTitle;
    return;
  }
  currentPlayingSong = songTitle;
  await listeningToNewSong();
}

async function listeningToNewSong() {
  if (currentPlayingSong == lastPlayingSong) {
    songPlayTime = 0.0;
    return;
  }
  console.log(lastPlayingSong)
  calcNewWieght(lastPlayingSong);
  lastPlayingSong = currentPlayingSong;
  songPlayTime = 0.0;

  var result = calcSongWeight(currentPlayingSong);

  if (result) {
    return;
  }

  lastPlayingSong = currentPlayingSong;
  var queueTracks = await getUseQue();
  await getNextSong(queueTracks);
}

async function getNextSong(queue) {
  var songToPlay;
  var songPicked = false;
  var songIndex = 0;
  queue.queue.every((element, v) => {
    if (element == false || element == true) {
      return true;
    }
    var isSongPicked = calcSongWeight(element);

    if (!isSongPicked) {
      return true;
    }
    songToPlay = element.name;
    songPicked = true;
    songIndex = v + 1;
    return false;
  });

  if (!songPicked) {
    noSongPicked();
  }

  justSkippedSong = currentPlayingSong;
  currentPlayingSong = songToPlay;

  makeSkips(songIndex).then(() => {
    isSkippingSongs = false;
  });
}

async function makeSkips(numberOfSkips) {
  isSkippingSongs = true;
  for (let i = 0; i < numberOfSkips; i++) {
    await makeSkipCalls();
    await delay(20);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  return;
  //cry
}

function calcSongWeight(songName) {
  if (!weights.hasOwnProperty(songName)) {
    weights[songName] = 8.0;
  }
  const songWeight = weights[songName];
  var randomNumber = Math.floor(Math.random() * 10) + 1;
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
  var response = await fetch("http://localhost:5107/api/refreshtoken", {
    method: "POST",
    body: JSON.stringify({ refreshToken: refreshToken }),
  });
  var result = await response.json();

  localStorage.setItem("token", result["access_token"]);
  token = result["access_token"];
  return;
}

function calcNewWieght(songName) {
  console.log(weights);
  if (isSkippingSongs || songName == "") {
    return;
  }

  if (!weights.hasOwnProperty(songName)) {
    weights[songName] = 8;
    localStorage.setItem("weights", weights);
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
  if (weights[songName] < 0) {
    weights[songName] = 0;
  }
  if (weights[songName] > 10) {
    weights[songName] = 10;
  }
  localStorage.setItem("weights", JSON.stringify(weights));
  return;
}
