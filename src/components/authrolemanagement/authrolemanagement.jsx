import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import {CLComponent} from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';

import _ from 'lodash';
import { Button, Row, Col, message, Modal} from 'antd';
const confirm = Modal.confirm;

let  { contentType, getAuthRoleList, deleteAuthRole} = Interface;
let req;

class AuthRoleManagement extends CLComponent {
  state = {
    selectedRowKeys: [],
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1
    },
    tableLoading: false,
    search: {},
    data: []
  }

  constructor (props) {
    super(props);
    this.bindCtx([
      "renderBody",
      "getFormFields",
      "check",
      "loadData",
      "pageChage",
      "deleteRoleOper",
      "deleteRoleConfirm"
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

    this.loadData(search, pagination);
    this.setState({search: search, pagination: pagination})
  }

  loadData (search, page) {
    const that = this;
    that.setState({tableLoading: true});
    let params = {
      page: {
        currentPage: page.currentPage || 1,
        pageSize: page.pageSize || 10
      },
      authRole: search || this.state.search
    } 

    const settings = {
      contentType,
      method: 'post',
      url: getAuthRoleList.url,
      data: JSON.stringify(params)
    }

    function getList (res) {
      that.setState({tableLoading: false});
      const data = res.data;
      if (data) {
        const pagination = { 
          total: data.page.totalCount,
          pageSize: page.pageSize,
          currentPage: page.currentPage,
        }
        
        that.setState({
          "pagination": pagination,
          "data": data.page.result,
        })

        sessionStorage.setItem("pagination", JSON.stringify(pagination));
        sessionStorage.setItem("search", JSON.stringify(search));
      }
    }

    if (req) {
      req.abort();
    }

    req = CL.clReqwest({settings, fn: getList});

    
  }

  getFormFields (fields) {
    let search = {};
    _.map(fields, function (doc, index) {
      if (doc) {
        if (_.isArray(doc)) { //判断为时间对象
          search.beginTime = new Date(doc[0].format("YYYY-MM-DD HH:mm")).getTime();
          search.endTime = new Date(doc[1].format("YYYY-MM-DD HH:mm")).getTime();
        } else {
          search[index] = doc;
        }
      }
    })

    const pagination = this.state.pagination;
    pagination.currentPage = 1;
    this.setState({search: search, pagination: pagination});
    this.loadData(search, pagination);

  }

  deleteRoleOper(ctx) {
    console.log(ctx);
    const id = ctx.id;
    const that = this;
    const settings = {
      contentType,
      method: deleteAuthRole.type,
      url: deleteAuthRole.url + id,
    }

    function deleteUser (res) {
      that.setState({tableLoading: false});
      const data = res.data;
      if (data) {
        message.success(res.result);
        that.loadData(that.state.search, that.state.pagination);
      }
    }

    CL.clReqwest({settings, fn: deleteUser});
  }

  deleteRoleConfirm(ctx) {
    const that = this;
    confirm({
      title: 'Do you Want to delete these items?',
      content: 'do you confirm',
      onOk() {
        that.deleteRoleOper(ctx);
      }
    });
  }

  check (data, type) { //点击按钮跳转
    if (!type) {
      type = "4";
      data = {id: 0};
    }
    let arr = location.hash.split('/');
    arr.pop();
    arr.push(`authrolemanagementDetails/${data.id}`);
    arr.push(type);
    let str = arr.join('/');
    //保存当前的搜索条件 以及分页
    sessionStorage.setItem("search", JSON.stringify(this.state.search));
    sessionStorage.setItem("pagination", JSON.stringify(this.state.pagination));

    location.hash = str;
  }

  pageChage (e) {//list 切换页面
    let pagination = {
      currentPage: e.current,
      pageSize: e.pageSize,
      total: this.state.pagination.total
    }
    
    this.setState({pagination: pagination})
    this.loadData(this.state.search, pagination)
  }

  renderBody() {
    const { selectedRowKeys } = this.state;
    let that = this;

    const columns = [
      {
        title: 'Role Name',
        dataIndex: 'roleName',
        width: "10%",
      }, 
      {
        title: 'Notes',
        dataIndex: 'remark',
        width: "10%",

      },
      
      {
        title: 'Created Time',
        dataIndex: 'createTime',
        sorter: (a, b) => new Date(a.createTime) - new Date(b.createTime),
        render: function (text, record) {
          return moment(record.createTime).format("YYYY-MM-DD HH:mm");
        },
        width: "10%",

      },
      {
        title: 'Updated Time',
        dataIndex: 'updateTime',
        sorter: (a, b) => new Date(a.updateTime) - new Date(b.updateTime),
        render: function (text, record) {
          return moment(record.updateTime).format("YYYY-MM-DD HH:mm");
        },
        width: "10%",
        
      },
      
      {
        title: 'Operation ',
        dataIndex: 'Operation ',
        render: function (text, record) {
          return (
            <Row gutter={1}>
              <Col span={6}>
                <Button type="primary" onClick={()=> {that.check(record, "1")}}>Check</Button>
              </Col>
              <Col span={6}>
                <Button type="primary" onClick={()=> {that.check(record, "2")}}>Edit</Button>
              </Col>
              <Col span={6}>
                <Button type="danger" onClick={()=> {that.deleteRoleConfirm(record)}}>Delete</Button>
              </Col>
              <Col span={6}>
                <Button type="primary" onClick={()=> {that.check(record, "3")}}>Resource</Button>
              </Col>
            </Row>
          )
        }
      }
    ];

    const operation = [
      {
        id: 'Role Name',
        type: 'text',
        label: 'Account name',
        placeholder: 'Enter account Name'
      }
    ];

    const data = this.state.data;
    let settings = {
      data: data,
      columns: columns,
      operation: operation,
      getFields: that.getFormFields,
      pagination: that.state.pagination || {},
      pageChange: that.pageChage,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
      btn: [
        {
          title: "new",
          type: "primary",
          fn: that.check
        }
      ]
    }

    return (
      <div className="people-management" key="people-management">
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
export default AuthRoleManagement;