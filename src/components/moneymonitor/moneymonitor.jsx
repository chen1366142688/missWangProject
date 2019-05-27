import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import {CLComponent, AsyncComponent } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import CF from 'currency-formatter';
import _ from 'lodash';
import { Button, Table,  DatePicker, Tabs, } from 'antd';
const { contentType, getpayoutlist } = Interface;
let TB;
const TabPane = Tabs.TabPane;
const LendingProofread = AsyncComponent(() => import("./lendingProofread.jsx"));
class Moneymonitor extends CLComponent {
  state = {
    search: {},
    options: {
      statusOptions1: [],
    },
    pagination: {
      total: 0,
      pageSize: 20,
      currentPage: 1,
    },
    tableLoading: false,
    data: '',
    type: "1",
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'loadData',
      'pageChage',
      "tabChange",
      'getFormFields',
    ]);
  }


  componentDidMount() {
    const that = this;
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

    const type = sessionStorage.getItem('operateDataType') || '1';
    this.setState({ search: search, pagination: pagination, type : '1' });
    this.loadData(search,pagination);
  }

  loadData(search, page) {
    const that = this;
    that.setState({ tableLoading: true });
    let params = {
      payoutAccountChangeLog: {
        startChangeQueryDate: search.startChangeQueryDate,
        endChangeQueryDate: search.endChangeQueryDate,
      },
      page: {
        currentPage: page.currentPage || 1,
        pageSize: page.pageSize || 20,
      },
    };
    const settings = {
      contentType,
      method: getpayoutlist.type,
      url: getpayoutlist.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      that.setState({ tableLoading: false });
      if (res.data) {
        const pagination = {
          total: res.data.totalCount,
          pageSize: res.data.pageSize,
          currentPage: res.data.currentPage,
        };
        sessionStorage.setItem('pagination', JSON.stringify(pagination));
        sessionStorage.setItem('search', JSON.stringify(search));
        that.setState({
          pagination: pagination,
          data: res.data.result,
          search: search,
        });
      }
    }
    CL.clReqwest({ settings, fn });
  }

  getFormFields(fields) {
    const search = {};
    _.map(fields, (doc, index) => {
      if (doc) {
        if (index === 'sRepaymentTime') {
          search.startChangeQueryDate = new Date(doc[0].format('YYYY-MM-DD HH:mm')).getTime();
          search.endChangeQueryDate = new Date(doc[1].format('YYYY-MM-DD HH:mm')).getTime();
        } else {
          search[index] = doc;
        }
      }
    });
    const pagination = this.state.pagination;
    pagination.currentPage = 1;
    this.setState({
      search: search,
      pagination: pagination
    });
    this.loadData(search, pagination);
  }

  tabChange (e) {
    const that = this;
    that.setState({
      type: e,
    });
    sessionStorage.setItem("operateDataType", e);
  }
  pageChage(e) { // list 切换页面
    const pagination = {
      currentPage: e.current,
      pageSize: e.pageSize,
      total: this.state.pagination.total,
    };

    this.setState({ pagination: pagination });
    this.loadData(this.state.search, pagination);
  }

  renderBody() {
    const that = this;
    const { data } = that.state;
    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        width: '12%',
        render: function (index, record) {
          return record.id;
        },
      },
      {
        title: 'Dragonpay',
        children: [
          {
            title: '账户变更时间',
            dataIndex: 'changeDate',
            key: 'changeDate',
            width: '13%',
            render(index, record) {
                return moment(record.changeDate).format('YYYY-MM-DD HH:mm:ss');
            }
          },
          {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            width: '12%',
            render(index, record) {
              if (!record.type) {
                return '-'
              } else {
                return record.type
              }
            }
          },
          {
            title: '金额',
            dataIndex: 'amount',
            key: 'amount',
            width: '12%',
            render(index, record) {
              if (!record.amount) {
                return '-'
              } else if(record.amount!==record.systemAmount && record.type == 'P'){
                return <p style={{backgroundColor: "red",color:'#fff'}}>{CL.cf(record.amount, 2)}</p>;
              }else if(record.amount!==record.systemAmount && record.type == 'F'){
                return <p style={{backgroundColor: "red",color:'#fff'}}>{CL.cf(record.amount, 2)}</p>;
              }else{
                return CL.cf(record.amount, 2);
              }
            }
          },
          {
            title: '账户余额',
            dataIndex: 'balance',
            key: 'balance',
            width: '12%',
            render(index, record) {
              if (!record.balance) {
                return '-'
              } else {
                return CL.cf(record.balance, 2);
              }
            }
          },
          {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            width: '12%',
            render(index, record) {
              if (!record.description) {
                return '-'
              } else {
                return record.description
              }
            }
          },
          {
            title: '校对',
            dataIndex: 'checkRight',
            key: 'checkRight',
            width: '12%',
            render(index, record) {
              if (!record.checkRight) {
                return '-'
              } else if(record.checkRight=='1'){
                return '√'
              }else{
                return record.checkRight
              }
            }
          },
        ],
      },
      {
        title: 'Unipeso',
        children: [
          {
            title: 'Payment amount',
            dataIndex: 'systemAmount',
            key: 'systemAmount',
            render(index, record) {
              if (!record.systemAmount) {
                return '-'
              } else if(record.systemAmount!==record.amount && record.type == 'P'){
                return <p style={{backgroundColor: "red",color:'#fff'}}>{CL.cf(record.systemAmount, 2)}</p>;
              }else if(record.systemAmount!==record.amount && record.type == 'F'){
                return <p style={{backgroundColor: "red",color:'#fff'}}>{CL.cf(record.systemAmount, 2)}</p>;
              }else{
                return CL.cf(record.systemAmount, 2);
              }
            }
          },
        ],
      },
    ];


    const operation = [
      {
        id: 'sRepaymentTime',
        type: 'rangePicker',
        label: '日期',
        placeholder: 'ranger',
      },

    ];

    const settings = {
      data: data,
      columns: columns,
      operation: operation,
      getFields: that.getFormFields,
      pagination: that.state.pagination || {},
      pageChange: that.pageChage,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
    };

    return (
      <div className="business-monitors" key="business-monitors">
        <Tabs defaultActiveKey={this.state.type} onChange={that.tabChange}>
          <TabPane tab="DP账户变更放款校对" key="1">
            <CLlist settings={settings} />
          </TabPane>
          <TabPane tab="DP放款实时校对" key="2">
            <LendingProofread />
          </TabPane>
        </Tabs>
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
export default Moneymonitor;
