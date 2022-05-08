let parser = new DOMParser();

let xhr = new XMLHttpRequest();
let xmlArr;
let extrack;

xhr.open('GET', '/mellow.xml');
xhr.onreadystatechange = function () {
  if (xhr.readyState === XMLHttpRequest.DONE) {
    let status = xhr.status;
    if (status === 0 || (status >= 200 && status < 400)) {
      xmlMellow = xhr.responseText;
      xmlParsed = parser.parseFromString(xmlMellow, "text/xml");

      let tracklist = xmlParsed.children[0].children[0].children;
      for(let track of tracklist){
        trackToObject(track)
        appendTrackToList(track.children);
        extrack = track.children;
      }
    } else {
      console.error('There was a mistake with XHR of the track list');
    }
  }
}
xhr.send();

const $trackList = document.querySelector('.track-list');

function trackToObject(trackHTMLCollection) {
  result = [];
  return result;
}

function appendTrackToList(trackHTMLCollection){
  let $div = document.createElement('div');
  $div.className = 'track';
  $div.textContent = trackHTMLCollection[1].textContent;
  // [0] author [1] trackname [2] resource link
  $trackList.appendChild($div);
}
