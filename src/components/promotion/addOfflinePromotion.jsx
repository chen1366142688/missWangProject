import React from 'react';
import {CLComponent, CLForm} from 'Lib/component/index';
import {CL} from 'Lib/tools/index';
import _ from 'lodash';
import {Interface} from 'Lib/config/index';

import { message, Modal, } from 'antd';
const confirm = Modal.confirm;
let {contentType, appConfigListPacketApp, promotionAddUser, appConfigListAppName} = Interface;

export default class MyForm extends CLComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      loading: false,
      AppName: [],
      packetName: '',
    }
  }

  componentDidMount() {
    this.appList();
  }

  getFields = (fields) => {
    let reg = /^(639)\d{9}$/;
    if(reg.test(fields.telephoneNo) === false){
      message.error('Invalid phone numbe!');
    }else{
      let that = this;
      let params = {
        packetName: fields.packetName,
        phone: fields.telephoneNo,
      };
      confirm({
        content: 'Whether to add the client?',
        onOk() {
          that.setState({tableLoading: true});
          const settings = {
            contentType,
            method: promotionAddUser.type,
            url: promotionAddUser.url,
            data: JSON.stringify(params),
          };

          function fn(res) {
            if(res && res.code === 200){
              that.setState({data:{}});
              that.props.loadDataOne();
            }
          }
          CL.clReqwest({settings, fn});
        }
      })
    }
  }

  appList = () => {
    const that = this;
    const settings = {
      contentType,
      method: appConfigListPacketApp.type,
      url: appConfigListPacketApp.url,
    };
    function fn(res) {
      const data = res.data;
      let roles = [];
      if (data) {
        Object.keys(data).forEach(function(key){
          roles.push({
            name:data[key],
            value: key,
          });
        });
        that.setState({ AppName: roles });
      }
    }
    CL.clReqwest({ settings, fn });
  }

  limitLengthValid = (rule, value, callback, limit) => {
    if (value && value.length > limit) {
      callback(`Limit ${limit} characters`);
    } else {
      callback();
    }
  };

  limitValueValid = (rule, value, callback, max, min) => {
    if (value && typeof max === "number" && value > max) {
      callback(`The maximum cannot exceed ${max}`);
    } else if (value && typeof min === "number" && value < min) {
      callback(`The minimum cannot below ${min}`);
    } else {
      callback();
    }
  };

  render() {
    let that = this;
    const options = [
      {
        id: "packetName",
        type: "select",
        label: "App Platform",
        placeholder: "Please select",
        options: this.state.AppName,
        rules: [{required: true, message: "Please enter App name!"}],
        onChange: function (e) {
          const data = _.extend(that.state.data, {packetName: e});
          that.setState(data);
        }
      },

      {
        id: "telephoneNo",
        type: "text",
        label: "User phone",
        placeholder: "639xxxxxxxxx",
        rules: [{
          required: true,
          message: "Invalid phone number. It should begin with 639 and contain 12 digits.",
          pattern: /^(639)\d{9}$/
        }],
        onChange: function (e) {
          const data = _.extend(that.state.data, {telephoneNo: e.target.value});
          that.setState(data);
        }
      },
    ];

    const settings = {
      options: options,
      getFields: this.getFields,
      values: this.state.data,
    };

    return (
      <div className="addOfflinePromotion" key='addOfflinePromotion'>
        <CLForm settings={settings}/>
      </div>
    )
  }
}
