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
import tableexport from 'tableexport';

const { TextArea } = Input;
const { TabPane } = Tabs;
const confirm = Modal.confirm;
const FormItem = Form.Item;
const Option = Select.Option;


const {
  contentType, fundInverstList, fundInverstDetails,
  inputFundInvest, modifyFundInvestDesc, calculateInvestFund,
  withdrawInvestFund,
} = Interface;

class InvestManagement extends CLComponent {
  state = {
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1,
    },
    expandedRowKeys: [],
    fromData: {},
    sorter: {
      sortFieldType: 2,
      sortType: 1,
    },
    search: {},
    formBtnLoading: false,
    withdraw: false,
    typeList: [
      {name:'Income',value: 1},
      {name:'Expense',value: 2},
    ],
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'pageChage',
      'loadData',
      'getFormFields',
      'renderBody',
      'toggleDetails',
      'toggleInput',
      'saveInput',
      'showConfirm',
      'setCashMoney',
      'showModal',
      'hideModal',
      'setDescMessage',
      'loadDetailList',
      'getFields',
      'submitData',
      'resetBtn',
    ]);
  }

  componentDidMount() {
    // 搜索条件
    const sessionSearch = sessionStorage.getItem('search');
    let search = this.state.search;
    if (sessionSearch) {
      search = JSON.parse(sessionSearch);
    }

    // 分页
    const sessionPagination = sessionStorage.getItem('pagination');
    let pagination = this.state.pagination;
    if (sessionPagination) {
      pagination = JSON.parse(sessionPagination);
    }

    // 排序
    const sessionSorter = sessionStorage.getItem('sorter');
    let sorter = this.state.sorter;
    if (sessionSorter && sessionSorter !== 'undefined') {
      sorter = JSON.parse(sessionSorter);
    }

    this.loadData(search, pagination, sorter);
    this.setState({ search: search, pagination: pagination });
  }

  loadData(search, page, sorter) {
    const that = this;
    const settings = {
      contentType,
      method: fundInverstList.type,
      url: fundInverstList.url,
      data: JSON.stringify({
        page: {
          currentPage: page.currentPage || 1,
          pageSize: page.pageSize || 10,
        },
        financialFunds: {
          ...search,
        },
      }),
    };

    function fn(res) {
      if (res.data) {
        const data = res.data;
        const pagination = {
          total: data.page.totalCount,
          pageSize: page.pageSize,
          currentPage: page.currentPage,
        };
        // 保存当前的搜索条件 以及分页
        sessionStorage.setItem('pagination', JSON.stringify(pagination));
        sessionStorage.setItem('search', JSON.stringify(search));
        sessionStorage.setItem('sorter', JSON.stringify(sorter));
        that.setState({
          data: (res.data.page.result || []).map((item, index) => {
            item.index = index + 1;
            return item;
          }) || [],
          IBC: CL.setOptions(data.interestBearingCurrency || [{ typeName: 'test', type: '1' }]),
          IRM: CL.setOptions(data.interestRateMethod || [{ typeName: 'testw', type: '2' }]),
          statusList: data.financialFundsStatus,
          pagination,
        });
      }
    }
    CL.clReqwest({ settings, fn });
  }

  getFormFields(fields) {
    const search = {};
    _.map(fields, (doc, index) => {
      if (doc) {
        if (index === 'startTime' || index === 'endTime') { // 判断为时间对象
          search[index] = new Date(doc.format('YYYY-MM-DD HH:mm')).getTime();
        } else {
          search[index] = doc;
        }
      }
    });
    const pagination = this.state.pagination;
    pagination.currentPage = 1;
    this.setState({ search, pagination, expandedRowKeys: [] });
    this.loadData(search, pagination, this.state.sorter);
  }

  pageChage(e) { // list 切换页面
    const pagination = {
      currentPage: e.current,
      pageSize: e.pageSize,
      total: this.state.pagination.total,
    };
    this.setState({ pagination: pagination });
    this.loadData(this.state.search, pagination, this.state.sorter);
  }

  toggleDetails(record, type) {
    let expandedRowKeys = this.state.expandedRowKeys;
    const flag = _.indexOf(expandedRowKeys, record.id) > -1;
    if (flag && !type) {
      expandedRowKeys = _.without(expandedRowKeys, record.id);
    } else {
      this.loadDetailList(record.id);
      expandedRowKeys.push(record.id);
    }

    this.setState({ expandedRowKeys });
  }

  getFields(data, thats) {
    _.each(data, (doc, index) => {
      if (index === 'startTime') {
        data[index] = new Date(data[index].format('YYYY-MM-DD HH:mm:ss')).getTime();
      }
    });
    this.submitData(data, thats);
  }

  submitData(data, thats) {
    const that = this;
    that.setState({ formBtnLoading: true });
    const settings = {
      contentType,
      method: inputFundInvest.type,
      url: inputFundInvest.url,
      data: JSON.stringify({
        financialFunds: data,
      }),
    };

    function fn(res) {
      if (res && res.data) {
        console.log(res.data);
        thats.handleReset();
        message.success('Save success');
        that.loadData(that.state.search, that.state.pagination, that.state.sorter);
        that.hideModal(undefined, 'registerModal');
        that.setState({
          formBtnLoading: false,
        });
      }
    }

    CL.clReqwest({ settings, fn });
  }



  loadDetailList(id) {
    const that = this;
    let { data, expandedRowKeys } = that.state;
    const settings = {
      contentType,
      method: fundInverstDetails.type,
      url: fundInverstDetails.url,
      data: JSON.stringify({
        financialIncomeDetail: {
          finacialFundsId: id,
        },
      }),
    };

    function fn(res) {
      if (res.data) {
        data = _.map(data, (item) => {
          if (item.id === id) {
            item.child = res.data.financialIncomeDetailList;
          }
          return item;
        });

        that.setState({
          data,
          withdrawStateList: res.data.financialFundsWithdrawState
        });
      }
    }

    CL.clReqwest({ settings, fn });
  }

  showModal(e, record, type) {
    this.setState({
      [type]: true,
      current: record,
    });
  }

  hideModal(record, type) {
    this.setState({ [type]: false });
  }

  toggleInput(doc, flag) {
    const data = _.map(this.state.data, (item) => {
      if (doc.id === item.id) {
        item.saveOper = flag;
      }
      return item;
    });
    this.setState({ data });
  }

  resetBtn(doc) {
    const data = _.map(this.state.data, (item) => {
      if (doc.id === item.id) {
        item.applyOper = false;
        item.saveOper = false;
      }
      return item;
    });
    this.setState({ data });

    this.toggleDetails(doc, true);
  }

  handleOk(type) {
    const that = this;
    let settings;
    let fn;
    const { current, descMessage } = that.state;

    if (type === 'saveMessage') {
      settings = {
        contentType,
        method: modifyFundInvestDesc.type,
        url: modifyFundInvestDesc.url,
        data: JSON.stringify({
          financialFunds: {
            id: current.id,
            description: descMessage,
          },
        }),
      };

      fn = function (res) {
        if (res && res.data) {
          that.loadData(that.state.search, that.state.pagination, that.state.sorter);
          that.setState({
            descModal: false,
            descMessage: '',
          });

          message.success('save success');
        }
      };

      CL.clReqwest({ settings, fn });
    }
  }

  saveInput(doc) { // 保存数据，并显示新的data
    const that = this;
    this.toggleDetails(doc, true); // 展开详情
    let { data, cashMoney } = that.state;

    if (!cashMoney) {
      message.error('the money must bigger than 0');
      return;
    }

    const settings = {
      contentType,
      method: calculateInvestFund.type,
      url: calculateInvestFund.url,
      data: JSON.stringify({
        financialFunds: {
          id: doc.id,
          toBeWithDrawAmount: cashMoney,
        },
      }),
    };


    function fn(res) {
      if (res && res.data) {
        if (!res.data.financialIncomeDetailList) {
          message.error(res.data.errorMsg);
        } else {
          data = _.map(data, (item) => {
            if (item.id === doc.id) {
              item.child = res.data.financialIncomeDetailList;
              item.saveOper = false;
              item.applyOper = true;
            }
            return item;
          });
          that.setState({ data });
        }
      }
    }

    CL.clReqwest({ settings, fn });
  }

  withdrawSave = () => {
    const that = this;
        const { cashMoney } = that.state;
        confirm({
          title: 'Do you Want to withdraw amount?',
          content: 'sure to withdraw amount',
          onOk() {
            const settings = {
              contentType,
              method: withdrawInvestFund.type,
              url: withdrawInvestFund.url,
              data: JSON.stringify({
                financialFunds: {
                  id: that.state.mid,
                  toBeWithDrawAmount: cashMoney,
                  inputTime: that.state.inputTime,
                },
              }),
            };

            function fn(res) {
              if (res.code == 200) {
                that.setState({ withdraw:false, expandedRowKeys: [],});
                that.loadData(that.state.search, that.state.pagination, that.state.sorter);
              } else {
                message.error('Apply error');
              }
            }

            CL.clReqwest({ settings, fn });
          },
          onCancel() {
            console.log('Cancel');
          },
      });
  }
  dateChange = (e) => {
    this.setState({
      inputTime: new Date(e.format('YYYY-MM-DD HH:mm:ss')).getTime() || moment(new Date()).format('YYYY-MM-DD HH:mm:ss').getTime(),
    });
    console.log(this.state.inputTime);
  }

  showConfirm(e, target, record) {
    this.setState({withdraw: true, mid: record.id});
  }
  setCashMoney(e) {
    this.setState({
      cashMoney: e,
    });
  }

  setDescMessage(e) {
    this.setState({
      descMessage: e.target.value,
    });
  }

  hideModalwithdraw = () => {
    this.setState({withdraw: false});
  }

  renderBody() {
    const that = this;
    const { data, IBC = {}, IRM = {} } = that.state;
    console.log('that.state.expandedRowKeys-->', that.state.expandedRowKeys);
    const editStyle = {
      display: 'block',
      position: 'absolute',
      right: '0px',
      fontSize: '22px',
      top: '0px',
      color: '#108ee9',
      cursor: 'pointer',
    };
    const remarkStyle = {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
      width: '60px',
    };


    const columns = [
      {
        title: 'Index',
        dataIndex: 'index',
        width: '4%',
      },
      {
        title: 'Channels',
        dataIndex: 'channelsName',
        width: '5%',
      },
      {
        title: 'Amount',
        dataIndex: 'contractAmount',
        width: '5%',
        render(index, data) {
          return CF.format(data.contractAmount, {});
        },
      },

      {
        title: 'Amount(PHP)',
        dataIndex: 'amount',
        width: '6%',
        render(index, data) {
          return CF.format(data.amount, {});
        },
      },

      {
        title: 'Interest Computation Currency(ICC)',
        dataIndex: 'interestBearingCurrency',
        width: '5%',
        render(index, record) {
          return (_.find(IBC, { value: record.interestBearingCurrency }) || {}).name;
        },
      },

      {
        title: 'Exchange Rate(ICC/PHP)',
        dataIndex: 'inputExchangeRate',
        width: '5%',
        render(index, record) {
          if (record.inputExchangeRate) {
            return record.inputExchangeRate;
          }
          return '—';
        },
      },

      {
        title: 'Term',
        dataIndex: 'period',
        width: '3%',
      },
      {
        title: 'Yield Rate',
        dataIndex: 'incomeRate',
        width: '4%',
        render(index, record) {
          return `${record.incomeRate}`;
        },
      },
      {
        title: 'Interest Computation Method',
        dataIndex: 'interestRateMethod',
        width: '8%',
        render(index, record) {
          return (_.find(IRM, { value: record.interestRateMethod }) || {}).name;
        },
      },

      {
        title: 'Total Amount Due(ICC)',
        dataIndex: 'sumOfPrincipalAndIncomeContract',
        width: '7%',
        render(index, data) {
          return CF.format(data.sumOfPrincipalAndIncomeContract, {});
        },
      },

      {
        title: 'Total Amount Due(PHP)',
        dataIndex: 'sumOfPrincipalAndIncome',
        width: '7%',
        render(index, data) {
          return CF.format(data.sumOfPrincipalAndIncome, {});
        },
      },

      {
        title: 'Start Time',
        dataIndex: 'startTime',
        width: '6%',
        render(index, record) {
          if (record.startTime) {
            return moment(record.startTime).format('YYYY-MM-DD');
          }
          return '—';
        },
      },
      {
        title: 'End Time',
        dataIndex: 'endTime',
        width: '6%',
        render(index, record) {
          if (record.startTime) {
            return moment(record.startTime).add(record.period, 'month').format('YYYY-MM-DD');
          }
          return '—';
        },
      },
      {
        title: 'Status',
        dataIndex: 'status',
        width: '4%',
        render(index, record) {
            var statusItem = _.find(that.state.statusList, item => {
              return item.type == record.status;
            })
          return statusItem.typeName || "—";
        },
      },
      {
        title: 'Presented Details',
        dataIndex: 'details',
        width: '5%',
        render(index, record) {
          const name = _.indexOf(that.state.expandedRowKeys, record.id) > -1 ? 'hide' : 'show';
          return (
            <a onClick={() => { that.toggleDetails(record); }}>{name}</a>
          );
        },
      },
      {
        title: 'Description',
        dataIndex: 'description',
        width: '7%',
        render(index, record) {
          return (
            <div style={{ position: 'relative' }}>
              <Tooltip placement="top" title={record.description} defaultVisible={false} overlayStyle={{ wordWrap: 'break-word' }}>
                <a style={remarkStyle}>{record.description}</a>
              </Tooltip>
              <Icon type="edit" style={editStyle} onClick={(...arg) => { that.showModal(...arg, record, 'descModal'); }} />
            </div>
          );
        },
      },
      {
        title: 'Operation',
        dataIndex: 'operation',
        // width: '18%',
        render(index, record) {
          return (
            <div>
              {
                !record.saveOper && !record.applyOper ? (
                  <Button type="primary" onClick={() => { that.toggleInput(record, true); }}>Withdrawal</Button>
                ) : ''
              }

              {
                record.saveOper ? (
                  <div>
                    <InputNumber min={0} defaultValue={0} max={20000000000} onChange={that.setCashMoney} />
                    <Button type="primary" onClick={() => { that.saveInput(record); }} style={{ marginLeft: 10 }}>Save</Button>
                    <Button type="danger" onClick={() => { that.toggleInput(record, false); }} style={{ marginLeft: 10 }}>Cancel</Button>
                  </div>
                ) : ''
              }

              {
                record.applyOper ? (
                  <div>
                    <Button type="primary" onClick={(...arg) => { that.showConfirm(...arg, 'apply', record); }} style={{ marginLeft: 10 }}>Apply</Button>
                    <Button type="danger" onClick={() => { that.resetBtn(record); }} style={{ marginLeft: 10 }}>Reset</Button>
                  </div>
                ) : ''
              }

            </div>
          );
        },
      },
    ];

    // 渠道名、开始时间、到期时间
    const operation = [
      {
        id: 'channelsName',
        type: 'text',
        label: 'Channel',
        placeholder: 'Input Channel',
      },

      {
        id: 'startTime',
        type: 'dateTime',
        label: 'Start Time',
      },
      {
        id: 'endTime',
        type: 'dateTime',
        label: 'End Time',
      },
    ];

    const subTableSettings = {
      columns: [
        {
          title: 'Installments',
          dataIndex: 'installments',
          key: 'installments',
        },
        {
          title: 'Principal(ICC)',
          dataIndex: 'contractPrincipal',
          key: 'contractPrincipal',
          render(index, data) {
            return CF.format(data.contractPrincipal, {});
          },
        },
        {
          title: 'Yield(ICC)',
          dataIndex: 'contractIncome',
          key: 'contractIncome',
          render(index, data) {
            return CF.format(data.contractIncome, {});
          },
        },
        {
          title: 'Principal & Yield(ICC)',
          dataIndex: 'contractPrincipalAndIncome',
          key: 'contractPrincipalAndIncome',
          render(index, data) {
            return CF.format(data.contractPrincipalAndIncome, {});
          },
        },
        {
          title: 'Principal(PHP)',
          dataIndex: 'principal',
          key: 'principal',
          render(index, data) {
            return CF.format(data.principal, {});
          },
        },
        {
          title: 'Yield(PHP)',
          dataIndex: 'income',
          key: 'income',
          render(index, data) {
            return CF.format(data.income, {});
          },
        },
        {
          title: 'Principal & Yield(PHP)',
          dataIndex: 'principalAndIncome',
          key: 'principalAndIncome',
          render(index, data) {
            return CF.format(data.principalAndIncome, {});
          },
        },
        {
          title: 'End Time',
          dataIndex: 'endTime',
          key: 'endTime',
          render(index, record) {
            return record.endTime ? moment(record.endTime).format('YYYY-MM-DD') : '—';
          },
        },
        {
          title: 'Withdrawal Status',
          dataIndex: 'withdrawState',
          key: 'withdrawState',
          render(index, record) {
              var statusItem = _.find(that.state.withdrawStateList, item => {
                  return item.type == record.withdrawState;
              })
              return statusItem.typeName || "—";
          }
        },
        {
          title: 'Withdrawal Time',
          dataIndex: 'withdrawTime',
          key: 'withdrawTime',
          render(index, record) {
            return record.withdrawTime ? moment(record.withdrawTime).format('YYYY-MM-DD') : '—';
          },
        },
        {
          title: 'Withdrawal Amount',
          dataIndex: 'withdrawAmount',
          key: 'withdrawAmount',
          render(index, record) {
            return record.withdrawTime ? record.withdrawAmount : '—';
          },
        },
      ],
    };

    const settings = {
      data: that.state.data,
      columns: columns,
      operation: operation,
      getFields: that.getFormFields,
      pagination: that.state.pagination,
      pageChange: that.pageChage,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
      btn: [
        {
          title: 'New',
          type: 'primary',
          fn: (...arg) => { that.showModal(...arg, undefined, 'registerModal'); },
        },
      ],
      expandedRowRender: function (record) {
        subTableSettings.dataSource = record.child || [];
        return (
          <Table
            className="cl-table"
            {...subTableSettings}
            pagination={false}
            rowKey={record => record.id}
            bordered
            size="small"
          />);
      },
      expandedRowKeys: that.state.expandedRowKeys || [],
    };


    const options = [
      {
        id: 'channelsName',
        type: 'text',
        label: 'Channels',
        placeholder: 'Please enter channel name',
        rules: [{ required: true, message: 'Please enter channel name!' }],
      },

      {
        id: 'startTime',
        type: 'dateTime',
        label: 'Start Time',
        placeholder: '',
        rules: [{ required: true, message: 'Please select start time!' }],
      },

      {
        id: 'contractAmount',
        type: 'number',
        label: 'Amount',
        placeholder: 'Please enter amount',
        rules: [{ required: true, message: 'Please enter amount!' }],
      },

      {
        id: 'inputExchangeRate',
        type: 'number',
        label: 'Exchange Rate',
        placeholder: 'Please enter rate',
        rules: [{ required: true, message: 'Please enter rate!' }],
      },

      {
        id: 'period',
        type: 'number',
        label: 'Term',
        placeholder: 'Please enter period',
        rules: [{ required: true, message: 'Please enter period!' }],
      },

      {
        id: 'incomeRate',
        type: 'number',
        label: 'Yield Rate',
        placeholder: 'Please enter income rate',
        rules: [{ required: true, message: 'Please enter income rate!' }],
        extra: (<span className="ant-form-text">%</span>),
      },
      {
        id: 'interestRateMethod',
        type: 'select',
        label: 'Interest Computation Method',
        placeholder: 'Please select',
        options: IRM,
        rules: [{ required: true, message: 'Please select calculation of interest !' }],
      },

      {
        id: 'interestBearingCurrency',
        type: 'select',
        label: 'Interest Computation Currency',
        placeholder: 'Please select',
        options: IBC,
        rules: [{ required: true, message: 'Please select interest bearing currency!' }],
      },

      {
        id: 'description',
        type: 'textarea',
        label: 'Description',
        placeholder: 'Please enter description!',
        rules: [{ required: true, message: 'Please enter description !' }],
      },
    ];


    // 提交表单信息


    const values = _.pick(that.state.fromData, [
      'channelsName',
      'startTime',
      'amount',
      'period',
      'incomeRate',
      'interestRateMethod',
      'interestBearingCurrency',
      'Exchange Rate',
      'description',
    ]);

    values.startTime = moment(new Date(values.startTime || new Date()));

    const fromSettings = {
      options: options,
      getFields: that.getFields,
      values: values,
      btnloading: that.state.formBtnLoading,
    };



    return (
      <div className="invest-management" key="invest-management">
        <CLlist settings={settings} />
        {/*<Table*/}
          {/*bordered*/}
          {/*size="small"*/}
          {/*className="user-info cl-table"*/}
          {/*scroll={{ y: 1500, x: 2000 }}*/}
          {/*rowKey={record => record.index}*/}
          {/*pagination={this.state.pagination}*/}
          {/*columns={columns}*/}
          {/*onChange={this.pageChage}*/}
          {/*dataSource={settings.data}*/}
          {/*loading={that.state.tableLoading}*/}
          {/*tableexport={tableexport}*/}
        {/*/>*/}
        <Modal
          title="Edit Description"
          visible={that.state.descModal}
          onOk={() => { that.handleOk('saveMessage'); }}
          onCancel={() => { that.hideModal({}, 'descModal'); }}
          okText="Save"
          cancelText="Cancel"
          mask={false}
        >
          <Row style={{ marginTop: 20 }}>
            <Col>
              <TextArea autosize={{ minRows: 3, maxRows: 7 }} value={that.state.descMessage || (that.state.current || {}).description} onChange={that.setDescMessage} />
            </Col>
          </Row>
        </Modal>


        <Modal
          title="Input Data"
          visible={that.state.registerModal}
          onCancel={() => { that.hideModal({}, 'registerModal'); }}
          mask={false}
          footer={null}
        >
          <Row style={{ marginTop: 20 }}>
            <Col>
              <CLForm settings={fromSettings} />
            </Col>
          </Row>
        </Modal>

        <Modal
          title="Notice"
          visible={that.state.withdraw}
          onCancel={that.hideModalwithdraw}
          onOk={that.withdrawSave}
          className='withdrawModal'
          okText='OK'
        >
          <Row style={{ marginTop: 20 }}>
            <Col span={6}>
              <DatePicker
                showTime
                format="YYYY-MM-DD"
                onChange={that.dateChange}
              />
              </Col>
          </Row>
        </Modal>
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
export default InvestManagement;
