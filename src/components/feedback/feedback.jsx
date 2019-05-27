import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent, AsyncComponent } from '../../../src/lib/component/index';

import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';

import _ from 'lodash';
import { Button, Tabs, Input, Modal, DatePicker, message, Row, Col, Checkbox, InputNumber, Radio } from 'antd';

const { contentType, getFeedbackList, getAppInfoByMemberId } = Interface;
let req;
const RepaymentFeedback = AsyncComponent(() => import('./repaymentFeedback.jsx'));
const ChangePhoneList = AsyncComponent(() => import('./changePhoneList.jsx'));
const MarketingSMSblacklist = AsyncComponent(() => import('./marketingSMSblacklist.jsx'));
const { TabPane } = Tabs;

class Feedback extends CLComponent {
  state = {
    selectedRowKeys: [],
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1,
    },
    examineStatus: [],
    tableLoading: false,
    search: {},
    options: {
      status: [],
    },
    data: [],
    type: '1',
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'onSelectChange',
      'getFormFields',
      'check',
      'loadData',
      'pageChage',
      'tabChange',
    ]);
  }
  componentDidMount() {
    CLAnimate.inAndOut(this);
    let type = sessionStorage.getItem('operateDataType') || '1';
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
    this.loadData(search, pagination);
    this.setState({ search: search, pagination: pagination, type : type });
  }
  getApplyInfo(doc) {
    const settings = {
      contentType,
      method: getAppInfoByMemberId.type,
      url: getAppInfoByMemberId.url,
      data: JSON.stringify({
        memberId: doc,
      }),
    };

    function fn(res) {
      if (res.data && res.data.id) {
        window.open(`${location.origin}${location.pathname}#/uplending/loanauditdetails/${res.data.id}/0`);
      }
    }
    CL.clReqwest({ settings, fn });
  }

  loadData(search, page) {
    const that = this;
    that.setState({ tableLoading: true });
    const params = {
      page: {
        currentPage: page.currentPage || 1,
        pageSize: page.pageSize || 10,
      },
      consultedUser: search || this.state.search,
    };

    const settings = {
      contentType,
      method: 'post',
      url: getFeedbackList.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      that.setState({ tableLoading: false });
      const data = res.data;
      if (data) {
        const pagination = {
          total: data.page.totalCount,
          pageSize: page.pageSize,
          currentPage: page.currentPage,
        };
        // 保存当前的搜索条件 以及分页
        sessionStorage.setItem('pagination', JSON.stringify(pagination));
        sessionStorage.setItem('search', JSON.stringify(search));

        that.setState({
          options: {
            status: CL.setOptions(data.feedbackStatus),
          },
          pagination: pagination,
          data: data.page.result,
          examineStatus: data.examineStatus,
        });
      }
    }

    if (req) {
      req.abort();
    }

    req = CL.clReqwest({ settings, fn });
  }

  onSelectChange = (selectedRowKeys) => { // 勾选项
    this.setState({ selectedRowKeys });
  }

  getFormFields(fields) {
    const search = {};
    _.map(fields, (doc, index) => {
      if (doc) {
        if (_.isArray(doc)) { // 判断为时间对象
          search.beginTime = new Date(doc[0].format('YYYY-MM-DD HH:mm')).getTime();
          search.endTime = new Date(doc[1].format('YYYY-MM-DD HH:mm')).getTime();
        } else {
          search[index] = doc;
        }
      }
    });
    const pagination = this.state.pagination;
    pagination.currentPage = 1;
    this.setState({ search: search, pagination: pagination });
    this.loadData(search, pagination);
  }

  check(data) { // 点击按钮跳转
    const arr = location.hash.split('/');
    arr.pop();
    arr.push(`feedbackdetails/${data.id}`);
    const str = arr.join('/');

    // 保存当前的搜索条件 以及分页
    sessionStorage.setItem('search', JSON.stringify(this.state.search));
    sessionStorage.setItem('pagination', JSON.stringify(this.state.pagination));

    const url = `${location.protocol}//${location.host}${location.pathname}${str}`;
    window.open(url);

    // location.hash = str;
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
  tabChange(e) {
    const that = this;
    that.setState({
      type: e,
    });
    sessionStorage.setItem('operateDataType', e);
    if(e == '1'){
      that.loadData(that.state.search, that.state.pagination);
    }
  }
  renderBody() {
    const { selectedRowKeys } = this.state;
    const that = this;
    const red = { color: 'red' };
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    const columns = [
      {
        title: 'Create Time',
        dataIndex: 'createTime',
        width: '10%',
        sorter: (a, b) => new Date(a.createTime) - new Date(b.createTime),
        render: function (text, record) {
          return moment(record.createTime).format('YYYY-MM-DD HH:mm');
        },
      },
      {
        title: '  Update Time',
        dataIndex: 'updateTime',
        width: '10%',
        sorter: (a, b) => new Date(a.updateTime) - new Date(b.updateTime),
        render: function (text, record) {
          return moment(record.updateTime).format('YYYY-MM-DD HH:mm');
        },
      },
      {
        title: 'User',
        dataIndex: 'telephone',
        width: '10%',
        sorter: (a, b) => a.appId - b.appId,
      },
      {
        title: 'Real Name',
        width: '10%',
        dataIndex: 'userName',
      },
      {
        title: 'APP platfrom',
        width: '10%',
        dataIndex: 'version',
        render(index, record) {
          return record.appName;
        },
      },
      {
        title: 'Evaluation Status',
        width: '10%',
        dataIndex: 'appStatus',
        render(index, record) {
          if (!record.appStatus) {
            return '—';
          }
          const obj = _.find(that.state.examineStatus, { type: parseInt(record.appStatus) }) || {};
          return obj.typeName;
        },
      },
      {
        title: 'Status',
        dataIndex: 'statusName',
        width: '10%',
        render: function (text, record) {
          if (record.statusName === 'not reply') {
            return (<span style={red}>{record.statusName}</span>);
          }
          return record.statusName;
        },
      },
      {
        title: 'ViewApplication',
        dataIndex: 'memberId ',
        width: '10%',
        render: function (text, record) {
          return (<Button type="primary" onClick={() => { that.getApplyInfo(record.memberId); }}>view</Button>);
        },
      },
      {
        title: 'Operation',
        dataIndex: 'statusName ',
        render: function (text, record) {
          return (<Button type="primary" onClick={() => { that.check(record); }}>view</Button>);
        },
      },

    ];

    const operation = [
      {
        id: 'telephone',
        type: 'text',
        label: 'User',
        formType: 'textarea',
        placeholder: 'Enter User Name',
      },
      {
        id: 'status',
        type: 'select',
        label: 'Status',
        placeholder: 'Please select',
        options: that.state.options.status,
      },
    ];

    const data = this.state.data;

    const settings = {
      data: data,
      columns: columns,
      rowSelection: rowSelection,
      operation: operation,
      getFields: that.getFormFields,
      pagination: that.state.pagination || {},
      pageChange: that.pageChage,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
    };

    return (
      <div className="loan-audit" key="loan-audit">
        <Tabs defaultActiveKey={this.state.type} onChange={that.tabChange}>
          <TabPane tab="Consult message list" key="1" >
            <CLlist settings={settings} />
          </TabPane>
          <TabPane tab="Repayment feedback" key="2" >
            <RepaymentFeedback />
          </TabPane>
          {
            CL.isRole("Consult_Changed user's phone") ? (
              <TabPane tab="Change user's phone number" key="3">
                <ChangePhoneList />
              </TabPane>
            ) : ''
          }
          <TabPane tab="Marketing SMS blacklist" key="4" >
            <MarketingSMSblacklist />
          </TabPane>
        </Tabs>
      </div>
    );
  }

  render(data) {
    return (
      <QueueAnim className="animate-content" type={this.state.aniType}>
        {this.state.showBlock ? [this.renderBody()] : null}
      </QueueAnim>
    );
  }
}
export default Feedback;
