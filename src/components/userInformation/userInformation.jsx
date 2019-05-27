import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';

import { CLComponent } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';

import _ from 'lodash';
import { Button } from 'antd';

const { getUserInformationList, contentType } = Interface;
let req;

class UserInformation extends CLComponent {
  state = {
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1,
    },
    sorter: {
      sortFieldType: 2,
      sortType: 1
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

    //排序
    let sessionSorter = sessionStorage.getItem('sorter');
    let sorter = this.state.sorter;
    if (sessionSorter) {
      sorter = JSON.parse(sessionSorter);
    }

    this.loadData(search, pagination, sorter);
    this.setState({search: search, pagination: pagination, sorter: sorter});
  }

  loadData(search, page, sorter) {
    const that = this;
    that.setState({ tableLoading: true });
    let params = {
      page: {
        currentPage: page.currentPage || 1,
        pageSize: page.pageSize || 10,
      },
      loanBasisInfo: search || this.state.search,
      sortFieldType: 1,
      sortType: 1,
    };

    if (sorter) {
      params = _.extend(params, sorter);
    }

    const settings = {
      contentType,
      method: 'post',
      url: getUserInformationList.url,
      data: JSON.stringify(params),
    };
    function fn (res) {
      that.setState({ tableLoading: false });
      const data = res.data;
      if (data) {
        const pagination = {
          total: data.page.totalCount,
          pageSize: page.pageSize,
          currentPage: page.currentPage,
        };
        sessionStorage.setItem('pagination', JSON.stringify(pagination));
        sessionStorage.setItem('search', JSON.stringify(search));
        sessionStorage.setItem("sorter", JSON.stringify(sorter));

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

    if (req) {
      req.abort();
    }

    req = CL.clReqwest({settings, fn});
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
    this.setState({search: search, pagination: pagination});
    this.loadData(search, pagination, this.state.sorter);
  }

  check(data) { // 点击按钮跳转
    const arr = location.hash.split('/');
    arr.pop();
    arr.push(`userinformationDetails/${data.appId}/${data.memberId}`);
    const str = arr.join('/');
    // 保存当前的搜索条件 以及分页
    sessionStorage.setItem('search', JSON.stringify(this.state.search));
    sessionStorage.setItem('pagination', JSON.stringify(this.state.pagination));

    location.hash = str;
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
      sortFieldType: SORTDIC[sorter.field],
      sortType: SORTDIC[sorter.order],
    }
    
    this.setState({pagination: pagination, sorter: sorterClient})
    this.loadData(this.state.search, pagination, sorterClient)
  }

  renderBody() {
    const { selectedRowKeys } = this.state;
    const that = this;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    const columns = [
      {
        title: 'User ID',
        dataIndex: 'memberId',
        width: "15%",
      },
      {
        title: 'User Name',
        width: "15%",
        dataIndex: 'memberPhone',
      },
      {
        title: 'Gender',
        dataIndex: 'sexName',
        width: "15%",
        filterMultiple: false,
      },
      {
        title: 'City/District',
        dataIndex: 'resideCity',
        width: "15%",
      },
      {
        title: 'Date of Registration',
        dataIndex: 'memberRegisterDate',
        width: "15%",
        sorter: (a, b) => new Date(a.memberRegisterDate) - new Date(b.memberRegisterDate),
        render: function (text, record) {
          return moment(record.memberRegisterDate).format('YYYY-MM-DD HH:mm');
        },
      },
      {
        title: 'Operation ',
        dataIndex: 'Operation ',
        width: "15%",
        render: function (text, record) {
          return (<Button type="primary" onClick={() => { that.check(record); }}>check</Button>);
        },
      },
    ];

    const data = this.state.data;
    const operation = [
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
        placeholder: 'Input Real Name'
      },
      {
        id: 'sex',
        type: 'select',
        label: 'Gender',
        placeholder: 'Please select',
        options: that.state.options.sexType,
      },
      {
        id: 'time',
        type: 'rangePicker',
        label: 'Date of Registration',
        placeholder: 'ranger',
      },
    ];

    const settings = {
      data: data.map( function (doc, index) {
        doc.id = doc.appId;
        return doc;
      }),
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
export default UserInformation;
