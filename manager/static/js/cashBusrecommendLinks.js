var phone;
var myreg = /^\d{10}$/;
var myregs = /^\d{4}$/;
var domain = "/uplending";
setPoint("h5Fragmnet", 210);
$('.register').on('click',function(){
    let value = $('#code').val();
    phone = $('.phoneNum').val();
    console.log(value,phone)
    if(value == '' || value == 'undefined' || value == null || !myregs.test(value)){
        sendMessage("Invalid verify code.");
        return;
    }else if(phone == '' || phone == 'undefined' || phone == null || !myreg.test(phone)){
        sendMessage("wrong number");
        return;
    }
    setPoint("register_get", 210);
    validExist(phone, value)
})

function register(phone, value){
    $.ajax({
        url:`${domain}/member/${phone}/login`,
        contentType: "application/json",
        dataType: "json",
        type:'post',
        data: JSON.stringify({
            "smsCode":value,
            "packetName":"h5 or wap",
            "version":"3"
        }),
        success:function(res){
            if(res.code == 200){
                console.log("send ok弹大礼包")
                $('#modalBag').show();
            }else{
                sendMessage(res.msg);
                console.log("请求失败")
            }
        },
        error:function(info){
            console.log("请求失败")
        }
    })
}
$('.close').on('click',function(){
    $('#modalBag').hide();
})
$('.sendCode').on('click',function(){
    phone = $('.phoneNum').val();
    if(phone == 'undefined' || phone == null || phone == '' || !myreg.test(phone)){
        sendMessage('wrong number');
        return;
    }
    $(this).css('background','#CCCCCC')
    $(this).attr('disabled',true)
    time(30, $(this))
    $(this).off('click')
    verifyCode()
})

function verifyCode() {
    phone = $('.phoneNum').val();
    $.ajax({
        url:`${domain}/member/verifyCode?phone=${"63" + phone}&version=3`,
        type:'GET',
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("packet-name", "com.dead.cash");
        },
        success:function(res){
            // sendMessage('send success');
            console.log("send ok发送验证码成功")
        },
        error:function(info){
            // sendMessage('send failed');
            console.log("请求失败")
        }
    })
}

function sendMessage(msg) {
    $('#message span')[0].innerHTML = msg;
    $('#message span')[0].className = "show-type";
    setTimeout(function () {
        $('#message span')[0].className = "none-type";
    }, 3000)
}

function validExist(phone, value) {
    if(phone.length == 10){
        if(!myreg.test(phone)){return;}
        phone = "63" + phone;
        $.ajax({
            url: `${domain}/member/${phone}/exist?version=3`,
            type:'GET',
            dataType:"json",
            success:function(res){
                if(res.code == 200 && !res.data.isExist){
                    register(phone, value)
                }else{
                    $('#modal').show();
                }
            },
            error:function(info){
                // sendMessage('send failed');
                console.log("请求失败")
            }
        })
    }else{
    }
}
$('#cancel').on('click',function(){
    $('#modal').hide();
})
$('.down').on('click',function(){
    $('#modal').hide();
    $('#modalBag').hide();
    setPoint("download_app", 210);
    location.href = 'https://play.google.com/store/apps/details?id=com.bus.cash';
})
$('.downLoad').on('click',function(){
    setPoint("download_app", 210);
    location.href = 'https://play.google.com/store/apps/details?id=com.bus.cash';
})
function time(wait, o) {
    if (wait == 0) {
        wait = 30
        o.text("Send");
        o.css('background','#983CE9')
        o.attr('disabled',false)
        o.on('click', function() {
            time(wait, $(this));
            o.css('background','#CCCCCC')
            $(this).off('click');
            verifyCode()
        });
    } else {
        o.text("Sent (" + wait + "s)");
        wait--;
        setTimeout(function() {
            time(wait, o);
        },1000)
    }
}

/**
 * 埋点
 */
function setPoint(viewName, name){
    $.ajax({
        url: `${domain}/memberTrack/actionAnalytic/v1`,
        dataType: "json",
        type: 'post',
        data: JSON.stringify({
            "attributes": {
                "focus": true,
                "clickTime": Date.now().toString(),
                "viewName": viewName
            },
            "name": name
        })
    })
}
