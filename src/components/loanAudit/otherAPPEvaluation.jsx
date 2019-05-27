import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';

import { CLComponent } from '../../../src/lib/component/index';
import CLList from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL, BuryPoint } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';

import _ from 'lodash';
import { Button } from 'antd';


const { getLoanAuditList, contentType, reminderInTwoHours, } = Interface;
let req;

class OtherAPPEvaluation extends CLComponent {
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
    search1: {},
    options: {
      examineStatusList: [],
      sexType: [],
      appOperatorName: [],
      processingStatus: [],
      appPlatformType: [],
    },
    data: [],
    data2: [],
    appLists: [],
    newAuditData: '',
  };

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
    ]);
  }

  componentDidMount() {
    const that = this;
    // 搜索条件
    const sessionSearch1 = sessionStorage.getItem('search1');
    let search1 = that.state.search1;
    if (sessionSearch1) {
      search1 = JSON.parse(sessionSearch1);
    }

    if (sessionStorage.getItem('operateDataType') == '3') {
      const sessionPaginations = sessionStorage.getItem('paginations');
      let paginations = that.state.paginations;
      if (sessionPaginations) {
        paginations = JSON.parse(sessionPaginations);
      }
      that.loadData2(search1, paginations, that.state.sorter);
      that.setState({ search1: search1, paginations: paginations });
    }
    // 排序
    const sessionSorter = sessionStorage.getItem('sorter1');
    let sorter = that.state.sorter;
    if (sessionSorter) {
      sorter = JSON.parse(sessionSorter);
    }
    // 分页
    const sessionPagination = sessionStorage.getItem('pagination1');
    let pagination = this.state.pagination;
    if (sessionPagination) {
      pagination = JSON.parse(sessionPagination);
    }
    that.loadData(search1, pagination, sorter);
    that.setState({ search1: search1, pagination: pagination });
  }

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
  }

  loadData(search1, page, sorter) {
    const that = this;
    that.setState({ tableLoading: true });
    let params = {
      page: {
        currentPage: page.currentPage || 1,
        pageSize: page.pageSize || 10,
      },
      loanBasisInfo: {
        appId: '' || search1.appId,
        memberPhoneMatching: '' || search1.memberPhoneMatching,
        memberNameMatching: '' || search1.memberNameMatching,
        sex: '' || search1.sex,
        examineStatus: '' || search1.examineStatus,
        operatorNameMatching: '' || search1.operatorNameMatching,
        processingStatus: '' || search1.processingStatus,
        appBeginTime: '' || search1.appBeginTime,
        appEndTime: '' || search1.appEndTime,
        beginTime: '' || search1.beginTime,
        endTime: '' || search1.endTime,
        packetName: '' || search1.packetName,
      },
      sortFieldType: 2,
      sortType: 1,
    };
    let arr = that.state.appLists;
    arr.forEach(doc => {
      if (doc.packetName === params.loanBasisInfo.packetName) {
        params.loanBasisInfo = _.extend(params.loanBasisInfo, doc);
        params.page = params.page;
      }
    });

    if (sorter) {
      params = _.extend(params, sorter);
    }

    const settings = {
      contentType,
      method: 'post',
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
        sessionStorage.setItem('pagination1', JSON.stringify(pagination));
        sessionStorage.setItem('search1', JSON.stringify(search1));
        sessionStorage.setItem('sorter1', JSON.stringify(sorter));
        const roles = [];
        const appList = [];
        const appLists = [];
        _.each(res.data.assessorList, (doc, index) => {
          roles.push({
            name: doc.fullName,
            value: doc.fullName,
          });
        });
        res.data.appPlatformType.map ((doc, index) => {
          appList.push({
            name: doc.versionName,
            value: doc.packetName,
          });
          appLists.push({
            version: doc.version,
            packetName: doc.packetName,
          });
        });

        that.setState({
          options: {
            examineStatusList: CL.setOptions(data.examineStatusList),
            sexType: CL.setOptions(data.sexType),
            appOperatorName: roles,
            processingStatus: CL.setOptions(data.processingStatus),
            appPlatformType: appList,
          },
          appLists: appLists,
          pagination: pagination,
          data: data.page.result || [],
        });
      }
    }

    if (req) {
      req.abort();
    }

    req = CL.clReqwest({ settings, fn });
  }

  loadData2(search1, page, sorter) {
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
        sessionStorage.setItem('search1', JSON.stringify(search1));
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

  getFormFields(fields) {
    const search1 = {};
    _.map(fields, (doc, index) => {
      if (doc) {
        if (index === 'time') { // 判断为时间对象
          search1.beginTime = new Date(doc[0].format('YYYY-MM-DD HH:mm')).getTime();
          search1.endTime = new Date(doc[1].format('YYYY-MM-DD HH:mm')).getTime();
        } else if (index === 'appTime') {
          search1.appBeginTime = new Date(doc[0].format('YYYY-MM-DD HH:mm')).getTime();
          search1.appEndTime = new Date(doc[1].format('YYYY-MM-DD HH:mm')).getTime();
        } else {
          search1[index] = doc;
        }
      }
    });

    const pagination = this.state.pagination;
    pagination.currentPage = 1;
    this.setState({ search1: search1, pagination: pagination });
    this.loadData(search1, pagination, this.state.sorter);
  }

  check(data) { // 点击按钮跳转
    const arr = location.hash.split('/');
    arr.pop();
    arr.push(`loanauditdetails/${data.appId || data.applicationId}/1`);
    const str = arr.join('/');
    // 保存当前的搜索条件 以及分页
    sessionStorage.setItem('search1', JSON.stringify(this.state.search1));
    sessionStorage.setItem('pagination', JSON.stringify(this.state.pagination));
    const url = `${location.protocol}//${location.host}${location.pathname}${str}`;
    BuryPoint.setPoint("otherAPPEvaluationCheck", data.memberId, data.appId, null, {
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
    this.loadData(that.state.search1, pagination, sorterClient);
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
    this.loadData2(that.state.search1, paginations, sorterClient);
  }

  renderBody() {
    const that = this;
    let btn = false;
    if ((_.indexOf(JSON.parse(sessionStorage.getItem('roles')), 'downloadPermissions') > -1)) {
      btn = [
        {
          title: 'Download',
          type: 'danger',
          fn: that.download,
        },
      ];

    }
    const columns = [
      {
        title: 'No',
        dataIndex: 'appId',
        width: '9%',
      },
      {
        title: 'APP platform',
        dataIndex: 'versionName',
        width: '9%',
      },
      {
        title: 'User Name',
        dataIndex: 'memberPhone',
        width: '9%',
      },
      {
        title: 'Gender',
        dataIndex: 'sexName',
        filterMultiple: false,
        width: '9%',
      },
      {
        title: 'City/District',
        dataIndex: 'resideCity',
        width: '9%',
      },
      {
        title: 'Evaluation Status',
        dataIndex: 'appStatusName',
        width: '9%',
      },
      {
        title: 'Assessor',
        dataIndex: 'appOperatorName',
        width: '9%',
        render(index, record) {
          if (!record.appOperatorName) {
            return '—';
          }
          return record.appOperatorName;
        },
      },
      {
        title: 'Date of Registration',
        dataIndex: 'memberRegisterDate',
        width: '9%',
        sorter: (a, b) => new Date(a.memberRegisterDate) - new Date(b.memberRegisterDate),
        render: function (text, record) {
          return moment(record.memberRegisterDate).format('YYYY-MM-DD HH:mm');
        },
      },
      {
        title: 'Application Time',
        dataIndex: 'applicationTime',
        width: '9%',
        sorter: (a, b) => new Date(a.applicationTime) - new Date(b.applicationTime),
        render: function (text, record) {
          return moment(record.applicationTime).format('YYYY-MM-DD HH:mm');
        },
      },
      {
        title: 'Operation ',
        // width: '9%',
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
        placeholder: 'Input Application No',
      },
      {
        id: 'memberPhoneMatching',
        type: 'text',
        label: 'User Name',
        formType: 'textarea',
        placeholder: 'Enter User Name',
      },
      {
        id: 'memberNameMatching',
        type: 'text',
        label: 'Real Name',
        placeholder: 'Input Real Name',
      },
      {
        id: 'sex',
        type: 'select',
        label: 'Gender',
        placeholder: 'Please select',
        options: that.state.options.sexType,
      },
      {
        id: 'examineStatus',
        type: 'select',
        label: 'Evaluation Status',
        options: that.state.options.examineStatusList,
        placeholder: 'Please select',
      },
      {
        id: 'time',
        type: 'rangePicker',
        label: 'Date of Registration',
        placeholder: 'ranger',
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
        id: 'packetName',
        type: 'select',
        label: 'APP platform',
        options: that.state.options.appPlatformType,
        placeholder: 'Please select',
      },
    ];

    // 审核数据
    const operation2 = [
      {
        id: 'appTime',
        type: 'rangePicker',
        label: 'Application Time',
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
      search: that.state.search1,
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
      search: that.state.search1,
    };
    const tab2 = document.querySelectorAll('.ant-tabs-tab')[1];
    if (tab2 && data2.length) {
      tab2.classList.add('twinkle');
    }

    const { count, addOne } = this.props;

    return (
      <div className="OtherAPPEvaluation" key="OtherAPPEvaluation">
        <CLList settings={settings} />
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
export default OtherAPPEvaluation;
