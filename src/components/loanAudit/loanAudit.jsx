import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';

import { CLComponent, AsyncComponent } from '../../../src/lib/component/index';
import CLList from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL, BuryPoint } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';

import _ from 'lodash';
import { Button, Tabs } from 'antd';

const AuditDetails = AsyncComponent(() => import('./auditDetails.jsx'));

const TabPane = Tabs.TabPane;
const {
  getLoanAuditList, contentType, reminderInTwoHours, getAuditData,
} = Interface;
let req;

class LoanAudit extends CLComponent {
  state = {
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1,
    },
    paginations: {
      total: 0,
      pageSize: 10,
      currentPage: 1,
    },
    sorter: {
      sortFieldType: 2,
      sortType: 1,
    },
    tableLoading: false,
    search: {},
    options: {
      examineStatusList: [],
      appOperatorName: [],
      processingStatus: [],
      appPlatformType: [],
      applicationTypeList: [],
    },
    data: [],
    data2: [],
    newAuditData: '',
    type: '1',
    Unprocessed: '',
    applicationStatus: false,
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'getFormFields',
      'check',
      'loadData',
      'pageChage',
      'pageChage1',
      'setTimer',
      'loadData2',
      'tabChange',
    ]);
  }

  componentDidMount() {
    const that = this;
    const type = sessionStorage.getItem('operateDataType') || '1';
    this.setState({ type: type });
    // 搜索条件
    const sessionSearch = sessionStorage.getItem('search');
    let search = that.state.search;
    if (sessionSearch) { search = JSON.parse(sessionSearch); }
    if (sessionStorage.getItem('operateDataType') == '3') {
      const sessionPaginations = sessionStorage.getItem('paginations');
      let paginations = that.state.paginations;
      if (sessionPaginations) {
        paginations = JSON.parse(sessionPaginations);
      }
      that.loadData2(search, paginations, that.state.sorter);
      that.setState({ search: search, paginations: paginations });
    }
    // 排序
    const sessionSorter = sessionStorage.getItem('sorter');
    let sorter = that.state.sorter;
    if (sessionSorter && sessionSorter !== "undefined") {
      sorter = JSON.parse(sessionSorter);
    }
    // 分页
    const sessionPagination = sessionStorage.getItem('pagination');
    let pagination = this.state.pagination;
    if (sessionPagination) {
      pagination = JSON.parse(sessionPagination);
    }
    that.loadData(search, pagination, sorter);
    that.setState({ search: search, pagination: pagination });
  }

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
  }

  loadData(search, page, sorter) {
    const that = this;
    that.setState({ tableLoading: true });
    let params = {
      page: {
        currentPage: page.currentPage || 1,
        pageSize: page.pageSize || 10,
      },
      loanBasisInfo: {
        appId: '' || search.appId,
        memberPhoneMatching: '' || search.memberPhoneMatching,
        memberNameMatching: '' || search.memberNameMatching,
        examineStatus: '' || search.examineStatus,
        appBeginTime: '' || search.appBeginTime,
        appEndTime: '' || search.appEndTime,
        operatorNameMatching: '' || search.operatorNameMatching,
        processingStatus: '' || search.processingStatus,
        product: '' || search.product,
        applicationType: '' || search.applicationType,
      },
      sortFieldType: 2,
      sortType: 1,
    };
    if (sorter) {
      params = _.extend(params, sorter);
    }

    const settings = {
      contentType,
      method: getLoanAuditList.type,
      url: getLoanAuditList.url,
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
        sessionStorage.setItem('sorter', JSON.stringify(sorter));
        const roles = [];
        _.each(res.data.assessorList, (doc, index) => {
          roles.push({
            name: doc.fullName,
            value: doc.fullName,
          });
        });

        const appList = [];
        for (const product of data.productList) {
          appList.push({
            name: product,
            value: product
          });
        }
        that.setState({
          options: {
            examineStatusList: CL.setOptions(data.examineStatusList),
            appOperatorName: roles,
            processingStatus: CL.setOptions(data.processingStatus),
            appPlatformType: appList,
            applicationTypeList: CL.setOptions(data.applicationTypeList),
          },
          pagination: pagination,
          data: data.page.result || [],
          Unprocessed: res.data.processingStatus[0].typeName,
        });
      }
    }

    if (req) {
      req.abort();
    }

    req = CL.clReqwest({ settings, fn });
  }

  loadData2(search, page, sorter) {
    const that = this;
    let params = {
      page: {
        currentPage: page.currentPage || 1,
        pageSize: page.pageSize || 10,
      },
    };
    if (sorter) {
      params = _.extend(params, sorter);
    }

    const settings = {
      contentType,
      method: reminderInTwoHours.type,
      url: reminderInTwoHours.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      that.setState({ tableLoading: false });
      if (res.data) {
        const paginations = {
          total: res.data.telephoneAuditRecordPage.totalCount,
          pageSize: res.data.telephoneAuditRecordPage.pageSize,
          currentPage: res.data.telephoneAuditRecordPage.currentPage,
        };
        // 保存当前的搜索条件 以及分页
        sessionStorage.setItem('paginations', JSON.stringify(paginations));
        sessionStorage.setItem('search', JSON.stringify(search));
        sessionStorage.setItem('sorter', JSON.stringify(sorter));
        that.setState({ data2: res.data.telephoneAuditRecordPage.result || [], paginations: paginations });
      }
    }
    if (req) {
      req.abort();
    }
    req = CL.clReqwest({ settings, fn });
  }

  setTimer() {
    const that = this;
    // 定时拉取promise to pay 数据，仿造消息提醒
    this.timer = setInterval(() => {
      that.loadData2();
    }, 300000);
  }

  tabChange(e) {
    const that = this;
    that.setState({
      type: e,
      tableLoading: true,
    });
    sessionStorage.setItem('operateDataType', e);
    if (e === '2') {
      let paginations = 1;
      if (sessionStorage.getItem('paginations')) {
        const sessionPaginations = sessionStorage.getItem('paginations') || {};
        paginations = this.state.paginations;
        if (sessionPaginations) {
          paginations = JSON.parse(sessionPaginations);
        }
      }
      that.loadData2({}, paginations, that.state.sorter);
      this.timer && clearTimeout(this.timer);
    } else if (e === '1') {
      that.loadData({}, that.state.pagination, that.state.sorter);
      this.setTimer();
    }
  }

  getFormFields(fields) {
    const search = {};
    _.map(fields, (doc, index) => {
      if (doc) {
        if (index === 'appTime') {
          search.appBeginTime = new Date(doc[0].format('YYYY-MM-DD HH:mm')).getTime();
          search.appEndTime = new Date(doc[1].format('YYYY-MM-DD HH:mm')).getTime();
        } else {
          search[index] = doc;
        }
      }
    });
    if(search.applicationType == "3"){
      this.setState({applicationStatus: true});
    }
    const pagination = this.state.pagination;
    pagination.currentPage = 1;
    this.setState({ search: search, pagination: pagination });
    this.loadData(search, pagination, this.state.sorter);
  }

  check(data) { // 点击按钮跳转
    const arr = location.hash.split('/');
    arr.pop();
    arr.push(`loanauditdetails/${data.appId || data.applicationId}/1/12`);
    const str = arr.join('/');
    // 保存当前的搜索条件 以及分页
    sessionStorage.setItem('search', JSON.stringify(this.state.search));
    sessionStorage.setItem('pagination', JSON.stringify(this.state.pagination));
    const url = `${location.protocol}//${location.host}${location.pathname}${str}`;
    BuryPoint.setPoint("cashlendingEvaluationCheck", data.memberId, data.appId, null, {
        EvaluationStatus: data.appStatusName
    });
    window.open(url);
    // location.hash = str;
  }

  pageChage(e, filters, sorter) { // list 切换页面
    const that = this;
    const pagination = {
      currentPage: e.current,
      pageSize: e.pageSize,
      total: that.state.pagination.total,
    };

    const SORTDIC = {
      applicationTime: 2,
      memberRegisterDate: 1,
      descend: 1,
      ascend: 2,
    };

    const sorterClient = {
      sortFieldType: SORTDIC[sorter.field] || 2,
      sortType: SORTDIC[sorter.order] || 1,
    };
    this.setState({ pagination: pagination });
    this.loadData(that.state.search, pagination, sorterClient);
  }

  pageChage1(e, filters, sorter) { // list 切换页面
    const that = this;
    const paginations = {
      currentPage: e.current,
      pageSize: e.pageSize,
      total: that.state.pagination.total,
    };

    const SORTDIC = {
      applicationTime: 2,
      memberRegisterDate: 1,
      descend: 1,
      ascend: 2,
    };

    const sorterClient = {
      sortFieldType: SORTDIC[sorter.field] || 2,
      sortType: SORTDIC[sorter.order] || 1,
    };
    this.setState({ pagination: paginations });
    this.loadData2(that.state.search, paginations, sorterClient);
  }

  renderBody() {
    const that = this;
    const columns = [
      {
        title: 'No',
        dataIndex: 'appId',
        width: '12%',
      },
      {
        title: 'APP platform',
        dataIndex: 'appPlatform',
        width: '12%',
      },
      {
        title: 'Phone Number',
        dataIndex: 'memberPhone',
        width: '12%',
      },
      {
        title: 'City/District',
        dataIndex: 'resideCity',
        width: '12%',
      },
      {
        title: 'Evaluation Status',
        dataIndex: 'appStatusName',
        width: '12%',
      },
      {
        title: 'Auditor',
        dataIndex: 'appOperatorName',
        width: '12%',
        render(index,record){
          if(!record.appOperatorName){
            return '-'
          }
         return record.appOperatorName
        }
      },
      {
        title: 'Application Time',
        dataIndex: 'applicationTime',
        width: '14%',
        sorter: (a, b) => new Date(a.applicationTime) - new Date(b.applicationTime),
        render: function (text, record) {
          return moment(record.applicationTime).format('YYYY-MM-DD HH:mm');
        },
      },
      {
        title: 'Operation ',
        // width: '10%',
        dataIndex: 'Operation ',
        render: function (text, record) {
          return (<Button type="primary" onClick={() => { that.check(record); }}>check</Button>);
        },
      },
    ];

    const columns2 = [
      {
        title: 'No',
        dataIndex: 'applicationId',
        width: '20%',
      },
      {
        title: 'Telephone No.',
        dataIndex: 'telephone',
        width: '20%',
      },
      {
        title: 'Operator Name',
        dataIndex: 'operatorName',
        width: '20%',
      },
      {
        title: 'Operate Time',
        dataIndex: 'operateDate',
        width: '20%',
        render: function (text, record) {
          return moment(record.operateDate).format('YYYY-MM-DD HH:mm');
        },
      },
      {
        title: 'Operation ',
        width: '20%',
        dataIndex: 'Operation ',
        render: function (text, record) {
          return (<Button type="primary" onClick={() => { that.check(record); }}>check</Button>);
        },
      },
    ];

    const { data, data2 = [] } = this.state;
    const operation = [
      {
        id: 'appId',
        type: 'text',
        label: 'Application No',
        placeholder: 'Application No',
      },
      {
        id: 'memberPhoneMatching',
        type: 'text',
        label: 'Phone Number',
        formType: 'textarea',
        placeholder: 'User\'s Phone Number',
      },
      {
        id: 'memberNameMatching',
        type: 'text',
        label: 'Name',
        placeholder: 'User\'s Name',
      },
      {
        id: 'examineStatus',
        type: 'select',
        label: 'Evaluation Status',
        options: that.state.options.examineStatusList,
        placeholder: 'Please select',
      },
      {
        id: 'operatorNameMatching',
        type: 'select',
        label: 'Auditor',
        options: that.state.options.appOperatorName,
        placeholder: 'Please select',
      },
      {
        id: 'appTime',
        type: 'rangePicker',
        label: 'Application Time',
        placeholder: 'ranger',
      },
      {
        id: 'processingStatus',
        type: 'select',
        label: 'Processing Status',
        options: that.state.options.processingStatus,
        placeholder: 'Please select',
      },
      {
        id: 'product',
        type: 'select',
        label: 'APP platform',
        options: that.state.options.appPlatformType,
        placeholder: 'Please select',
      },
      {
        id: 'applicationType',
        type: 'select',
        label: 'Applcation type',
        options: that.state.options.applicationTypeList,
        placeholder: 'Please select',
      },
    ];

    const settings = {
      data: data.map((doc, index) => {
        doc.id = doc.appId;
        return doc;
      }),
      columns: columns,
      operation: operation,
      getFields: that.getFormFields,
      pagination: that.state.pagination || {},
      pageChange: that.pageChage,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
    };
    const settings2 = {
      data: (data2 || []).map((doc, index) => {
        doc.id = doc.appId;
        return doc;
      }),
      columns: columns2,
      getFields: that.getFormFields,
      pagination: that.state.paginations || {},
      pageChange: that.pageChage1,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
    };
    const tab2 = document.querySelectorAll('.ant-tabs-tab')[1];
    if (tab2 && data2.length) {
      tab2.classList.add('twinkle');
    }

    const { count, addOne } = this.props;

    return (
      <div className="loan-audit" key="loan-audit">
        <Tabs defaultActiveKey={this.state.type} onChange={that.tabChange}>
          <TabPane tab="Evaluation list" key="1" >
            <CLList settings={settings} />
          </TabPane>
          <TabPane tab="Call After 2 Hours" key="2">
            <CLList settings={settings2} />
          </TabPane>
          <TabPane tab="Verification data" key="3">
            <AuditDetails />
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
export default LoanAudit;
