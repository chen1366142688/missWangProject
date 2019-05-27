import React from 'react';
import moment from 'moment';
import { CLComponent, CLBlockList } from '../../../src/lib/component/index';
import { message, Table, Spin, Tabs, Row, Col } from 'antd';
import { Interface } from '../../../src/lib/config/index';
import { CL } from '../../../src/lib/tools/index';
import CF from 'currency-formatter';
let  { analysisHistory, analysisToday, analysisAmount, contentType, } = Interface;

class UserCollectionData extends CLComponent {
  constructor (props) {
    super(props);
    this.bindCtx([
      "renderBody",
      "getData3",
    ]);
  }

  state = {
    columns: [],
    data: []
  }

  componentDidMount() {
    this.getData3();
  }

  getData3 () {
    const that = this;
    that.setState({tableLoading: true});

    const historySettings = {
      contentType,
      method: 'get',
      url: analysisHistory.url
    }

    function HisFn (res) {
      if (res.data) {
        CL.clReqwest({settings: todaySettings, fn: TodayFn});
        that.setState({hisData: res.data})
      }
    }

    const todaySettings = {
      contentType,
      method: 'get',
      url: analysisToday.url
    }

    function TodayFn (res) {
      if (res.data) {
        CL.clReqwest({settings: AccountSettings, fn: AccountFn});
        that.setState({todayData: res.data})
      }
    }

    const AccountSettings = {
      contentType,
      method: 'get',
      url: analysisAmount.url
    }

    function AccountFn (res) {
      that.setState({tableLoading: false});
      if (res.data) {
        that.setState({AccountData: res.data})
      }
    }

    CL.clReqwest({settings: historySettings, fn: HisFn});
  }

  renderBody () {
    const that = this;
    const {
      orderStage = {}, 
      memberStage = {}, 
      applicationStage = {},
      AccountData = {},
      todayData = {},
      hisData = {},
    } = that.state;

    let  userSettings = {
      title: "Registration and Application Data",
      data: []
    };

    let  releaseSettings = {
      title: "Disbursement Data",
      data: []
    };

    let  paybackSettings = {
      title: "Collection Data",
      data: []
    }

    userSettings.data = [
      {
        title: "Registered Account Today",
        content: CL.cf(todayData.registerUser),
        type: 'text',
      },
      {
        title: "Total Regeitered Account",
        content: CL.cf(hisData.registerUserHistory),
        type: 'text',
      },
      {
        title: "Applied Account Today",
        content:  CL.cf(todayData.loanApplication),
        type: 'text',
      },
      {
        title: "Total Applied Account",
        content: CL.cf(hisData.loanApplicationHistory),
        type: 'text',
      },
      {
        title: "Disbursed Account Today ",
        content: CL.cf(todayData.paySuess),
        type: 'text',
      },
      {
        title: "Total Disbursed Account",
        content: CL.cf(hisData.paysuessHistory),
        type: 'text',
      },
      {
        title: "Passing Rate Today",
        content: todayData.passRate,
        type: 'text',
      },
      {
        title: "Passing Rate Till Now",
        content: hisData.passRateHistory,
        type: 'text',
      }
    ]
    
    releaseSettings.data = [
      {
        title: "Disbursed Amount Today",
        content: "₱" + CF.format(todayData.loanAmount, {}),
        type: 'text',
      },
      {
        title: "Total Disbursed Amount",
        content: "₱" + CF.format(hisData.loanAmountHistory, {}),
        type: 'text',
      },
      {
        title: "Disbursed Amount today(Reloan)",
        content: "₱" + CF.format(todayData.repeatAmount, {}),
        type: 'text',
      },
      {
        title: "Disbursed Amount Total(Reloan)",
        content: "₱" + CF.format(hisData.repeatAmountHistory, {}),
        type: 'text',
      },
      {
        title: "Proportion of Reloan Today",
        content: todayData.repeatAmountRate,
        type: 'text',
      },
      {
        title: "Proportion of Reloan Total",
        content: hisData.repeatAmountRateHistory,
        type: 'text',
      },
    ]

    paybackSettings.data = [
      {
        title: "Normal Repaid Amount Today",
        content: CF.format(AccountData.repaymentNormalAmount, {}),
        type: 'text',
      },
      {
        title: "Early Repaid Amount Today",
        content: CF.format(AccountData.repaymentAdvanceAmount, {}),
        type: 'text',
      },
      {
        title: "Overdue Repaid Amount Today",
        content: CF.format(AccountData.repaymentOverdueAmount, {}),
        type: 'text',
      },
      {
        title: "Total Repaid Amount",
        content: CF.format(AccountData.repaymentSumAmount, {}),
        type: 'text',
      },
      {
        title: "Outstanding Balance of the Day",
        content: CF.format(AccountData.repaymentShouldAmount, {}),
        type: 'text',
      },
      {
        title: "Overdue Ousttanding Balance",
        content: CF.format(AccountData.repaymentOverdueShouldAmount, {}),
        type: 'text',
      },
      {
        title: "Current Expecting Amount ",
        content: CF.format(AccountData.loanAmountNow, {}),
        type: 'text',
      },
      {
        title: "Overdue Rate",
        content: AccountData.w,
        type: 'text',
      },
      {
        title: "Overdue Rate(W0)",
        content: AccountData.w0,
        type: 'text',
      },
      {
        title: "Overdue Rate(W1)",
        content: AccountData.w1,
        type: 'text',
      },
      {
        title: "Overdue Rate(W2)",
        content: AccountData.w2,
        type: 'text',
      },
      {
        title: "Overdue Rate(W3)",
        content: AccountData.w3,
        type: 'text',
      },
      {
        title: "Overdue Rate(W4)",
        content: AccountData.w4,
        type: 'text',
      },
      {
        title: "Overdue Rate Pricipal",
        content: AccountData.wb,
        type: 'text',
      },
      {
        title: "Overdue Rate Pricipal(W0)",
        content: AccountData.wb0,
        type: 'text',
      },
      {
        title: "Overdue Rate Pricipal(W1)",
        content: AccountData.wb1,
        type: 'text',
      },
      {
        title: "Overdue Rate Pricipal(W2)",
        content: AccountData.wb2,
        type: 'text',
      },
      {
        title: "Overdue Rate Pricipal(W3)",
        content: AccountData.wb3,
        type: 'text',
      },
      {
        title: "Overdue Rate Pricipal(W4)",
        content: AccountData.wb4,
        type: 'text',
      }
    ]



    return (
      <div>
        <CLBlockList  settings={userSettings}/>
        <CLBlockList  settings={releaseSettings}/>
        <CLBlockList  settings={paybackSettings}/>
      </div>)
  }

  render () {
    return this.renderBody();
  }
}

export default UserCollectionData;