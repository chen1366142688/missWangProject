import React from 'react';
import moment from 'moment';
import { CLComponent } from '../../../src/lib/component/index';
import { message, Table, Spin, Tabs, Row, Col } from 'antd';
import { Interface } from '../../../src/lib/config/index';
import { CL } from '../../../src/lib/tools/index';

let  { stageData, contentType, } = Interface;

class NodeData extends CLComponent {
  constructor (props) {
    super(props);
    this.bindCtx([
      "renderBody",
      "getData2",
      "getData3",
      "getData4",
      "getData5",
      "getData6",
    ]);
  }

  state = {
    columns: [],
    data: []
  }

  componentDidMount() {
    this.getData2();
    this.getData3();
    this.getData4();
    this.getData5();
    this.getData6();
  }

  getData2 () {
    const that = this;
    let settings1 = {
      contentType,
      method: stageData.memberStage.type,
      url: stageData.memberStage.url
    }
    function fn1 (res) {
      // console.log(res);
      const data = res.data;
      if (data) {
        that.setState({memberStage: data})
      }

    }
    CL.clReqwest({settings: settings1, fn: fn1});
  }

  getData3 () {
    const that = this;
    let settings2 = {
      contentType,
      method: stageData.orderStage.type,
      url: stageData.orderStage.url
    }
    function fn2 (res) {
      // console.log(res);
      const data = res.data;
      if (data) {
        that.setState({orderStage: data})
      }
    }
    CL.clReqwest({settings: settings2, fn: fn2});
  }

  getData4 () {
    const that = this;
    let settings3 = {
      contentType,
      method: stageData.applicationStage.type,
      url: stageData.applicationStage.url
    }
    function fn3 (res) {
      // console.log(res);
      that.setState({tableLoading: false});
      const data = res.data;
      if (data) {
        that.setState({applicationStage: data})
      }
    }
    CL.clReqwest({settings: settings3, fn: fn3});
  }

  getData5 () {
    const that = this;
    let settings4 = {
      contentType,
      method: stageData.applicationStage1.type,
      url: stageData.applicationStage1.url
    }
    function fn4 (res) {
      // console.log(res);
      that.setState({tableLoading: false});
      const data = res.data;
      if (data) {
        that.setState({applicationStage1: data})
      }
    }
    CL.clReqwest({settings: settings4, fn: fn4});
  }

  getData6 () {
    const that = this;
    let settings5 = {
      contentType,
      method: stageData.applicationStage2.type,
      url: stageData.applicationStage2.url
    }
    function fn5 (res) {
      that.setState({tableLoading: false});
      const data = res.data;
      if (data) {
        that.setState({applicationStage2: data})
      }
    }
    CL.clReqwest({settings: settings5, fn: fn5});
  }

  renderBody () {
    function formatPercent(a, b) {
      if (b === 0 || b === "0") {
        return "0%"
      }

      const c = a / b;
      return (parseFloat(c) * 100).toFixed(2) + "%";
    }

    const that = this;
    const columns = that.state.columns;
    const {
      orderStage = {}, 
      memberStage = {}, 
      applicationStage = {},
      applicationStage1 = {},
      applicationStage2 = {},
      AccountData = {},
      todayData = {},
      hisData = {},
    } = that.state;
    let column = [];
    let settings = {};
    let column1 = [], data1 = [], 
        column2 = [], data2 = [], 
        column3 = [], data3 = [],
        column4 = [], data4 = [], 
        column5 = [], data5 = [],
        column6 = [], data6 = [], 
        column7 = [], data7 = [],
        column8 = [], data8 = [], 
        column9 = [], data9 = [];

    const {
      normalAlready = {}, 
      normalNotyet = {}, 
      overdueAlready = {},
      todayOverdueAlready = {},
      todayNormalAlready = {},

      overdueLess7 = {},
      overdue714 = {},
      overdue1430 = {},
      overdue3045 = {},
      overdue4560 = {},
      overdueMore60 = {},

      totalLess7 = {},
      total714 = {},
      total1430 = {},
      total3045 = {},
      total4560 = {},
      totalMore60 = {},
      overduetotal = {},
      totalPrincipal,

    } = orderStage;


    // Applied-Registered Data
    function arFormat(value, doc) {
      if (doc.name !== "Applied/Registred Rate" && doc.name !== "New Applied/Registred Rate") {
        return CL.cf(value, 0)
      }            
      return value
    }

    column1 = [
      {
        title: ' ',
        dataIndex: 'name'
      }, 
      {
        title: 'total',
        dataIndex: 'total',
        render(index, doc) {
          return arFormat(doc.total, doc);
        }

      },
      {
        title: 'today',
        dataIndex: 'today',
        render(index, doc) {
          return arFormat(doc.today, doc);
        }
      },
      {
        title: 'week',
        dataIndex: 'thisWeek',
        render(index, doc) {
          return arFormat(doc.thisWeek, doc);
        }
      },
      {
        title: 'this month',
        dataIndex: 'thisMonth',
        render(index, doc) {
          return arFormat(doc.thisMonth, doc);
        }
      },
    ];

    data1 = [
      {
        index: 1,
        name: 'Registred Account',
        total: memberStage.total,
        today: memberStage.today,
        thisWeek: memberStage.thisWeek,
        thisMonth: memberStage.thisMonth,
      },
      {
        index: 2,
        name: 'Applied Account',
        total: applicationStage.total,
        today: applicationStage.today,
        thisWeek: applicationStage.thisWeek,
        thisMonth: applicationStage.thisMonth,
      },

      {
        index: 3,
        name: 'New Applied Account',
        total: applicationStage1.totalNewAppliedAccount,
        today: applicationStage1.todayNewAppliedAccount,
        thisWeek: applicationStage1.weekNewAppliedAccount,
        thisMonth: applicationStage1.thisMonthNewAppliedAccount,
      },
      
      {
        index: 4,
        name: 'Applied/Registred Rate',
        total: !parseInt(memberStage.total) ? "—" : (( applicationStage.total  / memberStage.total) * 100).toFixed(2) + '%',
        today: !parseInt(memberStage.today) ? "—" : (( applicationStage.today  / memberStage.today) * 100).toFixed(2) + '%',
        thisWeek: !parseInt(memberStage.thisWeek) ? "—" :  (( applicationStage.thisWeek  / memberStage.thisWeek) * 100).toFixed(2) + '%',
        thisMonth: !parseInt(memberStage.thisMonth) ? "—" :  (( applicationStage.thisMonth  / memberStage.thisMonth) * 100).toFixed(2) + '%',
      },
      {
        index: 5,
        name: 'New Applied/Registred Rate',
        total: formatPercent (applicationStage1.totalNewAppliedAccount, memberStage.total),
        today:  formatPercent (applicationStage1.todayNewAppliedAccount, memberStage.today), 
        thisWeek: formatPercent (applicationStage1.weekNewAppliedAccount, memberStage.thisWeek),
        thisMonth: formatPercent (applicationStage1.thisMonthNewAppliedAccount, memberStage.thisMonth),
      },
    ]

    //Disbursement Data
    function ddFormat(value, doc) {
      if (value && value.toString().indexOf("%") > -1) {
        return value;
      }
      let fix = doc.name === "Disbursement Amount" ? 2 : 0;
      return CL.cf(value, fix)
    }
    column2 = [
      {
        title: ' ',
        dataIndex: 'name'
      }, 
      {
        title: 'total',
        dataIndex: 'total',
        render (index, doc) {
          return ddFormat(doc.total, doc);
        }
      },
      {
        title: 'today',
        dataIndex: 'today',
        render (index, doc) {
          return ddFormat(doc.today, doc);
        }
      },
      {
        title: 'week',
        dataIndex: 'thisWeek',
        render (index, doc) {
          return ddFormat(doc.thisWeek, doc);
        }
      },
      {
        title: 'this month',
        dataIndex: 'thisMonth',
        render (index, doc) {
          return ddFormat(doc.thisMonth, doc);
        }
      },
    ];

    data2 = [
      {
        index: 1,
        name: 'Disbursement Amount',
        total: orderStage.totalPrincipal,
        today: orderStage.todayPrincipal,
        thisWeek: orderStage.thisWeekPrincipal,
        thisMonth: orderStage.thisMonthPrincipal,
      },
      {
        index: 2,
        name: 'Disbursement Account',
        total: orderStage.totalNumber,
        today: orderStage.todayNumber,
        thisWeek: orderStage.thisWeekNumber,
        thisMonth: orderStage.thisMonthNumber,
      },
      {
        index: 3,
        name: 'New Disbursement Account',
        total: orderStage.totalNewDisbursementAccount,
        today: orderStage.todayNewDisbursementAccount,
        thisWeek: orderStage.weekNewDisbursementAccount,
        thisMonth: orderStage.thisMonthNewDisbursementAccount,
      },
      
      {
        index: 4,
        name: 'Passing Rate',
        today: formatPercent(orderStage.todayNumber,  applicationStage.today),
        thisWeek: formatPercent( orderStage.thisWeekNumber,  applicationStage.thisWeek),
        thisMonth: formatPercent( orderStage.thisMonthNumber,  applicationStage.thisMonth),
        total: formatPercent( orderStage.totalNumber,  applicationStage.total),
      },
      {
        index: 5,
        name: 'New Passing Rate',
        today: formatPercent(orderStage.todayNewDisbursementAccount,  applicationStage2.todayAppliedAndNotApprovedAccount),
        thisWeek: formatPercent( orderStage.weekNewDisbursementAccount,  applicationStage2.weekAppliedAndNotApprovedAccount),
        thisMonth: formatPercent( orderStage.thisMonthNewDisbursementAccount,  applicationStage2.thisMonthAppliedAndNotApprovedAccount),
        total: formatPercent( orderStage.totalNewDisbursementAccount,  applicationStage2.totalAppliedAndNotApprovedAccount),
      }
    ]


    column3 = [ 
      {
        title: 'No. of Account',
        dataIndex: 'account',
        render(index, doc) {
          return CL.cf(doc.account, 0)
        }
      },
      {
        title: 'Principal',
        dataIndex: 'amount',
        render(index, doc) {
          return CL.cf(doc.amount, 2)
        }
      },
      {
        title: 'Principal+Interest',
        dataIndex: 'totalAmount',
        render(index, doc) {
          return CL.cf(doc.totalAmount, 2)
        }
      },
    ];

    data3 = [
      {
        index: 1,
        name: null,
        account: normalNotyet.numberOfCount,
        amount: normalNotyet.sumOfOverduePrincipal,
        totalAmount:  normalNotyet.sumOfOverduePrincipal + normalNotyet.sumOfOverdueInterest,
      }
    ]

    column4 = [ 
      {
        title: '',
        dataIndex: 'name'
      },
      {
        title: 'No. of Account',
        dataIndex: 'account',
        render(index, doc) {
          return CL.cf(doc.account, 0)
        }
      },
      {
        title: 'Principal',
        dataIndex: 'amount',
        render(index, doc) {
          return CL.cf(doc.amount, 2)
        }
      },
      {
        title: 'Principal+Interest',
        dataIndex: 'totalAmount',
        render(index, doc) {
          return CL.cf(doc.totalAmount, 2)
        }
      },
      {
        title: 'Amount',
        dataIndex: 'money',
        render(index, doc) {
          return CL.cf(doc.money, 2)
        }
      },
    ];

    data4 = [
      {
        index: 1,
        name: "Normal Closed",
        account: normalAlready.numberOfCount,
        amount: normalAlready.sumOfOverduePrincipal ,
        totalAmount:  normalAlready.sumOfOverduePrincipal + normalAlready.sumOfOverdueInterest,
        money: normalAlready.sumOfAlreadyRepaymentAmount
      },
      {
        index: 2,
        name: "Overdue Closed",
        account: overdueAlready.numberOfCount,
        amount: overdueAlready.sumOfOverduePrincipal,
        totalAmount: overdueAlready.sumOfOverduePrincipal + overdueAlready.sumOfOverdueInterest,
        money: overdueAlready.sumOfAlreadyRepaymentAmount,
      },
      {
        index: 3,
        name: "Total Closed",
        account: normalAlready.numberOfCount + overdueAlready.numberOfCount,
        amount: normalAlready.sumOfOverduePrincipal + overdueAlready.sumOfOverduePrincipal,
        totalAmount: normalAlready.sumOfOverduePrincipal + normalAlready.sumOfOverdueInterest + overdueAlready.sumOfOverduePrincipal + overdueAlready.sumOfOverdueInterest, 
        money: normalAlready.sumOfAlreadyRepaymentAmount+overdueAlready.sumOfAlreadyRepaymentAmount,
      }
    ]

    column5 = [ 
      {
        title: '',
        dataIndex: 'name'
      },
      {
        title: 'No. of Account',
        dataIndex: 'account',
        render(index, doc) {
          return CL.cf(doc.account, 0)
        }
      },
      {
        title: 'Principal',
        dataIndex: 'amount',
        render(index, doc) {
          return CL.cf(doc.amount, 2)
        }
      },
      {
        title: 'Principal+Interest',
        dataIndex: 'totalAmount',
        render(index, doc) {
          return CL.cf(doc.totalAmount, 2)
        }
      },
      {
        title: 'Amount',
        dataIndex: 'money',
        render(index, doc) {
          return CL.cf(doc.money, 2)
        }
      },
    ];

    data5 = [
      {
        index: 1,
        name: "Normal Closed",
        account: todayNormalAlready.numberOfCount,
        amount: todayNormalAlready.sumOfOverduePrincipal,
        totalAmount: todayNormalAlready.sumOfOverduePrincipal + todayNormalAlready.sumOfOverdueInterest,
        money: todayNormalAlready.sumOfAlreadyRepaymentAmount
      },
      {
        index: 2,
        name: "Overdue Closed",
        account: todayOverdueAlready.numberOfCount,
        amount: todayOverdueAlready.sumOfOverduePrincipal,
        totalAmount: todayOverdueAlready.sumOfOverduePrincipal + todayOverdueAlready.sumOfOverdueInterest,
        money:  todayOverdueAlready.sumOfAlreadyRepaymentAmount,
      },
      {
        index: 3,
        name: "Total Closed",
        account: todayNormalAlready.numberOfCount + todayOverdueAlready.numberOfCount,
        amount: todayNormalAlready.sumOfOverduePrincipal + todayOverdueAlready.sumOfOverduePrincipal,
        totalAmount: (todayNormalAlready.sumOfOverduePrincipal  + todayNormalAlready.sumOfOverdueInterest + todayOverdueAlready.sumOfOverduePrincipal + todayOverdueAlready.sumOfOverdueInterest), 
        money: todayNormalAlready.sumOfAlreadyRepaymentAmount + todayOverdueAlready.sumOfAlreadyRepaymentAmount,
      } 
    ]

    // 逾期情况
    column6 = [ 
      {
        title: '',
        dataIndex: 'name'
      },
      {
        title: 'No. of Account',
        dataIndex: 'account',
        render(index, doc) {
          return CL.cf(doc.account, 0)
        }
      },
      {
        title: 'Principal',
        dataIndex: 'amount',
        render(index, doc) {
          return CL.cf(doc.amount, 2)
        }
      },
      {
        title: 'Principal+Interest',
        dataIndex: 'totalAmount',
        render(index, doc) {
          return CL.cf(doc.totalAmount, 2)
        }
      },
      {
        title: 'Actual Overdue(penalty+late payment charge)',
        dataIndex: 'money',
        render(index, doc) {
          return CL.cf(doc.money, 2)
        }
      },
    ];

    data6 = [
      {
        index: 1,
        name: "<= 7 Days",
        account: overdueLess7.numberOfCount,
        amount: overdueLess7.sumOfOverduePrincipal,
        totalAmount: overdueLess7.sumOfOverdueInterest + overdueLess7.sumOfOverduePrincipal,
        money: overdueLess7.sumOfOverdueAmount
      },
      {
        index: 2,
        name: "＞7 Days",
        account: overdue714.numberOfCount,
        amount: overdue714.sumOfOverduePrincipal,
        totalAmount: overdue714.sumOfOverdueInterest+overdue714.sumOfOverduePrincipal,
        money: overdue714.sumOfOverdueAmount
      },
      {
        index: 3,
        name: ">14 Days",
        account: overdue1430.numberOfCount,
        amount:  overdue1430.sumOfOverduePrincipal,
        totalAmount:  overdue1430.sumOfOverdueInterest+ overdue1430.sumOfOverduePrincipal,
        money:  overdue1430.sumOfOverdueAmount
      },
      {
        index: 4,
        name: ">30 Days",
        account: overdue3045.numberOfCount,
        amount:  overdue3045.sumOfOverduePrincipal,
        totalAmount:  overdue3045.sumOfOverdueInterest+overdue3045.sumOfOverduePrincipal,
        money:  overdue3045.sumOfOverdueAmount
      },
      {
        index: 5,
        name: ">45 Days",
        account: overdue4560.numberOfCount,
        amount:  overdue4560.sumOfOverduePrincipal,
        totalAmount:  overdue4560.sumOfOverdueInterest + overdue4560.sumOfOverduePrincipal,
        money:  overdue4560.sumOfOverdueAmount
      },
      {
        index: 6,
        name: ">60 Days",
        account: overdueMore60.numberOfCount,
        amount: overdueMore60.sumOfOverduePrincipal,
        totalAmount: overdueMore60.sumOfOverdueInterest + overdueMore60.sumOfOverduePrincipal,
        money: overdueMore60.sumOfOverdueAmount
      },
      {
        index: 7,
        name: "Total",
        account: overduetotal.numberOfCount,
        amount: overduetotal.sumOfOverduePrincipal,
        totalAmount: overduetotal.sumOfOverdueInterest + overduetotal.sumOfOverduePrincipal,
        money: overduetotal.sumOfOverdueAmount
      }
    ]

    column7 = [ 
      {
        title: '',
        dataIndex: 'name'
      },
      {
        title: 'Total',
        dataIndex: 'total'
      },
      {
        title: '< 7 Days',
        dataIndex: 'less7'
      },
      {
        title: '> 7 Days',
        dataIndex: 'more7'
      },
      {
        title: '> 14 Days',
        dataIndex: 'more14'
      },
      {
        title: '> 30 Days',
        dataIndex: 'more30'
      },
      {
        title: '> 45 Days',
        dataIndex: 'more45'
      },
      {
        title: '> 60 Days',
        dataIndex: 'more60'
      },
    ];

    const count  = overduetotal.numberOfCount + data4[2].account;
    const allAmount = parseFloat(overduetotal.sumOfOverduePrincipal) + parseFloat(data4[2].amount) || 0;

    data7 = [
      {
        index: 4,
        name: "Overdue Rate(Account)",
        total: formatPercent (overduetotal.numberOfCount, count) ,
        less7: formatPercent (overdueLess7.numberOfCount, count),
        more7: formatPercent (overdue714.numberOfCount, count),
        more14: formatPercent (overdue1430.numberOfCount, count),
        more30: formatPercent (overdue3045.numberOfCount, count),
        more45: formatPercent (overdue4560.numberOfCount, count),
        more60: formatPercent (overdueMore60.numberOfCount, count),
      },
      {
        index: 3,
        name: "Overdue Rate(Principal)",
        total: formatPercent (parseFloat(data6[6].amount), allAmount) ,
        less7: formatPercent (parseFloat(overdueLess7.sumOfOverduePrincipal), allAmount),
        more7: formatPercent (parseFloat(overdue714.sumOfOverduePrincipal), allAmount),
        more14: formatPercent (parseFloat(overdue1430.sumOfOverduePrincipal), allAmount),
        more30: formatPercent (parseFloat(overdue3045.sumOfOverduePrincipal), allAmount),
        more45: formatPercent (parseFloat(overdue4560.sumOfOverduePrincipal), allAmount),
        more60: formatPercent (parseFloat(overdueMore60.sumOfOverduePrincipal), allAmount),
      },
      {
        index: 2,
        name: "Overdue Rate(Principal+Interest)",
        total: formatPercent (parseFloat(data6[6].totalAmount), allAmount) ,
        less7: formatPercent ((parseFloat(overdueLess7.sumOfOverduePrincipal) + parseFloat(overdueLess7.sumOfOverdueInterest)), allAmount),
        more7: formatPercent ((parseFloat(overdue714.sumOfOverduePrincipal) + parseFloat(overdue714.sumOfOverdueInterest)), allAmount),
        more14: formatPercent ((parseFloat(overdue1430.sumOfOverduePrincipal) + parseFloat(overdue1430.sumOfOverdueInterest)), allAmount),
        more30: formatPercent ((parseFloat(overdue3045.sumOfOverduePrincipal) + parseFloat(overdue3045.sumOfOverdueInterest)), allAmount),
        more45: formatPercent ((parseFloat(overdue4560.sumOfOverduePrincipal) + parseFloat(overdue4560.sumOfOverdueInterest)), allAmount),
        more60: formatPercent ((parseFloat(overdueMore60.sumOfOverduePrincipal) + parseFloat(overdueMore60.sumOfOverdueInterest)), allAmount),
      },
      
      
      {
        index: 1,
        name: "Overdue Rate (Total)",
        total: formatPercent (parseFloat(data6[6].money), allAmount) ,
        less7: formatPercent (parseFloat(overdueLess7.sumOfOverdueAmount), allAmount),
        more7: formatPercent (parseFloat(overdue714.sumOfOverdueAmount), allAmount),
        more14: formatPercent (parseFloat(overdue1430.sumOfOverdueAmount), allAmount),
        more30: formatPercent (parseFloat(overdue3045.sumOfOverdueAmount), allAmount),
        more45: formatPercent (parseFloat(overdue4560.sumOfOverdueAmount), allAmount),
        more60: formatPercent (parseFloat(overdueMore60.sumOfOverdueAmount), allAmount),
      },
    ]

    column8 = [ 
      {
        title: moment().format("YYYY-MM-DD"),
        dataIndex: 'today',
        render (index, doc) {
          return CL.cf(doc.today, 0)
        }
      },
      {
        title: moment().subtract(1, 'days').format("YYYY-MM-DD"),
        dataIndex: 'yesterday',
        render (index, doc) {
          return CL.cf(doc.yesterday, 0)
        }
      },
      {
        title: moment().subtract(2, 'days').format("YYYY-MM-DD"),
        dataIndex: 'threeDaysAgo',
        render (index, doc) {
          return CL.cf(doc.threeDaysAgo, 0)
        }
      },
      {
        title: moment().subtract(3, 'days').format("YYYY-MM-DD"),
        dataIndex: 'fourDaysAgo',
        render (index, doc) {
          return CL.cf(doc.fourDaysAgo, 0)
        }
      },
      {
        title: moment().subtract(4, 'days').format("YYYY-MM-DD"),
        dataIndex: 'fiveDaysAgo',
        render (index, doc) {
          return CL.cf(doc.fiveDaysAgo, 0)
        }
      },
      {
        title: moment().subtract(5, 'days').format("YYYY-MM-DD"),
        dataIndex: 'sixDaysAgo',
        render (index, doc) {
          return CL.cf(doc.sixDaysAgo, 0)
        }
      },
      {
        title: moment().subtract(6, 'days').format("YYYY-MM-DD"),
        dataIndex: 'sevenDaysAgo',
        render (index, doc) {
          return CL.cf(doc.sevenDaysAgo, 0)
        }
      },
    ];

    data8 = [ 
      {
        index: 1,
        today: memberStage.today,
        yesterday: memberStage.yesterday,
        threeDaysAgo: memberStage.threeDaysAgo,
        fourDaysAgo: memberStage.fourDaysAgo,
        fiveDaysAgo: memberStage.fiveDaysAgo,
        sixDaysAgo: memberStage.sixDaysAgo,
        sevenDaysAgo: memberStage.sevenDaysAgo,
      },
       {
        index: 2,
        today: applicationStage.today,
        yesterday: applicationStage.yesterday,
        threeDaysAgo: applicationStage.threeDaysAgo,
        fourDaysAgo: applicationStage.fourDaysAgo,
        fiveDaysAgo: applicationStage.fiveDaysAgo,
        sixDaysAgo: applicationStage.sixDaysAgo,
        sevenDaysAgo: applicationStage.sevenDaysAgo,
      },
      {
        index: 3,
        today: applicationStage1.todayNewAppliedAccount,
        yesterday: applicationStage1.oneDaysAgoNewAppliedAccount,
        threeDaysAgo: applicationStage1.twoDaysAgoNewAppliedAccount,
        fourDaysAgo: applicationStage1.threeDaysAgoNewAppliedAccount,
        fiveDaysAgo: applicationStage1.fourDaysAgoNewAppliedAccount,
        sixDaysAgo: applicationStage1.fiveDaysAgoNewAppliedAccount,
        sevenDaysAgo: applicationStage1.sixDaysAgoNewAppliedAccount,
      },
    ];

    function dwFormat (value, doc) {
      if (doc.index === 1) {
        return CL.cf(value, 2)
      } else {
        return CL.cf(value, 0)
      }
    }

    column9 = [ 
      {
        title: moment().format("YYYY-MM-DD"),
        dataIndex: 'today',
        render (index, doc) {
          return dwFormat(doc.today, doc);
        }
      },
      {
        title: moment().subtract(1, 'days').format("YYYY-MM-DD"),
        dataIndex: 'yesterday',
        render (index, doc) {
          return dwFormat(doc.yesterday, doc);
        }
      },
      {
        title: moment().subtract(2, 'days').format("YYYY-MM-DD"),
        dataIndex: 'threeDaysAgo',
        render (index, doc) {
          return dwFormat(doc.threeDaysAgo, doc);
        }
      },
      {
        title: moment().subtract(3, 'days').format("YYYY-MM-DD"),
        dataIndex: 'fourDaysAgo',
        render (index, doc) {
          return dwFormat(doc.fourDaysAgo, doc);
        }
      },
      {
        title: moment().subtract(4, 'days').format("YYYY-MM-DD"),
        dataIndex: 'fiveDaysAgo',
        render (index, doc) {
          return dwFormat(doc.fiveDaysAgo, doc);
        }
      },
      {
        title: moment().subtract(5, 'days').format("YYYY-MM-DD"),
        dataIndex: 'sixDaysAgo',
        render (index, doc) {
          return dwFormat(doc.sixDaysAgo, doc);
        }
      },
      {
        title: moment().subtract(6, 'days').format("YYYY-MM-DD"),
        dataIndex: 'sevenDaysAgo',
        render (index, doc) {
          return dwFormat(doc.sevenDaysAgo, doc);
        }
      },
    ];

    data9 = [ 
      {
        index: 1,
        today: orderStage.todayPrincipal,
        yesterday: orderStage.yesterdayPrincipal,
        threeDaysAgo: orderStage.threeDaysAgoPrincipal,
        fourDaysAgo: orderStage.fourDaysAgoPrincipal,
        fiveDaysAgo: orderStage.fiveDaysAgoPrincipal,
        sixDaysAgo: orderStage.sixDaysAgoPrincipal,
        sevenDaysAgo: orderStage.sevenDaysAgoPrincipal,
      },
      {
        index: 2,
        today: orderStage.todayNumber,
        yesterday: orderStage.yesterdayNumber,
        threeDaysAgo: orderStage.threeDaysAgoNumber,
        fourDaysAgo: orderStage.fourDaysAgoNumber,
        fiveDaysAgo: orderStage.fiveDaysAgoNumber,
        sixDaysAgo: orderStage.sixDaysAgoNumber,
        sevenDaysAgo: orderStage.sevenDaysAgoNumber,
      },
      {
          index: 3,
          today: orderStage.newUserTodayNumber,
          yesterday: orderStage.newUserYesterdayNumber,
          threeDaysAgo: orderStage.newUserThreeDaysAgoNumber,
          fourDaysAgo: orderStage.newUserFourDaysAgoNumber,
          fiveDaysAgo: orderStage.newUserFiveDaysAgoNumber,
          sixDaysAgo: orderStage.newUserSixDaysAgoNumber,
          sevenDaysAgo: orderStage.newUserSevenDaysAgoNumber,
        }
    ];


    return (
      <div>
        <Table  bordered  className="charge-details cl-table" 
          title={() => {return (<h2>Applied-Registered Data</h2>)}}
          loading = {that.state.tableLoading}
          pagination = {false}
          columns={column1} 
          rowKey={record =>  record.index}
          dataSource={data1} />

        <Table  bordered  className="charge-details cl-table"
          title={() => {return (<h2>Registred—Applied—New Applied Account Within 7D</h2>)}}
          loading = {that.state.tableLoading}
          pagination = {false}
          columns={column8} 
          rowKey={record =>  record.index}
          dataSource={data8} />

          <Table  bordered  className="charge-details cl-table" 
            title={() => {return (<h2>Disbursement Data</h2>)}}
            loading = {that.state.tableLoading}
            pagination = {false}
            columns={column2} 
            rowKey={record =>  record.index}
            dataSource={data2} />

          <Table  bordered  className="charge-details cl-table"
            title={() => {return (<h2>Disbursement Within 7D：Amount-Accounts-New Accounts</h2>)}}
            loading = {that.state.tableLoading}
            pagination = {false}
            columns={column9} 
            rowKey={record =>  record.index}
            dataSource={data9} />

          <Table  bordered  className="charge-details cl-table" 
            title={() => {return (<h2>Normal Status Data</h2>)}}
            loading = {that.state.tableLoading}
            pagination = {false}
            columns={column3} 
            rowKey={record =>  record.index}
            dataSource={data3} />

          <Table  bordered  className="charge-details cl-table" 
            title={() => {return (<h2>Total Repayment </h2>)}}
            loading = {that.state.tableLoading}
            pagination = {false}
            columns={column4} 
            rowKey={record =>  record.index}
            dataSource={data4} />

          <Table  bordered  className="charge-details cl-table" 
            title={() => {return (<h2>Repayment Today</h2>)}}
            loading = {that.state.tableLoading}
            pagination = {false}
            columns={column5} 
            rowKey={record =>  record.index}
            dataSource={data5} />

          <Table  bordered  className="charge-details cl-table" 
            title={() => {return (<h2>Overdue</h2>)}}
            loading = {that.state.tableLoading}
            pagination = {false}
            columns={column6} 
            rowKey={record =>  record.index}
            dataSource={data6} />

          <Table  bordered  className="charge-details cl-table"
            title={() => {return (<h2>Overdue Rate</h2>)}}
            loading = {that.state.tableLoading}
            pagination = {false}
            columns={column7} 
            rowKey={record =>  record.index}
            dataSource={data7} />
      </div>)
  }

  render () {
    return this.renderBody();
  }
}

export default NodeData;