var date;
var lowDate = new Date("04-28-2013");
var dateSelector = document.getElementById('mapDate');
var zoomSelector = document.getElementById('mapZoom');
var map = document.getElementById('map');
var mapContainer = document.getElementById("right");
var urlExtra = {
  date:"",
  zoom:"",
  scrollx:"",
  scrolly:"",
  width: window.innerWidth,
  height: window.innerHeight
};
var oldZoom = 1;


dateSelector.addEventListener('change', dateListener);
zoomSelector.addEventListener('change', zoomListener);
window.addEventListener("scroll", runOnScroll);
window.addEventListener("resize", runOnResize);
mapContainer.addEventListener("scroll", runOnScroll);

function runOnScroll(){
  urlExtra.scrollx = mapContainer.scrollLeft/map.width;
  urlExtra.scrolly = window.pageYOffset/map.height;
  history.pushState({}, "", "/?"+urlExtra.date+'/'+urlExtra.zoom+'/'+urlExtra.scrollx+'/'+urlExtra.scrolly+'/'+urlExtra.width+'/'+urlExtra.height);
}

function runOnResize(){
  urlExtra.width = window.innerWidth;
  urlExtra.height = window.innerHeight;
  history.pushState({}, "", "/?"+urlExtra.date+'/'+urlExtra.zoom+'/'+urlExtra.scrollx+'/'+urlExtra.scrolly+'/'+urlExtra.width+'/'+urlExtra.height);
}


function dateListener(){
  dateParts = `${dateSelector.value}`.split('-');
  date = new Date(`${dateParts[1]}-${dateParts[2]}-${dateParts[0]}`);
  if(date > lowDate) changeMap();
}

function zoomListener(){
  if(zoomSelector.value < 1){
    zoomSelector.value = 1;
  }
  var screenxper = (window.innerWidth)*(zoomSelector.value - oldZoom);
  var zoomscrollx = mapContainer.scrollLeft+mapContainer.scrollLeft*(zoomSelector.value - oldZoom) + screenxper/2;
  console.log(zoomscrollx);
  var screenyper = (window.innerHeight)*(zoomSelector.value - oldZoom);
  var zoomscrolly = window.pageYOffset+window.pageYOffset*(zoomSelector.value - oldZoom) + screenyper/2;

  document.documentElement.style.setProperty(`--zoom`, 80* (Math.pow(2,zoomSelector.value-1)) + 'em');
  urlExtra.zoom = zoomSelector.value;

  console.log(zoomscrollx);
  mapContainer.scrollLeft = zoomscrollx;
  window.scrollTo(0, zoomscrolly);

  history.pushState({}, "", "/?"+urlExtra.date+'/'+urlExtra.zoom+'/'+urlExtra.scrollx+'/'+urlExtra.scrolly+'/'+urlExtra.width+'/'+urlExtra.height);
  oldZoom = zoomSelector.value;
}

document.getElementById("zoomIn").addEventListener('click', function(){
  zoomSelector.value = parseFloat(zoomSelector.value) + .25;
  zoomListener();
});

document.getElementById("zoomOut").addEventListener('click', function(){
  zoomSelector.value = parseFloat(zoomSelector.value) - .25;
  zoomListener();
});

function changeMap(scrollY){
  storeScrollY = scrollY;
  if(!scrollY){
      storeScrollY = window.pageYOffset;
  }
  storeScrollX = mapContainer.scrollLeft;
  date.setHours(23);
  date.setMinutes(59);
  date.setSeconds(59);
  var data = JSON.stringify({year: date.getFullYear(), month: date.getMonth()+1, day: date.getDate()});

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/mapUpdate", true);
  xhr.setRequestHeader("Content-type","application/json");
  xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && xhr.status == 200) {
          var response = JSON.parse(xhr.responseText);
          if(xhr.responseText.includes("https:")){
            map.src = response.mapURL;
          }else{
            map.src = "https:"+response.mapURL;;
          }          
          urlExtra.date = response.mapDate.substring(0,10);
          urlExtra.zoom = zoomSelector.value;
          urlExtra.scrollx = storeScrollX/map.width;
          urlExtra.scrolly = storeScrollY/map.height;
          history.pushState({}, "", "/?"+urlExtra.date+'/'+urlExtra.zoom+'/'+urlExtra.scrollx+'/'+urlExtra.scrolly+'/'+urlExtra.width+'/'+urlExtra.height);
          dateSelector.value = urlExtra.date;
      }
  };
  xhr.send(data);
}

function showKey(){
  document.getElementById("keyDrop").classList.toggle('showKey');
}

function getMapInfo(){
  var url = window.location.href.split("/?")[1];
  if(url){
    var urlSplit = url.split("/");
    var urlSplit2;
    if(urlSplit.length == 1){
      urlSplit2 = urlSplit[0].split("%2F");
    } else{
      var urlSplit2 = urlSplit;
    }

    var xChange = (urlSplit2[4]-window.innerWidth)/2;
    var yChange = (urlSplit2[5]-window.innerHeight)/2;
    var dateparts = urlSplit2[0].split('-');
    date = new Date(dateparts[1]+'-'+dateparts[2]+'-'+dateparts[0]);
    zoomSelector.value = urlSplit2[1];
    zoomListener()
    mapContainer.scrollLeft = urlSplit2[2]*map.width + xChange;
    changeMap(urlSplit2[3]);
    setTimeout(function(){ window.scrollTo(0, urlSplit2[3]*map.height + yChange); }, 350);
  }else{
    date = new Date();
    changeMap();
  }
}
window.onload = getMapInfo;
