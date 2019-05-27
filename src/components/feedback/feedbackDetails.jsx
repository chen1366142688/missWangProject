import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import Viewer from 'viewerjs';
import { Interface } from '../../../src/lib/config/index';
import { CLComponent } from '../../../src/lib/component/index';
import CLBlockList from '../../../src/lib/component/CLBlockList.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Button, Row, Col, Card, Table, Input, message, Spin, Modal, Select, List, Tooltip, Icon, Upload } from 'antd';
import md5 from 'js-md5';
import _ from 'lodash';

const confirm = Modal.confirm;
const { TextArea } = Input;
const {
  getLoanAuditDetail, LoanAuditExamine, getFeedbackDetail, consultMessages, contentType,
    nextNotReplay, getTypeList, getContentList, typeInsert, typeSave, typeDelete,
    contentInsert, contentSave, contentDelete, uploadConsultImg
} = Interface;


class FeedbackDetails extends CLComponent {
  state = {
    data: null,
    typeList: [],
    contentList: [],
    selectConentList: [],
    updateSelectConentList: [],
    pagination: false,
    btnLoading: false,
    hasButton: true,
    managerTypeModal: false, // 修改type 管理type
    managerContentModal: false, // 修改manager 管理manager
    addTypeModal: false, // 新增type 弹出窗口
    updateTypeModal: false, // 更新type 弹出窗口
    addContentModal: false, // 新增内容
    updateContentModal: false, // 修改内容
    addTypeTemp: null, // 新增type名称
    updateTypeId: null, // 修改typeId
    updateTypeName: null,
    updateTypeTemp: null, // 修改type名称
    addContentTemp: null, // 新增content名称
    addContentTypeId: null, // 新增ContentTypeId
    updateContentId: null, // 修改contentId
    updateContentName: null,
    updateContentTemp: null, // 修改content名称
    upload:false, // 上传窗口的显示控制
    fileList: [],
    previewVisible: false,
    previewImage: '',
    arr: []
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'loadData',
      'confirm',
      'setMessage',
      'getNext',
      'showModal',
      'typeChange',
      'showTypeModal',
      'handleTypeAdd',
      'handleAddTypeOk',
      'loadTypeContentData',
      'contentSelect',
      'editType',
      'handleTempTypeChange',
      'handleTempTypeUpdateChange',
      'handleUpdateTypeOk',
      'handleCancle',
      'handleTypeDelete',
      'editContent',
      'handleAddContentOk',
      'handleContentAdd',
      'editContentValue',
      'handleTempContentChange',
      'handleUpdateContentOk',
    ]);
  }

  componentDidMount() {
    CLAnimate.inAndOut(this);
    this.loadTypeContentData();
    this.loadData(this.props.match.params);
  }

  setMessage(e) {
    if (e.target.value.length > 2000) {
      message.error('Exceeding the word limit.');
      return;
    }
    this.setState({ message: e.target.value });
  }

  handleCancle() {
    this.setState({
      managerTypeModal: false, addTypeModal: false, updateTypeModal: false, managerContentModal: false, addContentModal: false, updateContentModal: false,
    });
  }

  handleCancleWithParams(e) {
    this.setState(e);
  }

  loadData(params) {
    const that = this;
    const settings = {
      contentType,
      method: getFeedbackDetail.type,
      url: getFeedbackDetail.url + params.id,
    };

    function fn(res) {
      if (res.data) {
        that.setState({ data: res.data });
        that.setState({ hasButton: res.data.hasButton });
      }
    }
    CL.clReqwest({ settings, fn });
  }


  handleTypeAdd(e) {
    this.setState({ addTypeModal: true });
  }

  handleContentAdd() {
    this.setState({ addContentModal: true });
  }

  handleTypeDelete(e) {
    const that = this;

    console.log(e);

    confirm({
      title: 'delete',
      content: `are you sure delete ${e.typeName}?`,
      onOk() {
        console.log(e.id);

        const settings = {
          contentType,
          method: typeDelete.type,
          url: `${typeDelete.url}/${e.id}`,
        };

        function fn(res) {
          if (res.data) {
            message.info(res.result);

            that.loadTypeContentData();

            that.handleCancle();
          }
        }
        CL.clReqwest({ settings, fn });

        console.log('you click submit button');
      },
      onCancel() {
        console.log('you click cancle button');
      },
    });
  }

  handleContentDelete(e) {
    const that = this;
    confirm({
      title: 'delete',
      content: `are you sure delete ${e.content}?`,
      onOk() {
        console.log(e.id);
        const settings = {
          contentType,
          method: contentDelete.type,
          url: `${contentDelete.url}/${e.id}`,
        };

        function fn(res) {
          if (res.data) {
            message.info(res.result);
            that.loadTypeContentData();
            // that.editContent({id:that.state.addContentTypeId});
            that.handleCancle();
          }
        }
        CL.clReqwest({ settings, fn });
        console.log('you click submit button');
      },
      onCancel() {
        console.log('you click cancle button');
      },
    });
  }

  editContent(e) {
    const that = this;
    const value = e.id;
    const tempArray = [];
    console.log(value);
    this.state.contentList.map((doc) => {
      console.debug(`docTypeId${doc.typeId}`);
      if (doc.typeId == value) {
        tempArray.push(doc);
      }
    });
    console.debug(`selectConentList${this.state.selectConentList}`);
    console.debug(`tempArray${tempArray}`);
    this.setState({ updateSelectConentList: tempArray, managerContentModal: true, addContentTypeId: value });
  }

  handleTypeUpdate(e) {
    console.log('you put handleTypeUpdate button');
    console.log(e);
  }

  handleAddTypeOk(e) {
    const that = this;
    if (this.state.addTypeTemp == null) {
      message.error('message is empty!');
    } else {
      const settings = {
        contentType,
        method: typeInsert.type,
        url: typeInsert.url,
        data: JSON.stringify({ typeName: this.state.addTypeTemp }),
      };

      function fn(res) {
        if (res.data) {
          message.info(res.result);
          that.loadTypeContentData();
          that.handleCancleWithParams({ addTypeModal: false });
        }
      }
      CL.clReqwest({ settings, fn });
    }
  }

  handleUpdateTypeOk(e) {
    const that = this;
    if (that.state.updateTypeTemp == null) {
      message.error('type value can not be null!');
    } else {
      const settings = {
        contentType,
        method: typeSave.type,
        url: typeSave.url,
        data: JSON.stringify({ typeName: this.state.updateTypeTemp, id: this.state.updateTypeId }),
      };

      function fn(res) {
        if (res.data) {
          message.info(res.result);
          that.loadTypeContentData();
          that.handleCancleWithParams({ updateTypeModal: false });
        }
      }
      CL.clReqwest({ settings, fn });
    }
  }

  handleUpdateContentOk(e) {
    const that = this;
    if (that.state.addContentTemp == null) {
      message.error('content value can not be null!');
    } else {
      const settings = {
        contentType,
        method: contentSave.type,
        url: contentSave.url,
        data: JSON.stringify({ content: this.state.addContentTemp, id: this.state.updateContentId }),
      };

      function fn(res) {
        if (res.data) {
          message.info(res.result);
          that.loadTypeContentData();
          that.handleCancleWithParams({ updateContentModal: false, managerContentModal: false });
          // that.editContent({id:that.state.addContentTypeId});
        }
      }
      CL.clReqwest({ settings, fn });
    }
  }

  handleContentUpdate(e) {
    console.log('you click handleContentUpdate button');
  }

  handleAddContentOk() {
    const that = this;
    if (this.state.addContentTemp == null) {
      message.error('content is empty!');
    } else {
      const settings = {
        contentType,
        method: contentInsert.type,
        url: contentInsert.url,
        data: JSON.stringify({ typeId: that.state.addContentTypeId, content: that.state.addContentTemp }),
      };

      function fn(res) {
        if (res.data) {
          message.info(res.result);
          that.loadTypeContentData();
          that.setState({ addContentTemp: '' });
          that.handleCancleWithParams({ addContentModal: false, managerContentModal: false });
          // that.editContent({id:that.state.addContentTypeId});
        }
      }
      CL.clReqwest({ settings, fn });
    }
  }


  handleTempTypeChange(e) {
    this.setState({ addTypeTemp: e.target.value });
  }

  handleTempContentChange(e) {
    this.setState({ addContentTemp: e.target.value, updateContentTemp: e.target.value });
  }

  handleTempTypeUpdateChange(e) {
    console.log(`targetValue${e.target.value}`);
    this.setState({ updateTypeTemp: e.target.value });
  }

  handleContentCancle(e) {
    console.log('you click content cancle button');
  }

  loadTypeContentData() {
    const that = this;
    const getTypeSettings = {
      contentType,
      method: getTypeList.type,
      url: getTypeList.url,
    };

    const getContentSettings = {
      contentType,
      method: getContentList.type,
      url: getContentList.url,
    };

    function getTypeBack(res) {
      console.log(res.data);
      that.setState({ typeList: res.data });
    }
    function getContentBack(res) {
      that.setState({ contentList: res.data });
      that.setState({ selectConentList: [] });
    }
    CL.clReqwest({ settings: getTypeSettings, fn: getTypeBack });
    CL.clReqwest({ settings: getContentSettings, fn: getContentBack });
  }

  confirm(e) {
    const info = this.state.message;
    const that = this;
    const consultedUserId = this.props.match.params.id;
    if (!info) {
      message.error('message is empty!');
      return;
    }

    that.setState({ message: '' });
    that.setState({ btnLoading: true });

    const settings = {
      contentType,
      method: consultMessages.type,
      url: consultMessages.url,
      data: JSON.stringify({
        consultedUserId,
        message: info,
      }),
    };
    function fn(res) {
      that.setState({ btnLoading: false });
      if (res.data) {
        message.success(res.result);
        that.loadData(that.props.match.params);
      }
    }
    CL.clReqwest({ settings, fn });
  }



  getNext() {
    const that = this;
    that.setState({ btnLoading: true });

    const time = _.max(this.state.data.consultMessagesList.map((doc) => {
      return doc.createTime;
    }));

    const settings = {
      contentType,
      method: nextNotReplay.type,
      url: nextNotReplay.url,
      data: JSON.stringify({
        consultedUser: { endUpdateTime: time },
      }),
    };


    function fn(res) {
      that.setState({ btnLoading: false });
      if (res.data && !res.data.msg) {
        location.hash = '/uplending/feedback';
        setTimeout(() => {
          location.hash = `#/uplending/feedbackdetails/${res.data.id}`;
        }, 100);
      } else {
        message.error('There is no unanswered consultation below.');
      }
    }
    CL.clReqwest({ settings, fn });
  }

  showModal(e) {
    console.log(e);
    const viewer = new Viewer(e.target, {});
  }

  showTypeModal() {
    this.setState({ managerTypeModal: true });
  }

  contentSelect(value) {
    this.setState({ message: value });
  }

  typeChange(value) {
    const tempArray = [];
    this.state.contentList.map((doc) => {
      console.debug(`docTypeId${doc.typeId}`);
      if (doc.typeId == value) {
        tempArray.push(doc);
      }
    });

    console.debug(`selectConentList${this.state.selectConentList}`);
    console.debug(`tempArray${tempArray}`);
    this.setState({ selectConentList: tempArray });
  }

  listOutPut() {
    console.log('list output!');
  }

  editType(e) {
    this.setState({
      addTypeModal: false, updateTypeModal: true, updateTypeId: e.id, updateTypeName: e.typeName, updateTypeTemp: e.typeName,
    });
  }

  editContentValue(e) {
    this.setState({
      managerContentModal: false, updateContentModal: true, updateContentId: e.id, updateContentName: e.content, updateContentTemp: e.content,
    });
  }

  deleteType(e) {
    console.log('you click deleteType');
  }

  uploadImg = () => {
    this.setState({
        upload: true
    })
  }

    customRequest = (info) => {
        const _this = this;
        const fileList = this.state.fileList;
        const arr = this.state.arr;
        info.onSuccess = function (e) {
            _this.setState({banner: e});
        };
        arr.push(info.file);
        const reader = new FileReader();
        const AllowImgFileSize = 3100000; // 上传图片最大值(单位字节)（ 2 M = 2097152 B ）超过2M上传失败
        const file = info.file;
        let imgUrlBase64;
        if (file) {
            // 将文件以Data URL形式读入页面
            imgUrlBase64 = reader.readAsDataURL(file);
            reader.onload = function (e) {
                if (AllowImgFileSize != 0 && AllowImgFileSize < reader.result.length) {
                    alert('上传失败，请上传不大于2M的图片！');
                    return;
                }
                // 执行上传操作
                info.file.url = reader.result;
                fileList.push(info.file);
                _this.setState({arr: arr, info: info, fileList: fileList});
            };
        }
    }

    handleCancel = () => this.setState({previewVisible: false})

    handleCancel2 = (e) => {
        this.setState({
            upload: false,
            fileList: []
        });
    }

    uploadImgAsMsg = () => {
        const _this = this;
        let files = this.state.fileList;
        this.handleCancel2();
        this.setState({ btnLoading: true });
        let promiseList = files.map(file=>{
            return new Promise(function (resolve, reject) {
                const read = new FileReader();
                //read.uploadImg = uploadConsultImg;
                read.md5 = md5;
                read.CL = CL;
                const newfile = new File([file], `${new Date().getTime()}.jpg`, {type: 'image/jpeg'}); // 修改文件的名字
                read.readAsArrayBuffer(file);
                read.file = newfile;
                read.onloadend = function (e) {
                    const formData = new FormData();
                    formData.append('file', file);
                    const Xmd5 = md5.base64(e.target.result);
                    const uploadSettings = {
                        method: uploadConsultImg.type,
                        timeout: 600000,
                        url: uploadConsultImg.url,
                        processData: false,
                        data: formData,
                        withCredentials: true,
                        headers: {
                            'X-md5': Xmd5,
                            consultdUserId: _this.props.match.params.id,
                        },
                    };
                    resolve(uploadSettings);
                }


            })
                .then((uploadSettings) => {
                    return CL.clReqwestPromise(uploadSettings)
                })
        });

        return Promise.all(promiseList)
            .then((resList) => {
                let uploadRes = true;
                _this.setState({ btnLoading: false });
                _.each(resList, res => {
                    if (res.code != 200) {
                        uploadRes = false;
                    }
                });
                if (uploadRes) {
                    message.success("success！");
                    _this.loadData(_this.props.match.params);

                } else
                    message.error("部分图片上传失败！");
                return;
            })
    };

    uploadEnsure = () => {
      const _this = this;
        confirm({
            content: 'The picture will be sent directly to the user.  Whether to send?',
            onOk() {
                _this.uploadImgAsMsg();
            }
        });
    };

    handlePreview = (file) => {
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true,
        });
    }

    handleChange = ({fileList}) => this.setState({fileList})

  renderBody() {
    const { selectedRowKeys } = this.state;
    const that = this;
    if (!this.state.data) {
      return (
        <div className="full-loading" key="full-loading">
          <Spin size="large" />
        </div>
      );
    }

    let { consultMessagesList } = that.state.data;
    consultMessagesList = consultMessagesList || [];

    // const gridStyle = {
    //   width: '20%',
    //   textAlign: 'center',
    // };
    const remarkStyle = {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
      width: '300px',
    };

    const UserInfo = {
      columns: [
        {
          title: 'Time',
          dataIndex: 'appId',
          width: '15%',
          sorter: (a, b) => new Date(a.createTime) - new Date(b.createTime),
          render: function (text, record) {
            if (!record.createTime) {
              return '';
            }
            return moment(record.createTime).format('YYYY-MM-DD HH:mm');
          },
        },
        {
          title: ' Type',
          dataIndex: 'typeName',
          width: '15%',
        },
        {
          title: 'User',
          dataIndex: 'createUserName',
          width: '15%',
        },
        {
          title: 'Message',
          dataIndex: 'message',
          render: function (index, record) {
            if (record.messageType === 2) {
              return (<div><img width="60" onClick={that.showModal} src={record.imagUrl} alt={record.message} /></div>);
            }
            return record.message
          },
        },
      ],
      data: _.map(consultMessagesList, (doc, index) => {
        const obj = _.pick(doc, ['message', 'createUserName', 'typeName', 'createTime', 'messageType', 'imagUrl']);
        obj.index = index + 1;
        return obj;
      }),
    };

    const typeInfo = {
      columns: [
        {
          title: 'types',
          dataIndex: 'appId',
          width: '100%',

          render: function (text, record) {
            if (!record) {
              return '';
            }
            return record;
          },
        },
      ],
      data: _.map(consultMessagesList, (doc, index) => {
        const obj = _.pick(doc, ['message', 'createUserName', 'typeName', 'createTime', 'messageType', 'imagUrl']);
        obj.index = index + 1;
        return obj;
      }),
    };


    const settings = {
      data: this.state.data,
      columns: typeInfo.columns,

    };

    const fileList = this.state.fileList;

    const uploadButton = (
        <div>
          <Icon type="plus" />
          <div className="ant-upload-text">Upload</div>
        </div>
    );

    return (
      <div className="feedback-details" key="feedback-details">
        <Modal
            className="feedback-details-upload"
            title="please choose a picture"
            visible={this.state.upload}
            onOk={this.uploadEnsure}
            onCancel={this.handleCancel2}
            okText="Send"
            cancelText="Cancel"
            mask={false}
            width='300px'
        >
          <div className="clearfix">
            <Upload
                action="creditCollection/discountOrder/upload"
                accept="image/png, image/jpeg, image/jpg"
                listType="picture-card"
                fileList={fileList}
                onPreview={this.handlePreview}
                onChange={this.handleChange}
                customRequest={this.customRequest}
            >
                {fileList.length >= 3 ? null : uploadButton}
            </Upload>
            <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel}>
              <img alt="example" style={{ width: '100%' }} src={this.state.previewImage} />
            </Modal>
          </div>
        </Modal>
        <Modal
          title="type manager"
          visible={that.state.managerTypeModal}
          onOk={that.handleOk}
          onCancel={that.handleCancle}
          cancelText="Cancel"
          mask={false}
          style={{ width: '2000px' }}
        >
          <Row style={{ marginTop: 20 }}>
            <Col>
              <List
                bordered
                dataSource={this.state.typeList}
                renderItem={item => (
                  <List.Item actions={[<a onClick={that.editType.bind(null, item)}>edit</a>, <a onClick={that.editContent.bind(null, item)}>edit content</a>, <a onClick={that.handleTypeDelete.bind(that, item)}>delete</a>]}>
                    {item.typeName}
                  </List.Item>)}
              />
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <Button type="primary" onClick={this.handleTypeAdd}>Add</Button>
            </Col>
          </Row>
        </Modal>
        <Modal
          title="add type"
          visible={that.state.addTypeModal}
          onCancel={that.handleCancle}
          onOk={that.handleAddTypeOk}
          cancelText="cancle"
          okText="save"
          mask={false}
          style={{ width: '2000px' }}
        >
          <Row style={{ marginTop: 20 }}>
            <Col span={6}>
              <h4>please input type:</h4>
            </Col>
          </Row>

          <Row style={{ marginTop: 20 }}>
            <Col>
              <Input placeholder="please input type" onChange={that.handleTempTypeChange} />
            </Col>
          </Row>
        </Modal>
        <Modal
          title="update type"
          visible={that.state.updateTypeModal}
          onCancel={that.handleCancle}
          onOk={that.handleUpdateTypeOk}
          cancelText="cancle"
          okText="save"
          mask={false}
          style={{ width: '2000px' }}
        >
          <Row style={{ marginTop: 20 }}>
            <Col span={6}>
              <h4>please input type:</h4>
            </Col>

          </Row>
        </Modal>

        <Modal
          title="add type"
          visible={that.state.addTypeModal}
          onCancel={that.handleCancle}
          onOk={that.handleAddTypeOk}
          cancelText="cancle"
          okText="save"
          mask={false}
          style={{ width: '2000px' }}
        >
          <Row style={{ marginTop: 20 }}>
            <Col span={6}>

              <h4>please input type:</h4>
            </Col>
          </Row>
          <Row style={{ marginTop: 20 }}>
            <Col>
              <Input placeholder={that.state.updateTypeName} onChange={that.handleTempTypeUpdateChange} value={that.state.updateTypeTemp} />
            </Col>
          </Row>
        </Modal>
        <Modal
          title="content manager"
          visible={that.state.managerContentModal}
          onOk={that.handleOk}
          onCancel={that.handleCancle}
          cancelText="Cancel"
          mask={false}
          style={{ width: '2000px' }}
        >

          <Row style={{ marginTop: 20 }}>
            <Col>
              <List
                bordered
                dataSource={this.state.updateSelectConentList}
                renderItem={item => (
                  <List.Item actions={[<a onClick={that.editContentValue.bind(null, item)}>edit</a>, <a onClick={that.handleContentDelete.bind(that, item)}>delete</a>]}>
                    {item.content}
                  </List.Item>)}
              />
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <Button type="primary" onClick={this.handleContentAdd}>Add</Button>
            </Col>
          </Row>
        </Modal>
        <Modal
          title="add content"
          visible={that.state.addContentModal}
          onCancel={that.handleCancle}
          onOk={that.handleAddContentOk}
          cancelText="cancle"
          okText="save"
          mask={false}
          style={{ width: '2000px' }}
        >
          <Row style={{ marginTop: 20 }}>
            <Col span={6}>
              <h4>please input type:</h4>
            </Col>
          </Row>

          <Row style={{ marginTop: 20 }}>
            <Col>
              <TextArea placeholder="please input content" autosize={{ minRows: 4, maxRows: 10 }} onChange={that.handleTempContentChange} />
            </Col>
          </Row>
        </Modal>
        <Modal
          title="update content"
          visible={that.state.updateContentModal}
          onCancel={that.handleCancle}
          onOk={that.handleUpdateContentOk}
          cancelText="cancle"
          okText="save"
          mask={false}
          style={{ width: '2000px' }}
        >
          <Row style={{ marginTop: 20 }}>
            <Col span={6}>
              <h4>please input type:</h4>
            </Col>
          </Row>

          <Row style={{ marginTop: 20 }}>
            <Col>
              <Col>
                <TextArea placeholder={that.state.updateContentName} autosize={{ minRows: 4, maxRows: 10 }} onChange={that.handleTempContentChange} value={that.state.updateContentTemp} />
              </Col>
            </Col>
          </Row>
        </Modal>
        <Table
          bordered
          size="small"
          className="user-info cl-table"
          scroll={{ y: 600 }}
          rowKey={record => record.index}
          pagination={false}
          columns={UserInfo.columns}
          dataSource={UserInfo.data}
        />

        <Row gutter={16} className="operate">
          <Col span={3} className="title">
            <h4>Reply message</h4>
          </Col>
          <Col span={14}>
            <TextArea autosize={{ minRows: 4, maxRows: 10 }} onChange={this.setMessage} value={that.state.message} />
          </Col>
          <Col span={3} className="title" style={{ marginTop: 30 }}>
            <Button type="primary" onClick={this.confirm} loading={that.state.btnLoading}>Submit</Button>
          </Col>
        </Row>

        <Row gutter={19} className="operate">
          <Col span={4} className="title">
            <Button type="danger" onClick={this.getNext} loading={that.state.btnLoading}>Next</Button>
            <Button type="normal" style={{marginLeft: "10px"}}
                    onClick={this.uploadImg} loading={that.state.btnLoading}>Upload</Button>
          </Col>
          <Col span={3} className="title" style={{ marginLeft: 100, marginRight: -20}}>
            <Select style={{ width: '100%' }} onChange={that.typeChange}>
              {
                    that.state.typeList.map((doc) => {
                      return (<Option key={`type${doc.id}`} value={doc.id}>{doc.typeName}</Option>);
                    })
                  }
            </Select>
          </Col>
          <Col span={9} className="title" style={{ marginRight: 30 }}>
            <Select style={{ width: '100%', float: 'left'}} onChange={that.contentSelect}>
              {
                    that.state.selectConentList.map((doc) => {
                      return (<Option key={`content${doc.id}`} value={doc.content}>{doc.content}</Option>);
                    })
                  }
            </Select>
          </Col>
          <Col span={2} className="title">
            <Button type="primary" visible={this.state.hasButton} disabled={!this.state.hasButton} onClick={this.showTypeModal} >editType</Button>
          </Col>

        </Row>
      </div>
    );
  }

  render() {
    return (
      <QueueAnim className="animate-content" type={this.state.aniType}>
        {this.state.showBlock ? [this.renderBody()] : null}
      </QueueAnim>
    );
  }
}
export default FeedbackDetails;




