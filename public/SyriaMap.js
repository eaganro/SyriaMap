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
  scrolly:""
};


dateSelector.addEventListener('change', dateListener);
zoomSelector.addEventListener('change', zoomListener);
window.addEventListener("scroll", runOnScroll);
mapContainer.addEventListener("scroll", runOnScroll);

function runOnScroll(){
    urlExtra.scrollx = mapContainer.scrollLeft;
    urlExtra.scrolly = window.pageYOffset;;
    history.pushState({}, "", "/?"+urlExtra.date+'/'+urlExtra.zoom+'/'+urlExtra.scrollx+'/'+urlExtra.scrolly);
}


function dateListener(){
  dateParts = `${dateSelector.value}`.split('-');
  date = new Date(`${dateParts[1]}-${dateParts[2]}-${dateParts[0]}`);
  if(date > lowDate) changeMap();
}

function zoomListener(){
  document.documentElement.style.setProperty(`--${this.name}`, this.value + '%');
  urlExtra.zoom = this.value;
  history.pushState({}, "", "/?"+urlExtra.date+'/'+urlExtra.zoom+'/'+urlExtra.scrollx+'/'+urlExtra.scrolly);
}

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
          urlExtra.scrollx = storeScrollX;
          urlExtra.scrolly = storeScrollY;
          history.pushState({}, "", "/?"+urlExtra.date+'/'+urlExtra.zoom+'/'+urlExtra.scrollx+'/'+urlExtra.scrolly);
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

    dateparts = urlSplit2[0].split('-');
    date = new Date(dateparts[1]+'-'+dateparts[2]+'-'+dateparts[0]);
    zoom = zoomSelector.value = urlSplit2[1];
    document.documentElement.style.setProperty('--zoom', zoom + '%');
    mapContainer.scrollLeft = urlSplit2[2];
    changeMap(urlSplit2[3]);
    setTimeout(function(){ window.scrollTo(0, urlSplit2[3]); }, 300);
  }else{
    date = new Date();
    changeMap();
  }
}
window.onload = getMapInfo;
