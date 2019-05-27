import React from 'react';
import {CLComponent} from 'Components/index';
import CLlist from 'Components/CLlist.jsx';
import {CL} from 'Lib/tools/index';
import {Interface} from 'Lib/config/index';
import {Button, Modal, Input, message, Row, Col, Upload, Icon,} from 'antd';
import tableexport from 'tableexport';

const {TextArea} = Input;
const confirm = Modal.confirm;

const {
  appMonitorProductVersionPacket,
  operatingToolPushList,
  operatingToolPushStatusLt,
  contentType,
  sendMessageToPhone,
  operatingToolSmsImportData,
} = Interface;

export default class SMSTool extends CLComponent {
  constructor(props) {
    super(props);

    this.state = {
      msgLoading: false,
      search: {},
      options: {
        appNameList: [],
      },
      msgList: [],
      userCurrentState: [],
      sendData: {},
      sendTextMessage: false,
      ExcelModal: false,
      words: 300,
      fileList: [],
    }
  }

  componentDidMount(){
    // 搜索条件
    let search = this.state.search;
    const sessionSearch = sessionStorage.getItem('search');
    // this.loadData(search);
    this.userCurrentState();
    this.operatingToolPushStatus();
    this.setState({search: search});
  }

  loadData = (search) => {
    const _this = this;
    this.setState({msgLoading: true});

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
      _this.setState({msgLoading: false});
      const data = res.data;
      if (data) {
        _this.setState({
          msgList: data || [],
        });
      }
    }

    CL.clReqwest({settings, fn});
  }

  userCurrentState() {
    const _this = this;
    const settings = {
      contentType,
      method: appMonitorProductVersionPacket.type,
      url: appMonitorProductVersionPacket.url,
    };

    function fn(res) {
      if (res.data) {
        _this.setState({
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

    CL.clReqwest({settings, fn});
  }

  operatingToolPushStatus = () => {
    const _this = this;
    const settings = {
      contentType,
      method: operatingToolPushStatusLt.type,
      url: operatingToolPushStatusLt.url,
    };

    function fn(res) {
      if (res.data) {
        _this.setState({
          appNameList: res.data,
          userCurrentState: CL.setOptions(res.data),
        });
      }
    }

    CL.clReqwest({settings, fn});
  }

  getFormFields = (fields) => {
    const search = {}, stateParams = {};
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
    this.setState({search: stateParams});
    // this.loadData(search);
  }

  sendMessage = (data) => {
    let words = 300 - data.versionName.length - 2;
    this.setState({sendTextMessage: true, sendData: data, words});

  }

  sendTextMessage = () => {
    const _this = this;
    const data = this.state.sendData;
    confirm({
      title: 'Send message',
      content: 'Whether to send ?',
      onOk() {
        const settings = {
          contentType,
          method: sendMessageToPhone.type,
          url: sendMessageToPhone.url,
          data: JSON.stringify({
            userStatus: data.userStatus,
            version: data.version,
            startTime: data.startTime,
            endTime: data.endTime,
            message: _this.state.message,
            packetName: _this.getPacketNameByAppName(data.versionName)
          }),
        };
        const fn = function (res) {
          if (res && res.data) {
            _this.handleCancel();
            message.success('Send a success');
          }
        };
        CL.clReqwest({settings, fn});
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  getPacketNameByAppName = (appName) => {
    let app = _.find(this.state.options.appNameList, (itr) => {
      return itr.name == appName;
    })
    return app.value && app.value.split('-')[0];
  }


  handleCancel = (e) => {
    this.setState({sendTextMessage: false, showTableExport: false, isClickable: true, message: '',ExcelModal:false});
  }

  noteChange = (e) => {
    if (e.target.value.length > 300) {
      message.error(`The number of words exceeds ${this.state.words} characters`);
      return;
    }
    this.setState({message: e.target.value});
  }

  history = (data) => { // 点击按钮跳转
    const arr = location.hash.split('/');
    arr.pop();
    arr.push('operatingtoolsmshistory');
    const str = arr.join('/');
    const url = `${location.protocol}//${location.host}${location.pathname}${str}`;
    window.open(url);
  };

  ExcelUser = () => {
    this.setState({ExcelModal: true});
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
        that.setState({info: info, fileList: fileList});
      };
    }
  };

  onRemoves = (e) => {
    this.setState({fileList: [], info: {}});
  };

  smsChange = (e) => {
    if (e.target.value.length >= 287) {
      message.error('Limit 287 character. The content will send to user\'s app...');
    }
    this.setState({content: e.target.value});
  };

  smsSave = () => {
    const that = this;
    if(!that.state.info){
      message.error('Excel is required');
    }else if(!that.state.content) {
      message.error('context is required');
    }else{
      confirm({
        content: 'Whether to submit?',
        onOk(){
          let formData = new FormData(that.state.info.file);
          formData.append('file', that.state.info.file);
          formData.append('context ',that.state.content);
          const settings = {
            contentType,
            method: operatingToolSmsImportData.type,
            url: operatingToolSmsImportData.url,
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

  render() {
    const _this = this;
    let fileList = this.state.fileList;
    const uploadButton = (<Button><Icon type="upload"/> Upload Excel</Button>);
    const props = {
      listType: 'picture',
      defaultFileList: [...fileList],
      className: 'upload-list-inline',
      accept: ".xls,.xlsx",
      customRequest: _this.customRequest,
      onRemove: _this.onRemoves,
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
              <Button type="primary" onClick={() => {
                _this.sendMessage(record);
              }}>发送</Button>
            </div>
          );
        },
      },
    ];

    const operation = [
      {
        id: 'userStatus',
        type: 'select',
        label: '用户当前状态',
        placeholder: 'Please select',
        options: _this.state.userCurrentState,
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
        options: _this.state.options.appNameList,
      }
    ];

    const settings = {
      data: this.state.msgList || [],
      columns: columns,
      operation: operation,
      getFields: this.getFormFields,
      pagination: false,
      pageChange: this.pageChage,
      tableLoading: this.state.msgLoading,
      search: this.state.search,
      btn: [
        {
          title: 'History',
          fn: this.history,
        },
      ],
      btnTow: [
        {
          title: '导入用户包',
          type: 'primary',
          fn: _this.ExcelUser,
        },
      ],
    };
    return (
      <div className="sms-tool">
        <CLlist settings={settings} tableexport={tableexport}/>
        <Modal
          visible={this.state.sendTextMessage}
          onOk={this.sendTextMessage}
          onCancel={this.handleCancel}
          okText="Confirm"
          cancelText="Cancel"
          mask={false}
          style={{width: '2000px'}}
          title="Input message content"
        >
          <h4 style={{padding: 10, textAlign: 'center'}}>输入短信内容</h4>
          <TextArea placeholder={`Limit ${this.state.words} character. The content will send to user's phone...`}
                    autosize={{minRows: 2, maxRows: 6}} value={this.state.message} onChange={this.noteChange}/>
        </Modal>
        <Modal
          visible={_this.state.ExcelModal}
          onOk={_this.smsSave}
          onCancel={_this.handleCancel}
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
            <Col span={3} offset={1}><strong>短信内容 :</strong></Col>
            <Col span={12} offset={1} style={{marginRight: 10}}>
              <TextArea placeholder="Limit 287 character. The content will send to user's app..."
                        autosize={{minRows: 2, maxRows: 6}} onChange={_this.smsChange}/>
            </Col>
          </Row>
        </Modal>
      </div>
    )
  }
}
