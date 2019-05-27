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
let {contentType, sRepaymentDaily} = Interface;
let TB;

class SRepaymentOrder extends CLComponent {
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
      method: sRepaymentDaily.type,
      url: sRepaymentDaily.url + `${search.startSRepaymentTime || moment().subtract(10, 'days').format("YYYY-MM-DD") }/${search.endSRepaymentTime || moment().format("YYYY-MM-DD")}`,
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
      TB = tableexport(document.querySelector("#ex-table-srepayment-order"), {formats: ['csv','txt','xlsx']});
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
    const newData = [...data];
    const columns = [
      {
        title: '日期',
        dataIndex: 'date',
        render(index, record) {
          return record.screeningdate ? record.screeningdate.split(" ")[0] : 'total';
        },
        width: 80,
      },
      {
        title: "到期订单",
        width: 320,
        children: [
          {
            title: '单数',
            dataIndex: 'expireOrderCount',
            width: 60,
            render(index, record) {
              return CL.cf(record.expireOrderCount, 0)
            }
          },
          {
            title: '应收金额',
            dataIndex: 'expireAmount',
            width: 100,
            render(index, record) {
              return CL.cf(record.expireAmount, 2)
            }
          },
          {
            title: '未还单数',
            dataIndex: 'unrepaymentCount',
            width: 80,
            render(index, record) {
              return CL.cf(record.unrepaymentCount, 0)
            }
          },
          {
            title: '逾期率',
            dataIndex: 'overdueRate',
            width: 80,
            render(index, record) {
              return record.overdueRate
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
            title: '金额',
            dataIndex: 'advanceAmount',
            width: 100,
            render(index, record) {
              return CL.cf(record.advanceAmount, 2)
            }
          },
          {
            title: '提前率',
            dataIndex: 'advanceRate',
            width: 100,
            render(index, record) {
              return record.advanceRate;
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
            title: '金额',
            dataIndex: 'ontimeAmount',
            width: 100,
            render(index, record) {
              return CL.cf(record.ontimeAmount, 2)
            }
          },
          {
            title: '按时率',
            dataIndex: 'ontimeRate',
            width: 100,
            render(index, record) {
              return record.ontimeRate
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
            dataIndex: 'overdueOrderAmount',
            width: 100,
            render(index, record) {
              return CL.cf(record.overdueOrderAmount, 0)
            }
          },
          {
            title: '金额',
            dataIndex: ' overdueAmount',
            width: 100,
            render(index,record) {
              return CL.cf(record.overdueAmount, 2)
            }
          },
          {
            title: '自然逾期率',
            dataIndex: 'naturalOverdueRate',
            width: 100,
            render(index, record) {
              return record.naturalOverdueRate
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
    if (newData.length && that.state.total.overdueOrderAmount) {
      that.state.total.screeningdate = null;
      newData.push(that.state.total)
    }

    let settings = {
      data: newData.map( (doc, index) => {
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

      '到期订单-单数',
      '到期订单-应收金额',
      '到期订单-未还单数',
      '到期订单-逾期率',

      '提前还款-单数',
      '提前还款-应收金额',
      '提前还款-提前率',

      '按时还款-单数',
      '按时还款-应收金额',
      '按时还款-按时率',

      '逾期订单-单数',
      '逾期订单-金额',
      '逾期订单-自然逾期率',
    ];




    return (
      <div className="credit-collection2" key="credit-collection2">
        <CLlist settings={settings} />
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
           <table className="ex-table" id="ex-table-srepayment-order">
             <thead>
               <tr>
                 {th.map( function (doc) {
                   return (<th key={doc}>{doc}</th>)
                 })}
               </tr>
             </thead>
             <tbody>
               {
                 newData.map( function (record, index) {
                   return (
                     <tr key={index}>
                       <td>{record.screeningdate ? record.screeningdate.split(" ")[0] : 'total'}</td>
                       <td>{CL.cf(record.expireOrderCount, 0)}</td>
                       <td>{CL.cf(record.expireAmount, 2)}</td>
                       <td>{CL.cf(record.unrepaymentCount, 0)}</td>
                       <td>{record.overdueRate}</td>

                       <td>{ CL.cf(record.advanceOrderCount, 0)}</td>
                       <td>{CL.cf(record.advanceAmount, 2)}</td>
                       <td>{record.advanceRate}</td>

                       <td>{CL.cf(record.ontimeOrderCount, 0)}</td>
                       <td>{CL.cf(record.ontimeAmount, 2)}</td>
                       <td>{record.ontimeRate}</td>
                       <td>{CL.cf(record.overdueOrderAmount, 0)}</td>
                       <td>{ CL.cf(record.overdueAmount, 2)}</td>
                       <td>{record.naturalOverdueRate}</td>
                     </tr>
                   )
                 })
               }
             </tbody>
           </table>
        </Modal>
      </div>
    )
  }

  render () {
    return (
      <QueueAnim className="animate-content2">
        {this.renderBody()}
      </QueueAnim>
    )
  }
}
export default SRepaymentOrder;

