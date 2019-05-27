import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL, SessionManagement } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';

import _ from 'lodash';
import { Button, Input, Modal, Tabs, DatePicker, message, Select, Col, Row } from 'antd';
const Option = Select.Option;
const { TextArea } = Input;
const confirm = Modal.confirm;
const {
  callSaleClientList,
  contentType,
  callSaleClientReasonType,
  callSaleClientDeal,
  appMonitorProductVersionPacket,
  getSaleManagementAdvisor,
} = Interface;
let TB;
let numArr = [];
for (let i = 4; i <= 72; i++) {
  numArr.push(i);
}
let sessionCode = SessionManagement.getStorageList().callRetrieve.clientList;
class Callsale extends CLComponent {
  state = {
    tableLoading: false,
    search: {},
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1,
    },
    dateStart: _.map(numArr, item => {
      return {
        name: '' + item,
        value: '' + item
      };
    }),
    dateEnd: _.map(numArr, item => {
      return {
        name: '' + item,
        value: '' + item
      };
    }),
    data: [],
    firstButtonPopover: false,
    subject: '',
    dataList: {},
    packetName: '',
    telephoneNo: '',
    startHour: '',
    endHour: '',
    reasonTypeList: [],
    appList: [],
    reasion: '',
    dealType: '',
    arr: [],
    advisorList: [],
    title: '',
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'loadData',
      'handleCancel',
      'sendTextMessage',
      'noteChange1',
      'firstButton',
      'secondButton',
      'pageChage',
      'version',
      'telephoneNo',
      'startHour',
      'endHour',
      'search',
      'clear',
      'suspend',
    ]);
  }

  componentDidMount() {
    CLAnimate.inAndOut(this);
    let type = SessionManagement.getSessionItem(sessionCode, 'operateDataType') || '1';
    this.loadData(this.state.search, this.state.pagination);
    this.callSaleClientReasonType();
    this.getProductVersion();
    this.loadAdvisor();
    this.setState({ type: type });
  }

  componentWillUnmount(){
      SessionManagement.destroySession(sessionCode);
  }
  loadData(search, page) {
    const that = this;
    that.setState({ tableLoading: true });
    let params = {
      tabIndex: '2',
      callSaleOutputPage: {
        currentPage: page.currentPage || 1,
        pageSize: page.pageSize || 10,
      },
      operatorId: this.state.advisor,
    };
    for (let key in search) {
      if (key == 'packetName') {
        params.packetName = search[key];
        that.state.arr.forEach(doc => {
          if (doc.packetName === params.packetName) {
            params = _.extend(params, doc);
          }
        });
      } else if (key == 'telephoneNo') {
        params.telephoneNo = search[key];
      }
      else if (key == 'startHour') {
        params.startHour = search[key];
      }
      else if (key == 'endHour') {
        params.endHour = search[key];
      }
    }
    const settings = {
      contentType,
      method: callSaleClientList.type,
      url: callSaleClientList.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      that.setState({ tableLoading: false });
      const data = res.data;
      if (res.code == 200) {
        const pagination = {
          total: data.callSaleOutputPage.totalCount,
          pageSize: page.pageSize,
          currentPage: page.currentPage,
        };
        SessionManagement.setSessionBatch(sessionCode, { pagination, search });
        that.setState({
          data: data.callSaleOutputPage.result || [],
          pagination: pagination,
        });
      } else {
        console.log('请求失败，可能是服务器故障!');
      }
    }

    CL.clReqwest({ settings, fn });
  }

  pageChage(e) { // list 切换页面
    const pagination = {
      currentPage: e.current,
      pageSize: e.pageSize,
      total: this.state.pagination.total,
    };

    this.setState({ pagination: pagination });
    this.loadData(this.state.search, pagination);
  }

  loadAdvisor = () => {
    const _this = this;
    const settings = {
      contentType,
      method: getSaleManagementAdvisor.type,
      url: getSaleManagementAdvisor.url,
    };

    function fn(res) {
      if (res.data) {
        let advisorList = _.map(res.data, item => {
          return {
            name: item.fullName,
            value: item.id.toString()
          };
        });
        _this.setState({ advisorList });
      }
    }

    CL.clReqwest({
      settings,
      fn,
    });
  }

  advisor = (e) => {
    let search = this.state.search;
    // e == 0 ? search.packetName = '0' : search.packetName = e;
    search.advisor = e;
    this.setState({
      search: search,
      advisor: e
    });
  };

  search(){
    const that = this;
    let searchNow = that.state.search;
    for(let key in searchNow){
      if(searchNow[key] == ""){
        delete searchNow[key]
      }
    }
    const pagination = that.state.pagination;
    pagination.currentPage = 1;
    this.setState({ search: searchNow, pagination: pagination });
    this.loadData(searchNow,pagination);
  }

  clear(){
    let search = this.state.search;
    for(let key in search){
      search.packetName = "";
      search.telephoneNo = "";
      search.startHour = "";
      search.endHour = "";
      search.advisor = '';
    }
    this.setState({ packetName: null, telephoneNo: null, startHour: null, endHour: null, advisor: null, search:search });
  }

  callSaleClientReasonType(){
    const that = this;
    const settings = {
      contentType,
      method: callSaleClientReasonType.type,
      url: callSaleClientReasonType.url,
    };
    function fn(res) {
      const data = res.data;
      if (data) {
        that.setState({
          reasonTypeList: data || [],
        });
      }
    }
    CL.clReqwest({ settings, fn });
  }

  getProductVersion(){
    const that = this;
    const settings = {
      contentType,
      method: appMonitorProductVersionPacket.type,
      url: appMonitorProductVersionPacket.url,
    };
    function fn(res) {
      const data = res.data;
      if (data) {
        const roles = [];
        const arr = [];
        res.data.map((doc, index) => {
          roles.push({
            name: doc.versionName,
            packetName: doc.packetName,
          });
          arr.push({
            version: doc.version,
            packetName: doc.packetName,
          });
        });
        that.setState({
          appList: roles,
          arr: arr,
        });
      }
    }
    CL.clReqwest({ settings, fn });
  }

  version(e){
    let search = this.state.search;
    // e == 0 ? search.packetName = '0' : search.packetName = e;
    search.packetName = e;
    this.setState({ search: search,packetName:e});
  }

  telephoneNo(e){
    let search = this.state.search;
    search.telephoneNo = e.target.value || '';
    this.setState({ search: search,telephoneNo: e.target.value});
  }

  startHour(e){
    let search = this.state.search;
    search.startHour = e || '';
    this.setState({search: search, startHour: e,});
  }

  endHour(e){
    let search = this.state.search;
    search.endHour = e || '';
    this.setState({ search: search,endHour: e,});
  }

  firstButton(data, title) {
    this.setState({ firstButtonPopover: true, dataList: data, dealType: 1, title: title });
  }

  secondButton(data, title) {
    this.setState({ firstButtonPopover: true, dataList: data, dealType: 2, title: title });
  }

  thirdButton = (data, title) => {
    this.setState({ firstButtonPopover: true, dataList: data, dealType: 4, title: title });
  }

  suspend(e){
    this.setState({ reasion: e });
  }

  handleCancel= (e) => {
    this.setState({ firstButtonPopover: false });
    if (TB) {
      TB.remove();
    }
  }

  sendTextMessage() {
    const that = this;
    const data = that.state.dataList;
    confirm({
      title: 'Notice',
      content: 'Whether to do ?',
      onOk() {
        const settings = {
          contentType,
          method: callSaleClientDeal.type,
          url: callSaleClientDeal.url,
          data: JSON.stringify({
            loanBasisInfoId: data.loanBasisInfoId,
            name: data.name,
            telephoneNo: data.telephoneNo,
            dealType: that.state.dealType,
            versionName: data.versionName,
            reasion: that.state.reasion,
            note: that.state.subject,
            dispatchedSaleId:data.callNo,
          }),
        };
        const fn = function (res) {
          if (res && res.data) {
            that.setState({ firstButtonPopover: false });
            that.loadData(that.state.search, that.state.pagination);
            message.success('Send a success');
          }
        };
        CL.clReqwest({ settings, fn });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  noteChange1(e) {
    if (e.target.value.length > 2000) {
      message.error('The number of words exceeds 2000 characters');
      return;
    }
    this.setState({ subject: e.target.value });
  }

  renderBody() {
    const that = this;
    const columns = [
      {
        title: 'Call No',
        dataIndex: 'callNo',
        width: '7%',
        key: 'callNo',
        render: function (text, record) {
          return record.callNo;
        },
      },
      {
        title: 'Quit time',
        dataIndex: 'leaveTime',
        key: 'leaveTime',
        width: '12%',
        render: function (text, record) {
          return moment(record.leaveTime).format('YYYY-MM-DD HH:mm:ss');
        },
      },
      {
        title: 'Name',
        width: '7%',
        dataIndex: 'name',
        key: 'name',
        render(index, record) {
          return record.name;
        },
      },
      {
        title: 'Gender',
        width: '7%',
        dataIndex: 'sex',
        key: 'sex',
        render(index, record) {
          return record.sex;
        },
      },
      {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
        width: '7%',
        render(index, record) {
          return record.age;
        },
      },
      {
        title: 'Tel',
        dataIndex: 'telephoneNo',
        key: 'telephoneNo',
        width: '10%',
        render(index, record) {
          return record.telephoneNo;
        },
      },
      {
        title: 'App name',
        dataIndex: 'versionName',
        key: 'versionName',
        width: '10%',
        render(index, record) {
          return record.versionName;
        },
      },
      {
        title: 'Quit page',
        dataIndex: 'leavePageName',
        key: 'leavePageName',
        width: '10%',
        render(index, record) {
          return record.leavePageName;
        },
      },
      {
        title: 'Advisor',
        dataIndex: 'operatorName',
        key: 'operatorName',
        width: '8%',
      },
      {
        title: 'Operate',
        dataIndex: 'resideCity',
        render: function (text, record) {
          return (
            <Row gutter={1}>
              <Col span={8}>
                <Button type="primary" onClick={() => { that.firstButton(record, 'Deal'); }} style={{ padding: '0 28px' }}>Deal</Button>
              </Col>
              <Col span={8}>
                <Button type="danger" onClick={() => { that.secondButton(record, 'Suspend'); }}>Suspend</Button>
              </Col>
              <Col span={8}>
                <Button type="danger" onClick={() => { that.thirdButton(record, 'Unreachable'); }} >Unreachable</Button>
              </Col>
            </Row>
          );
        },
      },
    ];

    const { data = [] } = this.state;
    const settings = {
      data: data,
      columns: columns,
      // operation: operation,
      // getFields: that.getFormFields,
      pagination: that.state.pagination || {},
      pageChange: that.pageChage,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
    };
    return (
      <div className="Callsale" key="Callsale">
            <Row style={{ marginTop: 20, padding: '0 20px' }}>
              <Col span={6}>
                <span>APP name：</span>
                <Select
                  onChange={that.version}
                  style={{ width: 150 }}
                  value={that.state.packetName}
                >
                  {
                    that.state.appList.map( doc => {
                      return (
                        <Option key={doc.packetName} value={doc.packetName}>{doc.name}</Option>
                      )
                    })
                  }
                </Select>
              </Col>
              <Col span={6}>
                <span>Tel：</span>
                <Input value={that.state.telephoneNo} onChange={that.telephoneNo} style={{width:150}} />
              </Col>
              <Col span={10}>
                <span>Quit time（h）：</span>
                <Select
                  onChange={that.startHour}
                  style={{ width: 150 }}
                  value={that.state.startHour}
                >
                  {
                    that.state.dateStart.map( doc => {
                      return (
                        <Option key={doc.value} value={doc.value}>{doc.name}</Option>
                      )
                    })
                  }
                </Select>
                <span style={{color:'#ececec'}}>——</span>
                <Select
                  onChange={that.endHour}
                  style={{ width: 150 }}
                  value={that.state.endHour}
                >
                  {
                    that.state.dateEnd.map( doc => {
                      return (
                        <Option key={doc.value} value={doc.value}>{doc.name}</Option>
                      )
                    })
                  }
                </Select>
              </Col>
            </Row>
        <Row style={{ marginTop: 20, padding: '0 20px' }}>
          <Col span={6}>
            <span style={{ marginRight: 15 }}>Advisor：</span>
            <Select onChange={that.advisor} style={{ width: 150 }} value={that.state.advisor}>
              {
                that.state.advisorList.map(doc => {
                  return (
                    <Option key={doc.value} value={doc.value}>{doc.name}</Option>
                  );
                })
              }
            </Select>
          </Col>
        </Row>
            <Row style={{marginTop: 20}}>
              <Col span={2} offset={20}>
                <Button type="primary" onClick={that.search}>search</Button>
              </Col>
              <Col span={2}>
                <Button type="text" onClick={that.clear}>clear</Button>
              </Col>
            </Row>
            <CLlist settings={settings} />
        <Modal
          visible={that.state.firstButtonPopover}
          onOk={this.sendTextMessage}
          onCancel={that.handleCancel}
          okText="Confirm"
          cancelText="Cancel"
          mask={false}
          style={{ width: '2000px' }}
          title={that.state.title}
        >
          <h4 style={{ padding: 10 }}>Why quit before？</h4>
          <Select
            onChange={that.suspend}
            style={{ width: 280 }}
            value={that.state.reasion}
          >
            {
              that.state.reasonTypeList.map( doc => {
                return (
                  <Option key={doc.type} value={doc.type}>{doc.typeName}</Option>
                )
              })
            }
          </Select>
          <h4 style={{ padding: 10 }}>Notes:</h4>
          <TextArea placeholder="Please inout..." autosize={{ minRows: 2, maxRows: 6 }} onChange={that.noteChange1} />
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
export default Callsale;
