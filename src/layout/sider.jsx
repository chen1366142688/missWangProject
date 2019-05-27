
import { Menu, Icon, Switch, Button, Modal } from 'antd';
import React from 'react';
import { MenuConfig } from '../lib/config/';
import {CLComponent} from '../../src/lib/component/';
import { Link } from 'react-router-dom';
import { CL } from '../lib/tools/index';

import { Interface } from '../../src/lib/config/index';
const { contentType, accountingMonitor, paymentSerialRecordRole} = Interface;


const confirm = Modal.confirm;
const SubMenu = Menu.SubMenu;

class CLMenu extends CLComponent {
  state = {
    theme: 'dark',
    current: '0',
    collapsed: false,
    fundCharge: "0",
    paymentFailed: "0",
  }

  constructor (props) {
    super(props);
    this.bindCtx([
      "showConfirm",
      "confirmChange",
      "linkClick",
      "fmFlag",
      "pfFlag",
      "setTimer"

    ]);
  }

  handleClick = (e) => {
    this.confirmChange(e);
  }

  fmFlag() {
    //资金管理检查
    const that = this;
    const settings = {
      contentType,
      method: accountingMonitor.type,
      url: accountingMonitor.url
    }

    function fn (res) { //获取权限回调处理
      let {accountingMonitor} = res.data;
      sessionStorage.setItem("fundCharge", (accountingMonitor.accountingStatus || accountingMonitor.waitMactingAmountStatus).toString());
      that.setState({fundCharge:  (accountingMonitor.accountingStatus || accountingMonitor.waitMactingAmountStatus).toString()});
    }

    CL.clReqwest({settings, fn});
  }

  pfFlag() {
    const that = this;
    const settings = {
      contentType,
      method: paymentSerialRecordRole.type,
      url: paymentSerialRecordRole.url,
      data: JSON.stringify({
        page: {
          currentPage: 1,
          pageSize: 1
        },
        paymentSerialRecord: {
          serialStatusRange: [6, 7, 8, 9]
        }
      })
    }

    function fn (res) { //获取权限回调处理
      if (res.data && res.data.pagePayment && res.data.pagePayment.result && res.data.pagePayment.result.length) {
        sessionStorage.setItem("paymentFailed", "1");
        that.setState({paymentFailed: "1"})
      } else {
        sessionStorage.setItem("paymentFailed", "0");
        that.setState({paymentFailed: "0"})
      }
    }

    CL.clReqwest({settings, fn});
  }


  //每10分钟调用一次接口
  setTimer () {
    const that = this;
    this.timer = setInterval( () => {
      that.pfFlag();
      that.fmFlag();
    }, 600000)
  }

  componentDidMount () {
    this.setTimer();
    this.fmFlag();
    this.pfFlag();
  }

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
  }

  showConfirm(e, key) {
    const that  = this;
    confirm({
      title: 'Sure leave?',
      content: "you changed some  data, but didn't save, sure to leave",
      onOk() {
        that.confirmChange(e, key);
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  linkClick (e) {
    if (CL.getEditFlag()) {
      let hashValue = e.target.getAttribute("href");
      let key = e.target.dataset.key;
      ((...arg) => {this.showConfirm(...arg, hashValue, key)})()
      e.preventDefault();
      e.stopPropagation();
    }

    if (e.target.hash === location.hash) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  confirmChange (e, key) {


    if (_.isString(e)) {
      location.hash = e;
      this.setState({
        current: key,
      });
    } else {
      this.setState({
        current: e.key,
      });
    }

    //切换菜单时，清楚搜索项
    sessionStorage.removeItem("search");
    sessionStorage.removeItem("pagination");
    sessionStorage.removeItem("sorter");
    sessionStorage.removeItem("tableScrollTop");
    sessionStorage.removeItem("operateDataType");
    sessionStorage.removeItem("inputOrderType");
    sessionStorage.removeItem("fundsType");

    CL.removeEditFlag();
  }

  render() {
    let roles = JSON.parse(sessionStorage.getItem("roles"));
    if (!roles || !roles.length) {
      return '';
    }
    const that = this;

    //根据权限重构菜单
    let menuInfo = [];
    MenuConfig.map( (item, index) => {
      let realItem = item;
      let subReal = [];

      item.children.map( function (subItem, index) {
        let flag = roles.indexOf(subItem.role); //根据权限显示或隐藏菜单

        if (subItem.name === "Funds Management" && (sessionStorage.getItem("fundCharge") === "1" || that.state.fundCharge === "1")) { //判断是否需要充值
          subItem.icon = "exclamation-circle";
        } else if (subItem.name === "Funds Management"){
          subItem.icon = null;
        }

        if (subItem.name === "Payment Failed" &&  (sessionStorage.getItem("paymentFailed") === "1" || that.state.paymentFailed === "1")) { //判断是否需要充值
          subItem.icon = "exclamation-circle";
        } else if (subItem.name === "Payment Failed") {
          subItem.icon = null;
        }

        if (flag > -1) {
          subReal.push(subItem);
        }
      })

      if (subReal.length) {
        realItem.children = subReal;
        menuInfo.push(realItem);
      }
    })

    return (
      <div>
        <Menu
          theme={this.state.theme}
          onClick={this.handleClick}
          // defaultOpenKeys={['OM1']}
          selectedKeys={[this.state.current]}
          mode="inline"
          style= {{fontSize: '14'}}
        >
          {
            menuInfo.map( function (item, index) {
              return (
                <Menu.SubMenu key= {item.role + index} title={<span><Icon type={item.icon} /><span>{item.name}</span></span>}>
                {
                  item.children.map( function (subItem, index) {
                    return (<Menu.Item key={subItem.role + subItem.name + index}>
                      <Link onClick={ that.linkClick } data-key={subItem.role + subItem.name + index} to={subItem.path}>{subItem.icon ? (<Icon type={subItem.icon} />) : ""}{subItem.name}</Link>
                    </Menu.Item>)
                  })
                }
                </Menu.SubMenu>
              )
            })
          }

        </Menu>


      </div>
    );
  }
}

export default CLMenu;

