let canProceed = false;

function checkInput() {
  let url = document.getElementById('url').value;
  let startsWithHttp = url.startsWith('http://');
  let startsWithHttps = url.startsWith('https://');
  let startsWithwww = url.startsWith('www.');
  if (url == '') {
    canProceed = false;
    document.getElementById('url').style.background = 'gold';
  } else if (startsWithHttp || startsWithHttps || startsWithwww) {
    canProceed = true;
    document.getElementById('url').style.background = 'lime';
  } else {
    canProceed = false;
    document.getElementById('url').style.background = 'red';
  }
  
  if (canProceed) {
    document.getElementById('shorten-url').style.visibility = 'visible';
  } else {
    document.getElementById('shorten-url').style.visibility = 'hidden';
  }
}

function shortenUrl() {
  if (canProceed) { // this is more of a usability measure (make sure to implement check in backend too)
    let url = document.getElementById('url').value;
    window.location.href = 'https://minilink.glitch.me/new/' + url;
  }
}

document.getElementById('url').addEventListener('keypress', function(e) {
  if (e.keyCode == 13) {
    shortenUrl();
  }
});