import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import CF from 'currency-formatter';
import _ from 'lodash';
import tableexport from 'tableexport';
import { Button, Modal, Table } from 'antd';
let req;

const {
  contentType,
  collectionMonthlyDetailList,
  collectionGroup,
  monthlyCredit,
  getAuthRoleList,
  operatorAndRole
} = Interface;
let TB;
class MonthlyReportDetails extends CLComponent {
  state = {
    month: [],
    collectors: [],
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1
    },
    stage: [],
    options: {
      groupName: [],
    },
    search: {},
    data: [],
    defaultdate: ''
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'loadData',
      'getFormFields',
      'download',
      'handleCancel',
      'pageChage',

    ]);
  }

  componentDidMount() {
    const that = this;
    let sessionSearch = sessionStorage.getItem('search');
    let search = this.state.search;
    if (sessionSearch) {
      search = JSON.parse(sessionSearch);
    }
    //分页
    let sessionPagination = sessionStorage.getItem('pagination');
    let pagination = this.state.pagination;
    if (sessionPagination) {
      pagination = JSON.parse(sessionPagination);
    }
    // 搜索条件
    that.setState({ search: search, pagination: pagination });
    that.loadData1(search);
    that.collectionGroup();
    that.getRolesList();
    that.loadData( search, pagination);
  }

  loadData(search, page) {
    const that = this;
    that.setState({ tableLoading: true });
    let params = {
      reportCollection: search || that.state.search,
      page: {
        currentPage: page.currentPage || 1,
        pageSize: page.pageSize || 10,
      },
    }
    const settings = {
      contentType,
      method: collectionMonthlyDetailList.type,
      url: collectionMonthlyDetailList.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      if (res && res.data) {
        const pagination = {
          total: res.data.totalCount,
          pageSize: res.data.pageSize,
          currentPage: res.data.currentPage,
        };
        // 保存当前的搜索条件 以及分页
        sessionStorage.setItem('pagination', JSON.stringify(pagination));
        sessionStorage.setItem('search', JSON.stringify(search));
        that.setState({ data: res.data.result, pagination: pagination, defaultdate: res.data.result ? res.data.result[0].repaymentDate : ''});
      }

      that.setState({ tableLoading: false });
    }

    CL.clReqwest({ settings, fn });
  }
  loadData1(search) {
    const that = this;
    that.setState({ tableLoading: true });

    const settings = {
      contentType,
      method: monthlyCredit.type,
      url: monthlyCredit.url,
      data: JSON.stringify(search),
    };

    function fn(res) {
      if (res && res.data) {
        const stage = CL.setOptions(res.data.collectingOrderStatus);
        that.setState({ stage: stage });
      }
    }
    CL.clReqwest({ settings, fn });
  }
  getRolesList() {
    const that = this;
    const settings = {
      contentType,
      method: getAuthRoleList.type,
      url: getAuthRoleList.url,
      data: JSON.stringify(
        {
          page: { currentPage: 1, pageSize: 200 },
          authRole: {
            remark: '催收分单权限',
          },
        },
      ),
    };

    function fn(res) {
      if (res && res.data) {
        const result = res.data.page.result;
        const arr = Array.from(new Set(result.map((doc) => {
          return doc.id;
        })));

        const settings = {
          contentType,
          method: operatorAndRole.type,
          url: operatorAndRole.url,
          data: JSON.stringify({ roleIdRange: arr }),
        };

        function fn(res) {
          const arr = [];
          res.data.userRole.map((doc) => {
            if (!_.find(arr, { optId: doc.optId })) {
              arr.push(doc);
            }
          });

          that.setState({
            collectors: arr.map((doc) => {
              return {
                name: doc.roleName,
                value: doc.optId,
              };
            }),
          });
        }
        CL.clReqwest({ settings, fn });
      }
    }
    CL.clReqwest({ settings, fn });
  }

  collectionGroup () {
    const that = this;
    const settings = {
      contentType,
      method: collectionGroup.type,
      url: collectionGroup.url,
    };

    function fn(res) {
      if (res && res.data){
        const roles = [];
        _.each(res.data, (doc, index) => {
          roles.push({
            name: doc.name,
            value: doc.id,
          });
        });
        that.setState({
          options: {
            groupName: roles,
          }
        });
      }
    }
    CL.clReqwest({ settings, fn});
  }

  getFormFields(fields) {
    const search = {};
    _.map(fields, (doc, index) => {
      if (doc) {
        if (index === 'filingDateList') {
          const date = new Date(doc.format('YYYY-MM-DD')).getTime();
          search[index] = [date];
        } else {
          search[index] = doc;
        }
      }
    });
    const pagination = this.state.pagination;
    pagination.currentPage = 1;
    this.setState({search, pagination});
    this.loadData(search, pagination);
  }

  pageChage (e, filters) {//list 切换页面
    let pagination = {
      currentPage: e.current,
      pageSize: e.pageSize,
      total: this.state.pagination.total
    }
    this.setState({pagination: pagination});
    this.loadData(this.state.search, pagination)
  }

  download(e) {
    const that = this;
    that.setState({ showTableExport: true });
    setTimeout(() => {
      TB = tableexport(document.getElementById('ex-table-monthly-report'), { formats: ['csv', 'txt', 'xlsx'] });
    }, 100);
  }

  handleCancel() {
    const that = this;
    that.setState({ showTableExport: false });
    if (TB) {
      TB.remove();
    }
  }

  renderBody() {
    const that = this;
    const { data, month, collectors, stage, search, } = that.state;
    const columns = [
      {
        title: '申请单号',
        dataIndex: 'applicationId',
        width: '10%',
      },
      {
        title: '催收阶段',
        dataIndex: 'stageName',
        width: '10%',
      },
      {
        title: '催收员',
        dataIndex: 'operatorName',
        width: '10%',
      },
      {
        title: '分组',
        dataIndex: 'groupName',
        width: '9%',
        render(index,record){
          if(!record.groupName){
            return '-'
          }else {
            return record.groupName
          }
        }
      },
      {
        title: '入催时间',
        dataIndex: 'collectionDate',
        width: '10%',
        render(index, record) {
          return record.collectionDate;
        },
      },
      {
        title: '入催本息',
        dataIndex: 'collectionPrincipalInterestFormat',
        width: '10%',
        render(index, record) {
          if(record.collectionPrincipalInterestFormat == '-'){
            return '-'
          }else{
            return `${CL.cf(record.collectionPrincipalInterestFormat, 2)}`;
          }
        },
      },
      {
        title: '还款时间',
        dataIndex: 'repaymentDate',
        width: '10%',
        render(index, record) {
          return record.repaymentDate;
        },
      },

      {
        title: '还款总额',
        dataIndex: 'repaymentTotalAmount',
        width: '10%',
        render(index, record) {
          return CL.cf(record.repaymentTotalAmount, 2);
        },
      },
      {
        title: '还款本息',
        dataIndex: 'repaymentPrincipalInterest',
        width: '10%',
        render(index, record) {
          return `${CL.cf(record.repaymentPrincipalInterest, 2)}`;
        },
      },
      {
        title: '还款费率',
        dataIndex: 'repaymentOverdueFee',
        width: '10%',
        render(index, record) {
          return `${CL.cf(record.repaymentOverdueFee, 2)}`;
        },
      },
    ];

    const operation = [
      {
        id: 'filingDateList',
        type: 'monthPicker',
        label: '月份',
        placeholder: 'Please input',
      },

      {
        id: 'collectorId',
        type: 'select',
        label: '催收员',
        options: collectors,
        placeholder: 'Please select',
      },

      {
        id: 'groupId',
        type: 'select',
        label: '分组',
        options: that.state.options.groupName,
        placeholder: 'Please select',
      },

      {
        id: 'collectorStatus',
        type: 'select',
        label: '催收阶段',
        options: stage,
        placeholder: 'Please select',
      },

      {
        id: 'applicationId',
        type: 'text',
        label: '申请单号',
        placeholder: 'Please input',
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
      defaultdate: [
        {
          name: `月份 : `+that.state.defaultdate,
        }
      ],
      btn: [
        {
          title: 'Download',
          type: 'danger',
          fn: that.download,
        },
      ],
    };

    // 下载表格
    const th = [
      '申请单号',
      '催收阶段',
      '催收员',
      '分组',
      '入催时间',
      '入催本息',
      '还款时间',
      '还款总额',
      '还款本息',
      '还款费率',
    ];


    return (
      <div className="credit-collection" key="credit-collection">
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
          <table className="ex-table" id="ex-table-monthly-report">
            <thead>
              <tr>
                {th.map((doc) => {
                   return (<th key={doc}>{doc}</th>);
                 })}
              </tr>
            </thead>
            <tbody>
              {
                (data || []).map((doc, index) => {
                   return (
                     <tr key={index}>
                       <td>{doc.applicationId || '-'}</td>
                       <td>{doc.stageName}</td>
                       <td>{doc.operatorName}</td>
                       <td>{doc.groupName || '-'}</td>
                       <td>{doc.collectionDate}</td>
                       <td>{CL.cf(doc.collectionPrincipalInterestFormat, 2)}</td>
                       <td>{doc.repaymentDate}</td>
                       <td>{CL.cf(doc.repaymentTotalAmount, 2)}</td>
                       <td>{CL.cf(doc.repaymentPrincipalInterest, 2)}</td>
                       <td>{CL.cf(doc.repaymentOverdueFee, 2)}</td>
                     </tr>
                   );
                 })
               }
            </tbody>
          </table>
        </Modal>
        <CLlist settings={settings} />
        {/*<br/>*/}
        {/*<p style={{ float: 'right', marginRight: 25 }}>{that.sta}</p>*/}
        {/*<Table*/}
          {/*bordered*/}
          {/*size="small"*/}
          {/*className="monthly cl-table"*/}
          {/*rowKey={record => record.index}*/}
          {/*pagination={false}*/}
          {/*columns={columns}*/}
          {/*dataSource={settings.data}*/}
          {/*loading={that.state.btnLoading}*/}
          {/*tableexport={tableexport}*/}
        {/*/>*/}
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
export default MonthlyReportDetails;
