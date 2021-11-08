let chartDataList;

function setSiList() {
  $.ajax({
    method: "GET",
    url: "https://datacenter.kweather.co.kr/api/custom/siList",
    success: function (param) {
      let html = "";
      for (let i = 0; i < param.data.length; i++) {
        html +=
          "<option value='" +
          param.data[i].sdcode +
          "'>" +
          param.data[i].dname +
          "</option>";
      }
      $("#siSelectBox").html(html);
      setGuList(param.data[0].sdcode);
    },
  });
}

function setGuList(sdcode) {
  $.ajax({
    method: "GET",
    url:
      "https://datacenter.kweather.co.kr/api/custom/guList?searchSdcode=" +
      sdcode,
    success: function (param) {
      let html = "";
      for (let i = 0; i < param.data.length; i++) {
        html +=
          "<option value='" +
          param.data[i].sggcode +
          "'>" +
          param.data[i].dname +
          "</option>";
      }
      $("#guSelectBox").html(html);
      setDongList(sdcode, param.data[0].sggcode);
    },
  });
}

function setDongList(sdcode, sggcode) {
  $.ajax({
    url:
      "https://datacenter.kweather.co.kr/api/custom/dongList?searchSdcode=" +
      sdcode +
      "&searchSggcode=" +
      sggcode,
    type: "GET",
    success: function (param) {
      let html = "<option value='all'>전체</option>";

      for (let i = 0; i < param.data.length; i++) {
        html +=
          "<option value='" +
          param.data[i].dcode +
          "' lat='" +
          param.data[i].lat +
          "' lon='" +
          param.data[i].lon +
          "'>" +
          param.data[i].dname +
          "</option>";
      }

      $("#dongSelectBox").html(html);
    },
  });
}

$("#siSelectBox").change(function () {
  let sdcode = $("#siSelectBox").val();
  setGuList(sdcode);
});

$("#guSelectBox").change(function () {
  let sdcode = $("#siSelectBox").val();
  let sggcode = $("#guSelectBox").val();
  setDongList(sdcode, sggcode);
});

$(document).on("change", "select[id='locationSelectBox']", function () {
  if ($("#locationSelectBox").val() === "spot") {
    if (mapCircle != undefined) map.removeLayer(mapCircle);
    $("#distanceSelectBox option:eq(4)").prop("selected", true);
    $("#distanceSelectBox").attr("disabled", true);
    $("#spotDiv").show();
    setSiList();
  } else {
    $("#distanceSelectBox").attr("disabled", false);
    $("#distanceSelectBox option:eq(0)").prop("selected", true);
    $("#spotDiv").hide();
  }
});

const iaqCategory = {
  어린이집: "어린이집",
  유치원: "유치원",
  초등학교: "초등학교",
  중학교: "중학교",
  고등학교: "고등학교",
  아파트: "아파트",
  도서관: "도서관",
  요양원: "요양원",
  경로당: "경로당",
  체육관: "체육관",
};
const oaqCategory = {
  국가관측망: "airkor",
  sdot: "sdot",
  kweather: "kweather",
  제주도: "jeju",
};

$(document).on("change", "select[id='iaqoaqSelectBox']", function () {
  if ($("#iaqoaqSelectBox").val() === "iaq") {
    $("#categorySelect").children().remove();
    $("#categorySelect").append("<option value='' hidden>시설/지역</option>");
    for (key in iaqCategory) {
      $("#categorySelect").append(
        "<option value='" + iaqCategory[key] + "'>" + key + "</option>"
      );
    }
  } else {
    $("#categorySelect").children().remove();
    $("#categorySelect").append("<option value='' hidden>시설/지역</option>");
    for (key in oaqCategory) {
      $("#categorySelect").append(
        "<option value='" + oaqCategory[key] + "'>" + key + "</option>"
      );
    }
  }
});

function checkValidation() {
  let result = 0;
  if ($("#locationSelectBox").val() === "here") {
    if (
      $("#distanceSelectBox").val() != "" &&
      $("#iqaoaqSelectBox").val() != "" &&
      $("#categorySelect").val() != ""
    ) {
      result = 1;
    }
  } else {
    if (
      $("#iqaoaqSelectBox").val() != "" &&
      $("#categorySelect").val() != "" &&
      $("#siSelectBox").val() != "" &&
      $("#guSelectBox").val() != "" &&
      $("#dongSelectBox").val() != ""
    ) {
      result = 1;
    }
  }
  return result;
}

$("#search").click(function () {
  if (checkValidation() === 1) {
    $("#listDiv").hide();
    clusterMarkerGroup.remove();
    clusterMarkerGroup = L.markerClusterGroup();
    markerList = [];
    chartDataList = [];
    myMarkerOn();
    if ($("#iaqoaqSelectBox").val() === "iaq") {
      //IAQ선택한 경우
      const fileName = $("#categorySelect").val();
      let filePath = "/static/serial/" + fileName;
      let serials = loadFile(filePath).split("\r\n");

      $.ajax({
        url: "https://datacenter.kweather.co.kr/api/custom/iaqRealTimeBySerial",
        traditional: true,
        data: { serials: serials },
        type: "POST",
        async: false,
        success: function (param) {

          for (let i = 0; i < param.length; i++) {
            if (param[i].sensor == null) {
              let sensor = {
                pm10: "-",
                pm25: "-",
                co2: "-",
                voc: "-",
                temp: "-",
                humi: "-",
                noise: "-",
                cici: "-",
              };
              param[i].sensor = sensor;
            }
          }
          locationCheck(param);
        },
      });
    } else {
      //OAQ 선택한 경우
      let category = $("#categorySelect").val();
      let url = "";
      switch (category) {
        case "airkor":
          url = "https://datacenter.kweather.co.kr/api/custom/airkorRealTime";
          break;

        case "sdot":
          url = "https://datacenter.kweather.co.kr/api/custom/dotRealTime";
          break;
        case "kweather":
          url = "https://datacenter.kweather.co.kr/api/custom/oaqRealTime";

          break;

        case "jeju":
          url = "https://datacenter.kweather.co.kr/api/custom/jejuRealTime";
      }

      $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (param) {
          for (let i = 0; i < param.length; i++) {
            if (param[i].sensor == null) {
              let sensor = {
                pm10: "-",
                pm25: "-",
                windd: "-",
                winds: "-",
                temp: "-",
                humi: "-",
                noise: "-",
                uv: "-",
              };
              param[i].sensor = sensor;
            }
          }
          locationCheck(param);
        },
      });
    }
  } else {
    alert("검색 조건 확인");
  }
});

function loadFile(filePath) {
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  xmlhttp.send();
  if (xmlhttp.status == 200) {
    result = xmlhttp.responseText;
  }
  return result;
}

function makeList(chartDataList) {
  $("#listDiv").show();
  $("#csvDownBtn").show();
  if (chartDataList.length == 0) {
    $("#csvDownBtn").attr("disabled", true);
    $("#csvDownBtn").css("background-color", "#cecece");
    $("#csvDownBtn").css("cursor", "auto");
  } else {
    $("#csvDownBtn").attr("disabled", false);
    $("#csvDownBtn").css("background-color", "#477cc9");
    $("#csvDownBtn").css("cursor", "pointer");
  }
  $("#listTable").DataTable().destroy();
  $("#listTable").DataTable({
    searching: false,
    data: chartDataList,
    pageLength: 5,
    lengthMenu: [5, 10, 20],
    columns: [
      { data: "stationName" },
      { data: "serial" },
      { data: "lat" },
      { data: "lon" },
    ],
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
    columnDefs: [
      {
        targets: 0,
        render: function (data, type, full) {
          let txt =
            "<span id='sN' style='cursor:pointer;text-decoration:underline' name='stationName' data-sn='" +
            full.stationName +
            "' data-sr='" +
            full.serial +
            "'>" +
            data +
            "</span>";
          return txt;
        },
      },
      {
        targets: [2, 3],
        width: "40px",
        render: function (data) {
          let temp = data.split(".");
          if (temp[1] != null && temp[1].length > 5) {
            return (data * 1).toFixed(5);
          } else {
            return data;
          }
        },
      },
    ],
  });
  $("#listTable").css("width", "95%");
  $("#listTable").insertAfter($("#listTable_info"));
  $("#listTable_length").css("float", "right");
  $("#listTable_length").css("margin-top", "10px");
  $("#listTable_info").css("float", "right");
  $("#listTable_info").css("padding-top", "6px");
  $("#listTable_length").css("font-size", "0.7em");
  $("#listTable_length").css("margin-right", "15px");
}

//리스트 클릭 시 팝업
$(document).on("click", "td span[name='stationName']", function () {
  let serial = $(this).attr("data-sr");
  let stationName = $(this).attr("data-sn");
  let locationSelect = $("#locationSelectBox option:checked").text();
  let locationDetail;
  if ($("#locationSelectBox").val() == "here") {
    locationDetail = "반경 " + $("#distanceSelectBox option:checked").text();
  } else {
    locationDetail =
      $("#siSelectBox option:checked").text() +
      " " +
      $("#guSelectBox option:checked").text() +
      " " +
      $("#dongSelectBox option:checked").text();
  }
  let iaqoaq = $("#iaqoaqSelectBox option:checked").text();
  let category = $("#categorySelect option:checked").text();

  let winWidth = 400;
  let winHeight = 400;

  if (screen) {
    winWidth = screen.width;
    winHeight = screen.height;
  }

  newWindow = window.open(
    "/page/popup.html?sr=" +
      serial +
      "&sn=" +
      stationName +
      "&loc=" +
      locationSelect +
      "&ld=" +
      locationDetail +
      "&io=" +
      iaqoaq +
      "&ca=" +
      category,
    "detail_popup",
    "toolbar=no, location=no, scrollbars=yes,resizable=yes,width=" +
      winWidth +
      ",height=" +
      winHeight +
      ",left=0,top=0"
  );

  newWindow.focus();
});

function locationCheck(param) {
  let result = [];
  //현재위치에서 반경 검색인경우
  if ($("#locationSelectBox").val() == "here") {
    map.setView([lat, lon], 14);

    for (let i = 0; i < param.length; i++) {
      if ($("#distanceSelectBox").val() == "all") {
        populate(param[i]);
        chartDataList.push(param[i]);
      } else {
        let d = map.distance(
          [param[i].lat, param[i].lon],
          mapCircle.getLatLng()
        );
        //반경 내인 경우만 마커 표시
        if (d <= mapCircle.getRadius()) {
          populate(param[i]);
          chartDataList.push(param[i]);
        }
      }
    }
    makeList(chartDataList);
  } else {
    //원하는 위치에서 검색
    //국가관측망인 경우
    if ($("#categorySelect").val() == "airkor") {
      map.setView(
        [
          $("#dongSelectBox option:eq(1)").attr("lat"),
          $("#dongSelectBox option:eq(1)").attr("lon"),
        ],
        14
      );

      for (let i = 0; i < param.length; i++) {
        let addr = param[i].deviceIdx.split(" ");
        if (
          addr[0].substring(0, 2) ==
            $("#siSelectBox option:selected").text().substring(0, 2) &&
          addr[1] == $("#guSelectBox option:selected").text()
        ) {
          populate(param[i]);
          chartDataList.push(param[i]);
        }
      }
      //그 외의 경우
    } else {
      //동 전체 검색인 경우
      if ($("#dongSelectBox").val() == "all") {
        map.setView(
          [
            $("#dongSelectBox option:eq(1)").attr("lat"),
            $("#dongSelectBox option:eq(1)").attr("lon"),
          ],
          14
        );

        for (let i = 0; i < param.length; i++) {
          
          if (param[i].dcode.substr(2, 3) == $("#guSelectBox").val()) {
        
            populate(param[i]);
            chartDataList.push(param[i]);
          }
        }
      } else {
        map.setView(
          [
            $("#dongSelectBox option:selected").attr("lat"),
            $("#dongSelectBox option:selected").attr("lon"),
          ],
          14
        );

        for (let i = 0; i < param.length; i++) {
          if (param[i].dcode == $("#dongSelectBox").val()) {
            populate(param[i]);
            chartDataList.push(param[i]);
          }
        }
      }
    }

    makeList(chartDataList);
  }
}

$("#csvDownBtn").click(function () {
  let filename = "측정망 리스트.csv";
  getCSV(filename);
});

function getCSV(filename) {
  var csv = [];
  var row = [];
  row.push("지점명", "지점번호", "위도", "경도");
  csv.push(row.join(","));

  $.each(chartDataList, function (index, data) {
    row = [];
    row.push(data.stationName, data.serial, data.lat, data.lon);
    csv.push(row.join(","));
  });

  downloadCSV(csv.join("\n"), filename);
}

function downloadCSV(csv, filename) {
  var csvFile;
  var downloadLink;

  //한글 처리를 해주기 위해 BOM 추가하기
  const BOM = "\uFEFF";
  csv = BOM + csv;

  csvFile = new Blob([csv], { type: "text/csv" });
  downloadLink = document.createElement("a");
  downloadLink.download = filename;
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
}
