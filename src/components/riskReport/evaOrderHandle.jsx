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
let {contentType, processingReport} = Interface;
let TB;

class EvaOrderHandle extends CLComponent {
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
    // let type = sessionStorage.getItem("operateDataType") || "1";
    // this.setState({type: type})
    this.loadData(this.state.search);
  }

  loadData(search) {
    const that = this;
    that.setState({tableLoading: true});
    const settings = {
      contentType,
      method: processingReport.type,
      url: processingReport.url + `${search.startSRepaymentTime || moment().subtract(0, 'days').format("YYYY-MM-DD 00:00") }/${search.endSRepaymentTime || moment().format("YYYY-MM-DD 23:59")}`,
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
      TB = tableexport(document.querySelector("#ex-table-eva-order"), {formats: ['csv','txt','xlsx']});
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
          search.startSRepaymentTime = doc[0].format("YYYY-MM-DD 00:00");
          search.endSRepaymentTime = doc[1].format("YYYY-MM-DD 23:59");
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
    const {download} = that.props;
    const columns = [
      {
        title: '审核员姓名',
        dataIndex: 'name',
        width: "5%",
        render (index, record) {
          return record.name
        }
      }, 
      {
        title: '处理量',
        dataIndex: 'handleCount',
        width: "7%",
        render(index, record) {
          return CL.cf(record.handleCount)
        }
      },
      {
        title: '通过单',
        dataIndex: 'passCount',
        width: "7%",
        render(index, record) {
          return CL.cf(record.passCount)
        }
      },
      {
        title: '通过率',
        dataIndex: 'passRate',
        width: "7%",
        render(index, record) {
          return CL.cf(record.passRate,2)+ "%"
        }
      },
      {
        title: '回退单',
        dataIndex: 'rollbackCount',
        width: "7%",
        render(index, record) {
          return CL.cf(record.rollbackCount)
        }
      },
      {
        title: '回退率',
        dataIndex: 'rollbackRate',
        width: "7%",
        render(index, record) {
          return CL.cf(record.rollbackRate,2) + "%"
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
      data: data.map((doc,index) => {
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
      '处理量',
      '通过单',
      '通过率',
      '回退单',
      '回退率',
    ];

    return (
      <div className="credit-collection5" key="credit-collection5">
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
           <table className="ex-table" id="ex-table-eva-order">
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
                       <td>{record.handleCount || 0}</td>
                       <td>{record.passCount || 0}</td>
                       <td>{record.passRate ||0 }</td>
                       <td>{record.rollbackCount || 0}</td>
                       <td>{record.rollbackRate}</td>
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
      <QueueAnim className="animate-content5">
        {this.renderBody()}
      </QueueAnim>
    )
  }
}
export default EvaOrderHandle;

