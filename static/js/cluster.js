// var lat = 37.16792;
// var lon = 126.93805;
var lat = 37.4815733;
var lon = 126.8934683;
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
        maxZoom: 22,
    }
);

var stadisCanvas = L.tileLayer(
    "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=8f890138-c2ce-4e19-a081-ec6b9154f34a",
    {
        attribution: "Stadia Layer Version",
        maxZoom: 22,
    }

)



var iaqIcon = L.icon({
iconUrl: "../static/image/marker-blue.png",
    iconSize: [20, 20],
    popupAnchor: [10, -7],
});

var oaqIcon = L.icon({
    iconUrl: "../static/image/marker-green.png",
    iconSize: [20, 20],
    popupAnchor: [10, -7],
});

var nonReceive = L.icon({
    iconUrl: "../static/image/marker-gray.png",
    iconSize: [20, 20],
    popupAnchor: [10, -7],
});

var myIcon = L.icon({
    iconUrl: "../static/image/red_circle.png",
    iconSize: [20, 20],
    popupAnchor: [10, -7],
});

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                // lon = position.coords.longitude;
                // lat = position.coords.latitude;
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

    map = L.map("map", { layers: [stadisCanvas], maxZoom: 20 }).setView(
        [lat, lon],
        14
    );

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
    map.on('moveend', (e) => {
      
        var zoom = map.getZoom()
        console.log('zoom',zoom)
    })

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
    let category = $("#categorySelect").val();
    var min5prev = new Date().setMinutes(new Date().getMinutes() - 5) 
    var hour2prev = new Date().setHours(new Date().getHours() - 2)
    if (category == 'airkor') {
        if((hour2prev > new Date(param.timeStamp * 1000)) || param.timeStamp == undefined){
            var h = new L.Marker([param.lat, param.lon], { icon: nonReceive });
        }
        else{
            var h = new L.Marker([param.lat, param.lon], { icon: oaqIcon });
        }
    }
    else if (category == 'sdot' || category == 'kweather') {
        if((min5prev > new Date(param.timestamp * 1000)) || param.timestamp == undefined){
            var h = new L.Marker([param.lat, param.lon], { icon: nonReceive });
        }
        else{
            var h = new L.Marker([param.lat, param.lon], { icon: oaqIcon });
        }
    }
   
    else if (category == 'jeju') {
        function getDetailMapDateInNewDate(tm) {
            tm += ''
            var year = tm.substr(0, 4)
            var month = tm.substr(4, 2)
            var day = tm.substr(6, 2)
            var hour = tm.substr(8, 2)
            var min = tm.substr(10, 2)
        
            return year + "-" + month + "-" + day + " " + hour + ":" + min;
        }
        
        var convertTm = getDetailMapDateInNewDate(param.sensor.tm)
        if((min5prev > new Date(convertTm) || param.sensor.tm == undefined)){
            var h = new L.Marker([param.lat, param.lon], { icon: nonReceive });
        }
        else{
            var h = new L.Marker([param.lat, param.lon], { icon: oaqIcon });
        }
    }

    else{
     
        if(new Date(param.sensor.timestamp * 1000) < new Date(min5prev) || param.sensor.timestamp == undefined){
            var h = new L.Marker([param.lat, param.lon], { icon: nonReceive });
        }
        else {
            var h = new L.Marker([param.lat, param.lon], { icon: iaqIcon });
        }
    }
    // if((min5prev < new Date(param.sensor.timestamp * 1000)) || param.sensor.timestamp == undefined){
    //     var h = new L.Marker([param.lat, param.lon], { icon: nonReceive });
    // }
    // else if ($("#iaqoaqSelectBox").val() == "iaq") {
    //     var h = new L.Marker([param.lat, param.lon], { icon: iaqIcon });
    // } else {
    //     var h = new L.Marker([param.lat, param.lon], { icon: oaqIcon });
    // }

    let sr = param.serial;
    let sn = param.stationName;
    let keys = [];

    if ($("#iaqoaqSelectBox").val() == "iaq") {
        keys = iaq_key;
    } else {
        keys = oaq_key;
    }
    var fullDate = $("#categorySelect").val() == 'sdot' || $("#categorySelect").val() == 'kweather' ? new Date(param.timestamp * 1000):  $("#categorySelect").val() == 'airKor' ?new Date(param.timeStamp * 1000) :  new Date(param.sensor.timestamp * 1000)
    var year = fullDate.getFullYear();
    var month = ((fullDate.getMonth() + 1)+"").padStart(2, '0');
    var date = (fullDate.getDate() + "").padStart(2, '0');
    var hour = (fullDate.getHours() + "").padStart(2, '0');
    var minute = (fullDate.getMinutes() + "").padStart(2, '0');
    var second = (fullDate.getSeconds() + "").padStart(2, '0');
    console.log('param.sensor', param)
    var receiveText = ""
    function getDetailMapDateInNewDate(tm) {
        tm += ''
        var year = tm.substr(0, 4)
        var month = tm.substr(4, 2)
        var date = tm.substr(6, 2)
        var minute = tm.substr(8, 2)
        var min = tm.substr(10, 2)
    
        return  year + "." + month + "." + date + " " + hour + ":" + minute;
    }
    if($("#categorySelect").val() == 'airkor'){
        receiveText =  param.timeStamp == undefined ?  "-" : year + "." + month + "." + date + " " + hour + ":" + minute + ":" + second;

    }
    else if ( $("#categorySelect").val() == 'sdot' || $("#categorySelect").val() == 'kweather'){
        receiveText =  param.timestamp == undefined ?  "-" : year + "." + month + "." + date + " " + hour + ":" + minute + ":" + second;
    }
    else if ($("#categorySelect").val() == 'jeju'){
        receiveText =  param.sensor.tm == undefined ?  "-" : getDetailMapDateInNewDate(param.sensor.tm);

    }
    else{
        receiveText =  param.sensor.timestamp == undefined ?  "-" : year + "." + month + "." + date + " " + hour + ":" + minute + ":" + second;
    }
    let title =
        "<table id='infoTable'><tr style='background-color:#e6edf9;font-weight:bold;'><td colspan='2' style='font-size:1.5em;'>" +
        sn +
        " <font size='3'>" +
        sr +
        "</font>" +
        "</td>" +
        "<td colspan='2'>업데이트 시각 : " +
        receiveText +
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
function openPmPop(ispm) {
    var popupX = (window.screen.width / 2) - 300;
    // 만들 팝업창 width 크기의 1/2 만큼 보정값으로 빼주었음

    var popupY = (window.screen.height / 2) - 250;
    // 만들 팝업창 height 크기의 1/2 만큼 보정값으로 빼주었음
    var url = '../page/pm-popup.html?isPm='+ispm
    var options = 'top=' + popupY + ', left=' + popupX + ', width=600, height=500, status=no, menubar=no, toolbar=no, resizeable=no, location=no';
    window.open(url, 'zz', options);
}

getLocation();
