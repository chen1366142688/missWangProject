import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import {CLComponent, CLBlockList } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import CF from 'currency-formatter';
import _ from 'lodash';

import { Button, message, Table, Tabs, DatePicker, Row, Col, Modal } from 'antd';
let {contentType, repaymentDaily} = Interface;
let TB;

class RepaymentOrder extends CLComponent {
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
      method: repaymentDaily.type,
      url: repaymentDaily.url + `${search.startSRepaymentTime || moment().subtract(10, 'days').format("YYYY-MM-DD") }/${search.endSRepaymentTime || moment().format("YYYY-MM-DD")}`,
    }

    // function fn (res) {
    //   that.setState({tableLoading: false});
    //   that.setState({
    //     data: res.data.everydayVlue,
    //     total: res.data.totalVlue
    //   })
    // }
     function fn (res) {
      let arr=new Array();
      that.setState({tableLoading: false});
      let box=res.data.everydayVlue;
        for(let i=0;i<box.length;i++){
          if(!box[i].screeningdate&&!box[i].befscreeningdate){
            arr.push(i)
          }
        }
        let len=arr.length;
        while(len--){
          box.splice(arr[len],1)
        }
      that.setState({
        data: box,
        total: res.data.totalVlue
      })
    }

    CL.clReqwest({settings, fn});
  }

  download (target) {
    const that = this;
    that.setState({showTableExport: true});
    const {tableexport} = that.props;
    setTimeout(() => {
      TB = tableexport(document.querySelector("#ex-table-repayment-order"), {formats: ['csv','txt','xlsx']});
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
        title: '日期',
        dataIndex: 'date',
        render(index, record) {
          return record.screeningdate ? record.screeningdate.split(" ")[0] : 'total';
        },
        width: 100,
      }, 
      {
        title: "还款订单",
        width: 200,
        children: [
          {
            title: '单数',
            dataIndex: 'repaymentOrderCount',
            width: 80,
            render(index, record) {
              return CL.cf(record.repaymentOrderCount, 0)
            }
          },
          {
            title: '还款收益',
            dataIndex: 'repaymentIncome',
            width: 80,
            render(index, record) {
              return CL.cf(record.repaymentIncome, 2)
            }
          },
        ]
      },

      {
        title: "提前还款",
        width: 300,
        children: [
          
          {
            title: '单数',
            dataIndex: 'advanceOrderCount',
            width: 100,
            render(index, record) {
              return CL.cf(record.advanceOrderCount, 0)
            }
          },
          {
            title: '占比',
            dataIndex: 'advanceRate',
            width: 100,
            render(index, record) {
              return record.advanceRate
            }
          },
        ]
      },

      {
        title: "按时还款",
        width: 300,
        children: [
          
          {
            title: '单数',
            dataIndex: 'ontimeOrderCount',
            width: 100,
            render(index, record) {
              return CL.cf(record.ontimeOrderCount, 0)
            }
          },
          {
            title: '占比',
            dataIndex: 'ontimeRate',
            width: 100,
            render(index, record) {
              return record.ontimeRate;
            }
          },
        ]
      },

      {
        title: "逾期订单",
        width: 300,
        children: [
          
          {
            title: '单数',
            dataIndex: 'overdueOrderCount',
            width: 100,
            render(index, record) {
              return CL.cf(record.overdueOrderCount, 0)
            }
          },
          {
            title: '占比',
            dataIndex: 'overdueRate',
            width: 100,
            render(index, record) {
              return record.overdueRate
            }
          },
        ]
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

    //把total添加到数据末端
    if (data.length && that.state.total.repaymentOrderCount && !_.find(data, {screeningdate: null})) {
      that.state.total.screeningdate = null;
      data.push(that.state.total)
    }

    let settings = {
      data: data.map( (doc, index) => {
        doc.id = index;
        return doc;
      }),
      columns: columns,
      operation: operation,
      getFields: that.getFormFields,
      pagination: false,
      // pageChange: that.pageChage,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
      columnGroup: true,
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
      '日期',

      '还款订单-单数',
      '还款订单-还款收益',

      '提前还款-单数',
      '提前还款-占比',

      '按时还款-单数',
      '按时还款-占比',

      '逾期订单-单数',
      '逾期订单-占比',
    ];




    return (
      <div className="credit-collection3" key="credit-collection3">
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
           <table className="ex-table" id="ex-table-repayment-order">
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
                       <td>{record.screeningdate ? record.screeningdate.split(" ")[0] : 'total'}</td>
                       <td>{CL.cf(record.repaymentOrderCount, 0)}</td>
                       <td>{CL.cf(record.repaymentIncome, 2)}</td>

                       <td>{CL.cf(record.advanceOrderCount, 0)}</td>
                       <td>{record.advanceRate}</td>


                       <td>{ CL.cf(record.ontimeOrderCount, 0)}</td>
                       <td>{record.ontimeRate}</td>

                       <td>{CL.cf(record.overdueOrderCount, 0)}</td>
                       <td>{record.overdueRate}</td>
                     </tr>
                   )
                 })
               }
             </tbody>
           </table>
        </Modal>
        <CLlist settings={settings} />
      </div>
    )
  }

  render (data) {
    return (
      <QueueAnim className="animate-content3">
        {this.renderBody()}
      </QueueAnim>
    )
  }
}
export default RepaymentOrder;

