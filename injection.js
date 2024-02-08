// injection.js

function extractSongInfo() {
    const songTitleElement = document.querySelector('.now-playing .track-info__name');
    if (songTitleElement) {
        const songTitle = songTitleElement.textContent.trim();
        chrome.tabs.executeScript(tabs[0].id, { code: '(' + injectScript.toString() + ')()' });

    }
}

// Execute the extraction function
extractSongInfo();
