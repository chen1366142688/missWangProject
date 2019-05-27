import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import {CLComponent} from '../../../src/lib/component/index';
import { CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';

import _ from 'lodash';
import { Button,  Table, } from 'antd';

let  {paymentSerialRecord, unipayTransactionList, contentType} = Interface;

class PaymentFailed extends CLComponent {
  state = {
    tableLoading: false,
    data: []
  }

  constructor (props) {
    super(props);
    this.bindCtx([
      "renderBody",
      "loadData",
      "check"
    ]);
  }

  componentDidMount() {
    this.loadData();
  }

  check (data) {
    let arr = location.hash.split('/');
    arr.pop();
    arr.push(`loanauditdetails/${data.appId || data.applicationId}/2`);
    let str = arr.join('/');
    window.open(str);
  }


  loadData () {
    const that = this;
    let settings = {};
    let params = {
      page: {
        currentPage: 1,
        pageSize: 200,
      }
    }

    that.setState({tableLoading: true});
    params.paymentSerialRecord = {};
    params.paymentSerialRecord.serialStatusRange = [6,7,8, 9];

    settings = _.extend(settings, {
      contentType,
      url: paymentSerialRecord.url,
      method: paymentSerialRecord.type,
      data: JSON.stringify(params)
    })

    function fn (res) {
      if (res.data) {
       let dataList = res.data.page.result;
       let settings = {
          contentType,
          url: unipayTransactionList.url,
          method: unipayTransactionList.type,
          data: JSON.stringify({
            page: {
              currentPage: 1,
              pageSize: 200,
            },
            fundUnipayTransactionLog:{}
          })
        }
        function fn (res) {
          that.setState({tableLoading: false});
          if (res.data) {
            _.map(res.data.result,(doc)=>{
              dataList.push(doc);
            })
            that.setState({data: dataList})
          }
        }
        CL.clReqwest({settings, fn});
      }
    }
    CL.clReqwest({settings, fn});
  }

  renderBody() {
    let that = this;
    let columns = [];

    let total1 = {
      loanAmount: 0,
      amount: 0,
    }
    let data = that.state.data || [];
    const FailedReason = {
      "1": 'Ready',
      "2": 'Success',
      "3": 'Lock',
      "4": 'Pay to Account',
      "5": 'Pay Success',
      "6": 'Account error',
      "7": 'The payment time is abnormal',
      "8": 'Amount exceeded',
      "9": 'Failed to return'
    }
    columns = [
      {
        title: 'No',
        dataIndex: 'appId' || '—',
        width: "6%",
      }, 
      {
        title: 'Account Hold Name',
        dataIndex: 'userName',
        width: "10%",
      },
      {
        title: 'Phone Number',
        dataIndex: 'userPhone',
        width: "9%",
      },
      // {
      //   title: 'Email',
      //   dataIndex: 'userEmail',
      //   width: "12%",
      // },
      {
        title: 'Reason',
        dataIndex: 'payType',
        width: "10%",
        render: function (text, record) {
          return FailedReason[record.status] || record.reason || '--';
        }
      }, 
      {
        title: 'Payment Time',
        dataIndex: 'operateTime',
        width: "10%",
        render: function (text, record) {
          return record.operateTime ? moment(record.operateTime).format("YYYY-MM-DD HH:mm") : '—';
        }
      },
      {
        title: 'Amount',
        dataIndex: 'amount',
        width: "6%",
      },
      {
        title: 'Bank',
        dataIndex: 'bank',
        width: "6%",
        render(index, record){
          return record.bank || record.channel || '—';
        }
      },
      {
        title: 'Account No',
        dataIndex: 'accountNo',
        width: "10%",
        render(index, record){
          return record.accountNo || record.identificationId || '—'
        }
      },
      {
        title: 'Operation ',
        width: "10%",
        dataIndex: 'Operation ',
        render: function (text, record) {
          return (<Button type="primary" onClick={()=> {that.check(record)}}>check</Button>)
        }
      }
    ];
    return (
      <div className="journal-account" key="journal-account">
        <Table
          bordered
          dataSource={data.map( function (doc, index) {
            doc.appId = doc.appId || doc.applicationId || '—';
            doc.userName = doc.userName || doc.accountHoldName || '—';
            doc.userPhone = doc.userPhone || doc.receiverPhoneNumber || '—';
            total1.loanAmount += parseInt(doc.loanAmount);
            total1.amount += parseInt(doc.amount);
            return doc;
          })}
          columns={columns}
          pagination={false}
          style={{marginTop: 20}}
        />
      </div>
    )
  }

  render (data) {
    return (
      <QueueAnim className="animate-content">
        {this.renderBody()}
      </QueueAnim>
    )
  }
}
export default PaymentFailed;