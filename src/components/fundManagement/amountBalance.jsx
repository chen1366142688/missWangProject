import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent, CLForm } from '../../../src/lib/component/index';

import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import _ from 'lodash';
import CF from 'currency-formatter';

import {
  Button, Tabs, Input, Modal,
  DatePicker, message, Row, Col, Table, Icon,
  InputNumber, Tooltip, Form, Select,

} from 'antd';

const { TextArea } = Input;
const { TabPane } = Tabs;
const confirm = Modal.confirm;
const FormItem = Form.Item;
const Option = Select.Option;


const {
  contentType,
  accountBalance,
  fundEstimation,
  futherEstimationDays,
  fundTwoWeekSave,
  investFutherDaysIncome,
  accountingMonitor,
  getOperateAmount,
  fundAccountingAmountChannelAccountList,
  queryPayoutAccountBalance
} = Interface;

class AmountBalance extends CLComponent {
  state = {
    data: {},
    search: {},
    estimation: {},
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'loadEsData',
      'loadFETData',
      'setTWAmount',
      'showSaveTWA',
      'saveTWA',
      'getFormFields',
      'setInput',
      'loadOperateAmount',
    ]);
  }

  componentDidMount() {
    // 搜索条件
    const { search } = this.state;
    this.loadData(search);
    this.loadEsData();
    this.loadFETData();
    this.loadfutherTenDayData();
    this.loadfutherTenDayData();
    this.fmFlag();
    this.loadOperateAmount();
    this.fundAccountingAmountChannelAccountList();
    this.lodaDPData();
  }

  loadData(search) {
    const that = this;
    that.setState({ tableLoading: true });
    const params = {
      fundAccountingAmount: {
        orderFieldNextType: 'ASC',
        queryFields: [],
      },
    };


    const settings = {
      contentType,
      method: accountBalance.type,
      url: accountBalance.url,
      data: JSON.stringify({
        fundAccountingAmount: {
          orderFieldNextType: 'ASC',
          queryFields: [],
          ...search,
        },
      }),
    };

    function fn(res) {
      const data = res.data;
      that.setState({ tableLoading: false });
      if (data) {
        that.setState({ data });
      }
    }

    CL.clReqwest({ settings, fn });
  }

  lodaDPData() {
    const that = this;
    const settings = {
    contentType,
    method: queryPayoutAccountBalance.type,
    url: queryPayoutAccountBalance.url,
    };
    
    function fn(res) {
    const data = res.data;
    that.setState({ tableLoading: false });
    if (data) {
    that.setState({
    dragonpayAccountBalance: data.dragonpayAccountBalance,
    });
    }
    }
    
    CL.clReqwest({ settings, fn });
    }

  fundAccountingAmountChannelAccountList = () => {
    const that = this;
    const settings = {
      contentType,
      method: fundAccountingAmountChannelAccountList.type,
      url: fundAccountingAmountChannelAccountList.url,
    };

    function fn(res) {
      if (res && res.data) {
        that.setState({ settlementAccount: res.data[0].settlementAccount, settlementAccount1: res.data[1].settlementAccount });
      }
    }

    CL.clReqwest({ settings, fn });
  }

  loadfutherTenDayData() {
    const that = this;
    const settings = {
      contentType,
      method: investFutherDaysIncome.type,
      url: investFutherDaysIncome.url,
      data: JSON.stringify({
        xDays: 10,
      }),
    };

    function fn(res) {
      const data = res.data;
      that.setState({ tableLoading: false });
      let { estimation } = that.state;
      if (data) {
        estimation = _.extend(estimation, {
          tendays: data.sumOfPrincipalAndIncome,
        });
        that.setState({ estimation });
      }
    }

    CL.clReqwest({ settings, fn });
  }

  loadEsData() {
    const that = this;
    const settings = {
      contentType,
      method: fundEstimation.type,
      url: fundEstimation.url,
    };
    function fn(res) {
      const data = res.data;
      that.setState({ tableLoading: false });
      if (data) {
        let { estimation } = that.state;
        estimation = _.extend(
          estimation,
          data.disbursementEstimation,
          { inputDA: false },
        );
        that.setState({ estimation });
      }
    }
    CL.clReqwest({ settings, fn });
  }

  loadOperateAmount() {
    const that = this;
    const settings = {
      contentType,
      method: getOperateAmount.type,
      url: getOperateAmount.url,
    };
    function fn(res) {
      if (res.data) {
        that.setState({ activityOperationAmount: res.data.activityOperationAmount });
      }
    }
    CL.clReqwest({ settings, fn });
  }

  loadFETData() {
    const that = this;
    const settings1 = {
      contentType,
      method: futherEstimationDays.type,
      url: futherEstimationDays.url,
      data: JSON.stringify({
        estimationDays: 3,
      }),
    };

    function fn1(res) {
      const data = res.data;
      that.setState({ tableLoading: false });
      let { estimation } = that.state;
      if (data) {
        estimation = _.extend(estimation, {
          threedays: data,
        });
        that.setState({ estimation });
      }
    }

    const settings2 = {
      contentType,
      method: futherEstimationDays.type,
      url: futherEstimationDays.url,
      data: JSON.stringify({
        estimationDays: 5,
      }),
    };
    function fn2(res) {
      const data = res.data;
      that.setState({ tableLoading: false });
      let { estimation } = that.state;

      if (data) {
        estimation = _.extend(estimation, {
          fivedays: data,
        });
        that.setState({ estimation });
      }
    }

    CL.clReqwest({ settings: settings1, fn: fn1 });
    CL.clReqwest({ settings: settings2, fn: fn2 });
  }

  fmFlag() {
    // 资金管理检查
    const that = this;
    const settings = {
      contentType,
      method: accountingMonitor.type,
      url: accountingMonitor.url,
    };

    function fn(res) { // 获取权限回调处理
      sessionStorage.setItem('fundCharge', res.data.accountingMonitor.accountingStatus.toString());
      if (res.data.accountingMonitor.accountingStatus === 1) {
        that.setState({
          iconShow: _.find(res.data.fundAccount, { type: res.data.accountingMonitor.accountingCode }).typeName,
        });
      }

      if (res.data.accountingMonitor.waitMactingAmountStatus) {
        that.setState({
          waitMactingAmountStatus: true,
        });
      }
    }

    CL.clReqwest({ settings, fn });
  }

  setTWAmount(e) {
    this.setState({
      estimation: _.extend(this.state.estimation, {
        nextTwoWeeksDisbursementAmount_new: e,
      }),
    });
  }

  showSaveTWA() {
    const that = this;
    const { nextTwoWeeksDisbursementAmount_new } = that.state.estimation;
    if (!nextTwoWeeksDisbursementAmount_new) {
      message.error('You must input the amount!');
      return;
    }

    confirm({
      title: 'Do you Want to save the change?',
      content: 'Disbursement amount in 2weeks is Changed!',
      onOk() {
        that.saveTWA();
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  saveTWA() {
    const that = this;
    const { nextTwoWeeksDisbursementAmount_new } = that.state.estimation;
    const settings = {
      contentType,
      method: fundTwoWeekSave.type,
      url: fundTwoWeekSave.url,
      data: JSON.stringify(
        {
          disbursementEstimation: {
            nextTwoWeeksDisbursementAmount: nextTwoWeeksDisbursementAmount_new,
          },
        },
      ),
    };

    function fn(res) {
      if (res && res.data) {
        message.success('save success');
        that.loadEsData();
        that.fmFlag();
      }
    }

    CL.clReqwest({ settings, fn });
  }

  setInput(e, doc, flag) {
    let obj = {};
    if (!flag) {
      obj = {
        nextTwoWeeksDisbursementAmount_new: 0,
        inputDA: flag,
      };
    } else {
      obj = {
        inputDA: flag,
      };
    }
    this.setState({
      estimation: _.extend(this.state.estimation, obj),
    });
  }

  getFormFields(fields) {
    const search = {};
    _.map(fields, (doc, index) => {
      if (doc) {
        if (index === 'collectDate') {
          search.collectDate = doc.format('YYYY-MM-DD');
        } else {
          search[index] = doc;
        }
      }
    });
    const pagination = this.state.pagination || {};
    pagination.currentPage = 1;
    this.setState({ search: search, pagination: pagination });
    this.loadData(search, pagination);
    this.loadOperateAmount();
  }


  renderBody() {
    const that = this;
    let data = that.state.data;
    let columns = [];
    let data2 = [];
    let data3 = [];
    let data4 = [];
    const editStyle = {
      display: 'inlineBlock',
      fontSize: '18px',
      position: 'absolute',
      right: '5px',
      cursor: 'pointer',
      color: '#108ee9',
      top: '20%',
    };

    const iconStyle = {
      display: 'inlineBlock',
      position: 'absolute',
      right: '-80%',
      top: 0,
    };


    const columns1 = [
      {
        title: 'Accounting Balance',
        dataIndex: 'accountingAmount',
        width: '15%',
        render(index, data) {
          return CF.format(data.accountingAmount, {});
        },
      },
      {
        title: (<div style={{ position: 'relative' }}>Profit Funds {this.state.iconShow === 'Profit Funds' ? (<Icon style={iconStyle} type="exclamation-circle" />) : ''}</div>),
        dataIndex: 'surplusFundAmount',
        width: '15%',
        render(index, data) {
          return CF.format(data.surplusFundAmount, {});
        },

      },
      {
        title: (<div style={{ position: 'relative' }}>Provision For Risks {this.state.iconShow === 'Provision For Risks' ? (<Icon style={iconStyle} type="exclamation-circle" />) : ''}</div>),
        dataIndex: 'riskReserveAmount',
        width: '16%',
        render(index, data) {
          return CF.format(data.riskReserveAmount, {});
        },
      },
      {
        title: (<div style={{ position: 'relative' }}>Funds To Be Matched {this.state.waitMactingAmountStatus ? (<Icon style={iconStyle} type="exclamation-circle" />) : ''}</div>),
        dataIndex: 'waitMatchingAmount',
        width: '16%',
        render(index, data) {
          return CF.format(data.waitMatchingAmount, {});
        },
      },
      {
        title: 'Difference Account(total) ',
        dataIndex: 'differenceAmount',
        width: '18%',
        render(index, data) {
          return CF.format(data.differenceAmount, {});
        },
      },
      {
        title: 'Activity Operation Account',
        dataIndex: 'activityOperationAmount',
        render(index, data) {
          return CF.format(data.activityOperationAmount, {});
        },
      },
    ];

    const columns2 = [
      {
        title: 'Dragonpay Account Balance',
        dataIndex: 'dragonpayAccountBalance',
        width:'20%',
        render(index, data) {
          return CF.format(data.dragonpayAccountBalance, {});
        },
      },
      {
        title: 'Difference Account(DP)',
        dataIndex: 'settlementAccount',
        render(index, data) {
          return CF.format(data.settlementAccount, {});
        },
      },
    ];

    const columns4 = [
      {
        title: 'Unipay Account Balance',
        dataIndex: 'settlementAccount1',
        width:'20%',
        render(index, data) {
          return CF.format(data.settlementAccount1, {});
        },
      },
      {
        title: 'Difference Account(UP)',
        dataIndex: 'difference Account',
        render(index, data) {
          return CF.format(data.differenceAccount, {});
        },
      },
    ];

    const columns3 = [
      {
        title: 'Disbursement amount in 2weeks',
        dataIndex: 'nextTwoWeeksDisbursementAmount',
        render(index, record) {
          if (record.inputDA) {
            const { nextTwoWeeksDisbursementAmount_new, nextTwoWeeksDisbursementAmount } = record;

            const valueShow = nextTwoWeeksDisbursementAmount_new === 0 || nextTwoWeeksDisbursementAmount_new === '' || nextTwoWeeksDisbursementAmount_new ? nextTwoWeeksDisbursementAmount_new : nextTwoWeeksDisbursementAmount;
            return (
              <div style={{ position: 'relative' }}>
                <InputNumber
                  defaultValue={CF.format(record.nextTwoWeeksDisbursementAmount, {})}
                  style={{ width: '200px' }}
                  value={valueShow}
                  onChange={that.setTWAmount}
                />
                <Button type="primary" style={{ position: 'absolute', right: '35px' }} onClick={that.showSaveTWA}>Save</Button>
                <Icon type="close-circle" style={editStyle} onClick={(...arg) => { that.setInput(...arg, record, false); }} />
              </div>);
          }
          return (
            <div style={{ position: 'relative' }}>
              <a>{(CF.format(record.nextTwoWeeksDisbursementAmount, {}))}</a>
              <Icon type="edit" style={editStyle} onClick={(...arg) => { that.setInput(...arg, record, true); }} />
            </div>
          );


          return CF.format(record.nextTwoWeeksDisbursementAmount, {});
        },
      },
      {
        title: 'Due amount in 3days(pri+int)',
        dataIndex: 'threedays',
        render(index, record) {
          return CF.format(record.threedays, {});
        },
      },
      {
        title: 'Due amount in 5days(pri+int)',
        dataIndex: 'fivedays',
        render(index, record) {
          return CF.format(record.fivedays, {});
        },
      },
      {
        title: 'Wealth management funds & Yield in 10days',
        dataIndex: 'tendays',
        render(index, record) {
          return CF.format(record.tendays, {});
        },
      },
      // {
      //   title: '未来三天到期金额',
      //   dataIndex: 'nextTwoWeeksDisbursementAmount'
      // },
    ];

    const operation1 = [
      {
        id: 'collectDate',
        type: 'dateTime',
        label: 'End time',
      },
    ];

    const info = (this.state.data || {}).fundAccountingAmount || {};
    data = [
      {
        accountingAmount: info.accountingAmount || 0,
        surplusFundAmount: info.surplusFundAmount || 0,
        riskReserveAmount: info.riskReserveAmount || 0,
        waitMatchingAmount: info.waitMatchingAmount || 0,
        differenceAmount: info.differenceAmount || 0,
        activityOperationAmount: that.state.activityOperationAmount,
        id: '1',
      },
    ];
    data2 = [
      {
        dragonpayAccountBalance: that.state.dragonpayAccountBalance || 0,
        settlementAccount: info.differenceAmount || 0,
        id: '11',
      },
    ];

    data3 = [
      _.extend({ id: '1' }, that.state.estimation),
    ];

    data4 = [
      {
        settlementAccount1: that.state.settlementAccount1 || 0,
        id: '2',
      },
    ];

    columns = columns1;

    const settings = {
      data: data,
      columns: columns,
      operation: operation1,
      getFields: that.getFormFields,
      pagination: false,
      pageChange: that.pageChage,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
    };

    return (
      <div>
        <CLlist settings={settings} />
        <Table
          className="cl-table"
          dataSource={data2}
          columns={columns2}
          pagination={false}
          rowKey={record => record.id}
          bordered
          size="small"
        />
        <Table
          className="cl-table"
          dataSource={data4}
          columns={columns4}
          pagination={false}
          rowKey={record => record.id}
          bordered
          size="small"
        />
        <Table
          className="cl-table"
          dataSource={data3}
          columns={columns3}
          pagination={false}
          rowKey={record => record.id}
          bordered
          size="small"
        />

      </div>
    );
  }

  render(data) {
    return (
      <QueueAnim className="animate-content">
        { this.renderBody()}
      </QueueAnim>
    );
  }
}
export default AmountBalance;



