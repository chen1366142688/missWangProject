import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import tableexport from 'tableexport';

import { CLComponent } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';

import _ from 'lodash';
import { Button, Modal } from 'antd';

const { getRevaluationList, contentType } = Interface;
let TB;

class Revaluation extends CLComponent {
  state = {
    selectedRowKeys: [],
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1,
    },
    sorter: {
      sortFieldType: 2,
      sortType: 1,
    },
    tableLoading: false,
    search: {
      // memberPhoneMatching: "",
      // examineStatus: "",
      // beginTime: "",
      // endTime: "",
      // sex: 1
    },
    options: {
      examineStatusList: [],
      sexType: [],
    },
    data: [],
    showTableExport: false,
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'getFormFields',
      'check',
      'loadData',
      'pageChage',
      'download',
      'handleCancel',
    ]);
  }

  download(e) {
    const that = this;

    that.setState({ showTableExport: true });
    setTimeout(() => {
      TB = tableexport(document.getElementById('ex-table'), { formats: ['csv', 'txt', 'xlsx'] });
    }, 100);
  }

  handleCancel() {
    const that = this;
    that.setState({ showTableExport: false });
    if (TB) {
      TB.remove();
    }
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

    // 排序
    const sessionSorter = sessionStorage.getItem('sorter');
    let sorter = this.state.sorter;
    if (sessionSorter) {
      sorter = JSON.parse(sessionSorter);
    }

    this.loadData(search, pagination, sorter);
    this.setState({ search: search, pagination: pagination, sorter: sorter });
  }

  loadData(search, page, sorter) {
    const that = this;
    let params = {
      page: {
        currentPage: page.currentPage || 1,
        pageSize: page.pageSize || 10,
      },
      loanBasisInfo: search || this.state.search,
    };

    if (sorter) {
      params = _.extend(params, sorter);
    }

    const settings = {
      contentType,
      method: 'post',
      url: getRevaluationList.url,
      data: JSON.stringify(params),
    };
    that.setState({ tableLoading: true });

    function fn(res) {
      that.setState({ tableLoading: false });
      if (res.data) {
        const data = res.data;
        if (data) {
          const pagination = {
            total: data.page.totalCount,
            pageSize: page.pageSize,
            currentPage: page.currentPage,
          };
          sessionStorage.setItem('pagination', JSON.stringify(pagination));
          sessionStorage.setItem('search', JSON.stringify(search));
          sessionStorage.setItem('sorter', JSON.stringify(sorter));

          that.setState({
            options: {
              examineStatusList: CL.setOptions(data.examineStatusList),
              sexType: CL.setOptions(data.sexType),
            },
            pagination: pagination,
            data: data.page.result || [],
          });
        }
      }
    }
    CL.clReqwest({ settings, fn });
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
    this.loadData(search, pagination, this.state.sorter);
  }

  check(data) { // 点击按钮跳转
    const arr = location.hash.split('/');
    arr.pop();
    arr.push(`revaluationdetails/${data.appId}`);
    const str = arr.join('/');
    // 保存当前的搜索条件 以及分页
    sessionStorage.setItem('search', JSON.stringify(this.state.search));
    sessionStorage.setItem('pagination', JSON.stringify(this.state.pagination));

    location.hash = str;
  }

  pageChage(e, filters, sorter) { // list 切换页面
    const pagination = {
      currentPage: e.current,
      pageSize: e.pageSize,
      total: this.state.pagination.total,
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

    this.setState({ pagination: pagination, sorter: sorterClient });
    this.loadData(this.state.search, pagination, sorterClient);
  }

  renderBody() {
    const { selectedRowKeys } = this.state;
    const that = this;
    const columns = [
      {
        title: 'No',
        dataIndex: 'appId',
        width: '10%',
        // sorter: (a, b) => a.appId - b.appId,
      },
      {
        title: 'User Name',
        width: '10%',
        dataIndex: 'memberPhone',
      },
      {
        title: 'Real Name',
        dataIndex: 'name',
        width: '10%',
      },
      {
        title: 'Gender',
        dataIndex: 'sexName',
        width: '10%',
        // filters: [
        //   {
        //     text: 'MALE',
        //     value: 'MALE',
        //   },
        //   {
        //     text: 'FEMALE',
        //     value: 'FEMALE',
        //   }
        // ],
        // filterMultiple: false,
        // onFilter: (value, record) => record.sexName.indexOf(value) === 0,
        // sorter: (a, b) => a.sexName - b.sexName,
      },
      {
        title: 'City/District',
        dataIndex: 'resideCity',
        width: '10%',
      },
      {
        title: 'Evaluation Status',
        dataIndex: 'appStatusName',
        width: '10%',
      },
      {
        title: 'Assessor',
        dataIndex: 'appOperatorName',
        width: '10%',
      },
      {
        title: 'Date of Registration',
        dataIndex: 'memberRegisterDate',
        width: '10%',
        sorter: (a, b) => new Date(a.memberRegisterDate) - new Date(b.memberRegisterDate),
        render: function (text, record) {
          return moment(record.memberRegisterDate).format('YYYY-MM-DD HH:mm');
        },
      },
      {
        title: 'Application Time',
        dataIndex: 'applicationTime',
        width: '10%',
        sorter: (a, b) => new Date(a.applicationTime) - new Date(b.applicationTime),
        render: function (text, record) {
          return moment(record.applicationTime).format('YYYY-MM-DD HH:mm');
        },
      },
      {
        title: 'Operation ',
        dataIndex: 'Operation ',
        width: '10%',
        render: function (text, record) {
          return (<Button type="primary" onClick={() => { that.check(record); }}>check</Button>);
        },
      },
    ];

    const data = this.state.data;
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
        id: 'operatorNameMatching',
        type: 'text',
        label: 'Auditor',
        placeholder: 'Input assessor',
      },
      {
        id: 'time',
        type: 'rangePicker',
        label: 'Date of Registration',
        placeholder: 'ranger',
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
      btn: [
        {
          title: 'Download',
          type: 'danger',
          fn: that.download,
        },
      ],
    };

    const th = [
      'Application ID',
      'Net Proceed',
      'Account number',
      'Account holder name',
      'Institution name',
    ];

    return (
      <div className="loan-audit" key="loan-audit">
        <CLlist settings={settings} />
        <Modal
          className="te-modal"
          title="Download"
          closable
          visible={that.state.showTableExport}
          width="100%"
          style={{ top: 0 }}
          onCancel={that.handleCancel}
          footer={[
            <Button key="back" size="large" onClick={that.handleCancel}>Cancel</Button>,
           ]}
        >
          <table id="ex-table">
            <thead>
              <tr>
                {th.map((doc) => {
                   return (<th key={doc}>{doc}</th>);
                 })}
              </tr>
            </thead>
            <tbody>
              {
                 that.state.data.map((doc, index) => {
                   return (
                     <tr key={doc.name + index}>
                       <td>{doc.appId}</td>
                       <td>{doc.appAccountAmount}</td>
                       <td>{`\`${doc.accountNo}`}</td>
                       <td>{doc.bankAccountOwner}</td>
                       <td>{doc.bank}</td>
                     </tr>
                   );
                 })
               }
            </tbody>
          </table>
        </Modal>
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
export default Revaluation;
