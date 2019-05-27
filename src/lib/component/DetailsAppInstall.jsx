import React from 'react';
import moment from 'moment';
import { Table} from 'antd';
import { CL } from '../tools/index';
import CLComponent from './CLComponent.jsx';
import {Interface} from "../config/index.js";
const { Details, contentType } = Interface;

class AppInstall extends CLComponent {
  state = {}

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
    const personalAppInstallInfoSettings = {
      contentType,
      method: Details.getPersonalAppInstallInfo.type,
      url: Details.getPersonalAppInstallInfo.url,
      data: JSON.stringify({
        memberId
      })
    }
    function personalAppInstallInfoFn (res) {
      if (res.data) {
        that.setState({personalAppInstallInfo: res.data || []});
      }
    }

    if (memberId) {
      CL.clReqwest({settings: personalAppInstallInfoSettings, fn: personalAppInstallInfoFn});
    } else {
      that.setState({personalAppInstallInfo: []});
    }
  }

  render() {
    const that = this;
    const AppInstalledInformations = {
      columns: [
        {
          title: 'No',
          dataIndex: 'index',
          width: "50%"
        },
        {
          title: 'App name',
          dataIndex: 'appName',
          width: "50%"
        }
      ],
      data: _.map((that.state.personalAppInstallInfo || []), function (doc, index) {
        return {
          index: index + 1,
          appName: doc.appName
        }
      })
    };

    return (
      <Table  bordered  className="app-install-informaton cl-table" 
        title = {() => (<h4 className="table-title"> App Installed Information <a> (Number of APP: {that.state.personalAppInstallInfo ? that.state.personalAppInstallInfo.length : 0})</a></h4>)}
        loading = {!that.state.personalAppInstallInfo}
        pagination = {false}
        columns={AppInstalledInformations.columns} 
        dataSource={AppInstalledInformations.data}
        scroll={{ y: 120 }}
        rowKey={record => record.index}
        />
    );
  }
}
export default AppInstall;