import React from 'react';
import { Table} from 'antd';
import { CL } from '../tools/index';
import CLComponent from './CLComponent.jsx';
import CLBlockList from './CLBlockList.jsx';
import {Interface} from "../config/index.js";
const { Details, contentType } = Interface;

class AppFromAddressBook extends CLComponent {
  state = {
    applist: [],
    pagination: {
      current: 1,
      total: 1,
      pageSize: 20
    }
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'loadData',
      "changePage",
    ]);
  }

  componentDidMount () {
    this.loadData();
  }

  changePage (e) {
    const that = this;
    const pagination = {
      current: e.current,
      total: e.total,
      pageSize: e.pageSize
    }
    that.setState({pagination: pagination});
    that.loadData(pagination);
  }

  loadData(pagination) {
    const that = this;
    const memberId = that.props.memberId;
    pagination = pagination || that.state.pagination
    const applistSettings = {
      contentType,
      method: Details.getAppListByContact.type,
      url: Details.getAppListByContact.url,
      data: JSON.stringify({
        contactPersonInfo: {
          merberId: memberId
        },
        page: {
          currentPage: pagination.current,
          pageSize: pagination.pageSize
        }
      })
    }
    function applistFn (res) {
      if (res.data) {
        that.setState({
          applist: res.data.result,
          pagination: {
            total: res.data.totalCount,
            current: res.data.currentPage || pagination.current,
            pageSize: res.data.pageSize || pagination.pageSize
          }
        });
      }
    }

    if (memberId) {
      CL.clReqwest({settings: applistSettings, fn: applistFn});
    }
  }


  render() {
    const that = this;
    const applist = that.state.applist || [];
    const AppList = {
      columns: [
        {
          title: 'No.',
          dataIndex: 'index',
          width: "25%"
        },
        {
          title: 'Application No.',
          dataIndex: 'appId',
          render: function (doc, record) {
            return (<a href={`#/uplending/loanauditdetails/${record.appId}/0`} target="_blank" >{record.appId}</a>)
          },
          width: "25%"
        },
        {
          title: 'Phone number',
          dataIndex: 'memberPhone',
          width: "25%"
        },
        {
          title: 'Name',
          dataIndex: 'name',
          width: "25%"
        }
      ],
      data: _.map(applist, function (doc, index) {
        let obj = _.pick(doc, ["appId", "memberPhone", "name"]);
        obj.index = index + 1;
        return obj;
      })
    };

    return (
      <Table  bordered  className="address-book cl-table"  key="address-book cl-table"
        title = {() => (<h4 className="table-title"> Application From Contact List </h4>)}
        loading = {!that.state.applist}
        pagination = {that.state.pagination}
        columns={AppList.columns}
        dataSource={AppList.data}
        rowKey={record =>  record.index}
        onChange = {that.changePage}
        />
    );
  }
}
export default AppFromAddressBook;
