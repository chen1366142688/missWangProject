
var countdown = 60;
// var preUrl = `/uplending`; 
var preUrl = "/uplending-external-web";

//btn loading状态
function loaidng (btnloaidng) {
  var btn = document.getElementById("verify-code");
  btn.setAttribute("disabled", true);
  btn.innerHTML = '<div class="container"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';
}

function swalInfo (title, type) {
  swal({
    type: type || 'error',
    title: title,
    showConfirmButton: false,
    timer: 1500
  })
}

function loaidngBig () {
  var btn = document.getElementById("confirm-btn");
  btn.setAttribute("disabled", true);
  btn.innerHTML = '<div class="container-2"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';
}

//设定倒计时
function settime(val, second) {
  if (countdown == 0) {
    val.removeAttribute("disabled");
    val.innerHTML = "send";
    countdown = second || 60;
    return;
  } else {
    val.setAttribute("disabled", true);
    val.innerHTML = second || countdown;
    countdown--;
  }
  setTimeout(function() {
    settime(val)
  }, 1000)
}

function backBigBtn () {
  var btn = document.getElementById("confirm-btn");
  btn.removeAttribute("disabled");
  btn.innerHTML = 'TAP HERE TO START';
}

function backSendBtn () {
  var btn = document.getElementById("verify-code");
  btn.removeAttribute("disabled");
  btn.innerHTML = "send";
} 

function sendVerifyCode () {
  var url = preUrl + "/member/verifyCode";
  var telephoneNo = checkMobile();
  var btn = document.getElementById("verify-code");
  
  if (telephoneNo) {
    loaidng();
    telephoneNo = "63" + parseInt(telephoneNo);
    reqwest({
      url: preUrl + '/member/isMember/v1_12/' + telephoneNo,
      method: 'get',
      timeout: 30000,
    }).then( function (res) {
      if (res.code === 200 && res.data === false) {
        reqwest({
          url: url + "?phone=" + telephoneNo,
          method: 'get',
          timeout: 30000,
        }).then( function (res) {
          if (res.code === 200 && res.msg === "Ok.") {
            console.log('send code success');
            settime(btn);
          } else {
            swalInfo(res.msg)
            settime(btn, 1);
          }
        }, function (err, res) {
          backSendBtn();
          if (res === "Request is aborted: timeout") {
            swalInfo("Request timed out, please try again");
          }
        })
      } else {
        swalInfo("User is exist. Please log in your app.");
        backSendBtn()
      }
    }, function (err, res) {
      backSendBtn();
      if (res === "Request is aborted: timeout") {
        swalInfo("Request timed out, please try again");
      }
    })
  }
}


//注册接口
function register (params) {
  var url =  preUrl + "/member/register";
  var btn = document.getElementById("confirm-btn");
  loaidngBig();
  // return;
  reqwest({
    url: url,
    method: 'post',
    data: JSON.stringify(params),
    contentType: 'application/json',
    timeout: 30000,
  }).then (function (res) {
    if (res.code === 200 && res.msg === "Ok.") {
      swalInfo("Registered successfully.", 'success');
      backBigBtn();
      setTimeout(function () {
      //跳转到googlePlay
      try  {
        window.location.href = 'market://details?id=com.unipeso.phone';
      } catch (e) {
        window.location.href = "https://play.google.com/store/apps/details?id=com.unipeso.phone";
      }
       

      }, 2000)
    } else {
      swalInfo(res.msg);
      backBigBtn();
    }
  }, function (err, res) {
    backBigBtn();
    if (res === "Request is aborted: timeout") {
      swalInfo("Request timed out, please try again");
    }
  })
}

//确认按钮
function confirm () {

  var params = checkParams() || {};
  if (!params.telephoneNo || !params.smsCode || !params.password || !params.recommenderId) {
    return;
  }
  register(params);
}

//检查参数格式
function checkParams () {
  var telephoneNo = document.getElementById("telephoneNo").value;
  var smsCode = document.getElementById("smsCode").value;
  var password = document.getElementById("password").value;
  var recommenderId;

  if (location.search.indexOf("recommenderId") < 0 || !location.search.split("?")[1].split("=")[1]) {
    swalInfo("Please check url, not find recommeder");
    return;
  }

  recommenderId = location.search.split("?")[1].split("=")[1];
  if (!telephoneNo) {
    swalInfo('Please input phone number');
    return;
  }

  if (!telephoneNo.startsWith("09") && !telephoneNo.startsWith("9")) {
    swalInfo("Should start with 9 or 09");
    return;
  }

  if (telephoneNo.length != 10 && telephoneNo.length != 11) {
    swalInfo("Should contain from 10 to 11 numbers");
    return;
  }

  if (!password) {
    swalInfo('Please input password');
    return;
  }

  if (!smsCode) {
    swalInfo('Please input verification code');
    return;
  }

  password = md5.base64(password);
  telephoneNo = "63" + parseInt(telephoneNo);
  return {telephoneNo: telephoneNo , smsCode: smsCode, password: password, recommenderId: recommenderId}
}

//检查电话号码
function checkMobile () {
  var telephoneNo = document.getElementById("telephoneNo").value;
  if (!telephoneNo) {
    swalInfo('Please input phone number');
    return;
  }

  var arr = [telephoneNo.substr(0, 2), telephoneNo.substr(0, 1)];

  if (arr.indexOf("09") < 0 && arr.indexOf("9") < 0) {
    swalInfo( "Phone number should start with 9 or 09 ");
    return;
  }

  if (telephoneNo.length != 10 && telephoneNo.length != 11) {
      swalInfo("Phone number should contain from 10 to 11 numbers");
      return;
  }
  return parseInt(telephoneNo);
}



