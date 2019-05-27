let dis = {};
const disFixed = {};
const mapDis = {};
const url = '/msrestful/riskcontrolmetric/save';

window.onload = function () {
  dis = sessionStorage.getItem('distance');
  if (!dis) {
    // 提示错误的文字
    alert('distace error');
  } else {
    dis = JSON.parse(dis);
  }

  initMap();

  const lbsDiv = document.querySelector('.lbs-info');
  const homeDiv = document.querySelector('.home-info');
  const companyDiv = document.querySelector('.company-info');

  lbsDiv.innerHTML = `<h4>LBS: ${dis.Lbs} </h4>`;
  homeDiv.innerHTML = `<h4>Home</h4>\
          <p>City: ${dis.Home.city},  Barangay: ${dis.Home.barangay}</p>\
          <p>Detail: ${dis.Home.detail}</p>`;

  companyDiv.innerHTML = `<h4>Company</h4>\
          <p>City: ${dis.Company.city},  Barangay: ${dis.Company.barangay}</p>\
          <p>Detail: ${dis.Company.detail}</p>\
          <p>Company Name: ${dis.Company.companyName}</p>`;
};

function initMap() {
  const home = dis.Home || {};
  const company = dis.Company || {};
  const bounds = new google.maps.LatLngBounds();
  const markersArray = [];
  const origin1 = disFixed.home || `${home.detail},${home.barangay}, ${home.city}`;
  const origin2 = disFixed.company || `${company.detail},${company.barangay}, ${company.city}`;
  const destinationA = dis.Lbs;

  const destinationIcon = 'https://chart.googleapis.com/chart?' +
      'chst=d_map_pin_letter&chld=D|FF0000|000000';
  const originIcon = 'https://chart.googleapis.com/chart?' +
      'chst=d_map_pin_letter&chld=O|FFFF00|000000';

  const map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 55.53, lng: 9.4 },
    zoom: 10,
  });
  const geocoder = new google.maps.Geocoder();

  const service = new google.maps.DistanceMatrixService();
  service.getDistanceMatrix({
    origins: [origin1, origin2],
    destinations: [destinationA],
    travelMode: 'DRIVING',
    unitSystem: google.maps.UnitSystem.METRIC,
    avoidHighways: false,
    avoidTolls: false,
  }, (response, status) => {
    if (status !== 'OK') {
      // alert('Error was: ' + status);
      console.log('status', status);
      return;
    }
    const originList = response.originAddresses;
    const destinationList = response.destinationAddresses;
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = '';
    deleteMarkers(markersArray);

    mapDis.home = formatDetail(originList[0]);
    mapDis.company = formatDetail(originList[1]);
    mapDis.homeDis = getDistance(response, 'home');
    mapDis.companyDis = getDistance(response, 'company');

    const showGeocodedAddressOnMap = function (asDestination) {
      const icon = asDestination ? destinationIcon : originIcon;
      return function (results, status) {
        console.log('results-->',results);
        console.log('status-->',status);
        if (status === 'OK') {
          map.fitBounds(bounds.extend(results[0].geometry.location));
          markersArray.push(new google.maps.Marker({
            map: map,
            position: results[0].geometry.location,
            icon: icon,
          }));
        } else {
          // alert('Geocode was not successful due to: ' + status);
          console.log('status');
        }
      };
    };

    for (let i = 0; i < originList.length; i++) {
      const results = response.rows[i].elements;
      geocoder.geocode({ address: originList[i] },
        showGeocodedAddressOnMap(false));

      for (let j = 0; j < results.length; j++) {
        geocoder.geocode({ address: destinationList[j] },
          showGeocodedAddressOnMap(true));

        if (i === 0) {
          originList[i] = `<strong>Home: </strong>${originList[i]}`;
        } else if (i === 1) {
          originList[i] = `<strong>Company: </strong>${originList[i]}`;
        }

        outputDiv.innerHTML += `${originList[i]}<====> LBS` +
              `  distance: ${(results[j].distance || {}).text} in ${(results[j].duration || {}).text}<br>`;
      }
    }
  });
}



function deleteMarkers(markersArray) {
  for (let i = 0; i < markersArray.length; i++) {
    markersArray[i].setMap(null);
  }
  markersArray = [];
}


function formatDetail(str) {
  const arr = str.split(',');
  var str = '';
  if (arr.length > 4) {
    arr.pop();
    arr.pop();
    arr.pop();
    arr.pop();
    str = arr.join(',');
  } else {
    str = arr[0];
  }

  return str;
}

function getDistance(res, type) {
  let dis = 0;
  if (type === 'home' && res.rows[0].elements[0].status === 'OK') {
    dis = res.rows[0].elements[0].distance.value;
  } else if (type === 'company' && res.rows[1].elements[0].status === 'OK') {
    dis = res.rows[1].elements[0].distance.value;
  }
  return (dis / 1000).toFixed(2);
}

// 点击搜索按钮
function search() {
  const home = document.querySelector('#home-address').value;
  const company = document.querySelector('#company-address').value;
  disFixed.home = home;
  disFixed.company = company;

  initMap();
}

function swalInfo(title, type) {
  swal({
    type: type || 'error',
    title: title,
    showConfirmButton: false,
    timer: 1500,
  });
}

function swConfirm(params) {
  swal({
    title: 'Sure to save distance data?',
    text: 'you will save distance data',
    type: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#DD6B55',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes',
  }).then((result) => {
    if (result.value) {
      reqwest({
        url: url,
        method: 'post',
        timeout: 30000,
        data: JSON.stringify(params),
        contentType: 'application/json',
      }).then((doc) => {
        swal(
          'Modified!',
          'Success',
          'success',
        );
      });
    }
  });
}

function saveAddress() {
  if (!dis.appId) {
    swalInfo('appId not find');
    return;
  }

  if (!mapDis.companyDis) {
    swalInfo('company to lbs distance is wrong');
    return;
  }

  // if (!mapDis.company) {
  //   swalInfo("company detail address is wrong");
  //   return;
  // }

  if (!mapDis.homeDis) {
    swalInfo('home to lbs distance is wrong');
    return;
  }

  // if (!mapDis.home) {
  //   swalInfo("home detail address is wrong");
  //   return;
  // }


  const params = {
    applicationId: dis.appId,
    workLbsDistance: mapDis.companyDis,
    homeLbsDistance: mapDis.homeDis,
    // "resideAddress": mapDis.home,
    // "companyAddress": mapDis.company,
  };

  swConfirm(params);
}
