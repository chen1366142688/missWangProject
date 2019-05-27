import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';

import {CLComponent} from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import Viewer from 'viewerjs';
import _ from 'lodash';
import { Button, message } from 'antd';

let  {contentType, getBannerList } = Interface;
let TYPE = {};
let STATUS = {};
let req;


class BannerManagement extends CLComponent {
  state = {
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1
    },
    tableLoading: false,
    search: {},
    options: {
      bannerStatus: []
    },
    data: [],
    appNameList: [],
    packetNameList: [],
  }

  constructor (props) {
    super(props);
    this.bindCtx([
      "renderBody",
      "getFormFields",
      "check",
      "loadData",
      "pageChage",
      "showModal"
    ]);
  }

  showModal (e) {
    const viewer = new Viewer(e.target, {});
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
    const params = {
      page: {
        currentPage: page.currentPage || 1,
        pageSize: page.pageSize || 10
      },
      search: {
        beginCreateTime: search.beginCreateTime,
        endCreateTime: search.endCreateTime,
        packetName: search.packetName,
        appName: search.appName,
        version: search.version,
        status: search.status,
        title: search.title,
      },
    }

    const settings = {
      contentType,
      method: 'post',
      url: getBannerList.url,
      data: JSON.stringify(params)
    }

    function fn (res) {
      that.setState({tableLoading: false});
      const data = res.data;
      if (data) {
        const pagination = {
          total: data.page.totalCount,
          pageSize: page.pageSize,
          currentPage: page.currentPage,
        }
        //保存当前的搜索条件 以及分页
        sessionStorage.setItem("pagination", JSON.stringify(pagination));
        sessionStorage.setItem("search", JSON.stringify(search));

        _.each(data.bannerStatus, (value, index) => {
          STATUS[value.type]= value.typeName;
        });
        _.each(data.bannerType, (value, index) => {
          TYPE[value.type]= value.typeName;
        });
        let appArr = res.data.packetNameList;
        let arrList = res.data.appNameList;
        let packetNameList = [];
        let appNameList = [];
        for(let key in appArr){
          packetNameList.push({
            name: appArr[key],
            value: appArr[key],
          });
        }
        for(let key in arrList){
          appNameList.push({
            name: arrList[key],
            value: arrList[key],
          });
        }

        that.setState({
          "pagination": pagination,
          "data": data.page.result,
          options: {
            bannerStatus: CL.setOptions(data.bannerStatus),
            bannerType: CL.setOptions(data.bannerType),
          },
          packetNameList,
          appNameList
        })
      }
    }

    if (req) {
      req.abort();
    }

    req = CL.clReqwest({settings, fn});
  }

  getFormFields (fields) {
    let search = {}, stateParams={};
    _.map(fields, function (doc, index) {
      if (doc) {
        if (index === "time") { //判断为时间对象
          search.beginCreateTime = new Date(doc[0].format("YYYY-MM-DD HH:mm")).getTime();
          search.endCreateTime = new Date(doc[1].format("YYYY-MM-DD HH:mm")).getTime();
          stateParams.beginCreateTime = search.beginCreateTime;
          stateParams.endCreateTime = search.endCreateTime;
        } else if (index === "version") {
          let versionArr = fields.version.split('-');
          search.packetName = versionArr[0];
          search.version = versionArr[1];
          stateParams.version = doc;
        } else {
          search[index] = doc;
          stateParams[index] = doc;
        }
      }
    })

    const pagination = this.state.pagination;
    pagination.currentPage = 1;
    this.setState({search: stateParams, pagination: pagination});
    this.loadData(search, pagination);
  }

  check (data) { //点击按钮跳转
    let arr = location.hash.split('/');
    arr.pop();
    arr.push(`bannermanagementdetails/${data.id || 0}`);
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
        title: 'Banner',
        dataIndex: 'banner',
        width: "11%",
        render: function (text, record) {
          return (<img src={record.banner} onClick={that.showModal} alt="banner" style={{width: "100px"}}/>)
        }
      },
      {
        title: 'Headline',
        dataIndex: 'title',
        width: "10%",
      },
      {
        title: 'Type',
        dataIndex: 'type',
        width: "10%",
        render: function (text, record) {
          return TYPE[record.type];
        }
      },
      {
        title: 'App Platform',
        dataIndex: 'appName',
        width: "11%",
        render: function (text, record) {
          return record.appName;
        }
      },
      {
        title: 'Packet name',
        dataIndex: 'packetName',
        width: "13%",
        render: function (text, record) {
          return record.packetName;
        }
      },
      {
        title: 'Status',
        dataIndex: 'status',
        width: "11%",
        render: function (text, record) {
          return STATUS[record.status];
        }
      },
      {
        title: 'Create Time/Updated Time',
        width: "11%",
        dataIndex: 'createTime',
        sorter: (a, b) => new Date(a.createTime) - new Date(b.createTime),
        render: function (text, record) {
          return (
            <div>
              <div>{moment(record.createTime).format("YYYY-MM-DD HH:mm")}</div>
              <div>{record.updateTime ? moment(record.updateTime).format("YYYY-MM-DD HH:mm") : '-'}</div>
            </div>
          );
        }
      },
      {
        title: 'Create By/Updated By',
        width: "11%",
        dataIndex: 'createOperatorName',
        render: function (text, record) {
          return (
            <div>
              <div>{record.createOperatorName}</div>
              <div>{record.updateOperatorName || '-'}</div>
            </div>
          );
        }
      },
      {
        title: 'View ',
        dataIndex: 'statusName ',
        render: function (text, record) {
          return (<Button type="primary" onClick={()=> {that.check(record)}}>view</Button>)
        }
      }
    ];

    const operation = [
      {
        id: 'title',
        type: 'text',
        label: 'Title',
        placeholder: 'Enter title'
      },
      {
        id: 'status',
        type: 'select',
        label: 'Status',
        placeholder: 'Please select',
        options: that.state.options.bannerStatus
      },
      {
        id: 'time',
        type: 'rangePicker',
        label: 'Create Time',
      },
      {
        id: 'appName',
        type: 'select',
        label: 'App Platform',
        placeholder: 'Please select',
        options: that.state.appNameList,
      },
      {
        id: 'packetName',
        type: 'select',
        label: 'Packet name',
        placeholder: 'Please select',
        options: that.state.packetNameList,
      },
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
export default BannerManagement;
