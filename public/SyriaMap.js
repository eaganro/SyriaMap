var date;
var lowDate = new Date("04-28-2013");
var dateSelector = document.getElementById('mapDate');
var zoomSelector = document.getElementById('mapZoom');
var map = document.getElementById('map');


dateSelector.addEventListener('change', dateListener);
zoomSelector.addEventListener('change', zoomListener);


function dateListener(){
  dateParts = `${dateSelector.value}`.split('-');
  date = new Date(`${dateParts[1]}-${dateParts[2]}-${dateParts[0]}`);
  if(date > lowDate) changeMap();
}

function zoomListener(){
  document.documentElement.style.setProperty(`--${this.name}`, this.value + '%');
}

function changeMap(){
  date.setDate(date.getDate()+1);
  var data = JSON.stringify({year: date.getFullYear(), month: date.getMonth()+1, day: date.getDate()});

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/mapUpdate", true);
  xhr.setRequestHeader("Content-type","application/json");
  xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && xhr.status == 200) {
          if(xhr.responseText.includes("https:")){
            map.src = xhr.responseText;
          }else{
            map.src = "https:"+xhr.responseText;
          }
      }
  };
  xhr.send(data);
}

function showKey(){
  document.getElementById("keyDrop").classList.toggle('showKey');
}

function getMapInfo(){
  date = new Date();
  changeMap();
}
window.onload = getMapInfo;
