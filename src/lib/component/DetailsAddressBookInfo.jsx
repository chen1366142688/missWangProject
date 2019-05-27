import React from 'react';
import { Table} from 'antd';
import { CL } from '../tools/index';
import CLComponent from './CLComponent.jsx';
import CLBlockList from './CLBlockList.jsx';
import {Interface} from "../config/index.js";
const { Details, contentType } = Interface;

class AddressBookInfo extends CLComponent {
  state = {
    addressBookInfo: []
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'loadData',
    ]);
  }

  componentDidMount () {
    this.loadData();
  }

  loadData() {
    const that = this;
    const memberId = that.props.memberId;
    const totalPersonCountSettings = {
      contentType,
      method: Details.totalPersonCount.type,
      url: Details.totalPersonCount.url,
      data: JSON.stringify({
        merberId: memberId
      })
    }
    function totalPersonCountFn (res) {
      if (res.data) {
        that.setState({totalPersonCount: res.data});
      }
    }

    const sensitivePersonCountSettings = {
      contentType,
      method: Details.getSensitivePersonCount.type,
      url: Details.getSensitivePersonCount.url,
      data: JSON.stringify({
        merberId: memberId
      })
    }
    function sensitivePersonCountFn (res) {
      if (res.data) {
        that.setState({sensitivePersonCount: res.data});
      }
    }


    if (memberId) {
      CL.clReqwest({settings: totalPersonCountSettings, fn: totalPersonCountFn});
      CL.clReqwest({settings: sensitivePersonCountSettings, fn: sensitivePersonCountFn});
    }
  }


  render() {
    const that = this;
    const {mark, showMark} = that.props;
    const AddressBookInformation = {
      title: "Contact List Information",
      data: [
        {
          title: "Number of contacts",
          content: that.state.totalPersonCount,
          type: 'text',
          // check: showMark ? CL.setMark(mark.hasMoreThan30Contacts) : ''
        },
        {
          title: "Number of negetive contacts",
          content: that.state.sensitivePersonCount,
          type: 'text',

        }
      ]
    }

    return (
      <CLBlockList  settings={AddressBookInformation}/>
    );
  }
}
export default AddressBookInfo;
