import React from 'react';
import {CLComponent, CLForm} from 'Lib/component/index';
import {CL} from 'Lib/tools/index';
import _ from 'lodash';
import { message, Modal, Tooltip,} from 'antd';
import {Interface} from 'Lib/config/index';

const confirm = Modal.confirm;
let {contentType, appMonitorProductVersionPacket, telephoneManagerQueryMemberInfo, telephoneManagerModifyMemberTelephone} = Interface;

export default class MyForm extends CLComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      tableLoading: false,
      AppName: [],
      packetName: '',
      memberName: ''
    }
  }

  componentDidMount() {
    this.appList();
  }

  getFields = (fields) => {
    let reg = /^(639)\d{9}$/;
    if(reg.test(fields.oldTelephoneNo) === false || reg.test(fields.newTelephoneNo) === false ){
      message.error('Invalid phone numbe!');
    }else{
      let that = this;
      let params = {
        memberId:that.state.memberId,
        packetName: fields.packetName,
        oldTelephoneNo: fields.oldTelephoneNo,
        newTelephoneNo: fields.newTelephoneNo,
        operateDesc:fields.operateDesc,
      };
      let appVersionList = that.state.appVersionList;
      appVersionList.forEach(doc => {
        if (doc.packetName === params.packetName) {
          params = _.extend(params, doc);
        }
      });
      confirm({
        content: 'Whether to do?',
        onOk() {
          that.setState({tableLoading: true});
          const settings = {
            contentType,
            method: telephoneManagerModifyMemberTelephone.type,
            url: telephoneManagerModifyMemberTelephone.url,
            data: JSON.stringify(params),
          };

          function fn(res) {
            if(res && res.code === 200){
              that.setState({data:{}});
              that.props.getFieldsData();
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
      method: appMonitorProductVersionPacket.type,
      url: appMonitorProductVersionPacket.url,
    };

    function fn(res) {
      let obj = [];
      let obj1 = [];
      if (res.data) {
        res.data.map((doc, index) => {
          obj.push({
            value: doc.packetName,
            name: doc.versionName,
          });
          obj1.push({
            version: (doc.version).toString(),
            packetName: doc.packetName,
          });
        })
        that.setState({
          AppName: obj,
          appVersionList: obj1,
        });
      }
    }

    CL.clReqwest({settings, fn});
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
        label: "App",
        placeholder: "Please select",
        options: this.state.AppName,
        rules: [{required: true, message: "Please enter App name!"}],
        onChange: function (e) {
          const data = _.extend(that.state.data, {packetName: e});
          that.setState(data);
        }
      },

      {
        id: "oldTelephoneNo",
        type: "text",
        label: "User's old phone number",
        placeholder: "639xxxxxxxxx",
        rules: [{
          required: true,
          message: "Invalid phone numbe! The phone number should start with 639 and be a 12-digit pure number",
          pattern: /^(639)\d{9}$/
        }],
        onChange: function (e) {
          if (e.target.value.length >= 12) {
            const data = _.extend(that.state.data, {oldTelephoneNo: e.target.value});
            that.setState(data);
            let params = {
              packetName: that.state.data.packetName,
              telephoneNo: e.target.value,
            };
            let appVersionList = that.state.appVersionList;
            appVersionList.forEach(doc => {
              if (doc.packetName === params.packetName) {
                params = _.extend(params, doc);
              }
            });
            const settings = {
              contentType,
              method: telephoneManagerQueryMemberInfo.type,
              url: telephoneManagerQueryMemberInfo.url,
              data: JSON.stringify(params),
            };

            function fn(res) {
              if (res && res.data) {
                const data = _.extend(that.state.data, {memberId: res.data.memberId, memberName: res.data.memberName});
                that.setState(data);
              }
            }

            CL.clReqwest({settings, fn});
          }
        }
      },

      {
        id: "memberName",
        type: "text",
        label: "User's name",
        placeholder: "--",
        disabled: this.props.disabled,
        onChange: function (e) {
          const data = _.extend(that.state.data, {memberName: e.target.value});
          that.setState(data);
        }
      },

      {
        id: "newTelephoneNo",
        type: "text",
        label: "User's new phone number",
        placeholder: "639xxxxxxxxx",
        rules: [{
          required: true,
          message: "Invalid phone numbe! The phone number should start with 639 and be a 12-digit pure number",
          pattern: /^(639)\d{9}$/
        }],
        onChange: function (e) {
          const data = _.extend(that.state.data, {newTelephoneNo: e.target.value});
          that.setState(data);
        }
      },

      {
        id: "operateDesc",
        type: "textarea",
        label: "Note",
        placeholder: "Please enter note!",
        rules: [
          {validator: (rule, value, callback) => this.limitLengthValid(rule, value, callback, 200)},
        ],
        onChange: function (e) {
          const data = _.extend(that.state.data, {operateDesc: e.target.value});
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
      <div className="addBlackList" key='addBlackList'>
        <CLForm settings={settings}/>
      </div>
    )
  }
}
