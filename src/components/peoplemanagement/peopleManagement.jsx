import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';

import {CLComponent} from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import {CLAnimate, CL} from '../../../src/lib/tools/index';
import {Interface} from '../../../src/lib/config/index';
import {Button, Row, Col, Modal } from 'antd';

const confirm = Modal.confirm;
import _ from 'lodash';

const {getRevaluationList, contentType, getPeopleManageList, creditCollectionResetPassword } = Interface;
let req;


class PeopleManagement extends CLComponent {
  state = {
    selectedRowKeys: [],
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1,
    },
    tableLoading: false,
    resetPwdModal: false,
    search: {},
    options: {
      status: [],
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

    this.loadData(search, pagination);
    this.setState({search: search, pagination: pagination});
  }

  loadData(search, page) {
    const that = this;
    that.setState({tableLoading: true});
    const params = {
      page: {
        currentPage: page.currentPage || 1,
        pageSize: page.pageSize || 10,
      },
      operator: search || this.state.search,
    };

    const settings = {
      contentType,
      method: 'post',
      url: getPeopleManageList.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      that.setState({tableLoading: false});
      const data = res.data;
      if (data) {
        const pagination = {
          total: 100,
          pageSize: page.pageSize,
          currentPage: page.currentPage,
        };
        sessionStorage.setItem('pagination', JSON.stringify(pagination));
        sessionStorage.setItem('search', JSON.stringify(search));
        that.setState({
          options: {
            status: CL.setOptions(data.statusList),
          },
          pagination: pagination,
          data: data.page.result,
        });
      }
    }

    if (req) {
      req.abort();
    }

    req = CL.clReqwest({settings, fn});
  }

  onSelectChange = (selectedRowKeys) => { // 勾选项
    this.setState({selectedRowKeys});
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
    this.loadData(search, pagination);
  }

  check(data, type) { // 点击按钮跳转
    if (!type) {
      type = '4';
      data = {id: 0};
    }
    const arr = location.hash.split('/');
    arr.pop();
    arr.push(`peoplemanagementDetails/${data.id}`);
    arr.push(type);
    const str = arr.join('/');
    // 保存当前的搜索条件 以及分页
    sessionStorage.setItem('search', JSON.stringify(this.state.search));
    sessionStorage.setItem('pagination', JSON.stringify(this.state.pagination));

    location.hash = str;
  }

  resetPwd = (code) => {
    this.setState({resetCode: code, resetPwdModal: true, });
  }

  handleCancle = () => {
    this.setState({resetPwdModal: false});
  }

  resetPwdSave = () => {
    let that = this;
    confirm({
      title: '  Operate successfully?',
      content: 'The new password id 123456',
      onOk() {
       let settings = {
          contentType,
          method: creditCollectionResetPassword.type,
          url: `${creditCollectionResetPassword.url}${that.state.resetCode}`,
        };
        let fn = function (res) {
          if (res && res.code == 200) {
            that.loadData(that.state.search, that.state.pagination);
            that.setState({resetPwdModal: false});
          }
        };

        CL.clReqwest({settings, fn});
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  pageChage(e) { // list 切换页面
    const pagination = {
      currentPage: e.current,
      pageSize: e.pageSize,
      total: this.state.pagination.total,
    };

    this.setState({pagination: pagination});
    this.loadData(this.state.search, pagination);
  }


  renderBody() {
    const {selectedRowKeys} = this.state;
    const that = this;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    const columns = [
      {
        title: 'Account name',
        dataIndex: 'loginName',
        width: '8%',
      },
      {
        title: 'Full name of account',
        dataIndex: 'fullName',
        width: '8%',
      },
      {
        title: 'Telephone',
        dataIndex: 'mobile',
        width: '8%',
      },
      {
        title: 'Company',
        dataIndex: 'companyName',
        width: '8%',
      },
      {
        title: 'Gender',
        dataIndex: 'sexName',
        width: '8%',
      },
      {
        title: 'Status',
        dataIndex: 'statusName',
        width: '8%',
      },
      {
        title: 'Created time',
        dataIndex: 'createTime',
        sorter: (a, b) => new Date(a.createTime) - new Date(b.createTime),
        render: function (text, record) {
          return moment(record.createTime).format('YYYY-MM-DD HH:mm');
        },
        width: '10%',
      },

      {
        title: 'Operation ',
        dataIndex: 'Operation ',
        render: function (text, record) {
          return (
            <Row gutter={1}>
              <Col span={4}>
                <Button type="primary" onClick={() => {
                  that.check(record, '1');
                }}>Check</Button>
              </Col>
              <Col span={4}>
                <Button type="primary" onClick={() => {
                  that.check(record, '2');
                }}>Edit</Button>
              </Col>
              <Col span={8}>
                <Button type="primary" onClick={() => {
                  that.check(record, '3');
                }}>Role association</Button>
              </Col>
              <Col span={8}>
                <Button type="primary" onClick={() => that.resetPwd(record.id)}>Reset password</Button>
              </Col>
            </Row>
          );
        },
      },
    ];

    const operation = [
      {
        id: 'loginName',
        type: 'text',
        label: 'Account name',
        placeholder: 'Enter account Name',
      },
      {
        id: 'status',
        type: 'select',
        label: 'Account status',
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
      btn: [
        {
          title: 'new',
          type: 'primary',
          fn: that.check,
        },
      ],
    };

    return (
      <div className="people-management" key="people-management">
        <CLlist settings={settings}/>
        <Modal
          title="Notice"
          visible={that.state.resetPwdModal}
          onOk={that.resetPwdSave}
          onCancel={that.handleCancle}
          okText="Yes"
          cancelText="No"
          mask={false}
        >
          <Row style={{marginTop: 20}}>
            <Col span={22}>
              <strong>Whether to reset the password to initial password ? </strong>
            </Col>
          </Row>
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

export default PeopleManagement;
