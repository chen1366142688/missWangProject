import Dispatcher from 'Dispatcher';
import constants from 'Constants';
import Action from './action';

module.exports = ()=> {
    let webSocket = new WebSocket('ws://127.0.0.1:8555/api');
    let timer;

    webSocket.onerror = function (event) {
        Dispatcher.dispatch(new Action(constants.common.SOCKET, {
            type: 'error',
            event: event
        }));
    };

    webSocket.onclose = function (event) {
        webSocket = new WebSocket('ws://127.0.0.1:8555/api');
        clearInterval(timer);
        Dispatcher.dispatch(new Action(constants.common.SOCKET, {
            type: 'close',
            event: event
        }));
    };

//与WebSocket建立连接
    webSocket.onopen = function (event) {
        timer = setInterval(HeartBeatCheck, 10000);
        webSocket.send('{"command":"OpenDevice"}');
        Dispatcher.dispatch(new Action(constants.common.SOCKET, {
            type: 'open',
            event: event,
            webSocket
        }));
    };

    function HeartBeatCheck()
    {
        webSocket.send('HeartBeatData');
    }

//处理服务器返回的信息
    webSocket.onmessage = function (event) {
        console.log(event.data);
        Dispatcher.dispatch(new Action(constants.common.SOCKET, {
            type: 'msg',
            event: event
        }));
    };
};