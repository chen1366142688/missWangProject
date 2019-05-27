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

import { Button, Icon, Modal, Row, Col, Tabs } from 'antd';

const TabPane = Tabs.TabPane;

let req;

const {
  contentType, getCreditCollectionList, monthlyCredit, collectionGroup, getAuthRoleList, operatorAndRole, getCompanyList
} = Interface;
let TB;
class CreditReport extends CLComponent {
  state = {
    month: [],
    collectors: [],
    collectors1: [],
    stage: [],
    options: {
      groupName: [],
      companyList: [],
      userList:[
        {name: '新用户', value:'0'},
        {name: '老用户', value: '1'},
      ]
    },
    groupName:'',
    search: {},
    data: [],
    concats: true,
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'getRolesList',
      'collectionGroup',
      'loadData',
      'getFormFields',
      'download',
      'handleCancel',

    ]);
  }

  componentDidMount() {
    const that = this;
    // 搜索条件
    const search = this.state.search;
    that.getRolesList();
      that.collectionGroup();
      this.getCompanyListMth();
    that.loadData(1,search);
  }

  getCompanyListMth = () => {
      let settings = {
          contentType,
          method: getCompanyList.type,
          url: getCompanyList.url,
          data: JSON.stringify({
              pageRequestDto: {
                  currentPage: 1,
                  limit: 1000,
                  order: 'desc',
                  sort: ['id']
              }
          })
      };

      CL.clReqwestPromise(settings)
          .then((res) => {
              if (res.status === "SUCCESS") {
                  let options = this.state.options;
                  options.companyList = res.response.rows.map(item => {
                      return {
                          name: item.name,
                          value: item.id
                      }
                  }) || [];
                  options.companyList.unshift({
                      name: 'Unipeso',
                      value: 0
                  })
                  this.setState({
                      options
                  })
              }
          });
  };

  loadData(num,search) {
    const that = this;
    that.setState({ tableLoading: true });

    const settings = {
      contentType,
      method: 'post',
      url: monthlyCredit.url,
      data: JSON.stringify(search),
    };

    function fn(res) {
      if (res && res.data) {
        const stage = CL.setOptions(res.data.collectingOrderStatus);
        let data = res.data.reportCollectionMonthlyList || [];

        that.setState({ stage, data });
        // 这是获取到催收阶段的数组之后与催收人员列表拼接的方法
        if(num === 1){
          const collectors = that.state.collectors.concat(CL.setOptions(res.data.collectingOrderStatus));
          // 这是重新赋值到全局state
          that.setState({ collectors: collectors});
        }
      }

      that.setState({ tableLoading: false });
    }

    CL.clReqwest({ settings, fn });
  }

  getRolesList() {
    const that = this;
    const settings = {
      contentType,
      method: 'post',
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

        arr.push(1557);
        arr.push(1558);

        const settings2 = {
          contentType,
          method: 'post',
          url: operatorAndRole.url,
          data: JSON.stringify({ roleIdRange: arr }),
        };

        function fn2(res) {
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

        CL.clReqwest({ settings: settings2, fn: fn2 });
      }
    }

    CL.clReqwest({ settings, fn });
  }
  collectionGroup (num) {
    const that = this;
    const settings = {
      contentType,
      method: 'get',
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
          options: _.assign(that.state.options, {
            groupName: roles,
          })
        });
        const collectors1 = that.state.collectors1.concat(roles);
        const collectors = that.state.collectors.concat(roles);
        that.setState({ collectors1: collectors1, collectors: collectors});
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
    this.loadData(2,search);
    this.setState({ search });
  }

  download(e) {
    const that = this;
    that.setState({ showTableExport: true });
    setTimeout(() => {
      TB = tableexport(document.getElementById('ex-table-credit-report'), { formats: ['csv', 'txt', 'xlsx'] });
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
    const { data, month, collectors, collectors1, stage, search, } = that.state;
    const columns = [
      {
        title: '催收员',
        dataIndex: 'collectorName',
        width: '9%',
        render(index, record) {
          var collectorName;
          for(let i=0;i<collectors1.length;i++){
            if(collectors1[i].value === record.groupId && record.collectorId==null && record.groupName=='Total' ){
              collectorName = collectors1[i];
              return collectorName.name
            }
          }
          for(let i=0;i<collectors.length;i++){
            if(collectors[i].value === record.collectorId ){
              collectorName = collectors[i];
              return collectorName.name
            }
          }
          if(record.memberFlagDesc == 'NewAndOldTotal' && record.companyName === "Total"){
            let company = _.find(that.state.options.userList, com => {
              return com.value == that.state.search.isOld;
          })
          return company ? company.name : "";
          }
          if (record.companyName === "Total") {
              let company = _.find(that.state.options.companyList, com => {
                  return com.value == that.state.search.companyId;
              })
              return "Company " + (company ? company.name : "");
          }
            return record.collectorName;
        },
      },
        {
            title: 'Company',
            dataIndex: 'companyName',
            width: '7%',
            render(index, record) {
                if(record.companyName === "Total"){
                    return "";
                }
                return record.companyName;
            },
        },
      {
        title: '月份',
        dataIndex: 'filingDate',
        width: '9%',
        render(index, record) {
          return moment(record.filingDate || record.filingTime).format('YYYY-MM');
        },
      },

      {
        title: '入催账户数',
        dataIndex: 'collectionCount',
        width: '9%',
        render(index, record) {
          return CL.cf(record.collectionCount, 0);
        },
      },

      {
        title: '入催本息',
        dataIndex: 'collectionPrincipalInterest',
        width: '9%',
        render(index, record) {
          return CL.cf(record.collectionPrincipalInterest, 2);
        },
      },
      {
        title: '还款本息',
        dataIndex: 'repaymentPrincipalInterest',
        width: '9%',
        render(index, record) {
          return CL.cf(record.repaymentPrincipalInterest, 2);
        },
      },
      {
        title: '还款总额',
        dataIndex: 'repaymentTotalAmount',
        width: '9%',
        render(index, record) {
          return CL.cf(record.repaymentTotalAmount, 2);
        },
      },

      {
        title: '还款费息',
        dataIndex: 'repaymentOverdueFee',
        width: '9%',
        render(index, record) {
          return CL.cf(record.repaymentOverdueFee, 2);
        },
      },
      {
        title: '本息还款率',
        dataIndex: 'repaymentPrincipalInterestRate',
        width: '9%',
        render(index, record) {
          return `${(CL.cf(record.repaymentPrincipalInterestRate, 4) * 100).toFixed(2)}%`;
        },
      },
      {
        title: '留存账户本息',
        dataIndex: 'retainedPrincipalInterest',
        width: '9%',
        render(index, record) {
          return CL.cf(record.retainedPrincipalInterest, 2);
        },
      },
      {
        title: '留存账户总额',
        dataIndex: 'retainedTotalAmount',
        render(index, record) {
          return CL.cf(record.retainedTotalAmount, 2);
        },
      },
    ];

    const operation = [
      {
        id: 'filingDateList',
        type: 'monthPicker',
        label: '月份',
        // options: month,
        placeholder: 'Please select',
      },

      {
        id: 'collectorId',
        type: 'select',
        label: '催收员',
        options: collectors,
        placeholder: 'Please select',
        // mode: "multiple"
      },

      {
        id: 'collectorStatus',
        type: 'select',
        label: '催收阶段',
        options: stage,
        placeholder: 'Please select',
        // mode: "multiple"
      },

      {
        id: 'groupId',
        type: 'select',
        label: '分组',
        options: that.state.options.groupName,
        placeholder: 'Please select',
        // mode: "multiple"
      },
      {
          id: 'companyId',
          type: 'select',
          label: 'Company',
          placeholder: 'Please select',
          options: that.state.options.companyList || []
      },
      {
          id: 'isOld',
          type: 'select',
          label: '用户类型',
          placeholder: 'Please select',
          options: that.state.options.userList || []
      }
    ];

    const settings = {
      data: data.map((doc, index) => {
        doc.id = index;
        return doc;
      }),
      columns: columns,
      operation: operation,
      getFields: that.getFormFields,
      pagination: false,
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

    // 下载表格
    const th = [
      '催收员',
      '月份',
      '入催账户数',
      '入催本息',
      '还款本息',
      '还款总额',
      '还款费息',
      '本息还款率',
      '留存账户本息',
      '留存账户总额',
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
          <table className="ex-table" id="ex-table-credit-report">
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
                     <tr key={index}>
                       <td>{doc.collectorId ? (_.find(that.state.collectors, { value: doc.collectorId }) || {}).name : doc.groupName}</td>
                       <td>{moment(doc.filingDate || doc.filingTime).format('YYYY-MM')}</td>
                       <td>{CL.cf(doc.collectionCount, 0)}</td>
                       <td>{CL.cf(doc.collectionPrincipalInterest, 2)}</td>
                       <td>{CL.cf(doc.repaymentPrincipalInterest, 2)}</td>
                       <td>{CL.cf(doc.repaymentTotalAmount, 2)}</td>
                       <td>{CL.cf(doc.repaymentOverdueFee, 2)}</td>
                       <td>{CL.cf(doc.repaymentPrincipalInterestRate, 2)}</td>
                       <td>{CL.cf(doc.retainedPrincipalInterest, 2)}</td>
                       <td>{CL.cf(doc.retainedTotalAmount, 2)}</td>
                     </tr>
                   );
                 })
               }
            </tbody>
          </table>
        </Modal>
        <CLlist settings={settings} />
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
export default CreditReport;
