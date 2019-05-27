import React from 'react';
import moment from 'moment';
import { Table, Icon} from 'antd';
import { CL } from '../tools/index';
import CLComponent from './CLComponent.jsx';
import {Interface} from "../config/index.js";
const { Details, contentType } = Interface;


class CreditCollectionInfo extends CLComponent {
  state = {}

  constructor(props) {
    super(props);
  }
  componentWillMount () {
    this.loadData();
  }

  loadData() {
    const that = this;
    const orderId = that.props.orderId;
    const memberId = that.props.memberId;
    const collectHistoryLogListSettings = {
      contentType,
      method: Details.getCollectHistoryV2.type,
      url: Details.getCollectHistoryV2.url,
      data: JSON.stringify({
        memberId
      })
    }
    function collectHistoryLogListFn (res) {
      if (res.data) {
        that.setState({collectHistoryLogList: res.data});
      }
    }

    if (orderId) {
      CL.clReqwest({settings: collectHistoryLogListSettings, fn: collectHistoryLogListFn});
    } else {
      that.setState({collectHistoryLogList: []});
    }
  }

  render() {
    const that = this;
    const CreditCollectionInformation = {
      columns: [
        {
          title: 'No',
          dataIndex: 'index',
          width: "15%"
        },
        {
          title: 'Collect status',
          dataIndex: 'collectStatusName',
          width: "15%"
        },
        {
          title: 'Message',
          dataIndex: 'message',
          width: "15%"
        },
        {
          title: 'Collector',
          dataIndex: 'collectorName',
          width: "14%"
        },
          {
              title: 'Company',
              dataIndex: 'companyName',
              width: '14%'
          },
        {
          title: 'Time',
          dataIndex: 'time',
          width: "14%"
        },
        {
          title: 'Promise date',
          dataIndex: 'paytime',
          width: "14%"
        },

      ],
      data: _.map((that.state.collectHistoryLogList || []), function (doc, index) {
        return {
          index: index + 1,
          collectStatusName: doc.collectStatusName,
          message: doc.message,
          companyName: doc.companyName,
          time: doc.collectorTime ? moment(new Date(doc.collectorTime)).format("YYYY-MM-DD HH:mm") : '-',
          paytime: doc.promiseTime ? moment(new Date(doc.promiseTime)).format("YYYY-MM-DD") : '-',
          collectorName: doc.collectorName
        }
      })
    };

    return (
      <Table  bordered  className="credit-colleition-information cl-table" 
        title = {() => (<h4 className="table-title"> Credit Collection Information</h4>)}
        loading = {!that.state.collectHistoryLogList}
        pagination = {false}
        columns={CreditCollectionInformation.columns} 
        dataSource={CreditCollectionInformation.data}
        rowKey={record =>  record.index}
        scroll={{ y: 300 }}
        />
    );
  }
}
export default CreditCollectionInfo;