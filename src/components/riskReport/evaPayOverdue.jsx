import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import {CLComponent, CLBlockList } from '../../../src/lib/component/index';
import Overdue from '../../../src/lib/component/Overdue.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import CF from 'currency-formatter';
import _ from 'lodash';

import { Button, message, Table, Tabs, DatePicker, Row, Col, Modal } from 'antd';
let {contentType, examinerLoanoverdue} = Interface;
let TB;

class EvaPayOverdue extends CLComponent {
  state = {
    data: [],
    search: {},
    total: {},
  }

  constructor (props) {
    super(props);
    this.bindCtx([
      "renderBody",
      "loadData",
      "download",
      "handleCancel",
      "getFormFields",

    ]);
  }

  componentDidMount() {
    let type = sessionStorage.getItem("operateDataType") || "1";
    this.setState({type: type})
    this.loadData(this.state.search);
  }

  loadData(search) {
    const that = this;
    that.setState({tableLoading: true});
    const settings = {
      contentType,
      method: examinerLoanoverdue.type,
      url: examinerLoanoverdue.url + `${search.startSRepaymentTime || moment().subtract(1, 'months').startOf('month').format("YYYY-MM-DD") }/${search.endSRepaymentTime || moment().subtract(1, 'months').endOf('month').format("YYYY-MM-DD")}`,
    }
     function fn (res) {
      let arr=new Array();
      let users=new Array();
      that.setState({tableLoading: false});
      let box=res.data.everydayVlue;
        for(let i=0;i<box.length;i++){
          if(!box[i].screeningdate&&!box[i].befscreeningdate){
            arr.push(i)
          }else{
            users.push({'name':box[i].name,'value':i})
          }
        }
        let len=arr.length;
        while(len--){
          box.splice(arr[len],1)
        }
        if(res.data.totalVlue){
          box.push(res.data.totalVlue)
        }
      that.setState({
        data: box,
        total: res.data.totalVlue,
        user:users
      })
    }

    CL.clReqwest({settings, fn});
  }

  download (target) {
    const that = this;
    that.setState({showTableExport: true});
    const {tableexport} = that.props;
    setTimeout(() => {
      TB = tableexport(document.querySelector("#ex-table-eva-pay-overdue"), {formats: ['csv','txt','xlsx']});
    }, 100);
  }

  handleCancel () {
    const that = this;
    that.setState({showTableExport: false});
    if (TB) {
      TB.remove();
    }
  }

  getFormFields (fields) {
    let search = {};
    _.map(fields, function (doc, index) {
      if (doc) {
        if (index === "sRepaymentTime") {
          search.startSRepaymentTime = doc[0].format("YYYY-MM-DD");
          search.endSRepaymentTime = doc[1].format("YYYY-MM-DD");
        } else{
          search[index] = doc;
        }
      }
    })
    this.setState({search});
    this.loadData(search);
  }

  renderBody() {
    let that = this;
    const {data,} = that.state;
    const columns = [
      {
        title: '审核员姓名',
        dataIndex: 'name',
        width: "6.6%",
        render (index, record) {
          return record.name
        }
      },
      {
        title: '放款订单数',
        dataIndex: 'loanCount',
        width:"6.6%",
        render(index, record) {
          return CL.cf(record.loanCount, 0)
        }
      },
      {
        title: '放款金额',
        dataIndex: 'loanAmount',
        width: "6.6%",
        render(index, record) {
          return CL.cf(record.loanAmount, 2)
        }
      },
      {
        title: '逾期订单数',
        dataIndex: 'overdueCount',
        width: "6.6%",
        render(index, record) {
          return CL.cf(record.overdueCount, 0)
        }
      },
      {
        title: '逾期金额',
        dataIndex: 'overdueAmount',
        width: "6.6%",
        render(index, record) {
          return CL.cf(record.overdueAmount, 0)
        }
      },
     {
        title: '30天金额逾期率',
        dataIndex: 'thirtyDaysAmountOverdueRate',
        width: "6.6%",
        render(index, record) {
          return CL.cf(record.thirtyDaysAmountOverdueRate, 2) + "%"
        }
      },
      {
        title: '30天订单逾期率',
        dataIndex: 'thirtyDaysCountOverdueRate',
        width: "6.6%",
        render(index, record) {
          return CL.cf(record.thirtyDaysCountOverdueRate, 2) + "%"
        }
      },
      {
        title: '21天金额逾期率',
        dataIndex: 'tweentyoneDaysAmountOverdueRate',
        width: "6.6%",
        render(index, record) {
          return CL.cf(record.tweentyoneDaysAmountOverdueRate, 2) + "%"
        }
      },
      {
        title: '21天订单数逾期率',
        dataIndex: 'tweentyoneDaysCountOverdueRate',
        width: "6.6%",
        render(index, record) {
          return CL.cf(record.tweentyoneDaysCountOverdueRate, 2) + "%"
        }
      },
      {
        title: '14天金额逾期率',
        dataIndex: 'fourteenDaysAmountOverdueRate',
        width: "6.6%",
        render(index, record) {
          return CL.cf(record.fourteenDaysAmountOverdueRate, 2) + "%"
        }
      },
      {
        title: '14天订单逾期率',
        dataIndex: 'fourteenDaysCountOverdueRate',
        width: "6.6%",
        render(index, record) {
          return CL.cf(record.fourteenDaysCountOverdueRate, 2) + "%"
        }
      },
      {
        title: '7天金额逾期率',
        dataIndex: 'sevenDaysAmountOverdueRate',
        width: "6.6%",
        render(index, record) {
          return CL.cf(record.sevenDaysAmountOverdueRate, 2) + "%"
        }
      },
      {
        title: '7天订单数逾期率',
        dataIndex: 'sevenDaysCountOverdueRate',
        width: "6.6%",
        render(index, record) {
          return CL.cf(record.sevenDaysCountOverdueRate, 2) + "%"
        }
      },
      {
        title: '金额自然逾期率',
        dataIndex: 'naturalAmountOverdueRate',
        width: "6.6%",
        render(index, record) {
          return CL.cf(record.naturalAmountOverdueRate, 2) + "%"
        }
      },
      {
        title: '户数自然逾期率',
        dataIndex: 'naturalCountOverdueRate',
        render(index, record) {
          return CL.cf(record.naturalCountOverdueRate, 2) + "%"
        }
      },
    ];

    const operation = [
      {
        id: "sRepaymentTime",
        type: 'rangePicker',
        label: '日期',
        placeholder: 'ranger',
      },
    ];

    let settings = {
      data: data.map((doc, index) => {
        doc.id = index;
        return doc;
      }),
      columns: columns,
      operation: operation,
      getFields: that.getFormFields,
      pagination: false,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
      btn: [
        {
          title: "Download",
          type: "danger",
          fn: that.download
        }
      ],
    }
    //下载表格
    const th = [
      '审核员姓名',
      '放款订单数',
      '放款金额',
      '逾期订单数',
      '逾期金额',
      '30天金额逾期率',
      '30天订单逾期率',
      '21天金额逾期率',
      '21天订单数逾期率',
      '14天金额逾期率',
      '14天订单逾期率',
      '7天金额逾期率',
      '7天订单数逾期率',
      '金额自然逾期率',
      '户数自然逾期率',
    ];

    return (
      <div className="credit-collection6" key="credit-collection6">
          <Modal
           className="te-modal"
           title="Download"
           closable={true}
           visible={that.state.showTableExport}
           width = {"100%"}
           style={{ top: 0}}
           onCancel = {that.handleCancel}
           footer={[
             <Button key="back" size="large" onClick={that.handleCancel}>Cancel</Button>,
           ]}
           >
           <table className="ex-table" id="ex-table-eva-pay-overdue">
             <thead>
               <tr>
                 {th.map( function (doc) {
                   return (<th key={doc}>{doc}</th>)
                 })}
               </tr>
             </thead>
             <tbody>
               {
                 data.map( function (record, index) {
                   return (
                     <tr key={index}>
                       <td>{record.name ? record.name.split(" ")[0] : 'total'}</td>
                       <td>{record.loanCount}</td>
                       <td>{record.loanAmount}</td>
                       <td>{record.overdueCount}</td>
                       <td>{record.overdueAmount}</td>
                       <td>{record.thirtyDaysAmountOverdueRate}</td>
                       <td>{record.thirtyDaysCountOverdueRate}</td>
                       <td>{record.tweentyoneDaysAmountOverdueRate}</td>
                       <td>{record.tweentyoneDaysCountOverdueRate}</td>
                       <td>{record.fourteenDaysAmountOverdueRate}</td>
                       <td>{record.fourteenDaysCountOverdueRate}</td>
                       <td>{record.sevenDaysAmountOverdueRate}</td>
                       <td>{record.sevenDaysCountOverdueRate}</td>
                       <td>{record.naturalAmountOverdueRate}</td>
                       <td>{record.naturalCountOverdueRate}</td>
                     </tr>
                   )
                 })
               }
             </tbody>
           </table>
        </Modal>
        <Overdue settings={settings} />
      </div>
    )
  }

  render (data) {
    return (
      <QueueAnim className="animate-content6">
        {this.renderBody()}
      </QueueAnim>
    )
  }
}
export default EvaPayOverdue;

