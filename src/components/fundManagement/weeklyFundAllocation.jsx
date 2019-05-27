import React from 'react';
import moment from 'moment';
import { CLComponent } from '../../../src/lib/component/index';
import { Button, message, Table, InputNumber, Modal, Select, Switch, Icon, Spin, Tabs, DatePicker, Row, Col } from 'antd';
import { Interface } from '../../../src/lib/config/index';
import CLBlockList from '../../../src/lib/component/CLBlockList.jsx';
import { CL } from '../../../src/lib/tools/index';
import CF from 'currency-formatter';
import _ from 'lodash';

const {
  contentType, WeeklyFundBudget, BudgetaryIndependentVariable, ViewTheCapitalBudget,
} = Interface;
const Option = Select.Option;
const { WeekPicker } = DatePicker;
const confirm = Modal.confirm;
const arr = [
  'accountBalance',
  'dragonPayBalance',
  'fundOfChannel',
  'firstOverdueRate',
  'newUserLoanAmountNextWeek',
  'oldUserLoanAmountNextWeek',
  'loanCountNextWeek',
  'loanAmountNextWeek',
  'shouldRepaymentCountNextWeek',
  'expirePrincipalNextWeek',
  'expireInterestNextWeek',
  'offlineExpenseOutbound',
  'offlineExpenseTerritory',
];

class WeeklyFundAllocation extends CLComponent {
  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'getData',
      'search',
      'dateChange',
      'statusChange',
      'getWeekOfYear',
      'setInput',
      'changeValue',
      'setRecycleRate',
      'Save',
      'clear',
      'loadData',
      'changeValue1',
    ]);
  }

  state = {
    columns: [],
    data: [],
    data1: {},
    changeData: {},
    endTime: '',
    year: '',
    week: '',
    tableLoading: false,
    exChangeRate: {},
    recycleRate: {},
    expireChannelInvestorIncomeNextWeek: {},
    interestBearingCurrency: [],
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
    fundOfChannelCurrency: 1,
    switchStatus: {},
    defaultStatus: {},
  };

  componentDidMount() {
    this.getData();
    this.loadData1();
  }

  getData(date) {
    // debugger;
    const that = this;
    const Nowdate = new Date();
    const year = Nowdate.getFullYear();
    const week = that.getWeekOfYear();
    if (!date) {
      date = {
        year: year,
        week: week,
      };
    } else {
      date = {
        year: date.year,
        week: date.week,
      };
    }
    // if (!date) {
    //  date = {
    //   "year":that.state.year || year,
    //   "week":that.state.week || week,
    //   }
    // }
    const settings = {
      contentType,
      method: WeeklyFundBudget.type,
      url: WeeklyFundBudget.url,
      data: JSON.stringify(date),
    };

    function fn(res) {
      that.setState({ tableLoading: false });

      const data = res.data;
      that.setState({ data: data.capitalBudgetWeeklyResult || {} });
    }

    CL.clReqwest({
      settings,
      fn,
    });
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

  // 获取渠道资金里货币类型下拉框值
  statusChange(e) {
    this.setState({ fundOfChannelCurrency: e });
  }

  // 修改资金预算自变量//
  loadData(data) {
    const that = this;
    const Nowdate = new Date();
    const year = Nowdate.getFullYear();
    const week = that.getWeekOfYear();
    const {
      recycleRate, changeData, data1, fundOfChannelCurrency, interestBearingCurrency, switchStatus, defaultStatus,
    } = that.state;
    if (data1.recycleRate !== JSON.stringify(recycleRate)) { // 改变了三个中的一个就传到服务端
      changeData.recycleRate = JSON.stringify(recycleRate);
    }
    let params = {
      year: that.state.year || year,
      week: that.state.week || week,
    };
    if (changeData.fundOfChannel) {
      changeData.fundOfChannelCurrency = fundOfChannelCurrency;
    }
    if (Object.keys(switchStatus).length == 0) {
      params = _.extend(params, changeData, defaultStatus);
    } else {
      for (const key in switchStatus) {
        defaultStatus[`${key}`] = switchStatus[key];
      }
    }
    params = _.extend(params, changeData, defaultStatus);

    const settings = {
      contentType,
      method: BudgetaryIndependentVariable.type,
      url: BudgetaryIndependentVariable.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      const data = res.data;
      that.setState({ changeData: {} });
      if (res.code == '200') {
        message.success('save success');
        that.getData(params);
        that.loadData1(params);
      } else {
        message.success('save error');
      }
    }

    CL.clReqwest({
      settings,
      fn,
    });
  }

  // 修改资金自变量值提交保存
  Save(e) {
    const that = this;
    const { recycleRate1, recycleRate2, recycleRate3 } = that.state.recycleRate;
    if (!recycleRate1 || !recycleRate2 || !recycleRate3) {
      message.error('回收率1,2,3值必填');
      return;
    }
    confirm({
      title: 'Do you Want to save the change?',
      onOk() {
        that.loadData();
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
    });
  }

  loadData1(date) {
    const that = this;
    const Nowdate = new Date();
    const year = Nowdate.getFullYear();
    const week = that.getWeekOfYear();
    if (!date) {
      date = {
        year: year,
        week: week,
      };
    } else {
      date = {
        year: date.year,
        week: date.week,
      };
    }
    const settings = {
      contentType,
      method: ViewTheCapitalBudget.type,
      url: ViewTheCapitalBudget.url,
      data: JSON.stringify(date),
    };

    function fn(res) {
      const data = res.data;
      const defaultStatus = that.state.defaultStatus;
      if (data.capitalBudgetWeeklyIndependentVariable) {
        // 添加默认状态
        const results = data.capitalBudgetWeeklyIndependentVariable;
        const exChangeRate = JSON.parse(results.exchangeRate);
        const expireChannelInvestorIncomeNextWeek = JSON.parse(results.expireChannelInvestorIncomeNextWeek);
        if (results.dragonPayBalance !== null && results.dragonPayBalance > 0) {
          defaultStatus.dragonPayBalanceSwitch = false;
        } else {
          defaultStatus.dragonPayBalanceSwitch = true;
        }
        if (exChangeRate && exChangeRate !== null && exChangeRate.CNYPHP > 0 && exChangeRate.USDPHP > 0) {
          defaultStatus.exchangeRateSwitch = false;
        } else {
          defaultStatus.exchangeRateSwitch = true;
        }
        if (results.expireInterestNextWeek !== null && results.expireInterestNextWeek > 0 && results.expirePrincipalNextWeek !== null && results.expirePrincipalNextWeek > 0) {
          defaultStatus.expirePrincipalNextWeekSwitch = false;
        } else {
          defaultStatus.expirePrincipalNextWeekSwitch = true;
        }
        if (results.shouldRepaymentCountNextWeek !== null && results.shouldRepaymentCountNextWeek > 0) {
          defaultStatus.shouldRepaymentCountNextWeekSwitch = false;
        } else {
          defaultStatus.shouldRepaymentCountNextWeekSwitch = true;
        }
        if (expireChannelInvestorIncomeNextWeek && expireChannelInvestorIncomeNextWeek !== null && expireChannelInvestorIncomeNextWeek.investorIncome12 > 0 && expireChannelInvestorIncomeNextWeek.investorIncome15 > 0) {
          defaultStatus.expireChannelInvestorIncomeNextWeekSwitch = false;
        } else {
          defaultStatus.expireChannelInvestorIncomeNextWeekSwitch = true;
        }
        if (results.forecastReceiveAmountLastWeek !== null && results.forecastReceiveAmountLastWeek > 0) {
          defaultStatus.forecastReceiveAmountLastWeekSwitch = false;
        } else {
          defaultStatus.forecastReceiveAmountLastWeekSwitch = true;
        }
        if (results.forecastReceiveAmountTwoWeeksAgo !== null && results.forecastReceiveAmountTwoWeeksAgo > 0) {
          defaultStatus.forecastReceiveAmountTwoWeeksAgoSwitch = false;
        } else {
          defaultStatus.forecastReceiveAmountTwoWeeksAgoSwitch = true;
        }
        that.setState({
          data1: data.capitalBudgetWeeklyIndependentVariable || {},
          exChangeRate: data.capitalBudgetWeeklyIndependentVariable.exchangeRate ? JSON.parse(data.capitalBudgetWeeklyIndependentVariable.exchangeRate) : {},
          recycleRate: data.capitalBudgetWeeklyIndependentVariable.recycleRate ? JSON.parse(data.capitalBudgetWeeklyIndependentVariable.recycleRate) : {},
          expireChannelInvestorIncomeNextWeek: data.capitalBudgetWeeklyIndependentVariable.expireChannelInvestorIncomeNextWeek ? JSON.parse(data.capitalBudgetWeeklyIndependentVariable.expireChannelInvestorIncomeNextWeek) : {},
          interestBearingCurrency: data.interestBearingCurrency || [],
          fundOfChannelCurrency: data.capitalBudgetWeeklyIndependentVariable.fundOfChannelCurrency,
          defaultStatus: defaultStatus || {},
        });
      } else {
        that.setState({
          data1: {},
          exChangeRate: {},
          recycleRate: {},
          expireChannelInvestorIncomeNextWeek: {},
          interestBearingCurrency: data.interestBearingCurrency,
          fundOfChannelCurrency: '',
          defaultStatus: {},

        });
      }
    }

    CL.clReqwest({
      settings,
      fn,
    });
  }

  dateChange(e) {
    const that = this;
    const endTime = e.format('YYYY-wo');
    that.setState({ endTime: endTime });
  }

  clear() {
    this.setState({ endTime: null });
  }

  search() {
    const that = this;
    let Time = that.state.endTime;
    if (!Time) {
      this.getData();
      this.loadData1();
    } else {
      Time = Time.split('-');
      const year = Time[0];
      const week = Time[1];
      const value = week.replace(/[^0-9]/ig, '');
      const date = {
        year: year,
        week: value,
      };
      this.setState({
        week: value,
        year: year,
      });
      this.getData(date);
      this.loadData1(date);
    }
  }

  setInput(obj) {
    this.setState(obj);
  }

  changeValue(e, target) {
    const { data1, changeData } = this.state;
    data1[`${target}`] = e;
    changeData[target] = e;
    this.setState({
      data1,
      changeData,
    });
  }

  changeValue1(e, target) {
    const { switchStatus } = this.state;
    switchStatus[`${target}`] = e;
    this.setState({ switchStatus });
  }

  setRecycleRate(e, index) {
    const { recycleRate } = this.state;
    recycleRate[`recycleRate${index}`] = e;
    this.setState({ recycleRate });
  }

  renderBody() {
    const that = this;
    const columns = that.state.columns;
    const {
      data = {}, exChangeRate, recycleRate, expireChannelInvestorIncomeNextWeek, year, week, endTime,
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
        title: '周资金预算表',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '',
        colSpan: 2,
        dataIndex: 'inflow',
        key: 'inflow',
        render: (value, row, index) => {
          const obj = {
            children: value,
            props: {},
          };
          if (index === 0) {
            obj.props.colSpan = 2;
            that.state.data ? obj.children = that.state.data.totalAmount : '';
          }
          if (index === 13) {
            obj.props.colSpan = 2;
            that.state.data ? obj.children = that.state.data.forecastTotalAmountNextWeek : '';
          }
          return obj;
        },
      },
      {
        title: '',
        colSpan: 0,
        dataIndex: 'Flowout',
        key: 'Flowout',
        render: (value, row, index) => {
          const obj = {
            children: value,
            props: {},
          };
          if (index === 0) {
            obj.props.colSpan = 0;
          }
          if (index === 13) {
            obj.props.colSpan = 0;
          }
          return obj;
        },
      },
    ];

    const settings = {
      data: [
        {
          key: '1',
          name: '当前资金余额',
          dragonPayBalance: that.state.data ? CF.format(that.state.data.totalAmount, {}) : '-',
        },
        {
          key: '2',
          name: '现金流动项',
          inflow: '流入',
          Flowout: '流出',
        },
        {
          key: '3',
          name: 'CashLending预计放款量',
          inflow: '-',
          Flowout: that.state.data && that.state.data.cashlendingForecastLoanAmount || that.state.data.cashlendingForecastLoanAmount == 0 ? CF.format(that.state.data.cashlendingForecastLoanAmount, {}) : '-',
        },
        {
          key: '4',
          name: '渠道资金预计入金量',
          inflow: that.state.data && that.state.data.channelFundForecastAmountIn || that.state.data.channelFundForecastAmountIn == 0 ? CF.format(that.state.data.channelFundForecastAmountIn, {}) : '-',
          Flowout: '-',
        },
        {
          key: '5',
          name: '渠道资金预计需兑付资金量',
          inflow: '-',
          Flowout: that.state.data && that.state.data.channelFundForecastAmountOut || that.state.data.channelFundForecastAmountOut == 0 ? CF.format(that.state.data.channelFundForecastAmountOut, {}) : '-',
        },
        {
          key: '6',
          name: '渠道资金预计可复投资金量',
          inflow: that.state.data && that.state.data.channelFundForecastAmountRecycle || that.state.data.channelFundForecastAmountRecycle == 0 ? CF.format(that.state.data.channelFundForecastAmountRecycle, {}) : '-',
          Flowout: '-',
        },
        {
          key: '7',
          name: '预计新增预收服务费',
          inflow: that.state.data && that.state.data.forecastServiceFee || that.state.data.forecastServiceFee == 0 ? CF.format(that.state.data.forecastServiceFee, {}) : '-',
          Flowout: '-',
        },
        {
          key: '8',
          name: '预计新增信息服务费',
          inflow: that.state.data && that.state.data.forecastInformationFee || that.state.data.forecastInformationFee == 0 ? CF.format(that.state.data.forecastInformationFee, {}) : '-',
          Flowout: '-',
        },
        {
          key: '9',
          name: '预计新增通道服务费（净）',
          inflow: that.state.data && that.state.data.forecastPaymentChannel || that.state.data.forecastPaymentChannel == 0 ? CF.format(that.state.data.forecastPaymentChannel, {}) : '-',
          Flowout: '-',
        },
        {
          key: '10',
          name: '预计风险备付金代偿',
          inflow: '-',
          Flowout: that.state.data && that.state.data.forecastRisksToMatched || that.state.data.forecastRisksToMatched == 0 ? CF.format(that.state.data.forecastRisksToMatched, {}) : '-',
        },
        {
          key: '11',
          name: '预计风险备付金归还',
          inflow: that.state.data && that.state.data.forecastRepaymentToProvisionForRisks || that.state.data.forecastRepaymentToProvisionForRisks == 0 ? CF.format(that.state.data.forecastRepaymentToProvisionForRisks, {}) : '-',
          Flowout: '-',
        },
        {
          key: '12',
          name: '预计线下其他费用支出（境内）',
          inflow: '-',
          Flowout: that.state.data && that.state.data.forecastOfflineOthersExpenseTerritory || that.state.data.forecastOfflineOthersExpenseTerritory == 0 ? CF.format(that.state.data.forecastOfflineOthersExpenseTerritory, {}) : '-',
        },
        {
          key: '13',
          name: '预计线下其他费用指出（境外）',
          inflow: '-',
          Flowout: that.state.data && that.state.data.forecastOfflineOthersExpenseOutside || that.state.data.forecastOfflineOthersExpenseOutside == 0 ? CF.format(that.state.data.forecastOfflineOthersExpenseOutside, {}) : '-',
        },
        {
          key: '14',
          name: '预计下周末资金余额',
          Flowout: that.state.data ? CF.format(that.state.data.forecastTotalAmountNextWeek, {}) : '-',
        }],
      columns: column,
    };
    const {
      accountBalance,
      dragonPayBalance,
      fundOfChannel,
      firstOverdueRate,
      newUserLoanAmountNextWeek,
      oldUserLoanAmountNextWeek,
      loanCountNextWeek,
      loanAmountNextWeek,
      shouldRepaymentCountNextWeek,
      expirePrincipalNextWeek,
      expireInterestNextWeek,
      offlineExpenseOutbound,
      offlineExpenseTerritory,
      forecastReceiveAmountLastWeek,
      forecastReceiveAmountTwoWeeksAgo,
    } = this.state.data1;
    const self = this;
    const { investorIncome12, investorIncome15 } = this.state.expireChannelInvestorIncomeNextWeek;
    const { interestBearingCurrency, fundOfChannelCurrency } = this.state;
    const TheBudgetVariable = {
      data: [
        {
          title: '账户余额',
          content: accountBalance ? accountBalance : '-',
          type: 'text',
          render(index, record) {
            const obj = {
              inputDA: false,
              accountBalance,
            };
            const obj2 = {
              inputDA: true,
              accountBalance,
            };
            if (that.state.inputDA) {
              return (
                <div style={{
                  position: 'relative',
                  width: '100%',
                }}
                >
                  <InputNumber
                    defaultValue={accountBalance ? CF.format(accountBalance, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={accountBalance}
                    onChange={(e) => {
                      that.changeValue(e, 'accountBalance');
                    }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => {
                      that.setInput(obj);
                    }}
                  />
                </div>);
            }
            return (
              <div style={{
                position: 'relative',
                width: '100%',
              }}
              >
                <a>{(accountBalance ? CF.format(accountBalance, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => {
                    that.setInput(obj2);
                  }}
                />
              </div>
            );

            return accountBalance ? CF.format(accountBalance, {}) : '-';
          },
        },
        {
          title: 'DP余额',
          content: dragonPayBalance ? CF.format(dragonPayBalance, {}) : '-',
          type: 'text',
          render(index, record) {
            let flag = !dragonPayBalance;
            if (typeof self.state.switchStatus.dragonPayBalanceSwitch === 'boolean') {
              flag = self.state.switchStatus.dragonPayBalanceSwitch;
            }
            return (
              <div style={{
                position: 'relative',
                width: '100%',
              }}
              >
                <a>{(dragonPayBalance || dragonPayBalance == 0 ? dragonPayBalance : '-')}</a>
                <Switch
                  style={{
                    position: 'absolute',
                    right: '40px',
                  }}
                  checked={flag}
                  checkedChildren="No"
                  unCheckedChildren="OFF"
                  onChange={(e) => {
                    that.changeValue1(e, 'dragonPayBalanceSwitch');
                  }}
                />
              </div>);
            return dragonPayBalance ? dragonPayBalance : '-';
          },
        },
        {
          title: '渠道资金',
          content: fundOfChannel ? fundOfChannel : '-',
          type: 'text',
          render(index, record) {
            const obj = {
              inputDA1: false,
              fundOfChannel,
            };
            const obj2 = {
              inputDA1: true,
              fundOfChannel,
            };
            if (that.state.inputDA1) {
              return (
                <div style={{
                  position: 'relative',
                  width: '100%',
                }}
                >
                  <InputNumber
                    defaultValue={fundOfChannel ? CF.format(fundOfChannel, {}) : '-'}
                    style={{ minWidth: '120px' }}
                    // value={fundOfChannel}
                    onChange={(e) => {
                      that.changeValue(e, 'fundOfChannel');
                    }}
                  />
                  <Select
                    defaultValue="CNY"
                    onChange={that.statusChange}
                    style={{
                    position: 'absolute',
                    right: '40px',
                  }}
                  >
                    {
                      interestBearingCurrency.map((doc) => {
                        return (<Option key={doc.typeName} value={doc.type}>{doc.typeName}</Option>);
                      })
                    }
                  </Select>
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => {
                      that.setInput(obj);
                    }}
                  />
                </div>);
            }
            return (
              <div style={{
                position: 'relative',
                width: '100%',
              }}
              >
                <a>{(fundOfChannel || fundOfChannel == 0 ? CF.format(fundOfChannel, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => {
                    that.setInput(obj2);
                  }}
                />
              </div>
            );

            return fundOfChannel ? CF.format(fundOfChannel, {}) : '-';
          },
        },
        {
          title: '汇率(RMB/PESO)',
          content: exChangeRate && exChangeRate.CNYPHP ? CF.format(exChangeRate.CNYPHP, {}) : '-',
          type: 'text',
          render(index, record) {
            let flag = !exChangeRate.CNYPHP && !exChangeRate.USDPHP;
            if (typeof self.state.switchStatus.exchangeRateSwitch === 'boolean') {
              flag = self.state.switchStatus.exchangeRateSwitch;
            }
            return (
              <div style={{
                position: 'relative',
                width: '100%',
              }}
              >
                <a>{(exChangeRate && exChangeRate.CNYPHP || exChangeRate.CNYPHP == 0 ? exChangeRate.CNYPHP : '-')}</a>
                <Switch
                  style={{
                    position: 'absolute',
                    right: '40px',
                  }}
                  checked={flag}
                  checkedChildren="No"
                  unCheckedChildren="OFF"
                  onChange={(e) => {
                    that.changeValue1(e, 'exchangeRateSwitch');
                  }}
                />
              </div>);
            return exChangeRate && exChangeRate.CNYPHP ? exChangeRate.CNYPHP : '-';
          },
        },

        {
          title: '汇率(USD/PESO)',
          content: exChangeRate && exChangeRate.USDPHP || exChangeRate.USDPHP == 0 ? CF.format(exChangeRate.USDPHP, {}) : '-',
          type: 'text',
        },
        {
          title: '首逾率',
          content: firstOverdueRate ? firstOverdueRate : '-',
          type: 'text',
          render(index, record) {
            const obj = {
              inputDA2: false,
              firstOverdueRate,
            };
            const obj2 = {
              inputDA2: true,
              firstOverdueRate,
            };
            if (that.state.inputDA2) {
              return (
                <div style={{
                  position: 'relative',
                  width: '100%',
                }}
                >
                  <InputNumber
                    defaultValue={firstOverdueRate ? CF.format(firstOverdueRate, {}) : '_'}
                    style={{ minWidth: '200px' }}
                    onChange={(e) => {
                      that.changeValue(e, 'firstOverdueRate');
                    }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={() => {
                      that.setInput(obj);
                    }}
                  />
                </div>);
            }
            return (
              <div style={{
                position: 'relative',
                width: '100%',
              }}
              >
                <a>{(firstOverdueRate ? CF.format(firstOverdueRate, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={() => {
                    that.setInput(obj2);
                  }}
                />
              </div>
            );

            return firstOverdueRate ? CF.format(firstOverdueRate, {}) : '-';
          },
        },
        {
          title: '回收率1',
          content: recycleRate && recycleRate.recycleRate1 ? CF.format(recycleRate.recycleRate1, {}) : '-',
          type: 'text',
          render(index, record) {
            const obj = {
              inputDA3: false,
              recycleRate1: recycleRate.recycleRate1,
            };
            const obj2 = {
              inputDA3: true,
              recycleRate1: recycleRate.recycleRate1,
            };
            if (that.state.inputDA3) {
              return (
                <div style={{
                  position: 'relative',
                  width: '100%',
                }}
                >
                  <InputNumber
                    defaultValue={recycleRate && recycleRate.recycleRate1 ? CF.format(recycleRate.recycleRate1, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={recycleRate.recycleRate1}
                    onChange={(e) => {
                      that.setRecycleRate(e, '1');
                    }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => {
                      that.setInput(obj);
                    }}
                  />
                </div>);
            }
            return (
              <div style={{
                position: 'relative',
                width: '100%',
              }}
              >
                <a>{(recycleRate && recycleRate.recycleRate1 ? CF.format(recycleRate.recycleRate1, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => {
                    that.setInput(obj2);
                  }}
                />
              </div>
            );

            return recycleRate && recycleRate.recycleRate1 ? CF.format(recycleRate.recycleRate1, {}) : '-';
          },
        },
        {
          title: '回收率2',
          content: recycleRate && recycleRate.recycleRate2 ? CF.format(recycleRate.recycleRate2, {}) : '-',
          type: 'text',
          render(index, record) {
            const obj = {
              inputDA4: false,
              recycleRate2: recycleRate.recycleRate2,
            };
            const obj2 = {
              inputDA4: true,
              recycleRate2: recycleRate.recycleRate2,
            };
            if (that.state.inputDA4) {
              return (
                <div style={{
                  position: 'relative',
                  width: '100%',
                }}
                >
                  <InputNumber
                    defaultValue={recycleRate && recycleRate.recycleRate2 ? CF.format(recycleRate.recycleRate2, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={recycleRate.recycleRate2}
                    onChange={(e) => {
                      that.setRecycleRate(e, '2');
                    }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => {
                      that.setInput(obj);
                    }}
                  />
                </div>);
            }
            return (
              <div style={{
                position: 'relative',
                width: '100%',
              }}
              >
                <a>{(recycleRate && recycleRate.recycleRate2 ? CF.format(recycleRate.recycleRate2, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => {
                    that.setInput(obj2);
                  }}
                />
              </div>
            );

            return recycleRate && recycleRate.recycleRate2 ? CF.format(recycleRate.recycleRate2, {}) : '-';
          },
        },
        {
          title: '回收率3',
          content: recycleRate && recycleRate.recycleRate3 ? CF.format(recycleRate.recycleRate3, {}) : '-',
          type: 'text',
          render(index, record) {
            const obj = {
              inputDA5: false,
              recycleRate3: recycleRate.recycleRate3,
            };
            const obj2 = {
              inputDA5: true,
              recycleRate3: recycleRate.recycleRate3,
            };
            if (that.state.inputDA5) {
              return (
                <div style={{
                  position: 'relative',
                  width: '100%',
                }}
                >
                  <InputNumber
                    defaultValue={recycleRate && recycleRate.recycleRate3 ? CF.format(recycleRate.recycleRate3, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={recycleRate.recycleRate3}
                    onChange={(e) => {
                      that.setRecycleRate(e, '3');
                    }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => {
                      that.setInput(obj);
                    }}
                  />
                </div>);
            }
            return (
              <div style={{
                position: 'relative',
                width: '100%',
              }}
              >
                <a>{(recycleRate && recycleRate.recycleRate3 ? CF.format(recycleRate.recycleRate3, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => {
                    that.setInput(obj2);
                  }}
                />
              </div>
            );

            return recycleRate && recycleRate.recycleRate3 ? CF.format(recycleRate.recycleRate3, {}) : '-';
          },
        },
        {
          title: '下个自然周新用户放款量',
          content: newUserLoanAmountNextWeek ? newUserLoanAmountNextWeek : '-',
          type: 'text',
          render(index, record) {
            const obj = {
              inputDA6: false,
              newUserLoanAmountNextWeek,
            };
            const obj2 = {
              inputDA6: true,
              newUserLoanAmountNextWeek,
            };
            if (that.state.inputDA6) {
              return (
                <div style={{
                  position: 'relative',
                  width: '100%',
                }}
                >
                  <InputNumber
                    defaultValue={newUserLoanAmountNextWeek ? CF.format(newUserLoanAmountNextWeek, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={newUserLoanAmountNextWeek}
                    onChange={(e) => {
                      that.changeValue(e, 'newUserLoanAmountNextWeek');
                    }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => {
                      that.setInput(obj);
                    }}
                  />
                </div>);
            }
            return (
              <div style={{
                position: 'relative',
                width: '100%',
              }}
              >
                <a>{(newUserLoanAmountNextWeek ? CF.format(newUserLoanAmountNextWeek, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => {
                    that.setInput(obj2);
                  }}
                />
              </div>
            );

            return newUserLoanAmountNextWeek ? CF.format(newUserLoanAmountNextWeek, {}) : '-';
          },
        },
        {
          title: '下个自然周老用户放款量',
          content: oldUserLoanAmountNextWeek ? oldUserLoanAmountNextWeek : '-',
          type: 'text',
          render(index, record) {
            const obj = {
              inputDA7: false,
              oldUserLoanAmountNextWeek,
            };
            const obj2 = {
              inputDA7: true,
              oldUserLoanAmountNextWeek,
            };
            if (that.state.inputDA7) {
              return (
                <div style={{
                  position: 'relative',
                  width: '100%',
                }}
                >
                  <InputNumber
                    defaultValue={oldUserLoanAmountNextWeek ? CF.format(oldUserLoanAmountNextWeek, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={oldUserLoanAmountNextWeek}
                    onChange={(e) => {
                      that.changeValue(e, 'oldUserLoanAmountNextWeek');
                    }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => {
                      that.setInput(obj);
                    }}
                  />
                </div>);
            }
            return (
              <div style={{
                position: 'relative',
                width: '100%',
              }}
              >
                <a>{(oldUserLoanAmountNextWeek ? CF.format(oldUserLoanAmountNextWeek, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => {
                    that.setInput(obj2);
                  }}
                />
              </div>
            );

            return oldUserLoanAmountNextWeek ? CF.format(oldUserLoanAmountNextWeek, {}) : '-';
          },
        },
        {
          title: '下个自然周放款笔数',
          content: loanCountNextWeek ? loanCountNextWeek : '-',
          type: 'text',
          render(index, record) {
            const obj = {
              inputDA8: false,
              loanCountNextWeek,
            };
            const obj2 = {
              inputDA8: true,
              loanCountNextWeek,
            };
            if (that.state.inputDA8) {
              return (
                <div style={{
                  position: 'relative',
                  width: '100%',
                }}
                >
                  <InputNumber
                    defaultValue={loanCountNextWeek}
                    style={{ minWidth: '200px' }}
                    // value={loanCountNextWeek}
                    onChange={(e) => {
                      that.changeValue(e, 'loanCountNextWeek');
                    }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => {
                      that.setInput(obj);
                    }}
                  />
                </div>);
            }
            return (
              <div style={{
                position: 'relative',
                width: '100%',
              }}
              >
                <a>{(loanCountNextWeek ? CF.format(loanCountNextWeek, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => {
                    that.setInput(obj2);
                  }}
                />
              </div>
            );

            return loanCountNextWeek ? CF.format(loanCountNextWeek, {}) : '-';
          },
        },
        {
          title: '下个自然周放款金额',
          content: loanAmountNextWeek ? loanAmountNextWeek : '-',
          type: 'text',
          render(index, record) {
            const obj = {
              inputDA9: false,
              loanAmountNextWeek,
            };
            const obj2 = {
              inputDA9: true,
              loanAmountNextWeek,
            };
            if (that.state.inputDA9) {
              return (
                <div style={{
                  position: 'relative',
                  width: '100%',
                }}
                >
                  <InputNumber
                    defaultValue={loanAmountNextWeek ? CF.format(loanAmountNextWeek, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={loanAmountNextWeek}
                    onChange={(e) => {
                      that.changeValue(e, 'loanAmountNextWeek');
                    }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => {
                      that.setInput(obj);
                    }}
                  />
                </div>);
            }
            return (
              <div style={{
                position: 'relative',
                width: '100%',
              }}
              >
                <a>{(loanAmountNextWeek ? CF.format(loanAmountNextWeek, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => {
                    that.setInput(obj2);
                  }}
                />
              </div>
            );

            return loanAmountNextWeek > 0 ? CF.format(loanAmountNextWeek, {}) : '-';
          },
        },
        {
          title: '下个自然周应还笔数',
          content: shouldRepaymentCountNextWeek ? shouldRepaymentCountNextWeek : '-',
          type: 'text',
          render(index, record) {
            let flag = !shouldRepaymentCountNextWeek;
            if (typeof self.state.switchStatus.shouldRepaymentCountNextWeekSwitch === 'boolean') {
              flag = self.state.switchStatus.shouldRepaymentCountNextWeekSwitch;
            }
            return (
              <div style={{
                position: 'relative',
                width: '100%',
              }}
              >
                <a>{(shouldRepaymentCountNextWeek || shouldRepaymentCountNextWeek == 0 ? shouldRepaymentCountNextWeek : '-')}</a>
                <Switch
                  style={{
                    position: 'absolute',
                    right: '40px',
                  }}
                  checked={flag}
                  checkedChildren="No"
                  unCheckedChildren="OFF"
                  onChange={(e) => {
                    that.changeValue1(e, 'shouldRepaymentCountNextWeekSwitch');
                  }}
                />
              </div>);
            return shouldRepaymentCountNextWeek ? shouldRepaymentCountNextWeek : '-';
          },
        },
        {
          title: '下个自然周到期本金',
          content: expirePrincipalNextWeek || expirePrincipalNextWeek == 0 ? CF.format(expirePrincipalNextWeek, {}) : '-',
          type: 'text',
        },
        {
          title: '下个自然周到期利息',
          content: expireInterestNextWeek ? CF.format(expireInterestNextWeek, {}) : '-',
          type: 'text',
          render(index, record) {
            let flag = !expireInterestNextWeek || !expireInterestNextWeek;
            if (typeof self.state.switchStatus.expirePrincipalNextWeekSwitch === 'boolean') {
              flag = self.state.switchStatus.expirePrincipalNextWeekSwitch;
            }
            return (
              <div style={{
                position: 'relative',
                width: '100%',
              }}
              >
                <a>{(expireInterestNextWeek || expireInterestNextWeek == 0 ? expireInterestNextWeek : '-')}</a>
                <Switch
                  style={{
                    position: 'absolute',
                    right: '40px',
                  }}
                  checked={flag}
                  checkedChildren="No"
                  unCheckedChildren="OFF"
                  onChange={(e) => {
                    that.changeValue1(e, 'expirePrincipalNextWeekSwitch');
                  }}
                />
              </div>);
            return expireInterestNextWeek ? expireInterestNextWeek : '-';
          },

        },
        {
          title: '下个自然周到期投资收益12%',
          content: expireChannelInvestorIncomeNextWeek && expireChannelInvestorIncomeNextWeek.investorIncome12 ? CF.format(expireChannelInvestorIncomeNextWeek.investorIncome12, {}) : '-',
          type: 'text',
          render(index, record) {
            let flag = !expireChannelInvestorIncomeNextWeek.investorIncome12 || !expireChannelInvestorIncomeNextWeek.investorIncome12;
            if (typeof self.state.switchStatus.expireChannelInvestorIncomeNextWeekSwitch === 'boolean') {
              flag = self.state.switchStatus.expireChannelInvestorIncomeNextWeekSwitch;
            }
            return (
              <div style={{
                position: 'relative',
                width: '100%',
              }}
              >
                <a>{(expireChannelInvestorIncomeNextWeek && expireChannelInvestorIncomeNextWeek.investorIncome12 || expireChannelInvestorIncomeNextWeek.investorIncome12 == 0 ? CF.format(expireChannelInvestorIncomeNextWeek.investorIncome12, {}) : '-')}</a>
                <Switch
                  style={{
                    position: 'absolute',
                    right: '40px',
                  }}
                  checked={flag}
                  checkedChildren="No"
                  unCheckedChildren="OFF"
                  onChange={(e) => {
                    that.changeValue1(e, 'expireChannelInvestorIncomeNextWeekSwitch');
                  }}
                />
              </div>);
            return expireChannelInvestorIncomeNextWeek && expireChannelInvestorIncomeNextWeek.investorIncome12 ? expireChannelInvestorIncomeNextWeek.investorIncome12 : '-';
          },

        },
        {
          title: '下个自然周到期投资收益15%',
          content: expireChannelInvestorIncomeNextWeek && expireChannelInvestorIncomeNextWeek.investorIncome15 || expireChannelInvestorIncomeNextWeek.investorIncome15 == 0 ? CF.format(expireChannelInvestorIncomeNextWeek.investorIncome15, {}) : '-',
          type: 'text',
        },
        {
          title: '线下费用(境外)',
          content: offlineExpenseOutbound ? offlineExpenseOutbound : '-',
          type: 'text',
          render(index, record) {
            const obj = {
              inputDA10: false,
              offlineExpenseOutbound,
            };
            const obj2 = {
              inputDA10: true,
              offlineExpenseOutbound,
            };
            if (that.state.inputDA10) {
              return (
                <div style={{
                  position: 'relative',
                  width: '100%',
                }}
                >
                  <InputNumber
                    defaultValue={offlineExpenseOutbound ? CF.format(offlineExpenseOutbound, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={offlineExpenseOutbound}
                    onChange={(e) => {
                      that.changeValue(e, 'offlineExpenseOutbound');
                    }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => {
                      that.setInput(obj);
                    }}
                  />
                </div>);
            }
            return (
              <div style={{
                position: 'relative',
                width: '100%',
              }}
              >
                <a>{(offlineExpenseOutbound ? CF.format(offlineExpenseOutbound, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => {
                    that.setInput(obj2);
                  }}
                />
              </div>
            );

            return offlineExpenseOutbound ? CF.format(offlineExpenseOutbound, {}) : '-';
          },
        },
        {
          title: '线下费用(境内)',
          content: offlineExpenseTerritory ? offlineExpenseTerritory : '-',
          type: 'text',
          render(index, record) {
            const obj = {
              inputDA11: false,
              offlineExpenseTerritory,
            };
            const obj2 = {
              inputDA11: true,
              offlineExpenseTerritory,
            };
            if (that.state.inputDA11) {
              return (
                <div style={{
                  position: 'relative',
                  width: '100%',
                }}
                >
                  <InputNumber
                    defaultValue={offlineExpenseTerritory ? CF.format(offlineExpenseTerritory, {}) : '-'}
                    style={{ minWidth: '200px' }}
                    // value={offlineExpenseTerritory}
                    onChange={(e) => {
                      that.changeValue(e, 'offlineExpenseTerritory');
                    }}
                  />
                  <Icon
                    type="close-circle"
                    style={editStyle}
                    onClick={(...arg) => {
                      that.setInput(obj);
                    }}
                  />
                </div>);
            }
            return (
              <div style={{
                position: 'relative',
                width: '100%',
              }}
              >
                <a>{(offlineExpenseTerritory ? CF.format(offlineExpenseTerritory, {}) : '-')}</a>
                <Icon
                  type="edit"
                  style={editStyle}
                  onClick={(...arg) => {
                    that.setInput(obj2);
                  }}
                />
              </div>
            );

            return offlineExpenseTerritory ? CF.format(offlineExpenseTerritory, {}) : '-';
          },
        },
        {
          title: '上周应收金额 * 损失率',
          content: forecastReceiveAmountLastWeek ? forecastReceiveAmountLastWeek : '-',
          type: 'text',
          render(index, record) {
            let flag = !forecastReceiveAmountLastWeek;
            if (typeof self.state.switchStatus.forecastReceiveAmountLastWeekSwitch === 'boolean') {
              flag = self.state.switchStatus.forecastReceiveAmountLastWeekSwitch;
            }
            return (
              <div style={{
                position: 'relative',
                width: '100%',
              }}
              >
                <a>{(forecastReceiveAmountLastWeek || forecastReceiveAmountLastWeek == 0 ? forecastReceiveAmountLastWeek : '-')}</a>
                <Switch
                  style={{
                    position: 'absolute',
                    right: '40px',
                  }}
                  checked={flag}
                  checkedChildren="No"
                  unCheckedChildren="OFF"
                  onChange={(e) => {
                    that.changeValue1(e, 'forecastReceiveAmountLastWeekSwitch');
                  }}
                />
              </div>);
            return forecastReceiveAmountLastWeek ? forecastReceiveAmountLastWeek : '-';
          },

        },
        {
          title: '上上周应收金额 * 损失率',
          content: forecastReceiveAmountTwoWeeksAgo ? forecastReceiveAmountTwoWeeksAgo : '-',
          type: 'text',
          render(index, record) {
            let flag = !forecastReceiveAmountTwoWeeksAgo;
            if (typeof self.state.switchStatus.forecastReceiveAmountTwoWeeksAgoSwitch === 'boolean') {
              flag = self.state.switchStatus.forecastReceiveAmountTwoWeeksAgoSwitch;
            }
            return (
              <div style={{
                position: 'relative',
                width: '100%',
              }}
              >
                <a>{(forecastReceiveAmountTwoWeeksAgo || forecastReceiveAmountTwoWeeksAgo == 0 ? forecastReceiveAmountTwoWeeksAgo : '-')}</a>
                <Switch
                  style={{
                    position: 'absolute',
                    right: '40px',
                  }}
                  checked={flag}
                  checkedChildren="No"
                  unCheckedChildren="OFF"
                  onChange={(e) => {
                    that.changeValue1(e, 'forecastReceiveAmountTwoWeeksAgoSwitch');
                  }}
                />
              </div>);
            return forecastReceiveAmountTwoWeeksAgo ? forecastReceiveAmountTwoWeeksAgo : '-';
          },
        },
      ],
    };

    return (
      <div className="Weekly_undAllocation" key="Weekly_undAllocation">
        <Row className="table-wrap">
          <Col span={2} />
          <Col span={2}><b> Time : </b></Col>
          <Col span={2}>
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
              that.state.data !== null ? `${moment(that.state.data.startDate)
                .format('YYYY-MM-DD')}—${moment(that.state.data.endDate)
                .format('YYYY-MM-DD')}资金预算` : ''
            }
          </Col>
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
        <Row>
          <Col offset={22}>
            <div> 金额单位 : PHP</div>
          </Col>
        </Row>
        <div>
          <CLBlockList settings={TheBudgetVariable} />
          <br />
          <Row>
            <Col offset={22}>
              <Button type="primary" onClick={that.Save}>Save</Button>
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

export default WeeklyFundAllocation;
