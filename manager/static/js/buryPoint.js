window.buryPoint = (memberId, packetName, deviceId, xVersion) => {
    // alert("memberId: " + memberId + ", packetName: " + packetName + ", deviceId: " + deviceId + ", xVersion: " + xVersion);
    $.ajax({
        url: "/uplending-external-web/app/prepare-click-data?memberId=" + memberId,
        type: 'GET',
        xhrFields: {
            withCredentials: true // 这里设置了withCredentials
        },
        success: function (result) {
            if (result.code == 200) {
                // alert(JSON.stringify(result.data));
                let data = result.data;
                data.clickTime = Date.parse(new Date());
                data.packetName = packetName;
                data.memberId = memberId;
                data.version = 0;
                data.page = window.page;
                data.code = window.code;
                data.deviceId = deviceId;
                data.xVersion = xVersion;

                $.ajax({
                    url: "/uplending-external-web/memberTrack/click",
                    type: 'PUT',
                    dataType: "json",
                    contentType: "application/json;charset=utf-8",
                    data: JSON.stringify(data),
                    xhrFields: {
                        withCredentials: true // 这里设置了withCredentials
                    }
                })
            }
        }
    })

}