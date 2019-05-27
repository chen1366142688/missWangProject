import React from 'react';
import moment from 'moment';
import { Table, Icon} from 'antd';
import { CL } from '../tools/index';
import CLComponent from './CLComponent.jsx';
import CLBlockList from './CLBlockList.jsx';
import CF from 'currency-formatter';
import {Interface} from "../config/index.js";

const { contentType, repaymentRecord} = Interface;

class RepaymentRecord extends CLComponent {
  constructor(props) {
    super(props);
  }
  state = {
    data: [],
    loading: true
  }

  componentDidMount () {
    const applicationId = this.props.appId;
    if (applicationId) {
      this.loadData(applicationId);
    }
    
  }

  loadData(applicationId) {
    const that = this;
    const params = {
      page: {
        currentPage: 1,
        pageSize: 100
      },
      dpRepaymentRecord: {applicationId},
    }

    const settings = {
      contentType,
      method: repaymentRecord.type,
      url: repaymentRecord.url,
      data: JSON.stringify(params)
    }

    function fn (res) {
      if (res.data && res.data.page) {
        that.setState({
          data: res.data.page.result || [],
          loading: false
        })
      }
    }

    CL.clReqwest({settings, fn});
  }


  render() {
    const that = this;
    const columns = [
      {
        title: 'No',
        dataIndex: 'index',
        width: "6%",
      }, 
      {
        title: 'Repayment Channel',
        dataIndex: 'userEmail',
        width: "6%",
        render: function (text, record) {
          if (_.indexOf(["inputOrder", "ld"], record.repaymentCode) > -1) {
              return "Input Order";
          }
          return 'Dragonpay';
        }
      },
      {
        title: 'Repayment Time',
        dataIndex: 'operateTime',
        width: "10%",
        render: function (text, record) {
          return record.repaymentTime ? moment(record.repaymentTime).format("YYYY-MM-DD HH:mm") : '';
        }
      },
      {
        title: 'Repayment Amount',
        dataIndex: 'repaymentAmount',
        width: "12%",
        render (index, data) {
          return CF.format(data.repaymentAmount, {});
        }
      },
      {
        title: 'Institution',
        dataIndex: 'procid',
        width: "10%",
        render: function (text, record) {
          if (record.procid && record.procid !== "null") {
            return record.procid;
          } else {
            return "--"
          }
        }
      },
    ];
    const UserInfoData = {
      columns: columns,
      data: that.state.data.map((doc, index) => {
        doc.index = index + 1;
        return doc;
      })
    }

    return (
      <Table  bordered  className="user-info cl-table" 
        title = {() => (<h4 className="table-title"> Repayment Record of This Order </h4>)}
        loading = {that.state.loading}
        pagination = {false}
        columns={UserInfoData.columns}
        rowKey={record =>  record.index} 
        dataSource={UserInfoData.data} />
    );
  }
}
export default RepaymentRecord;