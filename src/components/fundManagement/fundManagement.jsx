import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';

import {CLComponent} from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import InvestManagement from "./investManagement.jsx";
import WeeklyFundAllocation from "./weeklyFundAllocation.jsx";
import BudgetAllocation from "./budgetAllocation.jsx";
import AmountBalance from "./amountBalance.jsx";
import CF from 'currency-formatter';
import _ from 'lodash';
import { Button, Tabs, Input, Modal, DatePicker, message, Row, Col, Table, Icon, InputNumber } from 'antd';
const {TextArea} = Input
const {TabPane} = Tabs;
const confirm = Modal.confirm;

const INCOMETYPE = {
  "ACCOUNTMANAGERINCOME": "account manager income",
  "AUDITSERVICEINCOME": "evalucation service income",
  "INFOMATIONSERVICEINCOME": "information service income",
  "OVERDUEDELAYTAXINCOME": "overdue delay fee income",
  "OVERDUEPAYMENTINCOME": "overdue payment income",
  "RISKRESERVE TRANSFORTOSURPLUSFUND": "risk reserve transfer to surplus fund"
}


let  { getBorrowEnterList, borrowInput,
  getSubmitRepaymentAmountList, contentType, accountBalance, currentYield,
  expenseDetail, incomeDetail, consumerDetail,
  queryPayoutAccountBalance, currentYieldConservative,
  paymentSerialRecord, repaymentRecord,
  fundTwoWeekSave, fundEstimation
} = Interface;

class FundManagement extends CLComponent {
  state = {
    type: "1",
    pagination: {
      total: 0,
      pageSize: 20,
      currentPage: 1
    },
    tableLoading: false,
    search: {},
    options: {
      status: []
    },
    data: [],
    biModal:false,
    bDate: '',
    currnetId: "",
    incomeTypeList: {},
    expenseTypeList: {},
    sorter: {},
  }

  constructor (props) {
    super(props);
    this.bindCtx([
      "renderBody",
      "getFormFields",
      "loadData",
      "pageChage",
      "changeTab",
    ]);
  }

  changeTab (e) {
    const pagination = {
      total: 0,
      pageSize: 20,
      currentPage: 1
    }
    const search = {};
    this.setState({search, pagination, type: e, data: []});
    this.loadData(search, pagination, e);
    sessionStorage.setItem("fundsType", e);
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


    // let sessionSorter = sessionStorage.getItem('sorter');
    // let sorter = this.state.sorter;
    // if (sessionSorter && sessionSorter !== "undefined") {
    //   sorter = JSON.parse(sessionSorter);
    // }

    let type = sessionStorage.getItem("fundsType") || "1";
    this.loadData(search, pagination, type);
    this.setState({search: search, pagination: pagination, type: type})
  }

  loadData (search, page, type) {
    const that = this;
    that.setState({tableLoading: true});

    let params = {};
    let settings;

    type = type || this.state.type;
    function fn (res) {
      const data = res.data;
      that.setState({tableLoading: false});
      if (data) {
        data.page = data.page || {};
        const pagination = {
          total: data.page.totalCount,
          pageSize: page.pageSize,
          currentPage: page.currentPage,
        }
        //保存当前的搜索条件 以及分页
        sessionStorage.setItem("pagination", JSON.stringify(pagination));
        sessionStorage.setItem("search", JSON.stringify(search));

        if (type === "2" || type === "3") {
          that.setState({
            "pagination": pagination,
            "data": data || {}
          });
        } else {
          that.setState({
            "pagination": pagination,
            "data": data.page.result,
          });
        }


        if (data.incomeTypeList) {
          that.setState({
            incomeTypeList: setObjList(data.incomeTypeList)
          })
        }

        if (data.expenseTypeList) {
          that.setState({
            expenseTypeList: setObjList(data.expenseTypeList)
          })
        }
      }
    }

    if (type === "2") { //还款录单
      params = {
        accountingExpenseTotalInfo: {
          "orderFieldNextType":"ASC",
          "queryFields":[]
        }
      }

      if (search.startDate && search.endDate) {
        params.accountingExpenseTotalInfo.startDate = search.startDate;
        params.accountingExpenseTotalInfo.endDate = search.endDate;
      }

      settings = {
        contentType,
        method: currentYield.type,
        url: currentYield.url,
        data: JSON.stringify(params)
      }
      CL.clReqwest({settings, fn});
    } else if (type === "3") {
      params = {
        startDate: search.startDates,
        endDate: search.endDates,
      }

      settings = {
        contentType,
        method: currentYieldConservative.type,
        url: currentYieldConservative.url,
        data: JSON.stringify(params)
      }
      CL.clReqwest({settings, fn});
    } else if (type === "4") {
      params = {
        accountingDetailInfo: {
          "orderFieldNextType":"ASC",
          "queryFields":[]
        },
        page: {
          currentPage: page.currentPage || 1,
          pageSize: page.pageSize || 20
        }
      }

      if (search.startDate && search.endDate) {
        params.accountingDetailInfo.startDate = search.startDate;
        params.accountingDetailInfo.endDate = search.endDate;
      }
      settings = {
        contentType,
        method: expenseDetail.type,
        url: expenseDetail.url,
        data: JSON.stringify(params)
      }
      CL.clReqwest({settings, fn});
    } else if (type === "5") {
      params = {
        accountingDetailInfo: {
          "orderFieldNextType":"ASC",
          "queryFields":[]
        },
        page: {
          currentPage: page.currentPage || 1,
          pageSize: page.pageSize || 20
        }
      }

      if (search.startDate && search.endDate) {
        params.accountingDetailInfo.startDate = search.startDate;
        params.accountingDetailInfo.endDate = search.endDate;
      }

      settings = {
        contentType,
        method: consumerDetail.type,
        url: consumerDetail.url,
        data: JSON.stringify(params)
      }
      CL.clReqwest({settings, fn});
    } else if (type === "6") {
      params = {
        accountingDetailInfo: {
          "orderFieldNextType":"ASC",
          "queryFields":[]
        },
        page: {
          currentPage: page.currentPage || 1,
          pageSize: page.pageSize || 20
        }
      }

      if (search.startDate && search.endDate) {
        params.accountingDetailInfo.startDate = search.startDate;
        params.accountingDetailInfo.endDate = search.endDate;
      }

      settings = {
        contentType,
        method: consumerDetail.type,
        url: consumerDetail.url,
        data: JSON.stringify(params)
      }

      CL.clReqwest({settings, fn});
    } else if (type === "7") {
      params = {
        page: {
          currentPage: page.currentPage || 1,
          pageSize: page.pageSize || 10
        },
        paymentSerialRecord: search || this.state.search,
      }
      params.paymentSerialRecord.serialStatusRange = [1, 2, 3, 4 ,5];

      settings = {
        contentType,
        method: paymentSerialRecord.type,
        url: paymentSerialRecord.url,
        data: JSON.stringify(params)
      }

      CL.clReqwest({settings, fn});
    } else if (type === "8") {
      params = {
        page: {
          currentPage: page.currentPage || 1,
          pageSize: page.pageSize || 10
        },
        dpRepaymentRecord: search || this.state.search,
      }

      settings = {
        contentType,
        method: repaymentRecord.type,
        url: repaymentRecord.url,
        data: JSON.stringify(params)
      }

      CL.clReqwest({settings, fn});
    }

    function setObjList(arr) {
      let obj = {};
      if (arr && arr.length) {
        arr.map( function (doc, index) {
          obj[doc.type]= doc.typeName
        })
      }
      return obj;
    }

  }

  getFormFields (fields) {
    let search = {};
    _.map(fields, function (doc, index) {
      if (doc) {
        if (index === "time") { //判断为时间对象
          search.startDate = doc[0].format("YYYY-MM-DD HH:mm:ss");
          search.endDate = doc[1].format("YYYY-MM-DD HH:mm:ss");
          search.startDates = new Date(doc[0].format("YYYY-MM-DD HH:mm:ss")).getTime();
          search.endDates = new Date(doc[1].format("YYYY-MM-DD HH:mm:ss")).getTime();
        } else if (index === "operateTime") { //判断为时间对象
          search.startOperateTime = new Date(doc[0].format("YYYY-MM-DD 00:00:00")).getTime();
          search.endOperateTime = new Date(doc[1].format("YYYY-MM-DD 23:59:59")).getTime();
        } else if (index === "arrivalDate") {
          search.startArrivalDate = new Date(doc[0].format("YYYY-MM-DD 00:00:00")).getTime();
          search.endArrivalDate = new Date(doc[1].format("YYYY-MM-DD 23:59:59")).getTime();
        } else if (index === "repaymentTime") {
          search.startRepaymentTime = new Date(doc[0].format("YYYY-MM-DD 00:00:00")).getTime();
          search.endRepaymentTime = new Date(doc[1].format("YYYY-MM-DD 23:59:59")).getTime();
        } else if (index === "collectDate") {
          search.collectDate = doc.format("YYYY-MM-DD");
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
    const type = that.state.type;
    let columns = [];

    let editStyle = {
      display: "inlineBlock",
      fontSize: "18px",
      position: "absolute",
      right: "5px",
      cursor: "pointer",
      color: "#108ee9",
      top: "20%"
    }


    const columns2 = [
      {
        title: 'Business Type',
        dataIndex: 'type',
        width: "25%",
      },
      {
        title: 'Expense',
        dataIndex: 'expense',
        width: "25%",
        render (index, data) {
          return data.expense ? CF.format(data.expense, {}) : '—';
        }
      },
      {
        title: 'Income',
        dataIndex: 'income',
        width: "25%",
        render (index, data) {
          return data.income ? CF.format(data.income, {}) : "—";
        }
      },
      {
        title: 'Summary',
        dataIndex: 'summary',
        width: "25%",
        render (index, data) {
          return   data.summary ? CF.format(data.summary, {}) : "—"; ;
        }
      }
    ];

    const columns3 = [
      {
        title: 'Transaction Date',
        dataIndex: 'date',
        render: function (index, record) {
          return moment(record.createdDate).format("YYYY-MM-DD HH:mm");
        },
        width: "25%"
      },
      {
        title: 'Items',
        dataIndex: 'items',
        width: "25%",
        render: function (index, record) {
          return (<div className="cl-table-cloumn">
            <div>{that.state.expenseTypeList[parseInt(record.innerType)]}</div>
            <div>{record.fundAccountSourceName}</div>
          </div>)
        },
      },
      {
        title: 'Debit',
        dataIndex: 'debit',
        width: "25%",
        render: function (index, record) {
          return (<div className="cl-table-cloumn">
            <div>{CF.format(record.amount, {})}</div>
            <div></div>
          </div>)
        }
      },
      {
        title: 'Credit',
        dataIndex: 'credit',
        width: "25%",
        render: function (index, record) {
          return (<div className="cl-table-cloumn">
            <div></div>
            <div>{CF.format(record.amount, {})}</div>
          </div>)
        }
      }
    ];

    const columns4 = [
      {
        title: 'Transaction Date',
        dataIndex: 'date',
        render: function (index, record) {
          return moment(record.createdDate).format("YYYY-MM-DD HH:mm");
        },
        width: "25%"
      },
      {
        title: 'Items',
        dataIndex: 'items',
        width: "25%",
        render: function (index, record) {
          return (<div className="cl-table-cloumn">
            <div>{that.state.incomeTypeList[parseInt(record.innerType)]}</div>
            <div>{record.fundAccountTargetName}</div>
          </div>)
        },
      },
      {
        title: 'Debit',
        dataIndex: 'debit',
        width: "25%",
        render: function (index, record) {
          return (<div className="cl-table-cloumn">
            <div></div>
            <div>{CF.format(record.amount, {})}</div>
          </div>)
        }
      },
      {
        title: 'Credit',
        dataIndex: 'credit',
        width: "25%",
        render: function (index, record) {
          return (<div className="cl-table-cloumn">
            <div>{CF.format(record.amount, {})}</div>
            <div></div>
          </div>)
        }
      }
    ];

    const columns5 = [
      {
        title: 'Transaction Date',
        dataIndex: 'createdDate',
        width: "15%",
        render: function (index, record) {
          return moment(record.createdDate).format("YYYY-MM-DD HH:mm");
        }
      },
      {
        title: 'User',
        dataIndex: 'loanBasisName',
        width: "15%",
      },
      {
        title: 'User type',
        dataIndex: 'userType',
        width: "15%",
      },
      {
        title: 'Business Type',
        dataIndex: 'type',
        width: "15%",
        render: function (index, record) {
          return INCOMETYPE[that.state.incomeTypeList[(parseInt(record.innerType) -1)]];
        }
      },
      {
        title: 'Remaining Balance',
        dataIndex: 'amount',
        width: "15%",
        render (index, data) {
          return CF.format(data.amount, {});
        }
      },
      {
        title: 'Currency',
        dataIndex: 'currency',
        width: "15%",
      },
      {
        title: 'Target Info',
        dataIndex: 'targetInfo'
      }
    ];

    const columns6 = [
      {
        title: 'No',
        dataIndex: 'appId',
        width: "6%",
      },
      {
        title: 'Phone Number',
        dataIndex: 'userPhone',
        width: "9%",
      },
      {
        title: 'Operate Time',
        dataIndex: 'operateTime',
        width: "10%",
        render: function (text, record) {
          return record.operateTime ? moment(record.operateTime).format("YYYY-MM-DD HH:mm") : '';
        }
      },
      {
        title: 'Arrive Time',
        dataIndex: 'arrivalDate',
        width: "10%",
        render: function (text, record) {
          return  record.arrivalDate ? moment(record.arrivalDate).format("YYYY-MM-DD HH:mm") : '';
        }
      },
      {
        title: 'Loan Amount',
        dataIndex: 'loanAmount',
        width: "7%",
        render (index, data) {
          return CF.format(data.loanAmount, {});
        }
      },
      {
        title: 'Payment Amount',
        dataIndex: 'amount',
        width: "7%",
        render (index, data) {
          return CF.format(data.amount, {});
        }
      },
      {
        title: 'Bank',
        dataIndex: 'bank',
        width: "6%",
      },
      {
        title: 'Account No',
        dataIndex: 'accountNo',
        width: "10%",
        render: function (text, record) {
          return  (!record.accountNo || record.accountNo === "empty") ? "--" : record.accountNo;
        }
      },
    ];

    const columns7 = [
      {
        title: 'No',
        dataIndex: 'applicationId',
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



    let operation2 = [
      {
        id: 'time',
        type: 'rangePicker',
        label: 'Time',
        placeholder: 'ranger',
      },
    ];

    const operation6 = [
      {
        id: 'appId',
        type: 'text',
        label: 'Application No',
        placeholder: 'Input Application No'
      },
      {
        id: 'userName',
        type: 'text',
        label: 'User Name',
        formType: 'textarea',
        placeholder: 'Enter User Name'
      },
      {
        id: 'userPhone',
        type: 'text',
        label: 'Phone Number',
        placeholder: 'Input Phone Number'
      },
      {
        id: 'operateTime',
        type: 'rangePicker',
        label: 'Payment Time',
        placeholder: 'ranger',
      },
      {
        id: 'arrivalDate',
        type: 'rangePicker',
        label: 'Arrive Time',
        placeholder: 'ranger',
      },
      {
        id: 'bank',
        type: 'text',
        label: 'Bank',
        placeholder: 'Input Bank'
      },
    ];

    const operation7 = [
      {
        id: 'applicationId',
        type: 'text',
        label: 'Application No',
        placeholder: 'Input Application No'
      },
      {
        id: 'repaymentTime',
        type: 'rangePicker',
        label: 'Payment Time',
        placeholder: 'ranger',
      },
    ];

    let data;
    let total1 = {
      loanAmount: 0,
      amount: 0,
    }

    if (type === "2") {
      let {accountingIncomeTotalInfo, accountingExpenseTotalInfo, total} = that.state.data || {};
      const income = accountingIncomeTotalInfo || {};
      const expense = accountingExpenseTotalInfo || {};
      total = total || 0;
      data = [
        {
          id: "1",
          type: "Accounting management fee income",
          income: income.accountManageIncome,
          expense: "",
          summary: ""
        },
        {
          id: "2",
          type: "Evaluation service fee income",
          income: income.auditServiceIncome,
          expense: "",
          summary: ""
        },
        {
          id: "3",
          type: "Information service fee income",
          income: income.infomationServiceIncome,
          expense: "",
          summary: ""
        },
        {
          id: "4",
          type: "Overdue delay fee income",
          income: income.overdueDelayTaxIncome,
          expense: "",
          summary: ""
        },
        {
          id: "5",
          type: "Overdue fee income",
          income: income.overduePaymentIncome,
          expense: "",
          summary: ""
        },
        {
          id: "6",
          type: "Repayment to provision for risks",
          income: income.sumOfComsumerToRiskAmount,
          expense: "",
          summary: ""
        },

        {
          id: "10",
          type: "Payment channel income",
          income: income.paymentChannelIncome || 0,
          expense: "",
          summary: ""
        },

        {
          id: "20",
          type: "Exchange Rate fluctuation income",
          income: income.exchangeRateFluctuationIncome || 0,
          expense: "",
          summary: ""
        },

        {
          id: "7",
          type: "Total income",
          income: "",
          expense: "",
          summary: income.totalIncome
        },
        {
          id: "8",
          type: "Provision-for- risks to  Funds-To-Be-Matched",
          income: '',
          expense: expense.sumOfRistToWaitAmount,
          summary: ""
        },
        {
          id: "9",
          type: "Market operating expenses",
          income: "",
          expense: expense.marketOperateExpense,
          summary: ""
        },
        {
          id: "18",
          type: "Inviting Friends Expense",
          income: "",
          expense: expense.invitationExpense,
          summary: ""
        },
        {
          id: "19",
          type: "Repeat Rewards Expense",
          income: "",
          expense: expense.repeatLoanExpense,
          summary: ""
        },

        {
          id: "15",
          type: "Payment channel expense",
          income: "",
          expense: expense.noteMessageChannelExpense,
          summary: ""
        },
        {
          id: "11",
          type: "Expenses of SMS channel fee",
          income: "",
          expense: 0,
          summary: ""
        },
        {
          id: "12",
          type: "Network telephone expense",
          income: "",
          expense: expense.networkTelephoneExpense,
          summary: ""
        },
        {
          id: "155",
          type: "Expenses of funds to be matched fee",
          income: "",
          expense: expense.idleInvestorIncomeExpense,
          summary: ""
        },
        {
          id: "157",
          type: "Exchange Rate fluctuation expense",
          income: "",
          expense: expense.exchangeRateFluctuationExpense,
          summary: ""
        },

        {
          id: "13",
          type: "Total expense",
          income: "",
          expense: "",
          summary: expense.totalExpense
        },

        {
          id: "14",
          type: "Current yield",
          income: "",
          expense: "",
          summary: total
        }
      ]
      columns = columns2;
    } else if (type === "3") {
      let {accountingIncomeTotalInfo, accountingExpenseTotalInfo, total} = that.state.data || {};
      const income = accountingIncomeTotalInfo || {};
      const expense = accountingExpenseTotalInfo || {};
      total = total || 0;
      data = [
        {
          id: "1",
          type: "Accounting management fee income",
          income: income.accountManageIncome,
          expense: "",
          summary: ""
        },
        {
          id: "2",
          type: "Evaluation service fee income",
          income: income.auditServiceIncome,
          expense: "",
          summary: ""
        },
        {
          id: "3",
          type: "Information service fee income",
          income: income.infomationServiceIncome,
          expense: "",
          summary: ""
        },
        {
          id: "4",
          type: "Overdue delay fee income",
          income: income.overdueDelayTaxIncome,
          expense: "",
          summary: ""
        },
        {
          id: "5",
          type: "Overdue fee income",
          income: income.overduePaymentIncome,
          expense: "",
          summary: ""
        },
        {
          id: "6",
          type: "Repayment to provision for risks",
          income: income.repaymentToProvisionForRisks,
          expense: "",
          summary: ""
        },

        {
          id: "10",
          type: "Payment channel income",
          income: income.paymentChannelIncome || 0,
          expense: "",
          summary: ""
        },

        {
          id: "21",
          type: "Exchange Rate fluctuation income",
          income: income.exchangeRateFluctuationIncome || 0,
          expense: "",
          summary: ""
        },
        {
          id: "7",
          type: "Total income",
          income: "",
          expense: "",
          summary: income.totalIncome
        },
        {
          id: "8",
          type: "Provision-for- risks to  Funds-To-Be-Matched",
          income: '',
          expense: expense.risksToFundsMatched,
          summary: ""
        },
        {
          id: "9",
          type: "Market operating expenses",
          income: "",
          expense: expense.marketOperateExpense,
          summary: ""
        },
        {
          id: "18",
          type: "Inviting Friends Expense",
          income: "",
          expense: expense.invitationExpense,
          summary: ""
        },
        {
          id: "19",
          type: "Repeat Rewards Expense",
          income: "",
          expense: expense.repeatLoanExpense,
          summary: ""
        },

        {
          id: "15",
          type: "Payment channel expense",
          income: "",
          expense: expense.noteMessageChannelExpense,
          summary: ""
        },
        {
          id: "11",
          type: "Expenses of SMS channel fee",
          income: "",
          expense: 0,
          summary: ""
        },
        {
          id: "12",
          type: "Network telephone expense",
          income: "",
          expense: expense.networkTelephoneExpense,
          summary: ""
        },
        {
          id: "255",
          type: "Expenses of funds to be matched fee",
          income: "",
          expense: expense.idleInvestorIncomeExpense,
          summary: ""
        },
        {
          id: "256",
          type: "Exchange Rate fluctuation expense",
          income: "",
          expense: expense.exchangeRateFluctuationExpense,
          summary: ""
        },

        {
          id: "13",
          type: "Total expense",
          income: "",
          expense: "",
          summary: expense.totalExpense
        },

        {
          id: "14",
          type: "Current yield",
          income: "",
          expense: "",
          summary: total
        }
      ]
      columns = columns2;
    } else if (type === "4") {
      data = that.state.data; //待修改
      columns = columns3;


    } else if (type === "5") {
      data = that.state.data;
      columns = columns4
    } else if (type === "6") {
      data = _.map(that.state.data, (doc) => {
        return _.extend(doc, {
          userType: "borrower",
          currency: "peso",
          targetInfo: "income"
        })
      });

      columns = columns5
    } else if (type === "7") {
      data = that.state.data && that.state.data.length ? _.map(that.state.data, (doc, index) => {
        if (!doc) {
          return doc;
        }
        doc.id = doc.appId || doc.applicationId + index.toString();
        total1.loanAmount += parseInt(doc.loanAmount);
        total1.amount += parseInt(doc.amount);
        return doc;
      }) : [];
      columns = columns6;
      operation2 = operation6;
    } else if (type === "8") {
      data = that.state.data && that.state.data.length ? _.map(that.state.data, (doc, index) => {
        if (!doc) {
          return doc;
        }
        doc.id = doc.appId || doc.applicationId + index.toString();
        total1.loanAmount += parseInt(doc.loanAmount);
        total1.amount += parseInt(doc.amount);
        return doc;
      }) : [];
      columns = columns7;
      operation2 = operation7;
    }


    let settings = {
      data: data,
      columns: columns,
      operation: operation2,
      getFields: that.getFormFields,
      pagination:that.state.pagination,
      pageChange: that.pageChage,
      tableLoading: that.state.tableLoading,
      search: that.state.search
    }

    return (
      <div className="input-order" key="input-order">
        <Tabs  defaultActiveKey={this.state.type} onChange={this.changeTab}>
          {CL.isRole("Funds Management-AB") ? (<TabPane tab="Amount Balance" key="1"><AmountBalance/></TabPane>) : ""}
          {CL.isRole("Funds Management-CY") ? (<TabPane tab="Current Yield" key="2"><CLlist settings={settings} /></TabPane>) : ""}
          {CL.isRole("Funds Management-CY") ? (<TabPane tab="Current yield (conservative)" key="3"><CLlist settings={settings} /></TabPane>) : ""}
          {CL.isRole("Funds Management-ED") ? (<TabPane tab="Expense Detail" key="4"><CLlist settings={settings} /></TabPane>) : ""}
          {CL.isRole("Funds Management-ID") ? (<TabPane tab="Income Detail" key="5"><CLlist settings={settings} /></TabPane>) : ""}
          {CL.isRole("Funds Management-CD") ? (<TabPane tab="Consumer Detail" key="6"><CLlist settings={settings} /></TabPane>) : ""}
          {CL.isRole("Funds Management-PL") ? (
            <TabPane tab="Payment List" key="7">
              <CLlist settings={settings} />
              <Row>
                <Col offset={1}><h4>Total Loan Amount: {total1.loanAmount}</h4></Col>
                <Col offset={1}><h4>Total Amount: {total1.amount}</h4></Col>
              </Row>im
            </TabPane>) : ""}
          {CL.isRole("Funds Management-RL") ? (<TabPane tab="Repayment List" key="8"><CLlist settings={settings} /></TabPane>) : ""}
          {CL.isRole("Funds Management-IM") ? (<TabPane tab="Wealth management funds" key="9"><InvestManagement/></TabPane>) : ""}
          {CL.isRole("Funds Management-MI") ? (<TabPane tab="周资金预算表" key="10"><WeeklyFundAllocation/></TabPane>) : ""}
          {CL.isRole("Funds Management-ZP") ? (<TabPane tab="资金需求配置表" key="11"><BudgetAllocation/></TabPane>) : ""}


        </Tabs>
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
export default FundManagement;
