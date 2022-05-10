let parser = new DOMParser();

let xhr = new XMLHttpRequest();
let trackObject = tracklist.tracks;
let currentTrackIndex = null;
const $trackList = document.querySelector('.track-list');

window.addEventListener('load', function (e) {
  // Giving all the tracks ID numbers, which the player needs.
  for (let i = 0; i < trackObject.length; i++) {
    trackObject[i].id = i + 1;
  }

  for (let track of trackObject) {
    appendTrackToList(track);
  }
});

// xhr.open('GET', 'https://vip.aersia.net/roster-mellow.xml');
// xhr.onreadystatechange = function () {
//   if (xhr.readyState === XMLHttpRequest.DONE) {
//     let status = xhr.status;
//     if (status === 0 || (status >= 200 && status < 400)) {
//       xmlMellow = xhr.responseText;
//       xmlParsed = parser.parseFromString(xmlMellow, "text/xml");
//       let tracklist = xmlParsed.children[0].children[0].children;
//       trackObject = tracklistObject(tracklist);
//     } else {
//       console.error('There was a mistake with XHR of the track list');
//     }
//   }
// }
// xhr.send();

// function tracklistObject(trackHTMLCollection) {
//   let result = [];
//   let next_id = 0;
//   for (let track of trackHTMLCollection) {
//     result.push({
//       author: track.children[0].textContent,
//       name: track.children[1].textContent,
//       link: track.children[2].textContent
//     })
//   }
//   return result;
// }
// These two + JSON.stringify(trackobject, null, 0) gave me the contents of mellow.json.

function appendTrackToList(track) {
  let $div = document.createElement('div');
  $div.className = `track t-${track.id}`;
  if (track.name.includes(' - ')) {
    $div.textContent = track.name.split(' - ').slice(1).join('-')
  } else {
    $div.textContent = track.name;
  }
  // [0] author [1] trackname [2] resource link
  $trackList.appendChild($div);
}

let $audio = document.querySelector('#audio');
let volume = .5;
$audio.volume = volume;

let $nowPlaying = document.querySelector('.now-playing');

$trackList.addEventListener('click', function (event) {
  // The check is in case people click and drag the list, for some reason.
  if (event.target.className !== 'track-list') {
    let selected_id = event.target.classList[1].split('-')[1];
    currentTrackIndex = selected_id - 1;
    changeSelectedTrack(event.target);
    $audio.setAttribute('src', trackObject[currentTrackIndex].link);
    play();
  }
});

let $controls = document.querySelector('.controls');
let $btnPlay = document.querySelector('.lucide-play');
let $btnPause = document.querySelector('.lucide-pause');

$controls.addEventListener('click', function (event) {
  let targetclass = event.target.className;
  let checks = ['controls', 'volume-slider', 'timer']
  if (!checks.includes(targetclass)) {
    let target = event.target.closest('svg');
    let type = target.classList[1].split('-').slice(1).join('-');
    switch (type) {
      case 'pause':
        pause();
        break;
      case 'play':
        play();
        break;
      case 'volume-1': case 'volume-x':
        toggleMute();
        break;
      case 'skip-forward':
        playNextTrack();
        break;
      case 'skip-back':
        playPreviousTrack();
        break;
    }
  }
});

document.addEventListener("keyup", function (event) {
  event.preventDefault();
  const key = event.key; // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"
  switch (key) { // change to event.key to key to use the above variable
    case "ArrowLeft":
      $audio.currentTime -= 10;
      if ($audio.currentTime <= 0){
        playPreviousTrack();
      }
      break;
    case "ArrowRight":
      $audio.currentTime += 20;
      break;
    case "ArrowUp":
      $audio.volume += .05;
      break;
    case "ArrowDown":
      $audio.volume -= .05;
      break;
  }
});

function pause() {
  $audio.pause();
  $btnPlay.classList.remove('hidden');
  $btnPause.classList.add('hidden');
}

function play() {
  if (currentTrackIndex === null) {
    currentTrackIndex = -1;
    playNextTrack();
  }
  else {
    $audio.play();
  }
  $btnPlay.classList.add('hidden');
  $btnPause.classList.remove('hidden');
}

const $volumeUnMuted = document.querySelector('.lucide-volume-1');
const $volumeMuted = document.querySelector('.lucide-volume-x');
function toggleMute() {
  if ($volumeMuted.classList.contains('hidden')) {
    $audio.volume = 0;
  } else {
    $audio.volume = volume;
  }
  $volumeMuted.classList.toggle('hidden');
  $volumeUnMuted.classList.toggle('hidden');
}

function changeSelectedTrack(target) {
  $prev_selected = document.querySelector('.selected-track')
  if ($prev_selected) {
    $prev_selected.classList.remove('selected-track');
  }
  target.classList.add('selected-track');
  $nowPlaying.textContent = `${trackObject[currentTrackIndex].author} - ${trackObject[currentTrackIndex].name}`;
}

const $volumeSlider = document.querySelector('.volume-slider');
$volumeSlider.addEventListener('change', function (event) {
  volume = event.target.value / 100
  if ($volumeMuted.classList.contains('hidden')) {
    $audio.volume = volume;
  }
});

const $timer = document.querySelector('.timer');
$audio.ontimeupdate = () => {
  $timer.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
};

$audio.onended = () => {
  playNextTrack();
}

function playNextTrack() {
  if (currentTrackIndex === null) {
    currentTrackIndex = -1;
  }
  currentTrackIndex++;
  let $newTrack = document.querySelector(`.t-${currentTrackIndex + 1}`);
  if ($newTrack) {
    changeSelectedTrack($newTrack);
    $audio.setAttribute('src', trackObject[currentTrackIndex].link);
    play();
  } else {
    $nowPlaying.textContent = 'Currently Not Playing Any Track';
    $timer.textContent = '0:00 / 0:00';
    currentTrackIndex = null;
  }
}

function playPreviousTrack() {
  if (currentTrackIndex !== null) {
    if ($audio.currentTime > 3) {
      $audio.currentTime = 0;
    } else {
      currentTrackIndex--;
      let $newTrack = document.querySelector(`.t-${currentTrackIndex + 1}`);
      changeSelectedTrack($newTrack);
      $audio.setAttribute('src', trackObject[currentTrackIndex].link);
      play();
    }
  }
}

function formatTime(seconds) {
  seconds = ~~seconds;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m > 9 ? m : h ? '0' + m : m || '0', s > 9 ? s : '0' + s]
    .filter(a => a)
    .join(':')
}

// If hitting play while the page just loaded, it should load up the next song.
