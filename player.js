let parser = new DOMParser();

let xhr = new XMLHttpRequest();
let trackObject;

xhr.open('GET', 'http://vip.aersia.net/roster-mellow.xml');
xhr.onreadystatechange = function () {
  if (xhr.readyState === XMLHttpRequest.DONE) {
    let status = xhr.status;
    if (status === 0 || (status >= 200 && status < 400)) {
      xmlMellow = xhr.responseText;
      xmlParsed = parser.parseFromString(xmlMellow, "text/xml");
      let tracklist = xmlParsed.children[0].children[0].children;
      trackObject = tracklistObject(tracklist);
      for(let track of trackObject){
        appendTrackToList(track);
      }
    } else {
      console.error('There was a mistake with XHR of the track list');
    }
  }
}
xhr.send();

const $trackList = document.querySelector('.track-list');

function tracklistObject(trackHTMLCollection) {
  let result = [];
  let next_id = 0;
  for (let track of trackHTMLCollection) {
    result.push({
      author: track.children[0].textContent,
      name: track.children[1].textContent,
      link: track.children[2].textContent,
      id: ++next_id
    })
  }
  return result;
}

function appendTrackToList(track){
  let $div = document.createElement('div');
  $div.className = `track t-${track.id}`;
  $div.textContent = track.name;
  // [0] author [1] trackname [2] resource link
  $trackList.appendChild($div);
}

let $audio = document.querySelector('#audio')

$trackList.addEventListener('click', function (event) {
  // The check is in case people click and drag the list, for some reason.
  if (event.target.className !== 'track-list') {
    let selected_id = event.target.classList[1].split('-')[1];
    console.log(trackObject[selected_id-1]);
    $audio.setAttribute('src', trackObject[selected_id - 1].link);
    $audio.play();
  }
});
