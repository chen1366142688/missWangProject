import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import {CLComponent } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import CF from 'currency-formatter';
import _ from 'lodash';
import { Table,} from 'antd';
const { contentType, getinvisibility, accountBalance, queryPayoutAccountBalance, } = Interface;
class LendingProofread extends CLComponent {
  state = {
    tableLoading: false,
    data: [],
    data1: [],
    data2: [],
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'loadData',
      'loadData1',
      'loadData2',
    ]);
  }


  componentDidMount() {
    this.loadData();
    this.loadData1();
    this.loadData2();
  }

  loadData() {
    const that = this;
    that.setState({ tableLoading: true });

    const settings = {
      contentType,
      method: getinvisibility.type,
      url: getinvisibility.url,
    };

    function fn(res) {
      that.setState({ tableLoading: false });
        that.setState({
            data: res.data
        });
      }
    CL.clReqwest({ settings, fn });
  }

  loadData1() {
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
      data: JSON.stringify(params),
    };

    function fn(res) {
    if(res.data){
      that.setState({
        data1: res.data.fundAccountingAmount,
       });
      }
    }
    CL.clReqwest({ settings, fn });
  }
  loadData2() {
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
          data2: data,
        });
      }
    }
    CL.clReqwest({ settings, fn });
  }
  renderBody() {
    const that = this;
    const {data, data1, data2} = that.state;
  const lendingProo = {
    columns : [
      {
        title: '账户变更时间',
        dataIndex: 'lastPaymentRecordDate',
        width: '10%',
        render: function (index, record) {
          return moment(record.lastPaymentRecordDate).format('YYYY-MM-DD HH:mm:ss');
        },
      },
      {
        title: ' DP放款处理分界点',
        dataIndex: 'lastPaymentRecordTime',
        width: '10%',
        render: function (index, record) {
          return moment(record.lastPaymentRecordTime).format('YYYY-MM-DD HH:mm:ss');
        },
      },
      {
        title: 'Unipeso放款提前记录部分',
        children: [
          {
            title: '待匹配资金减少放款金额',
            dataIndex: 'waitMatchedAmount',
            key: 'waitMatchedAmount',
            width: '10%',
            render(index, record) {
              if (!record.waitMatchedAmount) {
                return '-'
              } else {
                return CL.cf(record.waitMatchedAmount, 2);
              }
            }
          },
          {
            title: '审核&账户服务费(收入)',
            dataIndex: 'auditServiceAndAccountManage',
            key: 'type',
            width: '10%',
            render(index, record) {
              if (!record.auditServiceAndAccountManage) {
                return '-'
              } else {
                return CL.cf(record.auditServiceAndAccountManage, 2);
              }
            }
          },
          {
            title: '转账手续费(收入)',
            dataIndex: 'transferFee',
            key: 'transferFee',
            width: '10%',
            render(index, record) {
              if (!record.transferFee) {
                return '-'
              } else {
                return CL.cf(record.transferFee, 2);
              }
            }
          },
          {
            title: '放款时转账手续费(费用)',
            dataIndex: 'dpPaymentFee',
            key: 'dpPaymentFee',
            width: '10%',
            render(index, record) {
              if (!record.dpPaymentFee) {
                return '-'
              } else {
                return CL.cf(record.dpPaymentFee, 2);
              }
            }
          },
          {
            title: '与DP未同步金额',
            dataIndex: 'invisibilityAmount',
            key: 'invisibilityAmount',
            width: '10%',
            render(index, record) {
              if (!record.invisibilityAmount) {
                return '-'
              } else {
                return CL.cf(record.invisibilityAmount, 2);
              }
            }
          },
        ],
      },
      {
        title: 'DP余额',
        dataIndex: 'dragonpayAccountBalance',
        key: 'dragonpayAccountBalance',
        width: '10%',
        render(index, record) {
            return CL.cf(record.dragonpayAccountBalance, 2);
        }
      },
      {
        title: 'Unipeso账户金额',
        dataIndex: 'accountingAmount',
        width: '10%',
        render(index, record) {
          if (!record.accountingAmount) {
            return '-'
          } else {
            return CL.cf(record.accountingAmount, 2);
          }
        }
      },
      {
        title: '偏差',
        dataIndex: 'deviation',
        render: function (index, record) {
          return CL.cf(record.deviation, 2);
        },
      },
    ],
    data: [{
      lastPaymentRecordDate: that.state.data.lastPaymentRecordDate,
      lastPaymentRecordTime: that.state.data.lastPaymentRecordTime,
      waitMatchedAmount: data.waitMatchedAmount,
      auditServiceAndAccountManage: data.auditServiceAndAccountManage,
      transferFee: data.transferFee,
      dpPaymentFee: data.dpPaymentFee,
      invisibilityAmount: data.invisibilityAmount,
      dragonpayAccountBalance: data2.dragonpayAccountBalance,
      accountingAmount: data1.accountingAmount,
      deviation: data1.accountingAmount + data.invisibilityAmount - data2.dragonpayAccountBalance,
    }]
  }

    return (
      <div className="business-monitors" key="business-monitors">
        <Table
          bordered
          className="user-info cl-table"
          pagination={false}
          columns={lendingProo.columns}
          rowKey={record => record.index}
          dataSource={lendingProo.data}
        />
      </div>
    );
  }

  render(data) {
    return (
      <QueueAnim className="animate-content">
        {this.renderBody()}
      </QueueAnim>
    );
  }
}
export default LendingProofread;
