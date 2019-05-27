import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import tableexport from 'tableexport';
import { CLComponent } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import CF from 'currency-formatter';
import Viewer from 'viewerjs';
import _ from 'lodash';
import { Button, Tooltip, Icon, Row, Col, Input, message, Modal } from 'antd';
const { TextArea } = Input;

let TB;
let req;

const overdueDays = [
  {
    name: '0 day',
    value: 0,
  },
  {
    name: '1-3 day',
    value: 13,
  },
  {
    name: '4-7 day',
    value: 47,
  },
  {
    name: '8-15 day',
    value: 815,
  },
  {
    name: '16-30 day',
    value: 1630,
  },
  {
    name: 'more than 30 day',
    value: 30,
  },
];

const zoning = [
  {
    name: 'north',
    value: 4,
  },
  {
    name: 'south',
    value: 2,
  },
];

const {
  contentType,
  getCreditCollectionList,
  operatorAndRole,
} = Interface;

class CreditCollection extends CLComponent {
  state = {
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1,
    },
    sorter: {
      sortFieldType: 3,
      sortType: 1,
    },
    tableLoading: false,
    search1: {},
    options: {
      resideCity: [],
      status: [],
      repaymentStatus: [],
      overdueDays: overdueDays,
      collector: [],
    },
    data: [],
    showTableExport: false,
    sumOfMoney: {},
    data2: [],
    appPlatformType: [],
    arrs: [],
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'getFormFields',
      'check',
      'loadData',
      'loadDataTab2',
      'pageChage',
      'download',
      'handleCancel',
      'selectChange',
      'setTimer',
      'getOperList',
    ]);
  }
  download(target) {
    const that = this;
    that.setState({ showTableExport: true });
    setTimeout(() => {
      TB = tableexport(document.querySelector("#ex-table"), {formats: ['csv','txt','xlsx']});
    }, 100);
  }

  handleCancel() {
    const that = this;
    that.setState({
      showTableExport: false,
    });
    if (TB) {
      TB.remove();
    }
  }

  getOperList() {
    const that = this;
    const settings = {
      contentType,
      method: 'post',
      url: operatorAndRole.url,
      data: JSON.stringify({ roleIdRange: [1530, 1531, 1532, 1533, 1534, 1535, 1562, 1563] }),
    };

    function setCollectorOption(arr) {
      const arrUniq = [];
      arr.map((doc) => {
        if (_.findIndex(arrUniq, { value: doc.optId }) <= -1) {
          const obj = {};
          obj.name = doc.roleName;
          obj.value = doc.optId;
          arrUniq.push(obj);
        }
      });
      return arrUniq;
    }

    function fn(res) {
      if (res.data && res.data.userRole && res.data.userRole.length) {
        const options = that.state.options;
        options.collector = setCollectorOption(res.data.userRole) || [];
        that.setState({ options: options });// 第一个options
      }
    }

    CL.clReqwest({ settings, fn });
  }

  // 页面进入的时候加载的函数
  componentDidMount() {
    const that = this;
    // 搜索条件credit
    const sessionSearch = sessionStorage.getItem('search1');
    let search1 = this.state.search1;
    if (sessionSearch) {
      search1 = JSON.parse(sessionSearch);
    }
    // 分页credit
    const sessionPagination = sessionStorage.getItem('pagination');
    let pagination = this.state.pagination;
    if (sessionPagination) {
      pagination = JSON.parse(sessionPagination);
    }
    // 分页prmisePay
    const sessionPaginations = sessionStorage.getItem('paginations');
    let paginations = this.state.paginations;
    if (sessionPaginations) {
      paginations = JSON.parse(sessionPaginations);
    }

    // 排序暂时都用的是同样的参数
    const sessionSorter = sessionStorage.getItem('sorter');
    let sorter = this.state.sorter;
    if (sessionSorter) {
      sorter = JSON.parse(sessionSorter);
    }
    this.setState({
      search1: search1,
      pagination: pagination,
      sorter: sorter,
    });
    // 搜索和分页赋值到全局且请求4个tabbar的数据

    this.loadData(search1, pagination, sorter);
    setTimeout(() => {
      that.loadDataTab2(search1, that.state.pagination, that.state.sorter);
    }, 10000);

    if (this.state.type !== '2') { // 设定定时器
      this.setTimer();
    }
    that.getOperList();// 获取options内容
  }
  // 定时器
  setTimer() {
    const that = this;
    // 定时拉取promise to pay 数据，仿造消息提醒
    this.timer = setInterval(() => {
      that.loadDataTab2(that.state.search1, that.state.pagination, that.state.sorter);
    }, 300000);
  }

  componentWillUnmount() { // 清除定时器
    this.timer && clearTimeout(this.timer);
  }

  loadData(search1, page, sorter) {
    const that = this;
    that.setState({ tableLoading: true });
    // 兼容多选清空后，数组接口不支持的问题
    _.each(search1, (doc, index) => {
      if (_.isArray(doc) && doc.length === 0) {
        delete search1[index];
      }
    });

    let params = {
      page: {
        currentPage: page.currentPage,
        pageSize: page.pageSize,
      },
      loanBasisInfoJoinOrderInfo: search1 || this.state.search1,
    };

    if (sorter && !sorter.sortType) {
      sorter = {
        sortFieldType: 3,
        sortType: 1,
      };
    }
    params = _.extend(params, sorter);
    const settings = {
      contentType,
      method: 'post',
      url: getCreditCollectionList.url,
      data: JSON.stringify(params),
    };

    function setData(res) {
      that.setState({ tableLoading: false });
      const data = res.data;
      let arr = [];
      if (data) {
        res.data.productList.map((doc,index) => {
          arr.push({
            name: doc,
            value: doc,
          })
        })
        const pagination = {
          total: data.page.totalCount || '',
          pageSize: page.pageSize,
          currentPage: page.currentPage,
        };
        sessionStorage.setItem('pagination', JSON.stringify(pagination));
        sessionStorage.setItem('search1', JSON.stringify(search1));
        sessionStorage.setItem('sorter', JSON.stringify(sorter));

        const cityArr = [];
        // city 去重
        _.each(data.creditCity, (doc) => {
          const fn = _.find(cityArr, { creditName: doc.creditName });
          if (!fn) {
            cityArr.push(doc);
          }
        });

        const otherRepaymentStatus = CL.setOptions(data.specialStatus);
        that.setState({
          options: {
            status: CL.setOptions(data.pressStatus),
            resideCity: CL.setIdNameOptions(cityArr),
            overdueDays: overdueDays,
            repaymentStatus: CL.setOptions(data.repaymentStatus).concat(otherRepaymentStatus),
            collector: that.state.options.collector,
          },
          city: CL.setIdNameOptions(cityArr),
          ocity: CL.setIdNameOptions(data.creditCity),
          pagination: pagination,
          data: data.page.result || [],
          sumOfMoney: data.sumOfMoney || {},
          appPlatformType: arr,
        });
      }
    }

    if (req) {
      req.abort();
    }

    req = CL.clReqwest({ settings, fn: setData });
  }

  loadDataTab2(search1, page, sorter) {
    const that = this;
    const search2 = {
      endPromiseTime: new Date().getTime() + 30 * 60 * 1000,
      startPromiseTime: new Date('2019-01-01').getTime(),
      collectStatusRange: ['12'],
      repaymentStatus: '4',
    };

    const params = {
      page: {
        currentPage: page.currentPage || 1,
        pageSize: page.pageSize || 10,
      },
      loanBasisInfoJoinOrderInfo: search2,
    };

    const settings = {
      contentType,
      method: 'post',
      url: getCreditCollectionList.url,
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
        sessionStorage.setItem('pagination', JSON.stringify(pagination));
        sessionStorage.setItem('search1', JSON.stringify(search1));
        sessionStorage.setItem('sorter', JSON.stringify(sorter));


        const cityArr = [];
        // city 去重
        _.each(data.creditCity, (doc) => {
          const fn = _.find(cityArr, { creditName: doc.creditName });
          if (!fn) {
            cityArr.push(doc);
          }
        });

        const otherRepaymentStatus = CL.setOptions(data.specialStatus);

        that.setState({
          pagination2: pagination,
          data2: data.page.result || [],
        });
      }
    }

    CL.clReqwest({ settings, fn });
  }
  // onselechChange事件
  selectChange(value, main) {
    const that = this;
    const arr = [2, 4];
    const opt = that.state.options;
    const search1 = that.state.search1;
    if (arr.indexOf(parseInt(value)) > -1 && ['north', 'south'].indexOf(main.props.children) > -1) {
      opt.resideCity = _.filter(that.state.city, { zone: parseInt(value) });
      search1.creditName = '';
      search1.zone = value;
      that.setState({ options: opt, search1: search1 });
    }
  }
  getFormFields(fields) {
    const that = this;
    let search1 = {};
    _.map(fields, (doc, index) => {
      if (doc) {
        if (index === 'sRepaymentTime') {
          search1.startSRepaymentTime = new Date(doc[0].format('YYYY-MM-DD HH:mm')).getTime();
          search1.endSRepaymentTime = new Date(doc[1].format('YYYY-MM-DD HH:mm')).getTime();
        } else if (index === 'fRepaymentTime') {
          search1.startFRepaymentTime = new Date(doc[0].format('YYYY-MM-DD HH:mm')).getTime();
          search1.endFRepaymentTime = new Date(doc[1].format('YYYY-MM-DD HH:mm')).getTime();
        } else if (index === 'zone' && doc === '0') {
          search1 = search1;
        } else if (index === 'promiseTime') {
          search1.startPromiseTime = new Date(doc[0].format('YYYY-MM-DD HH:mm')).getTime();
          search1.endPromiseTime = new Date(doc[1].format('YYYY-MM-DD HH:mm')).getTime();
        } else {
          search1[index] = doc;
        }
      }
    },
    );
    const pagination = this.state.pagination;
    pagination.currentPage = 1;
    this.setState({ search1: search1, pagination: pagination });
    this.loadData(search1, pagination, this.state.sorter);
  }

  check(data) { // 点击按钮跳转
    const arr = location.hash.split('/');
    arr.pop();
    arr.push(`creditcollectionDetails/${data.orderId}/${data.applicationId}/${data.specialStatus || 0}/${data.lifetimeId || '0'}`);
    const str = arr.join('/');

    // 保存当前的搜索条件 以及分页
    sessionStorage.setItem('search1', JSON.stringify(this.state.search1));
    sessionStorage.setItem('pagination', JSON.stringify(this.state.pagination));
    const url = `${location.protocol}//${location.host}${location.pathname}${str}`;
    window.open(url);
    // location.hash = str;
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
      sRepaymentTime: 3,
      fRepaymentTime: 4,
      overdueDays: 5,

    };

    const sorterClient = {
      sortFieldType: SORTDIC[sorter.field] || 3,
      sortType: SORTDIC[sorter.order] || 1,
    };

    this.setState({ pagination: pagination, sorter: sorterClient });
    this.loadData(this.state.search1, pagination, sorterClient);
  }
  renderBody() {
    const that = this;
    let btn1 = false;
    if ((_.indexOf(JSON.parse(sessionStorage.getItem('roles')), 'downloadPermissions') > -1)) {
      btn1 = [
        {
          title: 'Download',
          type: 'danger',
          fn: that.download,
        },
      ];

    }
    const editStyle = {
      display: 'block',
      position: 'absolute',
      right: '15px',
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
      width: '100px',
    };

    const columns = [
      {
        title: 'No',
        dataIndex: 'applicationId',
        width: '5%',
        render: function (text, record) {
          return (<a onClick={() => { that.check(record); }}>{record.applicationId}</a>);
        },
      },
      {
        title: 'APP platform',
        dataIndex: 'versionName',
        width: '5%',
      },
      {
        title: 'Name',
        dataIndex: 'memberPhone',
        width: '7%',
        render: function (index, record) {
          return (<div>
          <div>{record.memberPhone}</div>
          <div>{record.name}</div>
          </div>);
          },
      },

      {
        title: 'Loan Time',
        dataIndex: 'createdTime',
        width: '7%',
        render(doc, data) {
          let time;
          if (data.arrivalDate) {
            time = moment(new Date(data.arrivalDate)).format('YYYY-MM-DD HH:mm');
          } else {
            time = moment(new Date(data.createdTime)).format('YYYY-MM-DD HH:mm');
          }
          return time;
        }, // 改为时间
      },

      {
        title: 'Outstanding Balance',
        dataIndex: 'remainAmount',
        width: '5%',
        render(index, data) {
          return CF.format(data.remainAmount, {});
        },
      },
      {
        title: 'Amount paid',
        dataIndex: 'alreadyRepaymentAmount',
        width: '5%',
        render(doc, data) {
          return CF.format(data.alreadyRepaymentAmount, {});
        },
      },

      {
        title: 'Repayment Due Time',
        dataIndex: 'sRepaymentTime',
        width: '7%',
        render(doc, data) {
          return moment(new Date(data.sRepaymentTime)).format('YYYY-MM-DD');
        },
        sorter: (a, b) => new Date(a.sRepaymentTime) - new Date(b.sRepaymentTime),
      },
      {
        title: 'Repayment Time',
        dataIndex: 'fRepaymentTime',
        width: '7%',
        render(doc, data) {
          if (data.fRepaymentTime) {
            return moment(new Date(data.fRepaymentTime)).format('YYYY-MM-DD');
          }
          return '-';
        },
        sorter: (a, b) => new Date(a.fRepaymentTime) - new Date(b.fRepaymentTime),
      },

      {
        title: 'Repayment Status',
        dataIndex: 'statusName',
        width: '8%',
        render: function (index, data) {
          const name = (_.find(that.state.options.repaymentStatus, { value: data.specialStatus || data.status }) || {}).name;
          if (data.status === 3 && data.specialStatus == 102) {
            return (<div>
              <Icon type="check-circle" />
              {name}
                    </div>);
          } else if ([1, 3].indexOf(data.status) < 0 && data.specialStatus == 101) { // 部分还款
            return (<div>
              <Icon type="close-circle" />
              {name}
                    </div>);
          } else if (data.status === 3) { // overdueClose
            return (<div>
              <Icon type="check-circle" />
              {data.statusName}
                    </div>);
          } else if (data.status === 4) { // 逾期未还
            return (<div>
              <Icon type="close-circle" />
              {data.statusName}
                    </div>);
          }
          return data.statusName;
        },
      },
      {
        title: 'Overdue Days',
        dataIndex: 'overdueDays',
        width: '5%',
        sorter: (a, b) => new Date(a.overdueDays) - new Date(b.overdueDays),
      },
      {
        title: 'Amount',
        dataIndex: 'overdueAmount',
        width: '6%',
        render(doc, data) {
          return CF.format(data.overdueAmount, {});
        },
      },

      {
        title: 'Principal',
        dataIndex: 'overduePrincipal',
        width: '5%',
        render(doc, data) {
          return CF.format(data.overduePrincipal, {});
        },
      },

      {
        title: 'Interest',
        dataIndex: 'overdueInterest',
        width: '5%',
        render(doc, data) {
          return CF.format(data.overdueInterest, {});
        },
      },
      {
        title: 'Late Payment Fee',
        dataIndex: 'overdueDelayTax',
        width: '5%',
        render(doc, data) {
          return CF.format(data.overdueDelayTax, {});
        },
      },
      {
        title: 'Overdue Fee',
        dataIndex: 'overduePayment',
        width: '5%',
        render(doc, data) {
          return CF.format(data.overduePayment, {});
        },
      },
      {
        title: 'Credit Collection Status',
        dataIndex: 'pressStatusName',
        width: '8%',
        render: function (index, record) {
          return (<div>
            <div>{record.pressStatusName || '-'}</div>
            <div>{record.promiseTime ? moment(new Date(record.promiseTime)).format('YYYY-MM-DD HH:mm') : '-'}</div>
          </div>);
        },
      },
      {
        title: 'Collector',
        dataIndex: 'collectorName',
        // width: '5%',
        render(doc, data) {
            return <p><p>{data.collectorCompanyName || "-"}</p><p>{data.collectorName || '-'}</p></p>;
        },
      },
    ];

    const rowClass = [];
    const data = _.map(that.state.data, (doc, index) => {
      if (doc.remainAmount < 0) {
        doc.remainAmount = 0;
      }

      if ((doc.status === 2 || doc.status === 4) && doc.alreadyRepaymentAmount > 0) {
        rowClass.push('yellow');
      } else {
        rowClass.push('normal');
      }
      return doc;
    });
    const { sumOfMoney = {}, data2 = [] } = that.state;

    const operation = [
      {
        id: 'applicationId',
        type: 'text',
        label: 'Application No',
        placeholder: 'Input Application No',
      },
      {
        id: 'memberPhone',
        type: 'text',
        label: 'User Name',
        placeholder: 'Please input user name',
      },
      {
        id: 'memberNameMatching',
        type: 'text',
        label: 'Real Name',
        placeholder: 'Input Real Name',
      },
      {
        id: 'certificateNo',
        type: 'text',
        label: 'ID No',
        placeholder: 'Please type credential number',
      },
      {
        id: 'sRepaymentTime',
        type: 'rangePicker',
        label: 'Repayment Due Time',
      },
      {
        id: 'fRepaymentTime',
        type: 'rangePicker',
        label: 'Repayment Time',
      },
      {
        id: 'collectStatusRange',
        type: 'select',
        label: 'Credit Collection Status',
        options: that.state.options.status,
        placeholder: 'Please select',
        mode: 'multiple',
      },
      {
        id: 'repaymentStatus',
        type: 'select',
        label: 'Repayment Status',
        options: that.state.options.repaymentStatus,
        placeholder: 'Please select',
      },
      {
        id: 'collectorIdRange',
        type: 'select',
        label: 'Collector',
        options: that.state.options.collector || [],
        placeholder: 'Please select',
        mode: 'multiple',
      },
      {
        id: 'promiseTime',
        type: 'rangePicker',
        label: 'Promise Date',
        placeholder: 'ranger',
      },
      {
        id: 'startOverdueDays',
        type: 'number',
        label: 'Overdue Days Start',
        placeholder: 'Start',
      },
      {
        id: 'endOverdueDays',
        type: 'number',
        label: 'Overdue Days End',
        placeholder: 'End',
      },
      {
        id: 'appName',
        type: 'select',
        label: 'APP platform',
        options: that.state.appPlatformType,
        placeholder: 'Please select',
      },
      {
          id: 'companyId',
          type: 'select',
          label: 'Company',
          placeholder: 'Please select',
          options: that.props.companyList || []
      }
    ];

    const settings = {
      data: data,
      columns: columns,
      operation: operation,
      getFields: that.getFormFields,
      pagination: that.state.pagination || {},
      pageChange: that.pageChage,
      tableLoading: that.state.tableLoading,
      search: that.state.search1,
      rowClass: rowClass,
      onSelect: that.selectChange,
      btn: btn1,
    };

    const settings2 = _.clone(settings);
    settings2.data = data2;
    settings2.operation = null;
    settings2.pagination = that.state.pagination2 || {};
    const th = [
      'No',
      'APP platform',
      'Name',
      'Phone',
      'Loan Time',
      'Outstanding Balance',
      'Amount paid',
      'Repayment Due Time',
      'Repayment Time',
      'Repayment Status',
      'Overdue Days',
      'Amount',
      'Principal',
      'Interest',
      'Late Payment Fee',
      'Overdue Fee',
      'Credit Collection Status',
      'Collector',
    ];

    // dom操作，添加闪烁
    const tab2 = document.querySelectorAll('.ant-tabs-tab')[1];
    if (tab2 && data2.length) {
      tab2.classList.add('twinkle');
    }

    return (
      <div className="credit-collection" key="credit-collection">
        <CLlist settings={settings} tableexport={tableexport}/>
        <Row>
          <Col span={23} offset={1} style={{ fontSize: '16px', color: '#108ee9' }}>
            <p>Total Amount: {sumOfMoney.sumOfOverdueAmount || 0 }</p>
            <p>Total Principal: {sumOfMoney.sumOfOverduePrincipal || 0 }</p>
            <p>Total Amount Paid: {sumOfMoney.sumOfAlreadyRepaymentAmount || 0 }</p>
          </Col>
        </Row>
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
              data.map((record, index) => {
                return (
                  <tr key={index}>
                    <td>{record.applicationId}</td>
                    <td>{record.versionName}</td>
                    <td>{record.name}</td>
                    <td>{record.memberPhone}</td>
                    <td>{moment(new Date(record.createdTime)).format('YYYY-MM-DD HH:mm')}</td>
                    <td>{CL.cf(record.remainAmount, 2)}</td>
                    <td>{CL.cf(record.alreadyRepaymentAmount, 2)}</td>
                    <td>{moment(record.sRepaymentTime).format('YYYY-MM-DD HH:mm')}</td>
                    <td>{record.fRepaymentTime ? moment(record.fRepaymentTime).format('YYYY-MM-DD HH:mm') : '-'}</td>
                    <td>{record.statusName}</td>
                    <td>{record.overdueDays}</td>
                    <td>{CL.cf(record.overdueAmount, 2)}</td>
                    <td>{CL.cf(record.overduePrincipal, 2)}</td>
                    <td>{CL.cf(record.overdueInterest, 2)}</td>
                    <td>{CL.cf(record.overdueDelayTax, 2)}</td>
                    <td>{CL.cf(record.overduePayment, 2)}</td>
                    <td>{record.pressStatusName || '-'}</td>
                    <td>{record.collectorName}</td>
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
        {this.renderBody()}
      </QueueAnim>
    );
  }
}
export default CreditCollection;
