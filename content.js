let storageShows = JSON.parse(localStorage.getItem("genie-productions"));
let triggerReload = false;

const targetNode = document.getElementById("video");
const episodeId = targetNode.getAttribute("data-video-episode-id"); // Get episode id for later checks
const config = { attributes: true, childList: true, subtree: true };

// Observe changes to our parent video element, if we catch a 'childlist' mutation attach a 'play' event listener to the child video component.
// Once the play button is pressed we check to see if the episode id is already present in localStorage 
// If not we will reload the page, the id will now be present and have it's breaksWatched object overwritten, bypassing the ads.
const callback = function(mutationsList, observer) {
  for (let mutation of mutationsList) {
    if (mutation.type === "childList") { 
      let video = document.getElementsByClassName("genie-video is-off-page")[0];
      try {
        video.addEventListener("play", event => {
          triggerReload && location.reload();
        });
        observer.disconnect();
        break;
      } catch (err) {}
    }
  }
};

const observer = new MutationObserver(callback);
observer.observe(targetNode, config);

!episodeId || storageShows[episodeId] ? (triggerReload = false) : (triggerReload = true); // Check if the episodeId pulled from the video element is present in localStorage

// Map over the shows pulled from localStorage, then map over each show's keys
// If the key matches a 3 digit number we have found where the breaksWatched object is stored,
// the indexes key which keeps track of how many ads have been watched is then overwritten
// along with the timestamp which is just the current time - 30mins
Object.keys(storageShows).map(show => {
  Object.keys(storageShows[show]).map(showKey => {
    if (showKey.match(/^([\d]{3})$/)) {
      storageShows[show][showKey].breaksWatched = {
        indexes: [0, 1, 2, 3],
        timestamp: Date.now() - 1800000
      };
    }
  });
});

localStorage.setItem("genie-productions", JSON.stringify(storageShows));
