import React from 'react';
import ReactDom from 'react-dom';
import Layout from './layout/layout.jsx';
import '../src/assets/css/style.css'; // 自定义样式
import 'antd/dist/antd.min.css'; // 蚂蚁组件样式
import 'risk-control-front-components-pro/less/common.css'
import '../src/assets/img/iphone6.png'; // 图片
import { CL } from './lib/tools/index';

document.body.innerHTML = "<div id='app'></div>";

// 浏览器刷新，或者关闭提醒
window.onbeforeunload = function (e) {
  if (CL.getEditFlag()) {
    const dialogText = "you changed some  data, but didn't save, sure to leave";
    e.returnValue = dialogText;
    return dialogText;
  }
};

ReactDom.render(
  <Layout />,
  document.getElementById('app'),
);
