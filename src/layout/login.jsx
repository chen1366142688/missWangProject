import React from 'react';
import _ from 'lodash';
import reqwest from 'reqwest';
import md5 from 'js-md5';
import { Form, Icon, Input, Button, Checkbox, Col, Row, message} from 'antd';
import { Interface } from '../../src/lib/config/index';
import { CLComponent } from '../../src/lib/component/index';
import { CL } from '../../src/lib/tools/index';

const FormItem = Form.Item;
const {dologin, getTimeStamp, contentType, getOperateResources, logout, accountingMonitor, paymentSerialRecordRole, loginByAmeyo} = Interface;

class Login extends CLComponent {
  state = {
    loading: false
  }

  constructor (props) {
    super(props);
    this.bindCtx([
      "handleSubmit", 
      "loginAmo",
      "getAuth"
    ]);
  }

  handleSubmit = (e) => {
    e.preventDefault();
    let that = this;

    that.setState({loading: true});

    this.props.form.validateFields((err, values) => {
      if (!err) {
        const hash = md5.create();
        hash.update(values.password);
        hash.update('?*#@ACP=-)');
        const password = hash.hex();

        const timeSettings = {
          contentType,
          method: getTimeStamp.type,
          url: getTimeStamp.url
        }

        const loginSettings = {
          contentType,
          method: "post",
          url: dologin.url,
          data: JSON.stringify({
            loginName: values.loginName,
            password: password
          }),
          withCredentials: false
        }

        function timeFn(res) { //登录回调处理
          if (res.code === 200) {
            const time = res.data;
            const str = `${values.loginName.toUpperCase()}${time}${password.toUpperCase()}`
            const hashPassword = md5(str);

            loginSettings.data = JSON.stringify({
              loginName: values.loginName,
              password: hashPassword,
              timeStamp: time
            });

            CL.clReqwest({settings: loginSettings, fn: loginFn});

          } else {
            that.setState({loading: false});
          }
        }

        //资金管理检查
        const accountMonitorSettings = {
          contentType,
          method: accountingMonitor.type,
          url: accountingMonitor.url
        }

        function accountMonitorFn (res) { //获取权限回调处理
          sessionStorage.setItem("fundCharge", res.data);
        }


        const paymentFailedSettings = {
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

        function paymentFailedFn (res) { //获取权限回调处理
          if (res.data && res.data.pagePayment && res.data.pagePayment.result && res.data.pagePayment.result.length) {
            sessionStorage.setItem("paymentFailed", "1");
          } else {
            sessionStorage.setItem("paymentFailed", "0");
          }
        }


        function loginFn(res) { //登录回调处理
          that.setState({tableLoading: false});
          if (res.code === 200) {
            that.getAuth();
            CL.clReqwest({settings: accountMonitorSettings, fn: accountMonitorFn});
            CL.clReqwest({settings: paymentFailedSettings, fn: paymentFailedFn});
          } else {
            that.setState({loading: false});
          }
        }

        CL.clReqwest({settings: timeSettings, fn: timeFn});
      }
    });
  }

  getAuth () {
    const that = this;
    const authSettings = {
      contentType,
      type: getOperateResources.type,
      url: getOperateResources.url
    }

    function authFn (res) { //获取权限回调处理
      const info = JSON.parse(res.response);
      let roles = [];
      that.setState({loading: false});
      if (info.data && info.data.loginName) {
        sessionStorage.setItem("loginName", info.data.loginName);
        sessionStorage.setItem("loginId", info.data.id);
      }

      if (info.data && info.data.resources) {
        _.map(info.data.resources, function (doc, index) {
          return doc.map( function (subItem) {
            roles.push(subItem.remark);
          })
        })
      }

      if (!roles.length) {
        message.error("You do not have any permissions at all!");
      } else {
        message.success("login success");
        sessionStorage.setItem("roles", JSON.stringify(roles));
        location.hash = '#/uplending/home';
      }
    }
    CL.clReqwest({settings: authSettings, fn: authFn});
  }

  componentDidMount() {

    const id = sessionStorage.getItem("loginId");
    if (!id) {
      this.loginAmo();
      return;
    }


    const logutSettings = {
      contentType,
      type: logout.type,
      url: `${logout.url}/${id}`
    }
    let that = this;
    reqwest(logutSettings).then( function (res) {
      sessionStorage.clear();
      const doc = JSON.parse(res.responseText);
      if (doc.code === 200) {
        console.log(res.responseText);
        message.success("logout success");
      }
    })
  }

  loginAmo() {
    let path = location.hash.split("?")[1] ? location.hash.split("?")[1] : '';
    const that = this;
    let param = {};
    if (path) {
      path.split("&").map( function (doc) {
        if (doc.split("=")[1] === "null") {
          param[doc.split("=")[0]] = null;
        }
        param[doc.split("=")[0]] = doc.split("=")[1]
      })
      //资金管理检查
      const settings = {
        contentType,
        method: loginByAmeyo.type,
        url: loginByAmeyo.url,
        data: JSON.stringify(param)
      }
      function fn (res) { //获取权限回调处理
        that.getAuth();
      }

      CL.clReqwest({settings, fn});
    }
  }


  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="cl-login-wrap">
        <img src="/manager/src/assets/img/login-bg.png"  alt="login" className="login-bg"/>
        <img src="/manager/src/assets/img/login-logo.png"  alt="login" className="login-logo"/>
        <img src="/manager/src/assets/img/login-title2.png"  alt="login" className="login-title-1"/>
        <img src="/manager/src/assets/img/login-title1.png"  alt="login" className="login-title-2"/>
        <img src="/manager/src/assets/img/login-title3.png"  alt="login" className="login-title-3"/>

        <Row className="cl-login">
          <div className="input-wrap">

            <Form onSubmit={this.handleSubmit} className="login-form">
              <h3>Welcome</h3>
              <FormItem>
                {getFieldDecorator('loginName', {
                  rules: [{ required: true, message: 'Please input your username!' }],
                })(
                  <Input prefix={<Icon type="user" />} placeholder="Username" />
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('password', {
                  rules: [{ required: true, message: 'Please input your Password!' }],
                })(
                  <Input prefix={<Icon type="lock"/>} type="password" placeholder="Password" />
                )}
              </FormItem>
              <FormItem className="remember-me">
                {getFieldDecorator('remember', {
                  valuePropName: 'checked',
                  initialValue: true,
                })(
                  <Checkbox >Remember me</Checkbox>
                )}
              </FormItem>
              <FormItem>
                <Button type="primary" htmlType="submit" className="login-form-button" loading={this.state.loading}>
                  Login
                </Button>
              </FormItem>
            </Form>
          </div>
        </Row>
      </div>

    );
  }
}

const LoginForm = Form.create()(Login);
export default LoginForm;

// <Col span={8} offset={8} className="login-title">
//   Cashlending Back-end Management System
// </Col>
