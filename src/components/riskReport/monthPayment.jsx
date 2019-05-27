import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import {CLComponent, CLBlockList } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import _ from 'lodash';

import { Button, message, Table , Icon, Spin, Tabs, DatePicker, Row, Col ,Modal} from 'antd';
let {contentType, monthlypaymentindicator } = Interface;
let TB;
class monthPayment extends CLComponent {
  state = {
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1
    },
    search: {},
    showTableExport: false,
    tableLoading: false,
    data: [],
    user: [
      { name: '所有客户', value: 0 },
      { name: '新客户', value: 1 },
      { name: '老客户', value: 2 },
    ],
  }

  constructor (props) {
    super(props);
    this.bindCtx([
      "renderBody",
      "loadData",
      "handleCancel",
      "download",
      "pageChage",
    ]);
  }

  componentDidMount() {
    CLAnimate.inAndOut(this);
    const sessionSearch = sessionStorage.getItem('search');
    let search = this.state.search;
    if (sessionSearch) {
      search = JSON.parse(sessionSearch);
    }
    let sessionPagination = sessionStorage.getItem('pagination');
    let pagination = this.state.pagination;
    if (sessionPagination) {
      pagination = JSON.parse(sessionPagination);
    }

    this.setState({search: search, pagination: pagination})
    this.loadData(search, pagination);
  }

  loadData (search,page) {
    const that = this;
    that.setState({tableLoading: true});
    let pageindex = page.currentPage-1;
    let pagesize = page.pageSize;
    let status = search.status;
    let dataUrl;
    if(status != '0'&& status !==undefined && status == 1){
      dataUrl = monthlypaymentindicator.url + `${pageindex}/${pagesize}/${0}`;
    }else if(status != '0'&& status !==undefined && status == 2){
      dataUrl = monthlypaymentindicator.url + `${pageindex}/${pagesize}/${1}`;
    }else{
      dataUrl = monthlypaymentindicator.url + `${pageindex}/${pagesize}`;
    }
    const settings = {
      contentType,
      method: monthlypaymentindicator.type,
      url: dataUrl,
    }

    function fn (res) {
      that.setState({tableLoading: false});
      if (res.data) {
        const pagination = {
          total: pagesize*5,
          pageSize: pagesize,
          currentPage: pageindex+1,
        }
        sessionStorage.setItem("pagination", JSON.stringify(pagination));
        sessionStorage.setItem("search", JSON.stringify(search));
        that.setState({
          pagination: pagination,
          data: res.data.everydayVlue,
        })
      }
    }
    CL.clReqwest({settings, fn});
  }

  pageChage (e) {//list 切换页面
    let pagination = {
      currentPage: e.current-1,
      pageSize: e.pageSize,
      total: this.state.pagination.total
    }

    this.setState({pagination: pagination})
    this.loadData(this.state.search, pagination)
  }
  download (target) {
    const that = this;
    that.setState({showTableExport: true});
    const {tableexport} = that.props;
    setTimeout(() => {
      TB = tableexport(document.querySelector("#ex-table-monthly-payment"), {formats: ['csv','txt','xlsx']});
    }, 100);
  }

  handleCancel () {
    const that = this;
    that.setState({showTableExport: false});
    if (TB) {
      TB.remove();
    }
  }

  getFormFields = (fields) => {
    let search = {};
    _.map(fields, (doc, index) => {
      if (doc) {
        search[index] = doc;
      }
    });
    const pagination = this.state.pagination;
    pagination.currentPage = 1;
    this.setState({search: search, pagination: pagination});
    this.loadData(search, pagination)
  }

  renderBody() {
    let that = this;
    const {data,} = that.state;
    const columns = [
      {
        title: '月份',
        dataIndex: 'yearmonth',
        width: "16%",
      },
      {
        title: '月通过率',
        dataIndex: 'monthlyPassRate',
        width: "16%",
        render(index, record) {
          return CL.cf(record.monthlyPassRate, 2) + "%"
        }
      },
      {
        title: '自然逾期率',
        dataIndex: 'naturalOverdueRate',
        width: "16%",
        render(index, record) {
          return CL.cf(record.naturalOverdueRate, 2) + "%"
        }
      },
      {
        title: '月复贷率',
        dataIndex: 'monthlyRepaymentRate',
        width: "16%",
        render(index, record) {
          return CL.cf(record.monthlyRepaymentRate, 2) + "%"
        }
      },
      {
        title: '30天以上逾期率',
        dataIndex: 'thirtyDaysCountOverdueRate',
        width: "16%",
        render(index, record) {
          return CL.cf(record.thirtyDaysCountOverdueRate, 2) + "%"
        }
      },
      {
        title: '损失率',
        dataIndex: 'lossRate',
        // width: "16%",
        render(index, record) {
          return CL.cf(record.lossRate, 2) + "%"
        }
      },
    ];
    const operation = [
      {
        id: 'status',
        type: 'select',
        label: '客户类型',
        options: that.state.user,
        placeholder: '所有客户',
      },
    ];

    let settings = {
      data: data.map((doc, index) => {
        doc.id = index;
        return doc;
      }),
      columns: columns,
      getFields: that.getFormFields,
      operation: operation,
      pagination: that.state.pagination || {},
      pageChange: that.pageChage,
      tableLoading: that.state.tableLoading,
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
      '月份',
      '月通过率',
      '自然逾期率',
      '月复贷率',
      '30天以上逾期率',
      '损失率',
    ];

    return (
      <div className="credit-collection7" key="credit-collection7">
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
           <table className="ex-table" id="ex-table-monthly-payment">
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
                       <td>{record.yearmonth}</td>
                       <td>{record.monthlyPassRate}</td>
                       <td>{record.naturalOverdueRate}</td>
                       <td>{record.monthlyRepaymentRate}</td>
                       <td>{record.thirtyDaysCountOverdueRate}</td>
                       <td>{record.lossRate}</td>
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
      <QueueAnim className="animate-content7">
        {this.renderBody()}
      </QueueAnim>
    )
  }
}
export default monthPayment;

