import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import _ from 'lodash';
import { Button, message } from 'antd';

const { contentType, repaymentFeedbackList } = Interface;
let req;

class RepaymentFeedback extends CLComponent {
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
      status11: [],
    },
    data: [],
    status: [],
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'getFormFields',
      'check',
      'check1',
      'loadData',
      'pageChage',
    ]);
  }

  componentDidMount() {
    CLAnimate.inAndOut(this);
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
    this.setState({ search: search, pagination: pagination });
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
    console.log(search);
    const that = this;
    that.setState({ tableLoading: true });
    const params = {
      page: {
        currentPage: page.currentPage || 1,
        pageSize: page.pageSize || 10,
      },
      // loanMemberRepayProof: search || that.state.search,
      loanMemberRepayProof: {
        applicationId: '' || search.applicationId,
        status: search.status,
      },
    };

    const settings = {
      contentType,
      method: 'post',
      url: repaymentFeedbackList.url,
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
            status11: CL.setOptions(data.status2),
          },
          pagination: pagination,
          data: data.page.result,
          status: data.status,
        });
      }
    }

    if (req) {
      req.abort();
    }

    req = CL.clReqwest({ settings, fn });
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
    arr.push(`repaymentFeedbackDetails/${data.applicationId}?${data.status}`);
    const str = arr.join('/');
    // 保存当前的搜索条件 以及分页
    sessionStorage.setItem('search', JSON.stringify(this.state.search));
    sessionStorage.setItem('pagination', JSON.stringify(this.state.pagination));
    const url = `${location.protocol}//${location.host}${location.pathname}${str}`;
    window.open(url);
  }


  check1(data) { // 点击按钮跳转
    const arr = location.hash.split('/');
    arr.pop();
    arr.push(`loanauditdetails/${data.appId || data.applicationId}/1`);
    const str = arr.join('/');
    // 保存当前的搜索条件 以及分页
    sessionStorage.setItem('search', JSON.stringify(this.state.search));
    sessionStorage.setItem('pagination', JSON.stringify(this.state.pagination));

    const url = `${location.protocol}//${location.host}${location.pathname}${str}`;
    window.open(url);
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
    const columns = [
      {
        title: 'Feedback time',
        dataIndex: 'createTime',
        width: '16%',
        sorter: (a, b) => new Date(a.createTime) - new Date(b.createTime),
        render: function (text, record) {
          return moment(record.createTime).format('YYYY-MM-DD HH:mm:ss');
        },
      },
      {
        title: 'Application No',
        dataIndex: 'applicationId',
        width: '16%',
        render: function (text, record) {
          return (<a onClick={() => { that.check1(record); }}>{record.applicationId}</a>);
        },
      },
      {
        title: 'User name',
        dataIndex: 'name',
        width: '16%',
      },
      {
        title: 'Phone number',
        width: '16%',
        dataIndex: 'phone',
      },

      {
        title: 'status',
        width: '16%',
        dataIndex: 'status',
        render(index, record) {
          if (record.status == '1') {
            return 'Processed';
          }
          return 'Unprocessed';
        },
      },
      {
        title: 'Operation',
        dataIndex: '6 ',
        render: function (text, record) {
          return (
            <Button type="primary" onClick={() => { that.check(record); }}>view</Button>
          );
        },
      },
    ];

    const operation = [
      {
        id: 'applicationId',
        type: 'text',
        label: 'Application No',
        formType: 'textarea',
        placeholder: 'Enter Application No',
      },
      {
        id: 'status',
        type: 'select',
        label: 'Status',
        placeholder: 'Please select',
        options: that.state.options.status11,
      },
    ];

    const data = this.state.data;

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
      <div className="loan-audit" key="loan-audit">
        <CLlist settings={settings} />
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
export default RepaymentFeedback;
