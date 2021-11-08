const temp = location.href.split("?");
const data = temp[1].split("&");
let data1 = data[0].split("=");
const serial = data1[1];
data1 = data[1].split("=");
const stationName = data1[1];
data1 = data[2].split("=");
const locSelect = data1[1];
data1 = data[3].split("=");
const locDetail = data1[1];
data1 = data[4].split("=");
const iaqoaq = decodeURI(data1[1]);
data1 = data[5].split("=");
const category = decodeURI(data1[1]);
let deviceType;

hisApiData = [];
let columsData = [];

let elementsData;
let collectionColum = new Array();

window.onload = function () {
  $("#txtSerial").html(serial);
  $("#txtStationName").html(decodeURI(stationName));

  $("#location").html(decodeURI(locSelect));
  $("#locDetail").html(decodeURI(locDetail));
  $("#iaqoaq").html(decodeURI(iaqoaq));
  $("#category").html(decodeURI(category));

  const rangeDate = 30;
  $("#startDt").datepicker({
    dateFormat: "yy/mm/dd",
    onSelect: function (selectDate) {
      let stxt = selectDate.split("/");
      stxt[1] = stxt[1] - 1;
      let sdate = new Date(stxt[0], stxt[1], stxt[2]);
      let edate = new Date(stxt[0], stxt[1], stxt[2]);
      edate.setDate(sdate.getDate() + rangeDate);

      $("#endDt").datepicker("option", {
        minDate: selectDate,
        beforeShow: function () {
          $("#endDt").datepicker("option", "maxDate", edate);
        
          setSdate = selectDate;
        },
      });

      $("#endDt").focus();
    }

  });

  $("#endDt").datepicker({
    dateFormat: "yy/mm/dd",
    onSelect: function (selectDate) {
      setEdate = selectDate;
    },
  });

  if (!$("#startDt").val()) {
    $("#startDt").val(setDate());
  }
  if (!$("#endDt").val()) {
    $("#endDt").val(setDate());
  }

  $("#modalSearchBtn").click(function () {
    let toDate = new Date($("#endDt").val());
    let fromDate = new Date($("#startDt").val());
    let dateGap = Math.ceil(
      (toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24)
    );

    if (dateGap > 31) {
      alert("조회 기간은 최대 한 달입니다.");
    } else {
      selectHistory();
    }
  });

  $("#chartTypes").click(function () {
    chgChartData();
  });

//   $('.form-control.hasDatepicker').click(function(){
//     $("a.ui-datepicker-prev").text("<");
//     $("a.ui-datepicker-next").text(">");
//   })

//   $('a.ui-corner-all').click(function(){
//     $("a.ui-datepicker-prev").text("<");
//     $("a.ui-datepicker-next").text(">");
//   })
};

function setDate() {
  let now_date = new Date();
  let now_year = now_date.getFullYear();
  let now_month = now_date.getMonth() + 1;
  let now_day = now_date.getDate();

  if (now_month < 10) {
    now_month = "0" + now_month;
  }
  if (now_day < 10) {
    now_day = "0" + now_day;
  }

  return now_year + "/" + now_month + "/" + now_day;
}

function selectHistory() {
  hisApiData = [];
  columsData = [];
  let obj = new Object();

  let startTime = $("#startDt").val() + "-00:00:00";
  let endTime = $("#endDt").val() + "-23:59:59";
  deviceType = "";

  if (iaqoaq == "실내") {
    deviceType = "iaq";
  } else {
    switch (category) {
      case "kweather":
        deviceType = "oaq";
        break;
      case "sdot":
        deviceType = "dot";
        break;
      case "제주도":
        deviceType = "oaq";
        break;
      case "국가관측망":
        deviceType = "airKor";
        break;
    }
  }

  if (deviceType == "airKor") {
    obj = {
      dcode: serial,
      startTime: startTime,
      endTime: endTime,
      standard: $("#searchOption").val(),
      type: "airKor",
    };
    getAirkorData(obj);
  } else {
    obj = {
      deviceType: deviceType,
      serial: serial,
      startTime: startTime,
      endTime: endTime,
      standard: $("#searchOption").val(),
      connect: "0",
    };
    getData(obj);
  }
}

function getData(obj) {
  //데이터 테이블 컬럼추출
  $.ajax({
    method: "GET",
    async: false,
    url:
      "https://datacenter.kweather.co.kr/api/custom/get/elements?serial=" +
      serial,
    success: function (d) {
      elementsData = d.data;

      if (elementsData.length != 0) {
        columsData.push({ data: "formatTimestamp" });

        for (let key in elementsData) {
          columsData.push({ data: elementsData[key].engName });
          collectionColum.push(elementsData[key].engName);
        }

        if (deviceType == "IAQ") columsData.push({ data: "cici" });
        else columsData.push({ data: "coci" });
      }

      if (collectionColum.length != 0) {
        tableTrDraw(elementsData, d, collectionColum);
      }

      //   selectHistory(serialNum, productDt, stationName, deviceType);
    },
  });

  fetch("https://datacenter.kweather.co.kr/api/custom/get/historyData", {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrer: "no-referrer",
    body: JSON.stringify(obj),
  })
    .then((response) => response.json())
    .then(function (res) {
      hisApiData = res.data;

      for (let i = 0; i < columsData.length; i++) {
        let key = columsData[i].data;
        for (let j = 0; j < hisApiData.length; j++)
          if (hisApiData[j][key] == null) {
            hisApiData[j][key] = null;
          }
      }

      for (let i in hisApiData) {
        let convertTime = "";

        if (hisApiData[i].timestamp == null) {
          convertTime = "";
        } else {
          let date = new Date(hisApiData[i].timestamp * 1000);
          let year = date.getFullYear();
          let month = date.getMonth() + 1;
          let day = date.getDate();

          let hours = date.getHours();
          let minutes = date.getMinutes();
          let seconds = date.getSeconds();

          if (month < 10) {
            month = "0" + month;
          }
          if (day < 10) {
            day = "0" + day;
          }
          if (hours < 10) {
            hours = "0" + hours;
          }
          if (minutes < 10) {
            minutes = "0" + minutes;
          }
          if (seconds < 10) {
            seconds = "0" + seconds;
          }

          convertTime =
            year + "-" + month + "-" + day + "\n" + hours + ":" + minutes;
        }

        hisApiData[i].convertTime = convertTime;
      }

      viewData();
    });
}

airkorElements = {
  co: "이산화탄소(co)",
  co_grade: "이산화탄소등급",
  khai: "khai",
  khai_grade: "khai등급",
  no2: "이산화질소(no2)",
  no2_grade: "이산화질소등급",
  o3: "오존(o3)",
  o3_grade: "오존등급",
  pm10: "미세먼지",
  pm10_grade: "미세먼지등급",
  pm25: "초미세먼지",
  pm25_grade: "초미세먼지등급",
  so2: "이산화황(so2)",
  so2_grade: "이산화황등급",
};
airkorKeys = [
  "convertTime",
  "pm10",
  "pm10_grade",
  "pm25",
  "pm25_grade",
  "co",
  "co_grade",
  "no2",
  "no2_grade",
  "so2",
  "so2_grade",
  "o3",
  "o3_grade",
  "khai",
  "khai_grade",
];
function getAirkorData(obj) {
  $.ajax({
    method: "GET",
    async: false,
    url: "https://datacenter.kweather.co.kr/api/custom/airKorHistory",
    data: obj,
    success: function (d) {
      for (let i = 0; i < d.data.length; i++) {
        d.data[i].convertTime =
          d.data[i].regDate.substring(0, 4) +
          "-" +
          d.data[i].regDate.substring(4, 6) +
          "-" +
          d.data[i].regDate.substring(6, 8) +
          "\n" +
          d.data[i].regDate.substring(8, 10) +
          ":" +
          d.data[i].regDate.substring(10, 12) +
          ":" +
          d.data[i].regDate.substring(12, 14);
      }
      hisApiData = d.data;
      let optionIdx = 0;
      let trHeadHTML = "";
      let trBodyHTML = "";
      let chartTypesHTML = "";

      trHeadHTML +=
        "<th style='width: 200px;background-color:#e6edf9;' class='bgGray1'>데이터 시간</th>";
      trBodyHTML += "<td></td>";

      let temp = { data: airkorKeys[0], mData: airkorKeys[0] };
      columsData[0] = temp;
      for (let i = 1; i < airkorKeys.length; i++) {
        let temp = { data: airkorKeys[i], mData: airkorKeys[i] };
        columsData[i] = temp;
        optionIdx++;
        trHeadHTML +=
          "<th style='width: 200px;background-color:#e6edf9;' class='bgGray1'>" +
          airkorElements[airkorKeys[i]] +
          "</th>";
        trBodyHTML += "<td></td>";
        chartTypesHTML +=
          "<label style='padding-right: 15px'><input type='checkbox' name='chartType' value='" +
          airkorKeys[i] +
          "'>" +
          " " +
          airkorElements[airkorKeys[i]] +
          "</label>";
        if (optionIdx % 10 == 0) chartTypesHTML += "<br/>";
      }

      $("#popTableHead").html(trHeadHTML);
      $("#popTableBody").html(trBodyHTML);
      $("#chartTypes").html(chartTypesHTML);
    },
  });
  viewData();
}

function viewData() {
  let table = $("#popTable").DataTable({
    scrollCollapse: true,
    autoWidth: false,
    language: {
      emptyTable: "데이터가 없습니다.",
      lengthMenu: "페이지당 _MENU_ 개씩 보기",
      info: "현재 _START_ - _END_ / _TOTAL_건",
      infoEmpty: "데이터 없음",
      infoFiltered: "( _MAX_건의 데이터에서 필터링됨 )",
      search: "",
      zeroRecords: "일치하는 데이터가 없습니다.",
      loadingRecords: "로딩중...",
      processing: "잠시만 기다려 주세요.",
      paginate: {
        next: "다음",
        previous: "이전",
      },
    },
    dom: '<"top"Blf>rt<"bottom"ip><"clear">',
    responsive: false,
    buttons: [
      {
        extend: "csv",
        charset: "UTF-8",
        text: "엑셀 다운로드",
        footer: false,
        bom: true,
        filename:
          serial +
          "_" +
          $("#startDt").val() +
          "_" +
          $("#endDt").val() +
          "_download",
        className: "btn-primary btn excelDownBtn",
      },
    ],
    destroy: true,
    processing: true,
    serverSide: false,
    data: hisApiData,
    columns: columsData,
    initComplete: function (settings, data) {
      //timeChartCreate("timeChartDiv", hisApiData, $('#chartTypeSelect').val());
      chgChartData();
    },
  });
  $("#popTable_filter").hide();
  $($("#tableTitle")).insertBefore("#popTable_length");
  $("#popTable_length").css("margin-left", "20px");
  $("#popTable_length").css("margin-bottom", "15px");
  $("#modalDownloadBtn").insertAfter("#popTable_filter");

  $("#popTable_wrapper .top").first().css("padding-bottom", "15px");
  $(".excelDownBtn").css("float", "right");
}

function tableTrDraw(datas, rawDatas, colums) {
  let ciType = "";

  if (deviceType == "IAQ") {
    ciType = "cici";
  } else {
    ciType = "coci";
  }

  let optionIdx = 0;
  let trHeadHTML = "";
  let trBodyHTML = "";
  let chartTypesHTML = "";
  let optionName = "";

  trHeadHTML +=
    "<th style='width: 200px;background-color:#e6edf9;' class='bgGray1'>데이터 시간</th>";
  trBodyHTML += "<td></td>";
  trBodyHTML += "<td></td>";

  for (let i = 0; i < colums.length; i++) {
    optionIdx++;
    trHeadHTML +=
      "<th style='width: 200px;background-color:#e6edf9;' class='bgGray1'>" +
      datas[i].korName +
      "<br/>(" +
      datas[i].elementUnit +
      ")</th>";
    trBodyHTML += "<td></td>";
    chartTypesHTML +=
      "<label style='padding-right: 10px'><input type='checkbox' name='chartType' value='" +
      colums[i] +
      "'>" +
      datas[i].korName +
      "</label>";
    if (optionIdx % 10 == 0) chartTypesHTML += "<br/>";
  }

  trHeadHTML +=
    "<th style='width: 200px;background-color:#e6edf9;' class='bgGray1'>통합지수<br/>(" +
    ciType +
    ")</th>";
  chartTypesHTML +=
    "<label style='padding-right: 10px'><input type='checkbox' name='chartType' value='" +
    ciType +
    "'>통합지수(" +
    ciType +
    ")</label>";

  $("#popTableHead").html(trHeadHTML);
  $("#popTableBody").html(trBodyHTML);
  $("#chartTypes").html(chartTypesHTML);
}

function chgChartData() {
  let chkArr = Array();
  let obj = document.getElementsByName("chartType");

  for (let i = 0; i < obj.length; i++)
    if (document.getElementsByName("chartType")[i].checked == true)
      chkArr.push(obj[i].value);

  timeChartCreate("timeChartDiv", hisApiData, chkArr);
}

function timeChartCreate(chartDiv, hisData, options) {
  am4core.addLicense("CH205407412");
  // am4core.useTheme(am4themes_animated);

  if (hisData == "undefined" || hisData == null || !hisData) {
    alert("해당 장비에 수집된 이력이 없습니다.");
    return;
  }

  let chart = am4core.create(chartDiv, am4charts.XYChart);
  chart.data = hisData;
  chart.cursor = new am4charts.XYCursor();
  chart.cursor.behavior = "panXY";
  chart.scrollbarX = new am4charts.XYChartScrollbar();
  chart.scrollbarX.parent = chart.topAxesContainer;

  let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "convertTime";
  categoryAxis.renderer.opposite = false;
  categoryAxis.connect = false;

  for (let idx in options) createSeries(options[idx]);

  function chgOptionNameFunc(name) {
    let chgName = "";

    if (name == "pm10") chgName = "미세먼지 (㎍/㎥)";
    else if (name == "pm25") chgName = "초미세먼지 (㎍/㎥)";
    else if (name == "co2") chgName = "이산화탄소 (ppm)";
    else if (name == "voc") chgName = "휘발성유기화합물 (ppb)";
    else if (name == "noise") chgName = "소음 (dB)";
    else if (name == "temp") chgName = "온도 (℃ )";
    else if (name == "humi") chgName = "습도 (%)";
    else if (name == "cici") chgName = "통합지수 (cici)";
    else if (name == "coci") chgName = "통합지수 (coci)";
    else chgName = name;

    return chgName;
  }

  function createSeries(name) {
    let chgName = chgOptionNameFunc(name);

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.inversed = false;
    valueAxis.title.text = chgName;
    valueAxis.renderer.minLabelPosition = 0.01;
    valueAxis.connect = false;
    valueAxis.renderer.line.strokeOpacity = 1;
    valueAxis.renderer.line.strokeWidth = 2;

    let interfaceColors = new am4core.InterfaceColorSet();

    let series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = name;
    series.dataFields.categoryX = "convertTime";
    series.yAxis = valueAxis;
    series.name = chgName;
    series.tensionX = 0.8;
    series.showOnInit = true;

    let segment = series.segments.template;
    segment.interactionsEnabled = true;

    let hoverState = segment.states.create("hover");
    hoverState.properties.strokeWidth = 3;

    let dimmed = segment.states.create("dimmed");
    dimmed.properties.stroke = am4core.color("#dadada");

    series.tooltip.background.cornerRadius = 20;
    series.tooltip.background.strokeOpacity = 0;
    series.tooltip.pointerOrientation = "vertical";
    series.tooltip.label.minWidth = 40;
    series.tooltip.label.minHeight = 40;
    series.tooltip.label.textAlign = "middle";
    series.tooltip.label.textValign = "middle";
    series.tooltipText = "{name}: [bold]{valueY}[/]";

    series.strokeWidth = 3;

    chart.scrollbarX.series.push(series);

    if (name != "visitor") series.connect = false;

    valueAxis.renderer.line.stroke = series.stroke;
    valueAxis.renderer.labels.template.fill = series.stroke;
    valueAxis.renderer.opposite = true;

    valueAxis.renderer.line.strokeOpacity = 1;
    valueAxis.renderer.line.strokeWidth = 2;
    valueAxis.renderer.line.stroke = series.stroke;
    valueAxis.renderer.labels.template.fill = series.stroke;
    valueAxis.renderer.opposite = true;
  }

  chart.legend = new am4charts.Legend();
}
