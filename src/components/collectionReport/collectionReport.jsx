import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import tableexport from 'tableexport';

import { CLComponent } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import CF from 'currency-formatter';

import _ from 'lodash';
import { Button, Icon, Modal, Table, Row, Col, DatePicker } from 'antd';

const { Column, ColumnGroup } = Table;
const { RangePicker } = DatePicker;

const { contentType, collectionReport } = Interface;

function setPercent(number) {
  if (number === 1) {
    return '100%';
  }

  number = (number * 100).toFixed(2);
  return `${number}%`;
}

function addCount(a, b, fixed) {
  a = a ? parseFloat(a) : 0;
  b = b ? parseFloat(b) : 0;
  if (!fixed) {
    fixed = 0;
  }
  return parseFloat((a + b).toFixed(fixed));
}


class CollectionReport extends CLComponent {
  state = {
    overAll: [],
    normal: [],
    overdue: [],
    startCreatedTime: null,
    endCreatedTime: null,
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'loadData',
      'onChange',
      'onChange2',
      'onChange3',
      'query',
      'clear',
    ]);
  }

  onChange(e) {
    const that = this;

    if (e[0] && e[1]) {
      that.setState({
        startCreatedTime: e[0].format('YYYY-MM-DD'),
        endCreatedTime: e[1].format('YYYY-MM-DD'),

      });
    }
  }

  onChange2(e) {
    const that = this;

    if (e[0] && e[1]) {
      that.setState({
        startSRepaymentTime: e[0].format('YYYY-MM-DD'),
        endSRepaymentTime: e[1].format('YYYY-MM-DD'),

      });
    }
  }

  onChange3(e) {
    const that = this;

    if (e[0] && e[1]) {
      that.setState({
        startFRepaymentTime: e[0].format('YYYY-MM-DD'),
        endFRepaymentTime: e[1].format('YYYY-MM-DD'),
      });
    }
  }

  query() {
    const that = this;
    that.setState({
      overAll: [],
      normal: [],
      overdue: [],
    });

    that.loadData({
      startCreatedTime: that.state.startCreatedTime,
      endCreatedTime: that.state.endCreatedTime,
      startSRepaymentTime: that.state.startSRepaymentTime,
      endSRepaymentTime: that.state.endSRepaymentTime,
      startFRepaymentTime: that.state.startFRepaymentTime,
      endFRepaymentTime: that.state.endFRepaymentTime,
    });
  }

  clear() {
    const that = this;
    that.setState({
      startCreatedTime: null,
      endCreatedTime: null,
      startSRepaymentTime: null,
      endSRepaymentTime: null,
      startFRepaymentTime: null,
      endFRepaymentTime: null,
    });
  }


  componentDidMount() {
    this.loadData();
  }

  loadData(search) {
    const that = this;
    if (!search) {
      search = {};
    }

    const settings = {
      contentType,
      method: collectionReport.statisticsOverAll.type,
      url: collectionReport.statisticsOverAll.url,
      data: JSON.stringify(search),
    };

    function fn(res) {
      if (res.data) {
        const data = res.data;
        that.setState({
          overAll: [
            {
              key: 'disbrustment amount',
              count: CF.format(data.sumOfOverduePrincipal, {}),
            },
            {
              key: 'number of disbrusment',
              count: data.numberOfCount,
            },
          ],
        });
      }
    }

    const settings2 = {
      contentType,
      method: collectionReport.statisticsNormal.type,
      url: collectionReport.statisticsNormal.url,
      data: JSON.stringify(search),
    };

    function fn2(res) {
      if (res.data) {
        const data = res.data;
        CL.clReqwest({ settings: settings3, fn: fn3 });

        const normal = [
          {
            key: '1',
            termDay: '7 days',
            numberOfCount: data.normal7days.numberOfCount,
            sumOfOverduePrincipal: CF.format(data.normal7days.sumOfOverduePrincipal, {}),
            cNumberOfCount: data.normalClosed7days.numberOfCount,
            cSumOfOverduePrincipal: CF.format(data.normalClosed7days.sumOfOverduePrincipal, {}),
            repaymentedCountProportion: setPercent(data.repaymented7CountProportion),
            repaymentedPrincipalProportion: setPercent(data.repaymented7PrincipalProportion),
          },
          {
            key: '2',
            termDay: '14 days',
            numberOfCount: data.normal14days.numberOfCount,
            sumOfOverduePrincipal: CF.format(data.normal14days.sumOfOverduePrincipal, {}),
            cNumberOfCount: data.normalClosed14days.numberOfCount,
            cSumOfOverduePrincipal: CF.format(data.normalClosed14days.sumOfOverduePrincipal, {}),
            repaymentedCountProportion: setPercent(data.repaymented14CountProportion),
            repaymentedPrincipalProportion: setPercent(data.repaymented14PrincipalProportion),
          },
          {
            key: '3',
            termDay: 'Sub total',
            numberOfCount: addCount(data.normal14days.numberOfCount, data.normal7days.numberOfCount),
            sumOfOverduePrincipal: CF.format(addCount(data.normal14days.sumOfOverduePrincipal, data.normal7days.sumOfOverduePrincipal), {}),
            cNumberOfCount: addCount(data.normalClosed14days.numberOfCount, data.normalClosed7days.numberOfCount),
            cSumOfOverduePrincipal: CF.format(addCount(data.normalClosed14days.sumOfOverduePrincipal, data.normalClosed7days.sumOfOverduePrincipal), {}),
            repaymentedCountProportion: setPercent(data.repaymentedTotalCountProportion),
            repaymentedPrincipalProportion: setPercent(data.repaymentedTotalPrincipalProportion),
          },
        ];

        _.each(normal, (doc, index) => {
          doc = _.map(doc, (item, key) => {
            if (!item) {
              doc[key] = 0;
            }
          });
        });

        that.setState({
          normal: normal,
        });
      }
    }

    const settings3 = {
      contentType,
      method: collectionReport.statisticsOverdue.type,
      url: collectionReport.statisticsOverdue.url,
      data: JSON.stringify(search),
    };

    function fn3(res) {
      if (res.data) {
        const data = res.data;
        const {
          overdueClosedLess7,
          delinquentLess7,
          countRecoveryLess7,
          principalRecoveryLess7,
          partialPaymentLess7,

          delinquent714,
          overdueClosed714,
          countRecovery714,
          principalRecovery714,
          partialPayment714,


          delinquent1430,
          overdueClosed1430,
          countRecovery1430,
          principalRecovery1430,
          partialPayment1430,

          delinquent3045,
          overdueClosed3045,
          countRecovery3045,
          principalRecovery3045,
          partialPayment3045,

          delinquent4560,
          overdueClosed4560,
          countRecovery4560,
          principalRecovery4560,
          partialPayment4560,

          delinquent6090,
          overdueClosed6090,
          countRecovery6090,
          principalRecovery6090,
          partialPayment6090,

          delinquentMore90,
          overdueClosedMore90,
          countRecoveryMore90,
          principalRecoveryMore90,
          partialPaymentMore90,

        } = data;

        const overdue = [
          {
            key: '1',
            termDay: '<= 7 days',
            numberOfCount: delinquentLess7.numberOfCount,
            sumOfOverduePrincipal: CF.format(delinquentLess7.sumOfOverduePrincipal, {}),
            sumOfOverdueAmount: CF.format(addCount(delinquentLess7.sumOfOverduePrincipal, delinquentLess7.sumOfOverdueInterest), {}),
            amount1: CF.format(delinquentLess7.sumOfOverdueAmount, {}),

            oNumberOfCount: overdueClosedLess7.numberOfCount,
            oSumOfOverduePrincipal: CF.format(overdueClosedLess7.sumOfOverduePrincipal, {}),
            oInterest: CF.format(overdueClosedLess7.sumOfOverdueInterest, {}),
            oSumOfOverdueDelayTax: CF.format(overdueClosedLess7.sumOfOverdueDelayTax, {}),
            oSumOfOverduePayment: CF.format(overdueClosedLess7.sumOfOverduePayment, {}),
            total: CF.format(addCount(overdueClosedLess7.sumOfOverduePrincipal, addCount(overdueClosedLess7.sumOfOverdueInterest, addCount(overdueClosedLess7.sumOfOverduePayment, overdueClosedLess7.sumOfOverdueDelayTax))), {}),

            repaymentedCountProportion: setPercent(countRecoveryLess7),
            repaymentedPrincipalProportion: setPercent(principalRecoveryLess7),

            pAccount: partialPaymentLess7.numberOfCount,
            pAmount: CF.format(partialPaymentLess7.sumOfAlreadyRepaymentAmount, {}),
          },
          {
            key: '2',
            termDay: '7~14 days',
            numberOfCount: delinquent714.numberOfCount,
            sumOfOverduePrincipal: CF.format(delinquent714.sumOfOverduePrincipal, {}),
            sumOfOverdueAmount: CF.format(addCount(delinquent714.sumOfOverduePrincipal, delinquent714.sumOfOverdueInterest), {}),
            amount1: CF.format(delinquent714.sumOfOverdueAmount, {}),

            oNumberOfCount: overdueClosed714.numberOfCount,
            oSumOfOverduePrincipal: CF.format(overdueClosed714.sumOfOverduePrincipal, {}),
            oInterest: CF.format(overdueClosed714.sumOfOverdueInterest, {}),
            oSumOfOverdueDelayTax: CF.format(overdueClosed714.sumOfOverdueDelayTax, {}),
            oSumOfOverduePayment: CF.format(overdueClosed714.sumOfOverduePayment, {}),
            total: CF.format(addCount(overdueClosed714.sumOfOverduePrincipal, addCount(overdueClosed714.sumOfOverdueInterest, addCount(overdueClosed714.sumOfOverduePayment, overdueClosed714.sumOfOverdueDelayTax))), {}),
            repaymentedCountProportion: setPercent(countRecovery714),
            repaymentedPrincipalProportion: setPercent(principalRecovery714),

            pAccount: partialPayment714.numberOfCount,
            pAmount: CF.format(partialPayment714.sumOfAlreadyRepaymentAmount, {}),
          },
          {
            key: '3',
            termDay: '14~30 days',
            numberOfCount: delinquent1430.numberOfCount,
            sumOfOverduePrincipal: CF.format(delinquent1430.sumOfOverduePrincipal, {}),
            sumOfOverdueAmount: CF.format(addCount(delinquent1430.sumOfOverduePrincipal, delinquent1430.sumOfOverdueInterest), {}),
            amount1: CF.format(delinquent1430.sumOfOverdueAmount, {}),

            oNumberOfCount: overdueClosed1430.numberOfCount,
            oSumOfOverduePrincipal: CF.format(overdueClosed1430.sumOfOverduePrincipal, {}),
            oInterest: CF.format(overdueClosed1430.sumOfOverdueInterest, {}),
            oSumOfOverdueDelayTax: CF.format(overdueClosed1430.sumOfOverdueDelayTax, {}),
            oSumOfOverduePayment: CF.format(overdueClosed1430.sumOfOverduePayment, {}),
            total: CF.format(addCount(overdueClosed1430.sumOfOverduePrincipal, addCount(overdueClosed1430.sumOfOverdueInterest, addCount(overdueClosed1430.sumOfOverduePayment, overdueClosed1430.sumOfOverdueDelayTax))), {}),

            repaymentedCountProportion: setPercent(countRecovery1430),
            repaymentedPrincipalProportion: setPercent(principalRecovery1430),

            pAccount: partialPayment1430.numberOfCount,
            pAmount: CF.format(partialPayment1430.sumOfAlreadyRepaymentAmount, {}),
          },

          {
            key: '4',
            termDay: '30~45 days',
            numberOfCount: delinquent3045.numberOfCount,
            sumOfOverduePrincipal: CF.format(delinquent3045.sumOfOverduePrincipal, {}),
            sumOfOverdueAmount: CF.format(addCount(delinquent3045.sumOfOverduePrincipal, delinquent3045.sumOfOverdueInterest), {}),
            amount1: CF.format(delinquent3045.sumOfOverdueAmount, {}),

            oNumberOfCount: overdueClosed3045.numberOfCount,
            oSumOfOverduePrincipal: CF.format(overdueClosed3045.sumOfOverduePrincipal, {}),
            oInterest: CF.format(overdueClosed3045.sumOfOverdueInterest, {}),
            oSumOfOverdueDelayTax: CF.format(overdueClosed3045.sumOfOverdueDelayTax, {}),
            oSumOfOverduePayment: CF.format(overdueClosed3045.sumOfOverduePayment, {}),
            total: CF.format(addCount(overdueClosed3045.sumOfOverduePrincipal, addCount(overdueClosed3045.sumOfOverdueInterest, addCount(overdueClosed3045.sumOfOverduePayment, overdueClosed3045.sumOfOverdueDelayTax))), {}),

            repaymentedCountProportion: setPercent(countRecovery3045),
            repaymentedPrincipalProportion: setPercent(principalRecovery3045),

            pAccount: partialPayment3045.numberOfCount,
            pAmount: CF.format(partialPayment3045.sumOfAlreadyRepaymentAmount, {}),
          },

          {
            key: '5',
            termDay: '45~60 days',
            numberOfCount: delinquent4560.numberOfCount,
            sumOfOverduePrincipal: CF.format(delinquent4560.sumOfOverduePrincipal, {}),
            sumOfOverdueAmount: CF.format(addCount(delinquent4560.sumOfOverduePrincipal, delinquent4560.sumOfOverdueInterest), {}),
            amount1: CF.format(delinquent4560.sumOfOverdueAmount, {}),

            oNumberOfCount: overdueClosed4560.numberOfCount,
            oSumOfOverduePrincipal: CF.format(overdueClosed4560.sumOfOverduePrincipal, {}),
            oInterest: CF.format(overdueClosed4560.sumOfOverdueInterest, {}),
            oSumOfOverdueDelayTax: CF.format(overdueClosed4560.sumOfOverdueDelayTax, {}),
            oSumOfOverduePayment: CF.format(overdueClosed4560.sumOfOverduePayment, {}),
            total: CF.format(addCount(overdueClosed4560.sumOfOverduePrincipal, addCount(overdueClosed4560.sumOfOverdueInterest, addCount(overdueClosed4560.sumOfOverduePayment, overdueClosed4560.sumOfOverdueDelayTax))), {}),

            repaymentedCountProportion: setPercent(countRecovery4560),
            repaymentedPrincipalProportion: setPercent(principalRecovery4560),

            pAccount: partialPayment4560.numberOfCount,
            pAmount: CF.format(partialPayment4560.sumOfAlreadyRepaymentAmount, {}),
          },

          {
            key: '6',
            termDay: '60~90days',
            numberOfCount: delinquent6090.numberOfCount,
            sumOfOverduePrincipal: CF.format(delinquent6090.sumOfOverduePrincipal, {}),
            sumOfOverdueAmount: CF.format(addCount(delinquent6090.sumOfOverduePrincipal, delinquent6090.sumOfOverdueInterest), {}),
            amount1: CF.format(delinquent6090.sumOfOverdueAmount, {}),

            oNumberOfCount: overdueClosed6090.numberOfCount,
            oSumOfOverduePrincipal: CF.format(overdueClosed6090.sumOfOverduePrincipal, {}),
            oInterest: CF.format(overdueClosed6090.sumOfOverdueInterest, {}),
            oSumOfOverdueDelayTax: CF.format(overdueClosed6090.sumOfOverdueDelayTax, {}),
            oSumOfOverduePayment: CF.format(overdueClosed6090.sumOfOverduePayment, {}),
            total: CF.format(addCount(overdueClosed6090.sumOfOverduePrincipal, addCount(overdueClosed6090.sumOfOverdueInterest, addCount(overdueClosed6090.sumOfOverduePayment, overdueClosed6090.sumOfOverdueDelayTax))), {}),

            repaymentedCountProportion: setPercent(countRecovery6090),
            repaymentedPrincipalProportion: setPercent(principalRecovery6090),

            pAccount: partialPayment6090.numberOfCount,
            pAmount: CF.format(partialPayment6090.sumOfAlreadyRepaymentAmount, {}),
          },

          {
            key: '7',
            termDay: '> 90 days',
            numberOfCount: delinquentMore90.numberOfCount,
            sumOfOverduePrincipal: CF.format(delinquentMore90.sumOfOverduePrincipal, {}),
            sumOfOverdueAmount: CF.format(addCount(delinquentMore90.sumOfOverduePrincipal, delinquentMore90.sumOfOverdueInterest), {}),
            amount1: CF.format(delinquentMore90.sumOfOverdueAmount, {}),

            oNumberOfCount: overdueClosedMore90.numberOfCount,
            oSumOfOverduePrincipal: CF.format(overdueClosedMore90.sumOfOverduePrincipal, {}),
            oInterest: CF.format(overdueClosedMore90.sumOfOverdueInterest, {}),
            oSumOfOverdueDelayTax: CF.format(overdueClosedMore90.sumOfOverdueDelayTax, {}),
            oSumOfOverduePayment: CF.format(overdueClosedMore90.sumOfOverduePayment, {}),
            total: CF.format(addCount(overdueClosedMore90.sumOfOverduePrincipal, addCount(overdueClosedMore90.sumOfOverdueInterest, addCount(overdueClosedMore90.sumOfOverduePayment, overdueClosedMore90.sumOfOverdueDelayTax))), {}),

            repaymentedCountProportion: setPercent(countRecoveryMore90),
            repaymentedPrincipalProportion: setPercent(principalRecoveryMore90),

            pAccount: partialPaymentMore90.numberOfCount,
            pAmount: CF.format(partialPaymentMore90.sumOfAlreadyRepaymentAmount, {}),
          },
        ];


        // 计算total
        const total = {
          key: '4',
          numberOfCount: 0,
          sumOfOverduePrincipal: 0,
          sumOfOverdueAmount: 0,
          amount1: 0,
          oNumberOfCount: 0,
          oSumOfOverduePrincipal: 0,
          oInterest: 0,
          oSumOfOverdueDelayTax: 0,
          oSumOfOverduePayment: 0,
          total: 0,
          repaymentedCountProportion: 0,
          repaymentedPrincipalProportion: 0,
          pAccount: 0,
          pAmount: 0,
        };

        _.each(overdue, (doc, index) => {
          doc = _.map(doc, (item, key) => {
            if (!item) {
              doc[key] = 0;
            }
            total[key] += parseFloat(item) || 0;
          });
        });



        // 逾期回收率=逾期已还/(逾期已还+逾期未还)
        total.repaymentedCountProportion = `${((total.oNumberOfCount / (total.oNumberOfCount + total.numberOfCount)) * 100).toFixed(2)}%`;
        total.repaymentedPrincipalProportion = `${((total.oSumOfOverduePrincipal / (total.oSumOfOverduePrincipal + total.sumOfOverduePrincipal)) * 100).toFixed(2)}%`;
        total.termDay = 'Sub total';



        const total1 = that.state.normal[2] || {};

        const rate = (total.oSumOfOverduePrincipal + parseFloat(total1.cSumOfOverduePrincipal)) / (parseFloat(total1.sumOfOverduePrincipal) + total.sumOfOverduePrincipal + total.oSumOfOverduePrincipal + parseFloat(total1.cSumOfOverduePrincipal));
        const Gtotal = {
          key: '15',
          termDay: 'G.Total',
          numberOfCount: total1.numberOfCount + total.numberOfCount,
          sumOfOverduePrincipal: CF.format(total1.sumOfOverduePrincipal + total.sumOfOverduePrincipal, {}),
          sumOfOverdueAmount: null,
          amount1: null,
          oNumberOfCount: null,
          oSumOfOverduePrincipal: total.oSumOfOverduePrincipal + total1.cSumOfOverduePrincipal,
          oInterest: null,
          oSumOfOverdueDelayTax: `${(rate * 100).toFixed(2)}%`,
          oSumOfOverduePayment: null,
          total: null,
          repaymentedCountProportion: null,
          repaymentedPrincipalProportion: null,
          pAccount: null,
          pAmount: null,
        };

        total.sumOfOverduePrincipal = CF.format(total.sumOfOverduePrincipal, {});
        total.sumOfOverdueAmount = CF.format(total.sumOfOverdueAmount, {});
        total.amount1 = CF.format(total.amount1, {});
        total.oSumOfOverduePrincipal = CF.format(total.oSumOfOverduePrincipal, {});
        total.oInterest = CF.format(total.oInterest, {});
        total.oSumOfOverdueDelayTax = CF.format(total.oSumOfOverdueDelayTax, {});
        total.oSumOfOverduePayment = CF.format(total.oSumOfOverduePayment, {});
        total.total = CF.format(total.total, {});
        total.pAmount = CF.format(total.pAmount, {});
        overdue.push(total);
        overdue.push(Gtotal);

        that.setState({
          overdue: overdue,
        });
      }
    }

    CL.clReqwest({ settings, fn });
    CL.clReqwest({ settings: settings2, fn: fn2 });
  }


  renderBody() {
    const that = this;

    const columns1 = [
      {
        title: 'Overall',
        dataIndex: 'key',
        colSpan: 2,
        render: (value, row, index) => {
          const obj = {
            children: value,
            props: {
              rowSpan: 1,
            },
          };
          return obj;
        },
      },
      {
        title: 'Count',
        dataIndex: 'count',
        colSpan: 0,
      },
    ];
    const {
      startCreatedTime, endCreatedTime, startSRepaymentTime, endSRepaymentTime, startFRepaymentTime, endFRepaymentTime,
    } = that.state;
    return (
      <div className="credit-report" key="credit-collection">
        <Row className="table-wrap">
          <Col span={3}>
            Create Time:
          </Col>
          <Col span={6}>
            <RangePicker
              showTime
              format="YYYY/MM/DD"
              onChange={that.onChange}
              allowClear
              value={[
                !startCreatedTime ? null : moment(new Date(startCreatedTime)),
                !endCreatedTime ? null : moment(new Date(endCreatedTime)),
              ]}
            />
          </Col>
        </Row>
        <Row className="table-wrap">
          <Col span={3}>
            Repayment Due Time:
          </Col>
          <Col span={6}>
            <RangePicker
              showTime
              format="YYYY/MM/DD"
              onChange={that.onChange2}
              allowClear
              value={[
                !startSRepaymentTime ? null : moment(new Date(startSRepaymentTime)),
                !endSRepaymentTime ? null : moment(new Date(endSRepaymentTime)),
              ]}
            />
          </Col>
        </Row>
        <Row className="table-wrap">
          <Col span={3}>
            Repayment Time:
          </Col>
          <Col span={6}>
            <RangePicker
              showTime
              format="YYYY/MM/DD"
              onChange={that.onChange3}
              allowClear
              value={[
                !startFRepaymentTime ? null : moment(new Date(startFRepaymentTime)),
                !endFRepaymentTime ? null : moment(new Date(endFRepaymentTime)),
              ]}
            />
          </Col>
        </Row>
        <Row className="table-wrap">
          <Col span={2} offset={6}>
            <Button type="primary" onClick={that.query}>search</Button>
          </Col>
          <Col span={2}>
            <Button onClick={that.clear}>clear</Button>
          </Col>
        </Row>

        <Row className="table-wrap">
          <Col span={12}>
            <Table
              columns={columns1}
              dataSource={that.state.overAll}
              pagination={false}
              bordered
              loading={!that.state.overAll.length}
            />
          </Col>
        </Row>

        <Row className="table-wrap">
          <Col span={18}>
            <Table
              dataSource={that.state.normal}
              pagination={false}
              bordered
              loading={!that.state.normal}
            >
              <Column
                title="Term Day"
                dataIndex="termDay"
                key="termDay"
              />

              <ColumnGroup title="Normal Account for Collection">
                <Column
                  title="#. Of Accounts"
                  dataIndex="numberOfCount"
                  key="numberOfCount"
                />
                <Column
                  title="Principal"
                  dataIndex="sumOfOverduePrincipal"
                  key="sumOfOverduePrincipal"
                />
              </ColumnGroup>
              <ColumnGroup title="Normal Account Closed">
                <Column
                  title="#. Of Accounts"
                  dataIndex="cNumberOfCount"
                  key="cNumberOfCount"
                />
                <Column
                  title="Principal"
                  dataIndex="cSumOfOverduePrincipal"
                  key="cSumOfOverduePrincipal"
                />
              </ColumnGroup>
              <ColumnGroup title="Rate">
                <Column
                  title="#.A"
                  dataIndex="repaymentedCountProportion"
                  key="repaymentedCountProportion"
                />
                <Column
                  title="P"
                  dataIndex="repaymentedPrincipalProportion"
                  key="repaymentedPrincipalProportion"
                />
              </ColumnGroup>
            </Table>
          </Col>
        </Row>

        <Row className="table-wrap">
          <Col span={24}>
            <Table
              dataSource={that.state.overdue}
              pagination={false}
              bordered
              loading={!that.state.overdue}
            >
              <Column
                title="#. Of Days Due"
                dataIndex="termDay"
                key="termDay"
                width="8%"
              />

              <ColumnGroup title="Overdue Account for Collection">
                <Column
                  title="#. Of Accounts"
                  dataIndex="numberOfCount"
                  key="numberOfCount"
                  width="5%"
                />
                <Column
                  title="Principal"
                  dataIndex="sumOfOverduePrincipal"
                  key="sumOfOverduePrincipal"
                />
                <Column
                  title="Principal + Interest"
                  dataIndex="sumOfOverdueAmount"
                  key="sumOfOverdueAmount"
                  width="6%"
                />
                <Column
                  title="Amount（Default interest、Penalty included）"
                  dataIndex="amount1"
                  key="amount1"
                  width="7%"
                />
              </ColumnGroup>
              <ColumnGroup title="Overdue Account Closed-Payment Breakdown">
                <Column
                  title="#. Of Accounts"
                  dataIndex="oNumberOfCount"
                  key="oNumberOfCount"
                  width="5%"
                />
                <Column
                  title="Principal "
                  dataIndex="oSumOfOverduePrincipal"
                  key="oSumOfOverduePrincipal"
                />
                <Column
                  title="Interest"
                  dataIndex="oInterest"
                  key="oInterest"
                />
                <Column
                  title="Late Payment fee"
                  dataIndex="oSumOfOverdueDelayTax"
                  key="oSumOfOverdueDelayTax"
                />
                <Column
                  title="Overdue Fee"
                  dataIndex="oSumOfOverduePayment"
                  key="oSumOfOverduePayment"
                />
                <Column
                  title="Total"
                  dataIndex="total"
                  key="total"
                />

              </ColumnGroup>
              <ColumnGroup title="Rate">
                <Column
                  title="#.A"
                  dataIndex="repaymentedCountProportion"
                  key="repaymentedCountProportion"
                />
                <Column
                  title="P"
                  dataIndex="repaymentedPrincipalProportion"
                  key="repaymentedPrincipalProportion"
                />
              </ColumnGroup>

              <ColumnGroup title="Partial Payment Collected">
                <Column
                  title="#. Of Accounts"
                  dataIndex="pAccount"
                  key="pAccount"
                  width="5%"
                />
                <Column
                  title="Amount"
                  dataIndex="pAmount"
                  key="pAmount"
                />
              </ColumnGroup>
            </Table>
          </Col>
        </Row>

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
export default CollectionReport;
