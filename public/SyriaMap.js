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
var oldZoom = 100;


dateSelector.addEventListener('change', dateListener);
zoomSelector.addEventListener('change', zoomListener);
window.addEventListener("scroll", runOnScroll);
window.addEventListener("resize", runOnResize);
mapContainer.addEventListener("scroll", runOnScroll);

function runOnScroll(){
  urlExtra.scrollx = mapContainer.scrollLeft/map.clientWidth;
  urlExtra.scrolly = window.pageYOffset/mapContainer.clientHeight;
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
  if(zoomSelector.value < 100){
    zoomSelector.value = 100;
  }
  console.log(window.innerHeight);
  document.documentElement.style.setProperty(`--zoom`, 80 * zoomSelector.value/100 + 'em');
  urlExtra.zoom = zoomSelector.value;

  mapContainer.scrollLeft = mapContainer.scrollLeft+500*(zoomSelector.value - oldZoom)/100;
  window.scrollTo(0, window.pageYOffset+260*(zoomSelector.value - oldZoom)/100);

  history.pushState({}, "", "/?"+urlExtra.date+'/'+urlExtra.zoom+'/'+urlExtra.scrollx+'/'+urlExtra.scrolly+'/'+urlExtra.width+'/'+urlExtra.height);
  oldZoom = zoomSelector.value;
}

document.getElementById("zoomIn").addEventListener('click', function(){
  zoomSelector.value = parseInt(zoomSelector.value) + 50;
  zoomListener();
});

document.getElementById("zoomOut").addEventListener('click', function(){
  zoomSelector.value = parseInt(zoomSelector.value) - 50;
  zoomListener();
});

function changeMap(scrollY){
  storeScrollY = scrollY;
  if(!scrollY){
      storeScrollY = window.pageYOffset;
  }
  storeScrollX = mapContainer.scrollLeft;
  date.setDate(date.getDate()+1);
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
          urlExtra.scrollx = storeScrollX/map.clientWidth;
          urlExtra.scrolly = storeScrollY/mapContainer.clientHeight;
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
    mapContainer.scrollLeft = urlSplit2[2]*map.clientWidth + xChange;
    changeMap(urlSplit2[3]);
    setTimeout(function(){ window.scrollTo(0, urlSplit2[3]*mapContainer.clientHeight + yChange); }, 300);
  }else{
    date = new Date();
    changeMap();
  }
}
window.onload = getMapInfo;
