import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import CF from 'currency-formatter';


import {CLComponent} from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';


import _ from 'lodash';
import { Button } from 'antd';
let req;

const zoning = [
  {
    name: "north",
    value: 4
  },
  {
    name: "south",
    value: 2
  },
]

const overdueDays = [
  {
    name: "1 day",
    value: 1
  },
  {
    name: "3 day",
    value: 2
  },

  {
    name: "4 day",
    value: 4
  },
  {
    name: "5 day",
    value: 5
  },
  {
    name: "6 day",
    value: 6
  },
  {
    name: "7 day",
    value: 7
  },
  {
    name: "7-14 day",
    value: 714
  },
  {
    name: "30-60 day",
    value: 3060
  },
  {
    name: "60-90 day",
    value: 6090
  },
  {
    name: "more than 90 day",
    value: 90
  }
]

let  {getLoanOrderList, getPaymentCode, contentType} = Interface;

class PostLoan extends CLComponent {
  state = {
    selectedRowKeys: [],
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1
    },
    sorter: {
      sortFieldType: 3,
      sortType: 1
    },
    tableLoading: false,
    search: {},
    options: {
      resideCity: [],
      status: [],
      overdueDays: overdueDays
    },
    data: null
  }

  constructor (props) {
    super(props);
    this.bindCtx([
      "renderBody",
      "getFormFields",
      "check",
      "loadData",
      "pageChage",
      "selectChange"
    ]);
  }

  componentDidMount() {
    CLAnimate.inAndOut(this);
    //搜索条件
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

    let sessionSorter = sessionStorage.getItem('sorter');
    let sorter = this.state.sorter;
    if (sessionSorter) {
      sorter = JSON.parse(sessionSorter);
    }

    this.loadData(search, pagination, sorter);
    this.setState({search: search, pagination: pagination, sorter: sorter});
  }

  loadData (search, page, sorter) {

    const that = this;
    that.setState({tableLoading: true});
    let params = {
      page: {
        currentPage: page.currentPage || 1,
        pageSize: page.pageSize || 10
      },
      loanBasisInfoJoinOrderInfo: search || this.state.search,
    }

    if (sorter && !sorter.sortType) {
      sorter = {
        sortFieldType: 3,
        sortType: 1
      }
    }
    params = _.extend(params, sorter);

    const settings = {
      contentType,
      method: 'post',
      url: getLoanOrderList.url,
      data: JSON.stringify(params)
    }

    function fn (res) {
      that.setState({tableLoading: false});
      let data = res.data;
      if (data) {
        let pagination = {
          total: data.page.totalCount,
          pageSize: page.pageSize,
          currentPage: page.currentPage,
        }
        sessionStorage.setItem("pagination", JSON.stringify(pagination));
        sessionStorage.setItem("search", JSON.stringify(search));
        sessionStorage.setItem("sorter", JSON.stringify(sorter));

        let cityArr = [];
        //city 去重
        _.each(data.creditCity, function (doc) {
          let fn = _.find(cityArr, {creditName: doc.creditName});
          if (!fn) {
            cityArr.push(doc);
          }
        });

        that.setState({
          "options":{
            status: CL.setOptions(data.repaymentStatus),
            resideCity: CL.setIdNameOptions(cityArr),
            overdueDays: overdueDays
          },
          city: CL.setIdNameOptions(cityArr),
          "pagination": pagination,
          "data": data.page.result || [],
        })
      }
    }

    if (req) {
      req.abort();
    }

    req = CL.clReqwest({settings, fn});
  }

  getFormFields (fields) {
    let search = {};
    _.map(fields, function (doc, index) {
      if (doc) {
        if (index === "sRepaymentTime") {
          search.sRepaymentTime = new Date(doc.format("YYYY-MM-DD"));
        } else if (index === "fRepaymentTime") {
          search.fRepaymentTime = new Date(doc.format("YYYY-MM-DD"));
        } else {
          search[index] = doc;
        }
      }
    })

    const pagination = this.state.pagination;
    pagination.currentPage = 1;
    this.setState({search: search, pagination: pagination});
    this.loadData(search, pagination, this.state.sorter);
  }

  selectChange (value, main) {
    const that = this;
    const arr = [2, 4];
    let opt = that.state.options;
    let search = that.state.search;
    if (arr.indexOf(parseInt(value)) > -1 &&  ["north", "south"].indexOf(main.props.children) > -1) {
      opt.resideCity = _.filter(that.state.city, {zone: parseInt(value)});
      search.creditName = "";
      search.zone = value;
      that.setState({options: opt, search: search});
    }
  }

  check (data) { //点击按钮跳转
    const that = this;
    let arr = location.hash.split('/');
    arr.pop();
      arr.push(`postloandetails/${data.orderId}/${data.applicationId}`);
    let str = arr.join('/');
    sessionStorage.setItem("search", JSON.stringify(that.state.search));

    //保存当前的搜索条件 以及分页
    sessionStorage.setItem("search", JSON.stringify(that.state.search));
    sessionStorage.setItem("pagination", JSON.stringify(that.state.pagination));
    const url = `${location.protocol}//${location.host}${location.pathname}${str}`;
    window.open(url);
    // location.hash = str;

  }

  pageChage (e, filters, sorter) {//list 切换页面
    let pagination = {
      currentPage: e.current,
      pageSize: e.pageSize,
      total: this.state.pagination.total
    }

    const SORTDIC = {
      "applicationTime": 2,
      "memberRegisterDate": 1,
      "descend": 1,
      "ascend": 2,
      sRepaymentTime: 3,
      fRepaymentTime: 4,
      overdueDays: 5

    }

    let sorterClient = {
      sortFieldType: SORTDIC[sorter.field] || 3,
      sortType: SORTDIC[sorter.order] || 1,
    }

    this.setState({pagination: pagination, sorter: sorterClient});
    this.loadData(this.state.search, pagination, sorterClient)
  }

  renderBody() {
    const { selectedRowKeys } = this.state;
    let that = this;


    const columns = [
      {
        title: 'No',
        dataIndex: 'applicationId',
        width: "5%",
        render: function (index, doc) {
          return (<a onClick={()=> {that.check(doc)}}> {doc.applicationId}</a>)
        }
      },
      {
        title: 'Name',
        dataIndex: 'name',
        width: "10%",
        render: function (index, record) {
          return record.name
        }
      },

      {
        title: 'Loan Amount',
        dataIndex: 'overduePrincipal-1',
        width: "6.5%",
        render (index, data) {
          return CF.format(data.overduePrincipal, {});
        }
      },

      {
        title: 'Loan Time',
        dataIndex: 'createdTime',
        width: "10%",
        render(doc, data) {

          let time;
          if (data.arrivalDate) {
            time = moment(new Date(data.arrivalDate)).format("YYYY-MM-DD HH:mm");
          } else {
            time = moment(new Date(data.createdTime)).format("YYYY-MM-DD HH:mm");
          }
          return time;
        } //改为时间
      },

      {
        title: 'Outstanding Balance',
        dataIndex: 'remainAmount',
        width: "5%",
        render (index, data) {
          return CF.format(data.remainAmount, {});
        }
      },
      {
        title: 'Amount paid',
        dataIndex: 'alreadyRepaymentAmount',
        width: "5%",
        render(doc, data) {
          return CF.format(data.alreadyRepaymentAmount, {});
        }
      },
      {
        title: 'Repayment Due Time',
        dataIndex: 'sRepaymentTime',
        width: "90px",
        render(doc, data) {
          return moment(new Date(data.sRepaymentTime)).format("YYYY-MM-DD")
        },
        sorter: (a, b) => new Date(a.sRepaymentTime) - new Date(b.sRepaymentTime),
      },
      {
        title: 'Repayment Time',
        dataIndex: 'fRepaymentTime',
        width: "85px",
        render(doc, data) {
          if (data.fRepaymentTime) {
            return moment(new Date(data.fRepaymentTime)).format("YYYY-MM-DD")
          } else {
            return "-";
          }

        },
        sorter: (a, b) => new Date(a.fRepaymentTime) - new Date(b.fRepaymentTime),
      },

      {
        title: 'Status',
        dataIndex: 'statusName',
        width: "7%",
      },
      {
        title: 'Overdue Days',
        dataIndex: 'overdueDays',
        width: "5%",
        sorter: (a, b) => new Date(a.overdueDays) - new Date(b.overdueDays),
      },
      {
        title: 'Amount',
        dataIndex: 'overdueAmount',
        width: "5%",
        render(doc, data) {
          return CF.format(data.overdueAmount, {});
        }

      },

      {
        title: 'Principal',
        dataIndex: 'overduePrincipal',
        width: "5%",
        render(doc, data) {
          return CF.format(data.overduePrincipal, {});
        }
      },

      {
        title: 'Interest',
        dataIndex: 'overdueInterest',
        width: "5%",
        render(doc, data) {
          return CF.format(data.overdueInterest, {});
        }
      },
      {
        title: 'Late Payment Fee',
        dataIndex: 'overdueDelayTax',
        width: "6%",
        render(doc, data) {
          return CF.format(data.overdueDelayTax, {});
        }
      },
      {
        title: 'Overdue Fee',
        dataIndex: 'overduePayment',
        width: "5%",
        render(doc, data) {
          return CF.format(data.overduePayment, {});
        }
      },
    ];

    let rowClass = [];

    const data = _.map(this.state.data, function (doc, index) {
      if (doc.remainAmount < 0) {
        doc.remainAmount = 0;
      }
      doc.id = 1 + index;

      if ((doc.status === 2 || doc.status === 4) && doc.alreadyRepaymentAmount > 0) {
        rowClass.push("yellow");
      } else {
        rowClass.push("normal");
      }
      return doc;
    });

    const operation = [
      {
        id: 'applicationId',
        type: 'text',
        label: 'Application No',
        placeholder: 'Input Application No'
      },
      {
        id: 'memberPhone',
        type: 'text',
        label: 'User Name',
        placeholder: 'Please input user name'
      },
      {
        id: 'memberNameMatching',
        type: 'text',
        label: 'Real Name',
        placeholder: 'Input Real Name'
      },
      {
        id: 'certificateNo',
        type: 'text',
        label: 'ID No',
        placeholder: 'Please type credential number',
      },
      {
        id: 'status',
        type: 'select',
        label: 'Status',
        options: that.state.options.status,
        placeholder: 'Please select',
      },

      {
        id: 'sRepaymentTime',
        type: 'dateTime',
        label: 'Repayment Due Time',
      },
      {
        id: 'fRepaymentTime',
        type: 'dateTime',
        label: 'Repayment Time',
      },
      {
        id: 'overdueDays',
        type: 'select',
        label: 'Overdue Days',
        options: that.state.options.overdueDays,
        placeholder: 'Please select',
      },
    ];

    let settings = {
      data: data.map( function (doc, index) {
        doc.id = doc.applicationId;
        return doc;
      }),
      columns: columns,
      operation: operation,
      getFields: that.getFormFields,
      pagination: that.state.pagination || {},
      pageChange: that.pageChage,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
      rowClass: rowClass,
      onSelect: that.selectChange,
    }

    return (
      <div className="loan-audit" key="loan-audit">
       <CLlist settings={settings} />
      </div>
    )
  }

  render (data) {
    return (
      <QueueAnim className="animate-content" type={this.state.aniType}>
        {this.state.showBlock ? [ this.renderBody() ] : null}
      </QueueAnim>
    )
  }
}
export default PostLoan;
