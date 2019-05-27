import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';

import _ from 'lodash';
import { Modal, Tabs, } from 'antd';
import AddOfflinePromotion from "Src/components/promotion/addOfflinePromotion";

const TabPane = Tabs.TabPane;
const { promotionList, contentType, appConfigListAppName, appConfigListPacketApp } = Interface;

class OfflinePromotion extends CLComponent {
  state = {
    tableLoading: false,
    addOffline: false,
    search: {}, 
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1,
    },
    data: [],
    AppName: [],
    type: '1',
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'getFormFields',
      'loadData',
      'handleCancel',
      'tabChange',
    ]);
  }

  componentDidMount() {
    CLAnimate.inAndOut(this);
    // 搜索条件
    const sessionSearch = sessionStorage.getItem('search');
    if (sessionSearch) { search = JSON.parse(sessionSearch); }
    const type = sessionStorage.getItem('operateDataType');
    let search = this.state.search;
    this.loadData(search);
    this.getProductVersion();
    this.appConfigListPacketApp();
    this.setState({ search, type });
  }

  getProductVersion(){
    const that = this;
    const settings = {
      contentType,
      method: appConfigListAppName.type,
      url: appConfigListAppName.url,
    };
    function fn(res) {
      const data = res.data;
      if (data) {
        const roles = [];
        res.data.map((doc, index) => {
          roles.push({
            name: doc,
            value: doc,
          });
        });
        that.setState({ AppName: roles });
      }
    }
    CL.clReqwest({ settings, fn });
  }

  appConfigListPacketApp = () => {
    const that = this;
    const settings = {
      contentType,
      method: appConfigListPacketApp.type,
      url: appConfigListPacketApp.url,
    };
    function fn(res) {
      const data = res.data;
      let roles = [];
      if (data) {
        Object.keys(data).forEach(function(key){
          roles.push({
            name:data[key],
            value: key,
          });
        });
        that.setState({ AppNameList: roles });
      }
    }
    CL.clReqwest({ settings, fn });
  }

  loadData(search,page) {
    const that = this;
    that.setState({ tableLoading: true });
    let params = {
      startTime: search.startDate,
      endTime: search.endTime,
      phone: search.phone,
      version: search.version,
      appName: search.packetName,
      page: {
        pageSize: page && page.pageSize || 10,
        currentPage: page && page.currentPage || 1,
      }
    };
    let appVersionList = that.state.appVersionList;
      _.map(appVersionList,(doc) => {
        if (doc.packetName === params.packetName) {
          params = _.extend(params, doc);
        }
      });
    const settings = {
      contentType,
      method: promotionList.type,
      url: promotionList.url,
      data: JSON.stringify(params),
    };
    function fn(res) {
      that.setState({ tableLoading: false });
      const data = res.data;
      if (data) {
        const pagination = {
          total: data.page.totalCount,
          pageSize: data.page.pageSize,
          currentPage: data.page.currentPage,
        };
        that.setState({
          data: data.page.result || [],
          pagination: pagination
        });
      }
    }
    CL.clReqwest({ settings, fn });
  }


  pageChage = (e) => { // list 切换页面
    const that = this;
    const pagination = {
      currentPage: e.current,
      pageSize: e.pageSize,
      total: that.state.pagination.total,
    };

    this.setState({ pagination: pagination });
    this.loadData(that.state.search, pagination);
  }

  getFormFields(fields) {
      const search = {}, stateParams={};
      _.each(fields, (doc, index) => {
          if (doc) {
              if (index === 'time') { // 判断为时间对象
                  search.startDate = new Date(doc[0].format('YYYY-MM-DD 00:00:00')).getTime();
                  search.endTime = new Date(doc[1].format('YYYY-MM-DD 23:59:59')).getTime();
                  stateParams.startDate = search.startDate;
                  stateParams.endTime = search.endTime;
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
      });
      const pagination = this.state.pagination;
      pagination.currentPage = 1;
      this.setState({ search: search, pagination: pagination });
      this.loadData(search, pagination);
  }

  tabChange(e) {
    this.setState({ type: e });
    sessionStorage.setItem('operateDataType', e);
  }

  handleCancel () {
    this.setState({addOffline: false});
  }

  onCreate = () =>{
    this.setState({addOffline: true});
  }

  loadDataOne = () => {
    this.setState({addOffline: false, tableLoading: false });
    this.loadData(this.state.search,this.state.pagination);
  }

  renderBody() {
    const that = this;
    const columns = [
      {
        title: 'Id',
        dataIndex: 'id',
        width: '15%',
        render(index, record) {
          return record.id;
        },
      },
      {
        title: 'Create Time',
        width: '20%',
        dataIndex: 'createTime',
        render: function (text, record) {
          return moment(record.createTime).format('YYYY-MM-DD HH:mm');
        },
      },
      {
        title: 'App Platform',
        width: '20%',
        dataIndex: 'appPlatfrom',
        render(index, record) {
          return record.appPlatfrom ? record.appPlatfrom : '—';
        },
      },
      {
        title: 'User Phone',
        dataIndex: 'userPhone',
        width: '20%',
        render(index, record) {
          return record.userPhone;
        },
      },
      {
        title: 'Created by',
        dataIndex: 'createdBy',
        render (text, record) {
          return record.createdBy ? record.createdBy : '—';
        },
      },
    ];

    const data = that.state.data;
    const operation = [
      {
        id: 'packetName',
        type: 'select',
        label: 'App platform',
        placeholder: 'Please select',
        options: that.state.AppName,
      },
      {
        id: 'phone',
        type: 'text',
        label: 'User phone',
        placeholder: 'Please input',
      },
      {
        id: 'time',
        type: 'rangePicker',
        label: 'Create time',
        placeholder: 'ranger',
      },
    ];

    const settings = {
      data: data || [],
      columns: columns,
      operation: operation,
      getFields: that.getFormFields,
      pagination: that.state.pagination,
      pageChange: that.pageChage,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
      defaultbtn: [{
        title: 'Add',
        type: 'primary',
        fn: this.onCreate,
      }],
    };
    return (
      <div className="offlinePromotion" key="offlinePromotion">
        <Tabs defaultActiveKey={this.state.type} onChange={that.tabChange}>
          <TabPane tab="Offline promotion clients" key="1" >
            <CLlist settings={settings} />
          </TabPane>
        </Tabs>
        <Modal
          visible={that.state.addOffline}
          onOk={this.sendOffline}
          onCancel={that.handleCancel}
          okText="Save"
          cancelText="Cancel"
          mask={false}
          style={{ width: '1500px' }}
          title="Add offline promotion clients"
          footer={null}
          className='promotionClients'
        >
          <AddOfflinePromotion getFields={that.getFields} disabled loadDataOne={that.loadDataOne}/>
        </Modal>
      </div>
    );
  }

  render(data) {
    return (
      <QueueAnim className="offlinePromotion">
        {this.state.showBlock ? [this.renderBody()] : null}
      </QueueAnim>
    );
  }
}
export default OfflinePromotion;
