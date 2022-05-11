let xhr = new XMLHttpRequest();
let parser = new DOMParser();

xhr.open('GET', 'https://vip.aersia.net/roster-mellow.xml');
xhr.onreadystatechange = function () {
  if (xhr.readyState === XMLHttpRequest.DONE) {
    let status = xhr.status;
    if (status === 0 || (status >= 200 && status < 400)) {
      xmlMellow = xhr.responseText;
      xmlParsed = parser.parseFromString(xmlMellow, "text/xml");
      let tracklist = xmlParsed.children[0].children[0].children;
      tracks = tracklistObject(tracklist);
    } else {
      console.error('There was a mistake with XHR of the track list');
    }
  }
}
xhr.send();

function tracklistObject(trackHTMLCollection) {
  let result = [];
  let next_id = 0;
  for (let track of trackHTMLCollection) {
    result.push({
      author: track.children[0].textContent,
      name: track.children[1].textContent,
      link: track.children[2].textContent
    })
  }
  return result;
}

// These two + JSON.stringify(trackobject, null, 0) gave me the contents of mellow.json.
// code isn't being used / served, but it's good to have if I ever need to pull other playlists from aersia.
