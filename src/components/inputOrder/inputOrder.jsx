import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';

import {CLComponent} from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';

import _ from 'lodash';
import { Button, Tabs, Input, Modal, DatePicker, message } from 'antd';
const {TextArea} = Input
const {TabPane} = Tabs;
let req;



let  { getBorrowEnterList, borrowInput, getSubmitRepaymentAmountList, contentType} = Interface;

class InputOrder extends CLComponent {
  state = {
    type: "1",
    selectedRowKeys: [],
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1
    },
    tableLoading: false,
    search: {
      // appId: "",
      // status: "",
      // beginTime: "",
      // endTime: "",
      // basicName: 1

    },
    options: {
      status: []
    },
    data: [],
    biModal:false,
    bDate: '',
    currnetId: ""
  }

  constructor (props) {
    super(props);
    this.bindCtx([
      "renderBody",
      "onSelectChange",
      "getFormFields",
      "check",
      "loadData",
      "pageChage",
      "changeTab",
      "borrowInputModal",
      "handleCancel",
      "handleOk",
      "selectTime"
    ]);
  }

  changeTab (e) {
    const pagination = {
      total: 0,
      pageSize: 10,
      currentPage: 1
    }
    const search = {};

    this.setState({search, pagination, type: e});

    this.loadData(search, pagination, e);

    sessionStorage.setItem("inputOrderType", e);
  }

  componentDidMount() {
    CLAnimate.inAndOut(this);
    //搜索条件
    let sessionSearch = sessionStorage.getItem('search');
    let search = this.state.search;
    if (sessionSearch) {
      search = JSON.parse(sessionSearch);
    }

    //分页
    let sessionPagination = sessionStorage.getItem('pagination');
    let pagination = this.state.pagination;
    if (sessionPagination) {
      pagination = JSON.parse(sessionPagination);
    }

    let type = sessionStorage.getItem("inputOrderType") || "1";
    this.loadData(search, pagination, type);
    this.setState({search: search, pagination: pagination, type: type})
  }

  loadData (search, page, type) {
    const that = this;
    that.setState({tableLoading: true});
    let params = {
      page: {
        currentPage: page.currentPage || 1,
        pageSize: page.pageSize || 10
      },
      paymentSerialRecord: search || this.state.search
    } 

    let settings = {
      contentType,
      method: 'post',
      url: getBorrowEnterList.url,
      data: JSON.stringify(params)
    }

    type = type || this.state.type;

    if (type === "2") { //还款录单
      params = {
        page: {
          currentPage: page.currentPage || 1,
          pageSize: page.pageSize || 10
        },
        loanBasisInfo: search || this.state.search
      }
      settings = {
        contentType,
        method: 'post',
        url: getSubmitRepaymentAmountList.url,
        data: JSON.stringify(params)
      }
    }

    function fn (res) {
      const data = res.data;
      that.setState({tableLoading: false});
      if (data) {
        const pagination = { 
          total: data.page.totalCount,
          pageSize: page.pageSize,
          currentPage: page.currentPage,
        }
        //保存当前的搜索条件 以及分页
        sessionStorage.setItem("pagination", JSON.stringify(pagination));
        sessionStorage.setItem("search", JSON.stringify(search));
        that.setState({
          "options":{
            status: type === "2" ? [] : CL.setOptions(data.borrowInputStatus),
          },
          "pagination": pagination,
          "data": data.page.result,
        })
      }
    }

    if (req) {
      req.abort();
    }

    req = CL.clReqwest({settings, fn});
  }

  onSelectChange = (selectedRowKeys) => { //勾选项
    this.setState({ selectedRowKeys });
  }

  getFormFields (fields) {
    let search = {};
    _.map(fields, function (doc, index) {
      if (doc) {
        if (_.isArray(doc)) { //判断为时间对象
          search.beginTime = new Date(doc[0].format("YYYY-MM-DD HH:mm")).getTime();
          search.endTime = new Date(doc[1].format("YYYY-MM-DD HH:mm")).getTime();
        } else {
          search[index] = doc;
        }
      }
    })   
    
    const pagination = this.state.pagination;
    pagination.currentPage = 1;
    this.setState({search: search, pagination: pagination});
    this.loadData(search, pagination);
  }

  check (data) { //点击按钮跳转
    let arr = location.hash.split('/');
    arr.pop();
    arr.push(`inputorderdetails/${data.appId}`);
    let str = arr.join('/');

    //保存当前的搜索条件 以及分页
    sessionStorage.setItem("search", JSON.stringify(this.state.search));
    sessionStorage.setItem("pagination", JSON.stringify(this.state.pagination));

    location.hash = str;
  }

  borrowInputModal (record) {
    this.setState({biModal: true, currnetId: record.id});
  }

  handleCancel () {
    this.setState({biModal: false});
  }

  handleOk() { //确认借款成功
    const that = this;
    const date = that.state.bDate;
    const payId = that.state.currnetId;

    if (!date) {
      message.error("you must pick a date");
      return;
    }

    const settings = {
      contentType,
      method: 'post',
      url: borrowInput.url,
      data: JSON.stringify({date, payId})
    }

    function fn (res) {
      if (res.data) {
        message.success("operation success!");
        that.handleCancel();
        that.loadData(that.state.search, that.state.pagination);
      }
    }

    CL.clReqwest({settings, fn});
  }

  selectTime (e) {
    this.setState({bDate: e.format('YYYY-MM-DD')})
  }

  pageChage (e) {//list 切换页面
    let pagination = {
      currentPage: e.current,
      pageSize: e.pageSize,
      total: this.state.pagination.total
    }
    
    this.setState({pagination: pagination})
    this.loadData(this.state.search, pagination)
  }

  renderBody() {
    const { selectedRowKeys } = this.state;
    let that = this;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    const type = that.state.type;
    const columns1 = [
      {
        title: 'No',
        dataIndex: 'appId',
        width: "12.5%",
        sorter: (a, b) => a.appId - b.appId,
      }, 
      {
        title: 'User Name',
        width: "12.5%",
        dataIndex: 'userPhone'
      },
      {
        title: 'Account Holder Name',
        width: "12.5%",
        dataIndex: 'basicName'
      },
      {
        title: 'Loan Amount',
        width: "12.5%",
        dataIndex: 'loanAmount'
      }, 
      
      {
        title: 'Application Time',
        dataIndex: 'applicationTime',
        width: "12.5%",
        sorter: (a, b) => new Date(a.applicationTime) - new Date(b.applicationTime),
        render: function (text, record) {
          if (!record.applicationTime) {
            return '';
          }
          return moment(record.applicationTime).format("YYYY-MM-DD");
        }
      },
      {
        title: 'Time of Input',
        dataIndex: 'borrowDate',
        width: "12.5%",
        sorter: (a, b) => new Date(a.borrowDate) - new Date(b.borrowDate),
        render: function (text, record) {
          if (!record.borrowDate) {
            return '';
          }
          return moment(record.borrowDate).format("YYYY-MM-DD HH:mm");
        }
      },
      {
        title: ' Input Personnel',
        dataIndex: 'borrowOperater',
        width: "12.5%",
      }, 
      {
        title: 'Operation ',
        dataIndex: 'Operation ',
        width: "12.5%",
        render: function (text, record) {
          if (record.status != 1) {
            return '-';
          }
          return (<Button type="primary" onClick={()=> {that.borrowInputModal(record)}}>check</Button>)
        }
      }
    ];

    const columns2 = [
      {
        title: 'Application id',
        dataIndex: 'appId',
        width: "16%%",
        sorter: (a, b) => a.appId - b.appId,
      }, 
      {
        title: 'User Name',
        width: "16%",
        dataIndex: 'memberPhone'
      },
      {
        title: 'Real Name',
        width: "16%",
        dataIndex: 'name'
      },
      {
        title: 'Repayment Status',
        width: "16%",
        dataIndex: 'appStatusName'
      },
      // {
      //   title: 'Repayment Id',
      //   width: "16%",
      //   dataIndex: 'repaymentRemarkId'
      // },
      {
        title: 'Operation ',
        dataIndex: 'Operation ',
        width: "16%",
        render: function (text, record) {
          return (<Button type="primary" onClick={()=> {that.check(record)}}>check</Button>)
        }
      }
    ];

    
    const operation1 = [
      {
        id: 'appId',
        type: 'text',
        label: 'Application No',
        formType: 'textarea',
        placeholder: 'Enter application id'
      },
      {
        id: 'userPhone',
        type: 'text',
        label: 'User Name',
        formType: 'textarea',
        placeholder: 'Enter User Name'
      },
      {
        id: 'basicName',
        type: 'text',
        label: 'Account holder name',
        formType: 'textarea',
        placeholder: 'Enter account holder name'
      },
      {
        id: 'status',
        type: 'select',
        label: 'Status',
        placeholder: 'Please select',
        options: that.state.options.status
      },
      {
        id: 'time',
        type: 'rangePicker',
        label: 'Date of Registration',
        placeholder: 'ranger',
      }
    ];

    const operation2 = [
      {
        id: 'appId',
        type: 'text',
        label: 'Application Id',
        formType: 'textarea',
        placeholder: 'Enter application id'
      },
      {
        id: 'memberPhone',
        type: 'text',
        label: 'User Name',
        placeholder: 'Please input user name'
      }
    ];

    const data = this.state.data;

    let settings = {
      data: data,
      columns: type === "1" ? columns1 : columns2,
      rowSelection: rowSelection,
      operation: type === "1" ? operation1 : operation2,
      getFields: that.getFormFields,
      pagination: that.state.pagination || {},
      pageChange: that.pageChage,
      tableLoading: that.state.tableLoading,
      search: that.state.search
    }

    return (
      <div className="input-order" key="input-order">
        <Tabs  defaultActiveKey={this.state.type} onChange={this.changeTab}>
          <TabPane tab="Borrow Input" key="1"><CLlist settings={settings} /></TabPane>
          <TabPane tab="Repayment Input" key="2"><CLlist settings={settings} /></TabPane>
        </Tabs>
        <Modal
          title="Input Disursement Time"
          visible={that.state.biModal}
          onOk={that.handleOk}
          onCancel={that.handleCancel}
          okText =  {"Confirm"}
          cancelText = {'No'}
        > 
          <p>Please enter the time to transfer money to the user account.</p>
          <DatePicker onChange={that.selectTime} />
        </Modal>
      </div>
      
    )
  }

  render (data) {
    return (
      <QueueAnim className="animate-content" type={this.state.aniType}>
        {this.state.showBlock ? [ this.renderBody() ] : null}
      </QueueAnim>
    )
  }
}
export default InputOrder;