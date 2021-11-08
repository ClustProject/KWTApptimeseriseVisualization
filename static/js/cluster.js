var lat = 37.16792;
var lon = 126.93805;

var map, clusterMarkerGroup, markerList, mapCircle;

let today = new Date();

let year = today.getFullYear(); // 년도
let month = today.getMonth() + 1; // 월
let date = today.getDate(); // 날짜
let day = today.getDay(); // 요일
let hour = today.getHours(); // 시
let minute = today.getMinutes(); // 분
let second = today.getSeconds(); // 초

var worldCanvas = L.tileLayer(
  "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "김동기, 위성 Version",
  }
);
var grayCanvas = L.tileLayer(
  "http://{s}.sm.mapstack.stamen.com/(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/{z}/{x}/{y}.png",
  {
    attribution: "김동기, 그레이 Version",

  }
);
var googleCanvas = L.tileLayer(
  "http://mt.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
  {
    attribution: "Google Layer Version",
    maxZoom:22
  }
);

var iaqIcon = L.icon({
  iconUrl: "../static/image/marker-blue.png",
  popupAnchor: [10, -7],
});

var oaqIcon = L.icon({
  iconUrl: "../static/image/marker-green.png",
  popupAnchor: [10, -7],
});

var myIcon = L.icon({
  iconUrl: "../static/image/red_circle.png",
  iconSize: [16, 16],
  popupAnchor: [10, -7],
});

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        lon = position.coords.longitude;
        lat = position.coords.latitude;
        // $("#myLocationTxt").html("내 위치 : " + lat + ", " + lon);
        initMap();
      },
      function (error) {
        $("#myLocationTxt").html("기본 위치 : " + lat + ", " + lon);
        initMap();
        console.error(error);
      },
      {
        enableHighAccuracy: false,
        maximumAge: 0,
        timeout: Infinity,
      }
    );
  } else {
    $("#myLocationTxt").html("기본 위치 : " + lat + ", " + lon);
    initMap();
    alert("GPS를 지원하지 않습니다 .");
  }
}

function initMap() {
  //   var baseLayers = {
  //     "Gray Layer": grayCanvas,
  //     "위성 Layer": worldCanvas,
  //     "구글 Layer": googleCanvas,
  //   };

  map = L.map("map", { layers: [googleCanvas],maxZoom:22}).setView([lat, lon], 14);

  //   var layerControl = L.control.layers(baseLayers);
  //   layerControl.addTo(map);

  clusterMarkerGroup = L.markerClusterGroup();
  markerList = [];

  //populate();
  myMarkerOn();
}

function myMarkerOn() {
   
   var m = new L.Marker(new L.LatLng(lat, lon), { icon: myIcon });

//   var title = "내 위치";
//   m.bindPopup(title, { maxWidth: "100px" });
//   clusterMarkerGroup.addLayer(m);
//   map.addLayer(clusterMarkerGroup);
map.addLayer(m);
}

function getRandomLatLng(map) {
  var bounds = map.getBounds(),
    southWest = bounds.getSouthWest(),
    northEast = bounds.getNorthEast(),
    lngSpan = northEast.lng - southWest.lng,
    latSpan = northEast.lat - southWest.lat;

  return new L.LatLng(
    southWest.lat + latSpan * Math.random(),
    southWest.lng + lngSpan * Math.random()
  );
}

// function populate() {
//   for (var i = 0; i < 100; i++) {
//     var m = new L.Marker(getRandomLatLng(map), { icon: randomIcon });
//     var diffDistance = distanceDifferent(m.getLatLng().lng, m.getLatLng().lat);
//     var title = i + "번째 데이터<br/>나와의 거리 : " + diffDistance + "km";
//     m.bindPopup(title);
//     markerList.push(m);
//     clusterMarkerGroup.addLayer(m);
//   }

//   map.addLayer(clusterMarkerGroup);
// }

let popName = {
  cici: "실내쾌적지수<br>(cici)",
  pm25: "초미세먼지<br>(pm2.5)",
  pm10: "미세먼지<br>(pm10)",
  voc: "휘발성유기화합물<br>(VOCs)",
  temp: "온도",
  humi: "습도<br>(RH)",
  noise: "소음",
  co2: "이산화탄소<br>(co2)",
  uv: "자외선",
  windd: "풍향",
  winds: "풍속",
};
let iaq_key = ["cici", "pm10", "pm25", "co2", "voc", "temp", "humi", "noise"];
let oaq_key = ["pm10", "pm25", "temp", "humi", "windd", "winds", "uv", "noise"];

function populate(param) {
  if ($("#iaqoaqSelectBox").val() == "iaq") {
    var h = new L.Marker([param.lat, param.lon], { icon: iaqIcon });
  } else {
    var h = new L.Marker([param.lat, param.lon], { icon: oaqIcon });
  }

  let sr = param.serial;
  let sn = param.stationName;
  let keys = [];

  if ($("#iaqoaqSelectBox").val() == "iaq") {
    keys = iaq_key;
  } else {
    keys = oaq_key;
  }
  let title =
    "<table id='infoTable'><tr style='background-color:#e6edf9;font-weight:bold;'><td colspan='2' style='font-size:1.5em;'>" +
    sn +
    " <font size='3'>" +
    sr +
    "</font>" +
    "</td>" +
    "<td colspan='2'>업데이트 시각 : " +
    year +
    "." +
    month +
    "." +
    date +
    " " +
    hour +
    ":" +
    minute +
    ":" +
    second +
    "</td></tr>";

  title += "<tr style='background-color:#e6edf9; font-weight:bold;'>";
  for (let i = 0; i < 4; i++) {
    title += "<td>" + popName[keys[i]] + "</td>";
  }
  title += "</tr><tr>";
  for (let i = 0; i < 4; i++) {
    title += "<td>" + isEmpty(param.sensor[keys[i]]) + "</td>";
  }
  title += "</tr>";

  title += "<tr style='background-color:#e6edf9;font-weight:bold;'>";
  for (let i = 4; i < 8; i++) {
    title += "<td>" + popName[keys[i]] + "</td>";
  }
  title += "</tr><tr>";
  for (let i = 4; i < 8; i++) {
    title += "<td>" + isEmpty(param.sensor[keys[i]]) + "</td>";
  }
  title += "</tr>";

  h.bindPopup(title, { maxWidth: "440px", maxHeight: "220px" });

  markerList.push(h);

  clusterMarkerGroup.addLayer(h);

  map.addLayer(clusterMarkerGroup);
}

function isEmpty(str) {
  if (!str) {
    return "-";
  } else {
    return str;
  }
}
function changeCircle() {
  if (mapCircle != undefined) map.removeLayer(mapCircle);

  var radius = document.getElementById("distanceSelectBox").value;
  if (radius != "all")
    mapCircle = L.circle([lat, lon], Number(radius)).addTo(map);
}

function distanceDifferent(diffLon, diffLat) {
  var R = 6371; // km
  var dLat = ((diffLat - lat) * Math.PI) / 180;
  var dLon = ((diffLon - lon) * Math.PI) / 180;
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((diffLat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;

  return Math.round(d * 100) / 100;
}

// document.getElementById("moveBtn").onclick = function () {
//   var m = markerList[Math.floor(Math.random() * markerList.length)];

//   clusterMarkerGroup.zoomToShowLayer(m, function () {
//     m.openPopup();
//   });
// };

// document.getElementById("myLocationTxt").onclick = function () {
//   //   $("#distanceSelectBox").show();

//   map.flyTo([lat, lon], 16, {
//     animate: true,
//     duration: 1.5,
//   });
// };

getLocation();
//value : tb_space_info의 idx값
