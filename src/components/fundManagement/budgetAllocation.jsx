import React from 'react';
import moment from 'moment';
import { CLComponent } from '../../../src/lib/component/index';
import { Button, message, Table, Modal, InputNumber, Icon, Spin, Tabs, Row, Col, DatePicker } from 'antd';
import { Interface } from '../../../src/lib/config/index';
import CLBlockList from '../../../src/lib/component/CLBlockList.jsx';
import { CL } from '../../../src/lib/tools/index';
import CF from 'currency-formatter';

const {
  contentType, futureFundDemandTable, riskPaymentGold, preservationOfCapitalAllocation, configurationFactorTable,
} = Interface;
const confirm = Modal.confirm;
const { WeekPicker } = DatePicker;
const arr = [
  'firstOverdueRateNext7Days',
  'firstOverdueRateNext14Days',
  'firstOverdueRateNext30Days',
  'firstOverdueRateNext60Days',
  'firstOverdueRateNext90Days',
  'oldUserLoanAmountNextWeek',
  'loanAmountNext7Days',
  'loanAmountNext14Days',
  'loanAmountNext30Days',
  'loanAmountNext60Days',
  'loanAmountNext90Days',
  'recycleRate1',
  'recycleRate2',
  'recycleRate3',
  'repeatLoanRateNext7Days',
  'repeatLoanRateNext14Days',
  'repeatLoanRateNext30Days',
  'repeatLoanRateNext60Days',
  'repeatLoanRateNext90Days',
  'riskReserveAmount',
  'waitMatchingAmount',
];
class BudgetAllocation extends CLComponent {
  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'loadData',
      'loadData1',
      'loadData2',
      'dateChange',
      'getWeekOfYear',
      'setInput1',
      'changeValue1',
      'Save1',
      'search',
      'clear',
    ]);
  }

  state = {
    columns: [],
    data: [],
    data1: [],
    data2: [],
    endTime: '',
    year: '',
    week: '',
    obj: [],
    obj2: [],
    changeData: {},
    inputDA: false,
    inputDA1: false,
    inputDA2: false,
    inputDA3: false,
    inputDA4: false,
    inputDA5: false,
    inputDA6: false,
    inputDA7: false,
    inputDA8: false,
    inputDA9: false,
    inputDA10: false,
    inputDA11: false,
    inputDA12: false,
    inputDA13: false,
    inputDA14: false,
    inputDA15: false,
    inputDA16: false,
    inputDA17: false,
  }

  componentDidMount() {
    this.loadData();
    this.loadData1();
    this.loadData2();
  }
  loadData(date) {
    const that = this;
    const Nowdate = new Date();
    const year = Nowdate.getFullYear();
    const week = that.getWeekOfYear();
    if (!date) {
      date = {
        year: that.state.year || year,
        week: that.state.week || week,
      };
    }
    const settings = {
      contentType,
      method: futureFundDemandTable.type,
      url: futureFundDemandTable.url,
      data: JSON.stringify(date),
    };

    function fn(res) {
      that.setState({ tableLoading: false });
      const data = res.data;
      if (data) {
        that.setState({ data: data.futureFund || {} });
      }
    }
    CL.clReqwest({ settings, fn });
  }
  loadData1(date) {
    const that = this;
    const Nowdate = new Date();
    const year = Nowdate.getFullYear();
    const week = that.getWeekOfYear();
    if (!date) {
      date = {
        year: that.state.year || year,
        week: that.state.week || week,
      };
    }
    const settings = {
      contentType,
      method: riskPaymentGold.type,
      url: riskPaymentGold.url,
      data: JSON.stringify(date),
    };

    function fn(res) {
      that.setState({ tableLoading: false });
      const data = res.data;
      if (data) {
        that.setState({ data1: data.riskReserve || {} });
      }
    }
    CL.clReqwest({ settings, fn });
  }
  loadData2(date) {
    const that = this;
    const Nowdate = new Date();
    const year = Nowdate.getFullYear();
    const week = that.getWeekOfYear();
    if (!date) {
      date = {
        year: that.state.year || year,
        week: that.state.week || week,
      };
    }
    const settings = {
      contentType,
      method: configurationFactorTable.type,
      url: configurationFactorTable.url,
      data: JSON.stringify(date),
    };

    function fn(res) {
      that.setState({ tableLoading: false });
      const data = res.data;
      if (data) {
        that.setState({ data2: data.independentVariable || {} });
      }
    }
    CL.clReqwest({ settings, fn });
  }
  loadData3(data) {
    const that = this;
    const Nowdate = new Date();
    const year = Nowdate.getFullYear();
    const week = that.getWeekOfYear();
    const { changeData, data2 } = that.state;
    let params = {
      year: that.state.year || year,
      week: that.state.week || week,
    };
    params = _.extend(params, changeData);
    const settings = {
      contentType,
      method: preservationOfCapitalAllocation.type,
      url: preservationOfCapitalAllocation.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      const data = res.data;
      that.setState({ changeData: {} });
      if (res.code == '200') {
        message.success('save success');
        that.loadData();
        that.loadData1();
        that.loadData2();
      } else {
        message.success('save error');
      }
    }
    CL.clReqwest({ settings, fn });
  }
  // 获取当前是本年中第几周
  getWeekOfYear() {
    const today = new Date();
    let firstDay = new Date(today.getFullYear(), 0, 1);
    const dayOfWeek = firstDay.getDay();
    let spendDay = 1;
    if (dayOfWeek != 0) {
      spendDay = 7 - dayOfWeek + 1;
    }
    firstDay = new Date(today.getFullYear(), 0, 1 + spendDay);
    const d = Math.ceil((today.valueOf() - firstDay.valueOf()) / 86400000);
    const result = Math.ceil(d / 7);
    return result + 1;
  }
  search() {
    const that = this;
    let Time = that.state.endTime;
    if (!Time) {
      this.loadData();
      this.loadData1();
      this.loadData2();
    } else {
      Time = Time.split('-');
      const year = Time[0];
      const week = Time[1];
      const value = week.replace(/[^0-9]/ig, '');
      const date = {
        year: year,
        week: value,
      };
      this.setState({ week: value, year: year });
      this.loadData(date);
      this.loadData1(date);
      this.loadData2(date);
    }
  }
  clear() {
    this.setState({ endTime: null });
  }
  setInput1(obj) {
    this.setState(obj);
  }
  changeValue1(e, target) {
    const { data2, changeData } = this.state;
    data2[`${target}`] = e;
    changeData[target] = e;
    this.setState({ data2, changeData });
  }
  Save1(e) {
    const that = this;
    confirm({
      title: 'Do you Want to save the change?',
      onOk() {
        that.loadData3();
      },
      onCancel() {
        console.log('Cancel');
      },
    });
    that.setState({
      inputDA: false,
      inputDA1: false,
      inputDA2: false,
      inputDA3: false,
      inputDA4: false,
      inputDA5: false,
      inputDA6: false,
      inputDA7: false,
      inputDA8: false,
      inputDA9: false,
      inputDA10: false,
      inputDA11: false,
      inputDA12: false,
      inputDA13: false,
      inputDA14: false,
      inputDA15: false,
      inputDA16: false,
      inputDA17: false,
    });
  }

  dateChange(e) {
    const that = this;
    const endTime = e.format('YYYY-wo');
    that.setState({ endTime: endTime });
  }

  renderBody() {
    const that = this;
    const columns = that.state.columns;
    const {
      data, data1, year, week, endTime,
    } = that.state;
    const editStyle = {
      display: 'inlineBlock',
      fontSize: '18px',
      position: 'absolute',
      right: '5px',
      cursor: 'pointer',
      color: '#108ee9',
      top: '20%',
    };
    const column = [
      {
        title: '资产资金需求表',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '7天',
        dataIndex: 'days7',
        key: 'days7',
      },
      {
        title: '14天',
        dataIndex: 'days14',
        key: 'days14',
      },
      {
        title: '30天',
        dataIndex: 'days30',
        key: 'days30',
      },
      {
        title: '60天',
        dataIndex: 'days60',
        key: 'days60',
      },
      {
        title: '90天',
        dataIndex: 'days90',
        key: 'days90',
      },
    ];
    const settings = {
      data: [
        {
          key: '1',
          name: '预计放款量',
          days7: data.loanAmountNext7Days || data.loanAmountNext7Days == 0 ? CF.format(data.loanAmountNext7Days, {}) : '-',
          days14: data.loanAmountNext14Days || data.loanAmountNext14Days == 0 ? CF.format(data.loanAmountNext14Days, {}) : '-',
          days30: data.loanAmountNext30Days || data.loanAmountNext30Days == 0 ? CF.format(data.loanAmountNext30Days, {}) : '-',
          days60: data.loanAmountNext60Days || data.loanAmountNext60Days == 0 ? CF.format(data.loanAmountNext60Days, {}) : '-',
          days90: data.loanAmountNext90Days || data.loanAmountNext90Days == 0 ? CF.format(data.loanAmountNext90Days, {}) : '-',
        },
        {
          key: '2',
          name: '预计需兑付资金',
          days7: data.channelFundAmountOutNext7Days || data.channelFundAmountOutNext7Days == 0 ? CF.format(data.channelFundAmountOutNext7Days, {}) : '-',
          days14: data.channelFundAmountOutNext14Days || data.channelFundAmountOutNext14Days == 0 ? CF.format(data.channelFundAmountOutNext14Days, {}) : '-',
          days30: data.channelFundAmountOutNext30Days || data.channelFundAmountOutNext30Days == 0 ? CF.format(data.channelFundAmountOutNext30Days, {}) : '-',
          days60: data.channelFundAmountOutNext60Days || data.channelFundAmountOutNext60Days == 0 ? CF.format(data.channelFundAmountOutNext60Days, {}) : '-',
          days90: data.channelFundAmountOutNext90Days || data.channelFundAmountOutNext90Days == 0 ? CF.format(data.channelFundAmountOutNext90Days, {}) : '-',
        },
        {
          key: '3',
          name: '预计可复投资金',
          days7: data.channelFundAmountRecycleNext7Days || data.channelFundAmountRecycleNext7Days == 0 ? CF.format(data.channelFundAmountRecycleNext7Days, {}) : '-',
          days14: data.channelFundAmountRecycleNext14Days || data.channelFundAmountRecycleNext14Days == 0 ? CF.format(data.channelFundAmountRecycleNext14Days, {}) : '-',
          days30: data.channelFundAmountRecycleNext30Days || data.channelFundAmountRecycleNext30Days == 0 ? CF.format(data.channelFundAmountRecycleNext30Days, {}) : '-',
          days60: data.channelFundAmountRecycleNext60Days || data.channelFundAmountRecycleNext60Days == 0 ? CF.format(data.channelFundAmountRecycleNext60Days, {}) : '-',
          days90: data.channelFundAmountRecycleNext90Days || data.channelFundAmountRecycleNext90Days == 0 ? CF.format(data.channelFundAmountRecycleNext90Days, {}) : '-',
        },
        {
          key: '4',
          name: '当前待匹配资金余额',
          days7: data.waitMatchingAmount || data.waitMatchingAmount == 0 ? CF.format(data.waitMatchingAmount, {}) : '-',
          days14: data.waitMatchingAmount || data.waitMatchingAmount == 0 ? CF.format(data.waitMatchingAmount, {}) : '-',
          days30: data.waitMatchingAmount || data.waitMatchingAmount == 0 ? CF.format(data.waitMatchingAmount, {}) : '-',
          days60: data.waitMatchingAmount || data.waitMatchingAmount == 0 ? CF.format(data.waitMatchingAmount, {}) : '-',
          days90: data.waitMatchingAmount || data.waitMatchingAmount == 0 ? CF.format(data.waitMatchingAmount, {}) : '-',
        },
        {
          key: '5',
          name: '资金需求量',
          days7: data.fundQuantityNext7Days || data.fundQuantityNext7Days == 0 ? CF.format(data.fundQuantityNext7Days, {}) : '-',
          days14: data.fundQuantityNext14Days || data.fundQuantityNext14Days == 0 ? CF.format(data.fundQuantityNext14Days, {}) : '-',
          days30: data.fundQuantityNext30Days || data.fundQuantityNext30Days == 0 ? CF.format(data.fundQuantityNext30Days, {}) : '-',
          days60: data.fundQuantityNext60Days || data.fundQuantityNext60Days == 0 ? CF.format(data.fundQuantityNext60Days, {}) : '-',
          days90: data.fundQuantityNext90Days || data.fundQuantityNext90Days == 0 ? CF.format(data.fundQuantityNext90Days, {}) : '-',
        },
      ],
      columns: column,
    };
    const column1 = [
      {
        title: '风险备付金相关项',
        dataIndex: 'name1',
        key: 'name1',
      },
      {
        title: '7天',
        dataIndex: 'day7',
        key: 'day7',
      },
      {
        title: '14天',
        dataIndex: 'day14',
        key: 'day14',
      },
      {
        title: '30天',
        dataIndex: 'day30',
        key: 'day30',
      },
      {
        title: '60天',
        dataIndex: 'day60',
        key: 'day60',
      },
      {
        title: '90天',
        dataIndex: 'day90',
        key: 'day90',
      },
    ];
    const settings1 = {
      data: [
        {
          key: '6',
          name1: '预计风险备付金代偿',
          day7: data1.risksToMatcheNext7Days || data1.risksToMatcheNext7Days == 0 ? CF.format(data1.risksToMatcheNext7Days, {}) : '-',
          day14: data1.risksToMatcheNext14Days || data1.risksToMatcheNext14Days == 0 ? CF.format(data1.risksToMatcheNext14Days, {}) : '-',
          day30: data1.risksToMatcheNext30Days || data1.risksToMatcheNext30Days == 0 ? CF.format(data1.risksToMatcheNext30Days, {}) : '-',
          day60: data1.risksToMatcheNext60Days || data1.risksToMatcheNext60Days == 0 ? CF.format(data1.risksToMatcheNext60Days, {}) : '-',
          day90: data1.risksToMatcheNext90Days || data1.risksToMatcheNext90Days == 0 ? CF.format(data1.risksToMatcheNext90Days, {}) : '-',
        },
        {
          key: '7',
          name1: '预计风险备付金归还',
          day7: data1.repaymentToProvisionForRisks7Days || data1.repaymentToProvisionForRisks7Days == 0 ? CF.format(data1.repaymentToProvisionForRisks7Days, {}) : '-',
          day14: data1.repaymentToProvisionForRisks14Days || data1.repaymentToProvisionForRisks14Days == 0 ? CF.format(data1.repaymentToProvisionForRisks14Days, {}) : '-',
          day30: data1.repaymentToProvisionForRisks30Days || data1.repaymentToProvisionForRisks30Days == 0 ? CF.format(data1.repaymentToProvisionForRisks30Days, {}) : '-',
          day60: data1.repaymentToProvisionForRisks60Days || data1.repaymentToProvisionForRisks60Days == 0 ? CF.format(data1.repaymentToProvisionForRisks60Days, {}) : '-',
          day90: data1.repaymentToProvisionForRisks90Days || data1.repaymentToProvisionForRisks90Days == 0 ? CF.format(data1.repaymentToProvisionForRisks90Days, {}) : '-',
        },
        {
          key: '8',
          name1: '预计盈余前置收入',
          day7: data1.surplusPreIncome7Days || data1.surplusPreIncome7Days == 0 ? CF.format(data1.surplusPreIncome7Days, {}) : '-',
          day14: data1.surplusPreIncome14Days || data1.surplusPreIncome14Days == 0 ? CF.format(data1.surplusPreIncome14Days, {}) : '-',
          day30: data1.surplusPreIncome30Days || data1.surplusPreIncome30Days == 0 ? CF.format(data1.surplusPreIncome30Days, {}) : '-',
          day60: data1.surplusPreIncome60Days || data1.surplusPreIncome60Days == 0 ? CF.format(data1.surplusPreIncome60Days, {}) : '-',
          day90: data1.surplusPreIncome90Days || data1.surplusPreIncome90Days == 0 ? CF.format(data1.surplusPreIncome90Days, {}) : '-',
        },
        {
          key: '9',
          name1: '当前风险备付金余额',
          day7: data1.waitMatchingAmount || data1.waitMatchingAmount == 0 ? CF.format(data1.waitMatchingAmount, {}) : '-',
          day14: data1.waitMatchingAmount || data1.waitMatchingAmount == 0 ? CF.format(data1.waitMatchingAmount, {}) : '-',
          day30: data1.waitMatchingAmount || data1.waitMatchingAmount == 0 ? CF.format(data1.waitMatchingAmount, {}) : '-',
          day60: data1.waitMatchingAmount || data1.waitMatchingAmount == 0 ? CF.format(data1.waitMatchingAmount, {}) : '-',
          day90: data1.waitMatchingAmount || data1.waitMatchingAmount == 0 ? CF.format(data1.waitMatchingAmount, {}) : '-',
        },
        {
          key: '10',
          name1: '风险备付金需求量',
          day7: data1.riskReserveQuantity7Days || data1.riskReserveQuantity7Days == 0 ? CF.format(data1.riskReserveQuantity7Days, {}) : '-',
          day14: data1.riskReserveQuantity14Days || data1.riskReserveQuantity14Days == 0 ? CF.format(data1.riskReserveQuantity14Days, {}) : '-',
          day30: data1.riskReserveQuantity30Days || data1.riskReserveQuantity30Days == 0 ? CF.format(data1.riskReserveQuantity30Days, {}) : '-',
          day60: data1.riskReserveQuantity60Days || data1.riskReserveQuantity60Days == 0 ? CF.format(data1.riskReserveQuantity60Days, {}) : '-',
          day90: data1.riskReserveQuantity90Days || data1.riskReserveQuantity90Days == 0 ? CF.format(data1.riskReserveQuantity90Days, {}) : '-',
        },
      ],
      columns: column1,
    };
    const {
      loanAmountNext7Days,
      loanAmountNext14Days,
      loanAmountNext30Days,
      loanAmountNext60Days,
      loanAmountNext90Days,
      firstOverdueRateNext7Days,
      firstOverdueRateNext14Days,
      firstOverdueRateNext30Days,
      firstOverdueRateNext60Days,
      firstOverdueRateNext90Days,
      recycleRate1,
      recycleRate2,
      recycleRate3,
      repeatLoanRateNext7Days,
      repeatLoanRateNext14Days,
      repeatLoanRateNext30Days,
      repeatLoanRateNext60Days,
      repeatLoanRateNext90Days,
      riskReserveAmount,
      waitMatchingAmount,
    } = this.state.data2;
    const DemandConfiguration = {
      data: [
        {
          title: '未来7天放款金额',
          content: loanAmountNext7Days !== null ? loanAmountNext7Days : '-',
          type: 'text',
          render(index, record) {
            const obj = { inputDA: false, loanAmountNext7Days };
            const obj2 = { inputDA: true, loanAmountNext7Days };
            if (that.state.inputDA) {
              return (
                <div style={{ position: 'relative', width: '100%' }}>
                  <InputNumber
                    defaultValue={loanAmountNext7Days !== null ? CF.format(loanAmountNext7Days, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={loanAmountNext7Days}
                    onChange={(e) => { that.changeValue1(e, 'loanAmountNext7Days'); }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => { that.setInput1(obj); }}
                  />
                </div>);
            }
            return (
              <div style={{ position: 'relative', width: '100%' }}>
                <a>{(loanAmountNext7Days !== null && loanAmountNext7Days !== 0 ? CF.format(loanAmountNext7Days, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => { that.setInput1(obj2); }}
                />
              </div>
            );

            return loanAmountNext7Days !== null ? CF.format(loanAmountNext7Days, {}) : '-';
          },
        },
        {
          title: '未来14天放款金额',
          content: loanAmountNext14Days !== null ? loanAmountNext14Days : '-',
          type: 'text',
          render(index, record) {
            const obj = { inputDA1: false, loanAmountNext14Days };
            const obj2 = { inputDA1: true, loanAmountNext14Days };
            if (that.state.inputDA1) {
              return (
                <div style={{ position: 'relative', width: '100%' }}>
                  <InputNumber
                    defaultValue={loanAmountNext14Days !== null ? CF.format(loanAmountNext14Days, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={loanAmountNext14Days}
                    onChange={(e) => { that.changeValue1(e, 'loanAmountNext14Days'); }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => { that.setInput1(obj); }}
                  />
                </div>);
            }
            return (
              <div style={{ position: 'relative', width: '100%' }}>
                <a>{(loanAmountNext14Days !== null && loanAmountNext14Days !== 0 ? CF.format(loanAmountNext14Days, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => { that.setInput1(obj2); }}
                />
              </div>
            );

            return loanAmountNext14Days !== null ? CF.format(loanAmountNext14Days, {}) : '-';
          },
        },
        {
          title: '未来30天放款金额',
          content: loanAmountNext30Days !== null ? loanAmountNext30Days : '-',
          type: 'text',
          render(index, record) {
            const obj = { inputDA2: false, loanAmountNext30Days };
            const obj2 = { inputDA2: true, loanAmountNext30Days };
            if (that.state.inputDA2) {
              return (
                <div style={{ position: 'relative', width: '100%' }}>
                  <InputNumber
                    defaultValue={loanAmountNext30Days !== null ? CF.format(loanAmountNext30Days, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={loanAmountNext30Days}
                    onChange={(e) => { that.changeValue1(e, 'loanAmountNext30Days'); }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => { that.setInput1(obj); }}
                  />
                </div>);
            }
            return (
              <div style={{ position: 'relative', width: '100%' }}>
                <a>{(loanAmountNext30Days !== null && loanAmountNext30Days !== 0 ? CF.format(loanAmountNext30Days, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => { that.setInput1(obj2); }}
                />
              </div>
            );

            return loanAmountNext30Days !== null ? CF.format(loanAmountNext30Days, {}) : '-';
          },
        },
        {
          title: '未来60天放款金额',
          content: loanAmountNext60Days !== null ? loanAmountNext60Days : '-',
          type: 'text',
          render(index, record) {
            const obj = { inputDA3: false, loanAmountNext60Days };
            const obj2 = { inputDA3: true, loanAmountNext60Days };
            if (that.state.inputDA3) {
              return (
                <div style={{ position: 'relative', width: '100%' }}>
                  <InputNumber
                    defaultValue={loanAmountNext60Days !== null ? CF.format(loanAmountNext60Days, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={loanAmountNext60Days}
                    onChange={(e) => { that.changeValue1(e, 'loanAmountNext60Days'); }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => { that.setInput1(obj); }}
                  />
                </div>);
            }
            return (
              <div style={{ position: 'relative', width: '100%' }}>
                <a>{(loanAmountNext60Days !== null && loanAmountNext60Days !== 0 ? CF.format(loanAmountNext60Days, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => { that.setInput1(obj2); }}
                />
              </div>
            );

            return loanAmountNext60Days !== null ? CF.format(loanAmountNext60Days, {}) : '-';
          },
        },
        {
          title: '未来90天放款金额',
          content: loanAmountNext90Days !== null ? loanAmountNext90Days : '-',
          type: 'text',
          render(index, record) {
            const obj = { inputDA4: false, loanAmountNext90Days };
            const obj2 = { inputDA4: true, loanAmountNext90Days };
            if (that.state.inputDA4) {
              return (
                <div style={{ position: 'relative', width: '100%' }}>
                  <InputNumber
                    defaultValue={loanAmountNext90Days !== null ? CF.format(loanAmountNext90Days, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={loanAmountNext90Days}
                    onChange={(e) => { that.changeValue1(e, 'loanAmountNext90Days'); }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => { that.setInput1(obj); }}
                  />
                </div>);
            }
            return (
              <div style={{ position: 'relative', width: '100%' }}>
                <a>{(loanAmountNext90Days !== null && loanAmountNext90Days !== 0 ? CF.format(loanAmountNext90Days, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => { that.setInput1(obj2); }}
                />
              </div>
            );

            return loanAmountNext90Days !== null ? CF.format(loanAmountNext90Days, {}) : '-';
          },
        },
        {
          title: '未来7天首逾率',
          content: firstOverdueRateNext7Days !== null ? firstOverdueRateNext7Days : '-',
          type: 'text',
          render(index, record) {
            const obj = { inputDA5: false, firstOverdueRateNext7Days };
            const obj2 = { inputDA5: true, firstOverdueRateNext7Days };
            if (that.state.inputDA5) {
              return (
                <div style={{ position: 'relative', width: '100%' }}>
                  <InputNumber
                    defaultValue={firstOverdueRateNext7Days !== null ? CF.format(firstOverdueRateNext7Days, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={firstOverdueRateNext7Days}
                    onChange={(e) => { that.changeValue1(e, 'firstOverdueRateNext7Days'); }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => { that.setInput1(obj); }}
                  />
                </div>);
            }
            return (
              <div style={{ position: 'relative', width: '100%' }}>
                <a>{(firstOverdueRateNext7Days !== null && firstOverdueRateNext7Days !== 0 ? CF.format(firstOverdueRateNext7Days, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => { that.setInput1(obj2); }}
                />
              </div>
            );

            return firstOverdueRateNext7Days !== null ? CF.format(firstOverdueRateNext7Days, {}) : '-';
          },
        },
        {
          title: '未来14天首逾率',
          content: firstOverdueRateNext14Days !== null ? firstOverdueRateNext14Days : '-',
          type: 'text',
          render(index, record) {
            const obj = { inputDA6: false, firstOverdueRateNext14Days };
            const obj2 = { inputDA6: true, firstOverdueRateNext14Days };
            if (that.state.inputDA6) {
              return (
                <div style={{ position: 'relative', width: '100%' }}>
                  <InputNumber
                    defaultValue={firstOverdueRateNext14Days !== null ? CF.format(firstOverdueRateNext14Days, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={firstOverdueRateNext14Days}
                    onChange={(e) => { that.changeValue1(e, 'firstOverdueRateNext14Days'); }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => { that.setInput1(obj); }}
                  />
                </div>);
            }
            return (
              <div style={{ position: 'relative', width: '100%' }}>
                <a>{(firstOverdueRateNext14Days !== null && firstOverdueRateNext14Days !== 0 ? CF.format(firstOverdueRateNext14Days, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => { that.setInput1(obj2); }}
                />
              </div>
            );

            return firstOverdueRateNext14Days !== null ? CF.format(firstOverdueRateNext14Days, {}) : '-';
          },
        },
        {
          title: '未来30天首逾率',
          content: firstOverdueRateNext30Days !== null ? firstOverdueRateNext30Days : '-',
          type: 'text',
          render(index, record) {
            const obj = { inputDA7: false, firstOverdueRateNext30Days };
            const obj2 = { inputDA7: true, firstOverdueRateNext30Days };
            if (that.state.inputDA7) {
              return (
                <div style={{ position: 'relative', width: '100%' }}>
                  <InputNumber
                    defaultValue={firstOverdueRateNext30Days !== null ? CF.format(firstOverdueRateNext30Days, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={firstOverdueRateNext30Days}
                    onChange={(e) => { that.changeValue1(e, 'firstOverdueRateNext30Days'); }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => { that.setInput1(obj); }}
                  />
                </div>);
            }
            return (
              <div style={{ position: 'relative', width: '100%' }}>
                <a>{(firstOverdueRateNext30Days !== null && firstOverdueRateNext30Days !== 0 ? CF.format(firstOverdueRateNext30Days, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => { that.setInput1(obj2); }}
                />
              </div>
            );

            return firstOverdueRateNext30Days !== null ? CF.format(firstOverdueRateNext30Days, {}) : '-';
          },
        },
        {
          title: '未来60天首逾率',
          content: firstOverdueRateNext60Days !== null ? firstOverdueRateNext60Days : '-',
          type: 'text',
          render(index, record) {
            const obj = { inputDA8: false, firstOverdueRateNext60Days };
            const obj2 = { inputDA8: true, firstOverdueRateNext60Days };
            if (that.state.inputDA8) {
              return (
                <div style={{ position: 'relative', width: '100%' }}>
                  <InputNumber
                    defaultValue={firstOverdueRateNext60Days !== null ? CF.format(firstOverdueRateNext60Days, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={firstOverdueRateNext60Days}
                    onChange={(e) => { that.changeValue1(e, 'firstOverdueRateNext60Days'); }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => { that.setInput1(obj); }}
                  />
                </div>);
            }
            return (
              <div style={{ position: 'relative', width: '100%' }}>
                <a>{(firstOverdueRateNext60Days !== null && firstOverdueRateNext60Days !== 0 ? CF.format(firstOverdueRateNext60Days, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => { that.setInput1(obj2); }}
                />
              </div>
            );

            return firstOverdueRateNext60Days !== null ? CF.format(firstOverdueRateNext60Days, {}) : '-';
          },
        },
        {
          title: '未来90天首逾率',
          content: firstOverdueRateNext90Days !== null ? firstOverdueRateNext90Days : '-',
          type: 'text',
          render(index, record) {
            const obj = { inputDA9: false, firstOverdueRateNext90Days };
            const obj2 = { inputDA9: true, firstOverdueRateNext90Days };
            if (that.state.inputDA9) {
              return (
                <div style={{ position: 'relative', width: '100%' }}>
                  <InputNumber
                    defaultValue={firstOverdueRateNext90Days !== null ? CF.format(firstOverdueRateNext90Days, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={firstOverdueRateNext90Days}
                    onChange={(e) => { that.changeValue1(e, 'firstOverdueRateNext90Days'); }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => { that.setInput1(obj); }}
                  />
                </div>);
            }
            return (
              <div style={{ position: 'relative', width: '100%' }}>
                <a>{(firstOverdueRateNext90Days !== null && firstOverdueRateNext90Days !== 0 ? CF.format(firstOverdueRateNext90Days, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => { that.setInput1(obj2); }}
                />
              </div>
            );

            return firstOverdueRateNext90Days !== null ? CF.format(firstOverdueRateNext90Days, {}) : '-';
          },
        },
        {
          title: '待匹配资金账户当前余额',
          content: waitMatchingAmount && waitMatchingAmount !== 0 ? CF.format(waitMatchingAmount, {}) : '0.00',
          type: 'text',
        },
        {
          title: '风险备付金账户当前余额',
          content: riskReserveAmount && riskReserveAmount !== 0 ? CF.format(riskReserveAmount, {}) : '0.00',
          type: 'text',
        },
        {
          title: '复贷比例 -7天',
          content: repeatLoanRateNext7Days !== null ? repeatLoanRateNext7Days : '-',
          type: 'text',
          render(index, record) {
            const obj = { inputDA10: false, repeatLoanRateNext7Days };
            const obj2 = { inputDA10: true, repeatLoanRateNext7Days };
            if (that.state.inputDA10) {
              return (
                <div style={{ position: 'relative', width: '100%' }}>
                  <InputNumber
                    defaultValue={repeatLoanRateNext7Days !== null ? CF.format(repeatLoanRateNext7Days, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={repeatLoanRateNext7Days}
                    onChange={(e) => { that.changeValue1(e, 'repeatLoanRateNext7Days'); }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => { that.setInput1(obj); }}
                  />
                </div>);
            }
            return (
              <div style={{ position: 'relative', width: '100%' }}>
                <a>{(repeatLoanRateNext7Days !== null && repeatLoanRateNext7Days !== 0 ? CF.format(repeatLoanRateNext7Days, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => { that.setInput1(obj2); }}
                />
              </div>
            );

            return repeatLoanRateNext7Days !== null ? CF.format(repeatLoanRateNext7Days, {}) : '-';
          },
        },
        {
          title: '复贷比例 -14天',
          content: repeatLoanRateNext14Days !== null ? repeatLoanRateNext14Days : '-',
          type: 'text',
          render(index, record) {
            const obj = { inputDA11: false, repeatLoanRateNext14Days };
            const obj2 = { inputDA11: true, repeatLoanRateNext14Days };
            if (that.state.inputDA11) {
              return (
                <div style={{ position: 'relative', width: '100%' }}>
                  <InputNumber
                    defaultValue={repeatLoanRateNext14Days !== null ? CF.format(repeatLoanRateNext14Days, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={repeatLoanRateNext14Days}
                    onChange={(e) => { that.changeValue1(e, 'repeatLoanRateNext14Days'); }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => { that.setInput1(obj); }}
                  />
                </div>);
            }
            return (
              <div style={{ position: 'relative', width: '100%' }}>
                <a>{(repeatLoanRateNext14Days !== null && repeatLoanRateNext14Days !== 0 ? CF.format(repeatLoanRateNext14Days, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => { that.setInput1(obj2); }}
                />
              </div>
            );

            return repeatLoanRateNext14Days !== null ? CF.format(repeatLoanRateNext14Days, {}) : '-';
          },
        },
        {
          title: '复贷比例 -30天',
          content: repeatLoanRateNext30Days !== null ? repeatLoanRateNext30Days : '-',
          type: 'text',
          render(index, record) {
            const obj = { inputDA12: false, repeatLoanRateNext30Days };
            const obj2 = { inputDA12: true, repeatLoanRateNext30Days };
            if (that.state.inputDA12) {
              return (
                <div style={{ position: 'relative', width: '100%' }}>
                  <InputNumber
                    defaultValue={repeatLoanRateNext30Days !== null ? CF.format(repeatLoanRateNext30Days, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={repeatLoanRateNext30Days}
                    onChange={(e) => { that.changeValue1(e, 'repeatLoanRateNext30Days'); }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => { that.setInput1(obj); }}
                  />
                </div>);
            }
            return (
              <div style={{ position: 'relative', width: '100%' }}>
                <a>{(repeatLoanRateNext30Days !== null && repeatLoanRateNext30Days !== 0 ? CF.format(repeatLoanRateNext30Days, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => { that.setInput1(obj2); }}
                />
              </div>
            );

            return repeatLoanRateNext30Days !== null ? CF.format(repeatLoanRateNext30Days, {}) : '-';
          },
        },
        {
          title: '复贷比例 -60天',
          content: repeatLoanRateNext60Days !== null ? repeatLoanRateNext60Days : '-',
          type: 'text',
          render(index, record) {
            const obj = { inputDA13: false, repeatLoanRateNext60Days };
            const obj2 = { inputDA13: true, repeatLoanRateNext60Days };
            if (that.state.inputDA13) {
              return (
                <div style={{ position: 'relative', width: '100%' }}>
                  <InputNumber
                    defaultValue={repeatLoanRateNext60Days !== null ? CF.format(repeatLoanRateNext60Days, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={repeatLoanRateNext60Days}
                    onChange={(e) => { that.changeValue1(e, 'repeatLoanRateNext60Days'); }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => { that.setInput1(obj); }}
                  />
                </div>);
            }
            return (
              <div style={{ position: 'relative', width: '100%' }}>
                <a>{(repeatLoanRateNext60Days !== null && repeatLoanRateNext60Days !== 0 ? CF.format(repeatLoanRateNext60Days, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => { that.setInput1(obj2); }}
                />
              </div>
            );

            return repeatLoanRateNext60Days !== null ? CF.format(repeatLoanRateNext60Days, {}) : '-';
          },
        },
        {
          title: '复贷比例 -90天',
          content: repeatLoanRateNext90Days !== null ? repeatLoanRateNext90Days : '-',
          type: 'text',
          render(index, record) {
            const obj = { inputDA14: false, repeatLoanRateNext90Days };
            const obj2 = { inputDA14: true, repeatLoanRateNext90Days };
            if (that.state.inputDA14) {
              return (
                <div style={{ position: 'relative', width: '100%' }}>
                  <InputNumber
                    defaultValue={repeatLoanRateNext90Days !== null ? CF.format(repeatLoanRateNext90Days, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={repeatLoanRateNext90Days}
                    onChange={(e) => { that.changeValue1(e, 'repeatLoanRateNext90Days'); }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => { that.setInput1(obj); }}
                  />
                </div>);
            }
            return (
              <div style={{ position: 'relative', width: '100%' }}>
                <a>{(repeatLoanRateNext90Days !== null && repeatLoanRateNext90Days !== 0 ? CF.format(repeatLoanRateNext90Days, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => { that.setInput1(obj2); }}
                />
              </div>
            );

            return repeatLoanRateNext90Days !== null ? CF.format(repeatLoanRateNext90Days, {}) : '-';
          },
        },
        {
          title: '回收率1',
          content: recycleRate1 !== null ? recycleRate1 : '-',
          type: 'text',
          render(index, record) {
            const obj = { inputDA15: false, recycleRate1 };
            const obj2 = { inputDA15: true, recycleRate1 };
            if (that.state.inputDA15) {
              return (
                <div style={{ position: 'relative', width: '100%' }}>
                  <InputNumber
                    defaultValue={recycleRate1 !== null ? CF.format(recycleRate1, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={recycleRate1}
                    onChange={(e) => { that.changeValue1(e, 'recycleRate1'); }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => { that.setInput1(obj); }}
                  />
                </div>);
            }
            return (
              <div style={{ position: 'relative', width: '100%' }}>
                <a>{(recycleRate1 !== null && recycleRate1 !== 0 ? CF.format(recycleRate1, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => { that.setInput1(obj2); }}
                />
              </div>
            );

            return recycleRate1 !== null ? CF.format(recycleRate1, {}) : '-';
          },
        },
        {
          title: '回收率2',
          content: recycleRate2 !== null ? recycleRate2 : '-',
          type: 'text',
          render(index, record) {
            const obj = { inputDA16: false, recycleRate2 };
            const obj2 = { inputDA16: true, recycleRate2 };
            if (that.state.inputDA16) {
              return (
                <div style={{ position: 'relative', width: '100%' }}>
                  <InputNumber
                    defaultValue={recycleRate2 !== null ? CF.format(recycleRate2, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={recycleRate2}
                    onChange={(e) => { that.changeValue1(e, 'recycleRate2'); }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => { that.setInput1(obj); }}
                  />
                </div>);
            }
            return (
              <div style={{ position: 'relative', width: '100%' }}>
                <a>{(recycleRate2 !== null && recycleRate2 !== 0 ? CF.format(recycleRate2, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => { that.setInput1(obj2); }}
                />
              </div>
            );

            return recycleRate2 !== null ? CF.format(recycleRate2, {}) : '-';
          },
        },
        {
          title: '回收率3',
          content: recycleRate3 !== null ? recycleRate3 : '-',
          type: 'text',
          render(index, record) {
            const obj = { inputDA17: false, recycleRate3 };
            const obj2 = { inputDA17: true, recycleRate3 };
            if (that.state.inputDA17) {
              return (
                <div style={{ position: 'relative', width: '100%' }}>
                  <InputNumber
                    defaultValue={recycleRate3 !== null ? CF.format(recycleRate3, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={recycleRate3}
                    onChange={(e) => { that.changeValue1(e, 'recycleRate3'); }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => { that.setInput1(obj); }}
                  />
                </div>);
            }
            return (
              <div style={{ position: 'relative', width: '100%' }}>
                <a>{(recycleRate3 !== null && recycleRate3 !== 0 ? CF.format(recycleRate3, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => { that.setInput1(obj2); }}
                />
              </div>
            );

            return recycleRate3 !== null ? CF.format(recycleRate3, {}) : '-';
          },
        },
      ],
    };


    return (
      <div>
        <Row className="table-wrap">
          <Col span={2} />
          <Col span={2}><b> Time : </b></Col>
          <Col span={4}>
            <WeekPicker
              format="YYYY-wo"
              onChange={that.dateChange}
              allowClear
              value={!endTime ? null : moment(endTime, 'YYYY-WO')}
            />
          </Col>
          <Col span={2} offset={12}>
            <Button type="primary" onClick={that.search}>search</Button>
          </Col>
          <Col span={2}>
            <Button type="text" onClick={that.clear}>clear</Button>
          </Col>
        </Row>
        <Row className="table-wrap" style={{ marginTop: 40 }}>
          <Col span={6} style={{ marginLeft: 30 }}>
            {
        that.state.data ? `${moment(that.state.data.startDate).format('YYYY-MM-DD')}—${moment(that.state.data.endDate).format('YYYY-MM-DD')}资金预算` : ''
            }
          </Col>
        </Row>
        <Row className="table-wrap" style={{ marginTop: 40 }}>
          <Col span={6} style={{ marginLeft: 30 }}><b>未来资金需求表</b></Col>
        </Row>
        <Table
          bordered
          className="charge-details cl-table"
          loading={false}
          pagination={false}
          columns={settings.columns}
          rowKey={record => record.index}
          dataSource={settings.data}
          key="unique"
          width="30%"
        />
        <Row className="table-wrap" style={{ marginTop: 40 }}>
          <Col span={6} style={{ marginLeft: 30 }}><b>未来风险备付金需求表</b></Col>
        </Row>
        <Table
          bordered
          loading={false}
          pagination={false}
          columns={settings1.columns}
          rowKey={record => record.index}
          dataSource={settings1.data}
          key="unique1"
          width="30%"
        />
        <Row>
          <Col offset={22}>
            <div>   金额单位 : PHP</div>
          </Col>
        </Row>

        <div>
          <CLBlockList settings={DemandConfiguration} />
          <br />
          <Row>
            <Col offset={22}>
              <Button type="primary" onClick={that.Save1}>Save</Button>
            </Col>
          </Row>
        </div>
        <br />
        <br />
      </div>);
  }

  render() {
    return this.renderBody();
  }
}

export default BudgetAllocation;
