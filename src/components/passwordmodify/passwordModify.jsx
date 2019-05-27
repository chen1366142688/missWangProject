import React from 'react';
import QueueAnim from 'rc-queue-anim';

import {CLComponent, CLForm} from '../../../src/lib/component/index';
import { CLAnimate, CL} from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';

import _ from 'lodash';
import { message } from 'antd';

let  {passwordModify, contentType} = Interface;

class PasswordModify extends CLComponent {
  state = {
    tableLoading: false,
    data: [],
    search: {}
  }

  constructor (props) {
    super(props);
    this.bindCtx([
      "renderBody",
      "getFormFields",
    ]);
  }

  componentDidMount() {
    CLAnimate.inAndOut(this);
  }

  getFormFields (fields, thatForm) {
    let search = {};
    let settings = {};

    _.map(fields, function (doc, index) {
      search[index] = doc;
    })   
    this.setState({search: search});

    if (search.password !== search.confirmPassword) {
      message.error("new password and confirm password is not the same");
      thatForm.setState({loading: false});
      return;
    }

    settings = {
      contentType,
      method: passwordModify.type,
      url: passwordModify.url,
      data: JSON.stringify(search)
    }

    function fn (res) {
      thatForm.setState({loading: false});
      if (res.data) {
        message.success(res.result);
        location.hash = "/login";
      }
    }
    CL.clReqwest({settings, fn});
  }

  renderBody() {
    let that = this;
    const options = [
      {
        id: 'oldPassword',
        type: 'text',
        label: 'Old password',
        formType: 'textarea',
        placeholder: '',
        inputType: "password",
        rules: [{ required: true, message: 'Please input old password' }]
      },

      {
        id: 'password',
        type: 'text',
        label: 'New password',
        placeholder: '',
        inputType: "password",
        rules: [{ required: true, message: 'Please input new password' }]
      },

      {
        id: 'confirmPassword',
        type: 'text',
        label: 'Enter password again',
        placeholder: '',
        inputType: "password",
        rules: [{ required: true, message: 'Please input confirm password' }]
      }
    ];

    const settings = {
      options: options,
      getFields: that.getFormFields,
      values: {}
    }

    return (
      <div className="modify-password" key="modify-password">
       <CLForm settings = {settings}/> 
      </div>
    )
  }

  render (data) {
    return (
      <QueueAnim className="animate-content" type={this.state.aniType}>
        {this.state.showBlock ? [ this.renderBody() ] : null}
      </QueueAnim>
    )
  }
}
export default PasswordModify;