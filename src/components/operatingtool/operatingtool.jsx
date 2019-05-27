import React from 'react';
import QueueAnim from 'rc-queue-anim';
import { CLComponent } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import  SMSTool from './smsTool.jsx';

import _ from 'lodash';
import { Button, Input, Modal, Tabs, DatePicker, message, Row, Col, Upload, Icon,} from 'antd';
import tableexport from 'tableexport';

const { TextArea } = Input;
const confirm = Modal.confirm;
const TabPane = Tabs.TabPane;
const {
   operatingToolPushList, operatingToolPushStatusLt, sendTheSubmission, getDownloadInformation, contentType,appMonitorProductVersionPacket,operatingToolPushImportData
} = Interface;
let TB;
class Operatingtool extends CLComponent {
  state = {
    tableLoading: false,
    search: {},
    options: {
      appNameList: [],
    },
    data: [],
    sendTextMessage: false,
    showTableExport: false,
    ExcelModal: false,
    type: '1',
    userCurrentState: [],
    message: '',
    subject: '',
    dataList: {},
    downloadList: {},
    data1: [],
    isClickable: true,
    fileList: [],
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'getFormFields',
      'loadData',
      'pushMessage',
      'handleCancel',
      'download',
      'sendTextMessage',
      'History',
      'tabChange',
      'userCurrentState',
      'noteChange',
      'noteChange1',
      'downloadContent',
      'download1',
    ]);
  }

  componentDidMount() {
    CLAnimate.inAndOut(this);
    // 搜索条件
    const sessionSearch = sessionStorage.getItem('search');
    const type = sessionStorage.getItem('operateDataType');
    let search = this.state.search;
    // this.loadData(search);
    this.userCurrentState();
    this.operatingToolPushStatusLt();
    this.setState({ search, type });
  }
  loadData(search) {
    const that = this;
    that.setState({ tableLoading: true });
    const params = {
      userStatus: search.userStatus,
      version: search.version,
      startTime: search.startDate,
      endTime: search.endTime,
      packetName: search.packetName
    };
    const settings = {
      contentType,
      method: operatingToolPushList.type,
      url: operatingToolPushList.url,
      data: JSON.stringify(params),
    };
    function fn(res) {
      that.setState({ tableLoading: false });
      const data = res.data;
      if (data) {
        that.setState({
          data: data || [],
        });
      }
    }
    CL.clReqwest({ settings, fn });
  }


  userCurrentState() {
    const that = this;
    const settings = {
      contentType,
      method: appMonitorProductVersionPacket.type,
      url: appMonitorProductVersionPacket.url,
    };
    function fn(res) {
        if (res.data) {
            that.setState({
                appNameList: res.data,
                options: {
                    appNameList: res.data.map(item => {
                        return {
                            value: item.packetName + "-" + item.version,
                            name: item.versionName
                        }
                    })
                }
        });
      }
    }
    CL.clReqwest({ settings, fn });
  }

  operatingToolPushStatusLt() {
    const that = this;
    const settings = {
      contentType,
      method: operatingToolPushStatusLt.type,
      url: operatingToolPushStatusLt.url,
    };
    function fn(res) {
      if (res.data) {
        that.setState({
          appNameList: res.data,
          userCurrentState: CL.setOptions(res.data),
        });
      }
    }
    CL.clReqwest({ settings, fn });
  }

  getFormFields(fields) {
      const search = {}, stateParams={};
      _.each(fields, (doc, index) => {
          if (doc) {
              if (index === 'time') { // 判断为时间对象
                  search.startDate = new Date(doc[0].format('YYYY-MM-DD'));
                  search.endTime = new Date(doc[1].format('YYYY-MM-DD'));
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
    this.setState({ search: stateParams });
    // this.loadData(search);
  }
  tabChange(e) {
    this.setState({
      type: e
    });
    sessionStorage.setItem('operateDataType', e);
  }
  pushMessage(data) {
    this.setState({ sendTextMessage: true, dataList: data });
  }
  handleCancel= (e) => {
    this.setState({ sendTextMessage: false, showTableExport: false, isClickable: true, ExcelModal:false });
    if (TB) {
      TB.remove();
    }
  }

  getPacketNameByAppName = (appName) => {
    let app = _.find(this.state.options.appNameList, (itr) => {
      return itr.name == appName;
    })
    return app.value && app.value.split('-')[0];
  }

  sendTextMessage() {
    const that = this;
    const data = that.state.dataList;
    confirm({
      title: 'Send push',
      content: 'Whether to send ?',
      onOk() {
        const settings = {
          contentType,
          method: sendTheSubmission.type,
          url: sendTheSubmission.url,
          data: JSON.stringify({
            userStatus: data.userStatus,
            version: data.version,
            packetName: that.getPacketNameByAppName(data.versionName),
            startTime: data.startTime,
            endTime: data.endTime,
            message: that.state.message,
            subject: that.state.subject,
          }),
        };
        const fn = function (res) {
          if (res && res.data) {
            that.setState({ sendTextMessage: false });
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
  noteChange(e) {
    if (e.target.value.length > 242) {
      message.error('The number of words exceeds 242 characters');
      return;
    }
    this.setState({ message: e.target.value });
  }
  noteChange1(e) {
    if (e.target.value.length > 50) {
      message.error('The number of words exceeds 50 characters');
      return;
    }
    this.setState({ subject: e.target.value });
  }
  download(data) {
    this.setState({ showTableExport: true, downloadList: data });
    setTimeout(() => {
      this.downloadContent();
    }, 500);
  }
  download1(target) {
    const that = this;
    that.setState({ showTableExport: true });
    setTimeout(() => {
      TB = tableexport(document.querySelector('#ex-table'), { formats: ['csv', 'txt', 'xlsx'] });
      that.setState({ isClickable: false });
    }, 100);
  }
  downloadContent() {
    const that = this;
    const data = that.state.downloadList;
    const settings = {
      contentType,
      method: getDownloadInformation.type,
      url: getDownloadInformation.url,
      data: JSON.stringify({
        userStatus: data.userStatus,
        version: data.version,
        startTime: data.startTime,
        endTime: data.endTime,
      }),
    };
    const fn = function (res) {
      if (res && res.data) { that.setState({ data1: res.data }); }
    };
    CL.clReqwest({ settings, fn });
  };

  History(data) { // 点击按钮跳转
    const arr = location.hash.split('/');
    arr.pop();
    arr.push('operatingtoolhistory');
    const str = arr.join('/');
    // 保存当前的搜索条件 以及分页
    // sessionStorage.setItem('search', JSON.stringify(this.state.search));
    const url = `${location.protocol}//${location.host}${location.pathname}${str}`;
    window.open(url);
  };

  ExcelUser = () => {
    this.setState({ExcelModal:true});
  };

  customRequest = (info) => {
    const that = this;
    const fileList = that.state.fileList;
    if (info.file) {
      const reader = new FileReader();
      let imgUrlBase64 = reader.readAsDataURL(info.file);
      reader.onload = function (e) {
        info.file.url = reader.result;
        fileList.push(info.file);
        that.setState({ info: info, fileList: fileList });
      };
    }
  };

  onRemoves = (e) => {
    this.setState({fileList: [], info: {}});
  };

  pushChange = (e) => {
    if(e.target.value.length >= 242){
      message.error('Limit 242 character. The content will send to user\'s app...');
    }
    this.setState({content: e.target.value});
  };

  pushTitle = (e) => {
    if(e.target.value.length>=50){
      message.error('Limit 50 character.');
    }
    this.setState({title: e.target.value});
  };

  pushSave = () => {
    const that = this;
    if(!that.state.info){
      message.error('Excel is required');
    }else if(!that.state.title) {
      message.error('title is required');
    }else if(!that.state.content) {
      message.error('context is required');
    }else{
      confirm({
        content: 'Whether to submit?',
        onOk(){
          let formData = new FormData(that.state.info.file);
          formData.append('file', that.state.info.file);
          formData.append('context ',that.state.content);
          formData.append('title ',that.state.title);
          const settings = {
            contentType,
            method: operatingToolPushImportData.type,
            url: operatingToolPushImportData.url,
            data: formData,
            processData: false,
          };

          function fn(res) {
            if(res && res.code === 200){
              message.success('Success');
              that.loadData(that.state.search, that.state.pagination);
              that.setState({ExcelModal: false, fileList: []});
            }
          }
          CL.clReqwest({ settings, fn });
        }
      })
    }
  };

  renderBody() {
    const that = this;
    let fileList = this.state.fileList;
    const uploadButton = (<Button><Icon type="upload" /> Upload Excel</Button>);
    const props = {
      listType: 'picture',
      defaultFileList: [...fileList],
      className: 'upload-list-inline',
      accept: ".xls,.xlsx",
      customRequest: that.customRequest,
      onRemove: that.onRemoves,
    };
    const columns = [
      {
        title: 'APP名称',
        dataIndex: 'versionName',
        width: '18%',
        render(index, record) {
          return record.versionName;
        },
      },
      {
        title: '用户当前状态',
        width: '18%',
        dataIndex: 'userStatusName',
        render(index, record) {
          return record.userStatusName;
        },
      },
      {
        title: '状态产生时间',
        width: '18%',
        dataIndex: 'strTime',
        render(index, record) {
          return record.strTime;
        },
      },
      {
        title: '用户数',
        dataIndex: 'peopleCount',
        width: '18%',
        render(index, record) {
          return record.peopleCount;
        },
      },
      {
        title: '操作',
        dataIndex: 'resideCity',
        render: function (text, record) {
          return (
            <div>
              <Button type="primary" onClick={() => { that.pushMessage(record); }}>发送</Button>
              {/* <Button type="danger" onClick={() => { that.download(record); }} style={{ marginLeft: 20 }}>下载</Button> */}
            </div>
          );
        },
      },
    ];

    const data = this.state.data;
    const operation = [
      {
        id: 'userStatus',
        type: 'select',
        label: '用户当前状态',
        placeholder: 'Please select',
        options: that.state.userCurrentState,
      },
      {
        id: 'time',
        type: 'rangePicker',
        label: '状态产生时间',
        placeholder: 'ranger',
      },
      {
        id: 'version',
        type: 'select',
        label: 'APP名称',
        placeholder: 'Please select',
        options: that.state.options.appNameList,
      },
    ];

    const settings = {
      data: data || [],
      columns: columns,
      operation: operation,
      getFields: that.getFormFields,
      pagination: false,
      pageChange: that.pageChage,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
      btn: [
        {
          title: 'History',
          fn: that.History,
        },
      ],
      btnTow: [
        {
          title: '导入用户包',
          type:'primary',
          fn: that.ExcelUser,
        },
      ],
    };
    const th = [
      'No.',
      'Name',
      'registration date',
      'Telephone Number',
      'App Platform',
    ];
    return (
      <div className="operatingtool" key="operatingtool">
        <Tabs defaultActiveKey={this.state.type} onChange={that.tabChange}>
          <TabPane tab="PUSH Tool" key="1" >
            <CLlist settings={settings} tableexport={tableexport} />
          </TabPane>
          <TabPane tab="SMS Tool" key="2" >
            <SMSTool/>
          </TabPane>
        </Tabs>
        <Modal
          visible={that.state.sendTextMessage}
          onOk={this.sendTextMessage}
          onCancel={that.handleCancel}
          okText="Confirm"
          cancelText="Cancel"
          mask={false}
          style={{ width: '2000px' }}
          title="Input push content"
        >
          <h4 style={{ padding: 10 }}>标题</h4>
          <TextArea placeholder="Limit to 50 characters..." autosize={{ minRows: 2, maxRows: 6 }} onChange={that.noteChange1} />
          <h4 style={{ padding: 10 }}>内容</h4>
          <TextArea placeholder="Limit 242 character. The content will send to user's app..." autosize={{ minRows: 2, maxRows: 6 }} onChange={that.noteChange} />
        </Modal>
        <Modal
          className="te-modal"
          title="Download user`s Phone number"
          closable
          type="danger"
          visible={that.state.showTableExport}
          style={{ width: '2000px' }}
          onCancel={that.handleCancel}
          footer={[
            <Button key="back" onClick={that.handleCancel}>Cancel</Button>,
            <Button disabled={!this.state.isClickable} key="wdwd" type="danger" onClick={that.download1}>download</Button>,
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
              that.state.data1.map((record, index) => {
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{record.name}</td>
                    <td>{record.registDate}</td>
                    <td>{record.telephoneNo}</td>
                    <td>{record.appPlatform}</td>
                  </tr>
                );
              })
            }
            </tbody>
          </table>
        </Modal>
        <Modal
          visible={that.state.ExcelModal}
          onOk={that.pushSave}
          onCancel={that.handleCancel}
          okText="Save"
          cancelText="Cancel"
          mask={false}
          style={{width: '2000px'}}
          title="导入用户包"
        >
          <Row style={{marginTop: 20}}>
            <Col span={3} offset={1}><strong>用户包 :</strong></Col>
            <Col span={6} offset={1} style={{marginRight: 10}} key={Math.random()}>
              <Upload {...props}>
                {fileList.length >= 1 ? null : uploadButton}
              </Upload>
            </Col>
            <Col span={6} style={{paddingTop: 0}}>
              限Excel文件，只member_id,不含表头
            </Col>
          </Row>
          <Row style={{marginTop: 20}}>
            <Col span={3} offset={1}><strong>推送标题 :</strong></Col>
            <Col span={12} offset={1} style={{marginRight: 10}}>
              <TextArea placeholder="Limit 50 characters..." autosize={{ minRows: 1, maxRows: 1 }} onChange={that.pushTitle} />
            </Col>
          </Row>
          <Row style={{marginTop: 20}}>
            <Col span={3} offset={1}><strong>推送内容 :</strong></Col>
            <Col span={12} offset={1} style={{marginRight: 10}}>
              <TextArea placeholder="Limit 242 character. The content will send to user's app..." autosize={{ minRows: 2, maxRows: 6 }} onChange={that.pushChange} />
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
export default Operatingtool;
