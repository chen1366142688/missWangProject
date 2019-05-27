import React from 'react';
import { Table} from 'antd';
import moment from 'moment';
import { CL } from '../tools/index';
import CLComponent from './CLComponent.jsx';
import {Interface} from "../config/index.js";
import CF from 'currency-formatter';

const { Details, contentType } = Interface;

class LoanRecord extends CLComponent {
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
    const loanRecordSettings = {
      contentType,
      method: Details.loanOrderHistory.type,
      url: Details.loanOrderHistory.url,
      data: JSON.stringify({
        memberId: memberId
      })
    }
    function loanRecordFn (res) {
      if (res.data) {
        that.setState({loanRecord: res.data.result || []});
      }
    }

    if (memberId) {
      CL.clReqwest({settings: loanRecordSettings, fn: loanRecordFn});
    }
  }


  render() {
    const that = this;
    const loanRecord = that.state.loanRecord || [];

    const LoanRecords = {
      columns: [
        {
          title: 'Application No.',
          dataIndex: 'applicationId',
        },
        {
          title: 'Application time',
          dataIndex: 'applicationTime',
          render: function (text, record) {
            return moment(record.applicationTime).format("YYYY-MM-DD HH:mm");
          }
        },
        {
          title: 'Loan amount',
          dataIndex: 'loanAmount',
          render (index, data) {
            return CF.format(data.loanAmount, {});
          }
        },
        {
          title: 'Payment term',
          dataIndex: 'loanTimeLimit',
        },

        {
          title: 'Repayment status',
          dataIndex: 'statusName'
        },
        {
          title: 'Repayment time',
          dataIndex: 'frepaymentTime',
          render: function (text, record) {
            return record.frepaymentTime ? moment(record.frepaymentTime).format("YYYY-MM-DD HH:mm") : '-';
          }
        },
        {
          title: 'Amount',
          dataIndex: 'overdueAmount',
          render (index, data) {
            return CF.format(data.overdueAmount, {});
          }
        },
        {
          title: 'Overdue days',
          dataIndex: 'overdueDays'
        },
      ],
      data: _.map(loanRecord, function (doc, index) {
        let obj = _.pick(doc, 
          ['applicationId',
          'applicationTime',
          'loanAmount',
          'loanTimeLimit',
          'statusName',
          'frepaymentTime',
          'overdueAmount',
          'overdueDays',]);
        obj.index = index + 1;
        return obj;
      })
    };

    return (
      <Table  bordered  className="address-book cl-table" key="address-book cl-table"
        title = {() => (<h4 className="table-title"> Loan Record </h4>)}
        loading = {!that.state.loanRecord}
        pagination = {false}
        columns={LoanRecords.columns} 
        dataSource={LoanRecords.data}
        rowKey={record =>  record.index}
        scroll={{ y: 320 }}
         />
    );
  }
}
export default LoanRecord;