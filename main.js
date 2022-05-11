let parser = new DOMParser();

let xhr = new XMLHttpRequest();
let trackObject = tracklist.tracks;
let currentTrackIndex = null;
let playerActive = 0;
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
      case 'shuffle':
        shuffle();
        break;
    }
  }
});

document.addEventListener("keyup", function (event) {
  event.preventDefault();
  const key = event.key; // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"
  if (event.ctrlKey) {
    switch (key) {
      case "ArrowLeft":
        playPreviousTrack();
        break;
      case "ArrowRight":
        playNextTrack();
        break;
      case "ArrowUp":
        if (audio.volume <= .95) {
          $audio.volume += .05
          $volumeSlider.value = $audio.volume * 100;
        }
        break;
      case "ArrowDown":
        if (audio.volume >= .05) {
          $audio.volume -= .05
          $volumeSlider.value = $audio.volume * 100;
        }
        break;
    }
  } else if (playerActive) {
    switch (key) { // change to event.key to key to use the above variable
      case "ArrowLeft":
        $audio.currentTime -= 10;
        if ($audio.currentTime <= 0) {
          playPreviousTrack();
        }
        break;
      case "ArrowRight":
        $audio.currentTime += Math.max($audio.duration / 8, 15);
        break;
    }
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
  playerActive = 1;
}

function shuffle() {

  if (!playerActive) {
    scrambleTrackOrder();
    play();
  } else {
    let currentPlaying = trackObject.splice(currentTrackIndex, 1)
    scrambleTrackOrder();
    trackObject.unshift(currentPlaying[0]);
  }

  for (let i = 0; i < trackObject.length; i++) {
    delete trackObject[i].id;
    trackObject[i].id = i + 1;
  }

  while ($trackList.firstChild) {
    $trackList.firstChild.remove();
  }

  for (let track of trackObject) {
    appendTrackToList(track);
  }

  currentTrackIndex = 0;
  $firsttrack = document.querySelector('.t-1');
  changeSelectedTrack($firsttrack);
  document.body.scrollTop = document.documentElement.scrollTop = 0;
}

function scrambleTrackOrder() {
  let randomIndex;
  let shuffleIndex = trackObject.length;
  while (shuffleIndex != 0) {
    randomIndex = Math.floor(Math.random() * shuffleIndex);
    shuffleIndex--;
    [trackObject[shuffleIndex], trackObject[randomIndex]] = [
      trackObject[randomIndex], trackObject[shuffleIndex]];
  }
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
    setPlayerInactive();
  }
}

function playPreviousTrack() {
  if (currentTrackIndex !== null) {
    if ($audio.currentTime > 3) {
      $audio.currentTime = 0;
    } else {
      currentTrackIndex--;
      let $newTrack = document.querySelector(`.t-${currentTrackIndex + 1}`);
      if ($newTrack) {
        changeSelectedTrack($newTrack);
        $audio.setAttribute('src', trackObject[currentTrackIndex].link);
        play();
      } else {
        setPlayerInactive();
      }
    }
  }
}

function setPlayerInactive() {
  $nowPlaying.textContent = 'Currently Not Playing Any Track';
  $timer.textContent = '0:00 / 0:00';
  currentTrackIndex = null;
  $prev_selected = document.querySelector('.selected-track')
  if ($prev_selected) {
    $prev_selected.classList.remove('selected-track');
  }
  $audio.setAttribute('src', "");
  playerActive = 0;
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
