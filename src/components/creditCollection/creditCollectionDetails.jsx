/* eslint-disable no-unused-vars */
import React from 'react';
import QueueAnim from 'rc-queue-anim';
import md5 from 'js-md5';
import moment from 'moment';
import { Interface } from '../../../src/lib/config/index';
import {
  CLComponent,
  AddressBook,
  AddressBookInfo,
  MailInfo,
  // FacebookInfo,
  ContactInfo,
  Disbursement,
  EmploymentInfo,
  BasicInfo,
  IdentificationInfo,
  ChargeDetails,
  ChargeDetails2,
  UserInfo,
  CreditCollectionInfo,
  LoanRecord,
  AppFromAddressBook,
  CredtCollectionDetail,
  RepaymentRecord,
  DetailsRemark,
  AddressBookNew,
} from '../../../src/lib/component/index';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Button, Row, Col, Card, Checkbox, Table, Input, InputNumber, message, Upload, Spin, Select, Icon, DatePicker, Modal } from 'antd';

const { TextArea } = Input;
const CheckboxGroup = Checkbox.Group;
const confirm = Modal.confirm;
const Dragger = Upload.Dragger;
const {
  contentType,
  saveCreditCollectionInfo,
  Details,
  getAppInfoByMemberId,
  discountSave,
  orderMark,
  collectionTag,
  userAppInfo,
  discountOrder,
  blackApply,
  uploadImgModal,
  getNewAddressBookInfo
} = Interface;

class CreditCollectionDetails extends CLComponent {
  state = {
    data: null,
    pagination: false,
    pressStatus: '',
    pressDescription: '',
    loading: false,
    dsModal: false,
    Discount: false,
    Blacklist: false,
    tags: [],
    previewVisible: false,
    previewImage: '',
    fileList: [],
    DiscountAmount: 1,
    banner: '',
    arr: [],
    info: false,
    discountOrderApplicationId: '',
    dataCode: '',
    loanBasisInfo1: '',
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'loadData',
      'selectChange',
      'noteChange',
      'save',
      'timeChange',
      'discountSaveFn',
      'Blacklist',
      'Discount',
      'showDSModal',
      'BlacklistApproval',
      'DiscountApproval',
      'handleCancel',
      'orderMarkSave',
      'BlacklistApplication',
      'checkboxChange',
      'handleShowMessageList',
      'inputMoney',
      'uploadContentImg',
      'customRequest',
    ]);
  }

  handleShowMessageList() {
    const that = this;


    that.setState({ showInputMessage: false });

    const settings = {
      contentType,
      method: showSms.type,
      url: `${showSms.url}/${that.props.settings.loanBasisInfo.appId}`,
    };
    function fn(res) {
      if (res.code == 200) {
        that.setState({ showMessageList: true, messageList: res.data.MessageLog, showInputMessage: false });
      }
    }
    CL.clReqwest({ settings, fn });
  }

  componentWillMount(){
      this.getAddressBookType();
  }

  componentDidMount() {
    let str = this.props.location.pathname;
    let arr = str.split('/');
    let dataCode = arr[arr.length-1];
    this.setState({ dataCode: dataCode });
    CLAnimate.inAndOut(this);
    this.loadData(this.props.match.params);
  }

  loadData(params) {
    const that = this;
    const settings = {
      contentType,
      method: Details.getLoanBasisiInfo.type,
      url: Details.getLoanBasisiInfo.url + params.applicationId,
    };

    function fn(res) { // 加载数据异步，加载完成后风控异步
      if (res.data) {
        that.setState({ loanBasisInfo: res.data });
        const applicationId = params.applicationId;
        const memberId = res.data.memberId;
        const name = res.data.name;
        const basisId = res.data.id;
        const orderId = params.orderId;
        that.setState({
          memberId,
          applicationId,
          orderId,
        });

        const contactPersonSettings = {
          contentType,
          method: Details.getLoanContactInfo.type,
          url: Details.getLoanContactInfo.url,
          data: JSON.stringify({
            memberId,
            id: basisId,
            appId: parseInt(applicationId),
          }),
        };

        function contactPersonFn(res) {
          if (res.data) {
            that.setState({ contactPerson: res.data });
          }
        }

        const userDataSettings = {
          contentType,
          method: Details.getUserData.type,
          url: Details.getUserData.url,
          data: JSON.stringify({
            memberId,
          }),
        };
        function userDataFn(res) {
          if (res.data) {
            that.setState({ userData: res.data });
          }
        }

        const orderInfoSettings = {
          contentType,
          method: Details.getOrderInfoByOrderId.type,
          url: Details.getOrderInfoByOrderId.url,
          data: JSON.stringify({
            id: orderId,
          }),
        };
        function orderInfoFn(res) {
          if (res.data) {
            that.setState({ orderInfo: res.data });
          }
        }

        const deviceCheckSettings = {
          contentType,
          method: Details.deviceCheck.type,
          url: Details.deviceCheck.url,
          data: JSON.stringify({
            memberId,
          }),
        };

        function deviceCheckFn(res) {
          if (res.data) {
            that.setState({ deviceCheck: res.data });
          }
        }

        const orderPreStatusSettings = {
          contentType,
          method: Details.orderPreStatus.type,
          url: Details.orderPreStatus.url,
        };
        function orderPreStatusFn(res) {
          if (res.data) {
            that.setState({ orderPreStatus: res.data });
          }
        }

        const repetitionUserSettings = {
          contentType,
          method: Details.repetitionUser.type,
          url: Details.repetitionUser.url,
          data: JSON.stringify({
            loanBasisInfo: {
              notMemberId: memberId,
              name: name,
            },
          }),
        };
        function repetitionUserFn(res) {
          const users = [];
          if (res.data.repetitionUser && res.data.repetitionUser.length) {
            res.data.repetitionUser.map((doc, index) => {
              users.push({
                id: index,
                telephoneNo: doc.memberPhone,
                memberId: doc.memberId,
              });
            });
          }

          if (users.length) {
            that.setState({ sameUser: users });
          }
        }

        const userAppInfoSettings = {
          contentType,
          method: userAppInfo.type,
          url: userAppInfo.url,
          data: JSON.stringify({
            loanBasisInfoJoinOrderInfo: {
              memberId: memberId,
            },
          }),
        };
        function userAppInfoFn(res) {
          if (res.data) {
            that.setState({
              userApp: {
                lastAccessDate: res.data.lastAccessDate,
                numberOfUse: res.data.numberOfUse,
              },
            });
          }
        }
        const loanBasisInfoLivingSettings = {
          contentType,
          method: Details.livingPhoto.type,
          url: Details.livingPhoto.url + applicationId,
        };

        function fn(res) {
          if (res.data) {
            that.setState({ loanBasisInfo1: res.data.livingPhotoBase64 });
          }
        }

        CL.clReqwest({ settings: contactPersonSettings, fn: contactPersonFn });
        CL.clReqwest({ settings: userDataSettings, fn: userDataFn });
        CL.clReqwest({ settings: orderInfoSettings, fn: orderInfoFn });
        CL.clReqwest({ settings: deviceCheckSettings, fn: deviceCheckFn });
        CL.clReqwest({ settings: repetitionUserSettings, fn: repetitionUserFn });
        CL.clReqwest({ settings: orderPreStatusSettings, fn: orderPreStatusFn });
        CL.clReqwest({ settings: userAppInfoSettings, fn: userAppInfoFn });
        CL.clReqwest({ settings: loanBasisInfoLivingSettings, fn });
      } else {
        that.setState({ data: {} });
      }
    }

    const settings2 = {
      contentType,
      method: Details.collectionTag.type,
      url: Details.collectionTag.url,
    };

    function fn2(res) {
      if (res.data && res.data.length) {
        that.setState({
          tags: CL.setCheckBox(res.data),
        });
      }
    }

    CL.clReqwest({ settings, fn });
    CL.clReqwest({ settings: settings2, fn: fn2 });
  }

  showDSModal(e) {
    this.setState({ dsModal: true });
  }
  // 申请打折
  DiscountApproval(e) {
    this.setState({ Discount: true });
  }
  // 黑名单申请
  BlacklistApproval(e) {
    this.setState({ Blacklist: true });
  }

  checkboxChange(e) {
    this.setState({
      tagChoice: e.join(','),
    });
  }

  discountSaveFn() {
    const that = this;
    that.setState({ loading: true, dsModal: false });

    const settings = {
      contentType,
      method: discountSave.type,
      url: discountSave.url,
      data: JSON.stringify({
        applicationId: this.props.match.params.applicationId,
      }),
    };

    function fn(res) {
      that.setState({ loading: false });
      if (res.data) {
        message.success(res.result);
        location.hash = '/uplending/creditcollection';
      }
    }

    CL.clReqwest({ settings, fn });
  }

  Blacklist = (e) => {
    const that = this;
    this.setState({
      Blacklist: false,
    });
    const settings = {
      contentType,
      method: blackApply.type,
      url: blackApply.url,
      data: JSON.stringify({
        orderId: that.props.match.params.orderId,
        reason: that.state.pressDescription,
      }),
    };
    function fn(res) {
      if (res.data) {
        message.success('Save successfully');
        that.loadData(that.props.match.params);
      }
      that.setState({
        loading: false,
      });
    }
    CL.clReqwest({ settings, fn });
  }

  Discount = (e) => {
    const that = this;
    this.setState({
      Discount: false,
    });
    const settings = {
      contentType,
      method: discountOrder.type,
      url: discountOrder.url,
      data: JSON.stringify({
        orderId: that.props.match.params.orderId,
        reason: that.state.pressDescription,
        discountAmount: that.state.DiscountAmount,
      }),
    };
    function fn(res) {
      if (res.data) {
        const arr = that.state.arr;
        message.success('Save successfully');
        that.setState({ discountOrderApplicationId: res.data.discountOrderApplicationId });
        // 上传图片
        if (arr.length == 1) {
          that.uploadContentImg([arr[0]], that.state.discountOrderApplicationId, that.state.info);
        } else if (arr.length == 2) {
          that.uploadContentImg([arr[0]], that.state.discountOrderApplicationId, that.state.info);
          setTimeout(() => { that.uploadContentImg([arr[1]], that.state.discountOrderApplicationId, that.state.info); }, 1000);
        } else if (arr.length == 3) {
          that.uploadContentImg([arr[0]], that.state.discountOrderApplicationId, that.state.info);
          setTimeout(() => { that.uploadContentImg([arr[1]], that.state.discountOrderApplicationId, that.state.info); }, 1000);
          setTimeout(() => { that.uploadContentImg([arr[2]], that.state.discountOrderApplicationId, that.state.info); }, 1500);
        } else {
          window.alert('Please send at least one picture');
        }
      }
      that.setState({
        loading: false,
      });
    }
    CL.clReqwest({ settings, fn });
  }

  orderMarkSave() {
    const that = this;
    if (!that.state.tagChoice) {
      message.error('You must at least pick one option ');
      return;
    }

    const settings = {
      contentType,
      method: orderMark.type,
      url: orderMark.url,
      data: JSON.stringify({
        orderId: that.props.match.params.orderId,
        collectionTag: that.state.tagChoice,
      }),
    };

    function fn(res) {
      if (res.data) {
        message.success('Save successfully');
        that.loadData(that.props.match.params);
      }
      that.setState({
        loading: false,
      });
    }

    confirm({
      title: 'Confirm',
      content: 'Do you want to save these tags',
      onOk() {
        that.setState({
          loading: true,
        });
        CL.clReqwest({ settings, fn });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  BlacklistApplication() {
    const that = this;
    if (!that.state.tagChoice) {
      message.error('内容是必填项哦 ');
      return;
    }

    const settings = {
      contentType,
      method: orderMark.type,
      url: orderMark.url,
      data: JSON.stringify({
        orderId: that.props.match.params.orderId,
        collectionTag: that.state.tagChoice,
      }),
    };

    function fn(res) {
      if (res.data) {
        message.success('Save tags success');
        that.loadData(that.props.match.params);
      }
      that.setState({
        loading: false,
      });
    }


    confirm({
      title: 'Confirm',
      content: 'Do you want to save these tags',
      onOk() {
        that.setState({
          loading: true,
        });
        CL.clReqwest({ settings, fn });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }
  handleCancel = () => this.setState({ previewVisible: false, dsModal: false })
  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }
  uploadContentImg(files, insert, onSuccess) {
    const read = new FileReader();
    const that = this;
    read.that = that;
    read.uploadImg = uploadImgModal;
    read.md5 = md5;
    read.CL = CL;
    const newfile = new File([files[0]], `${new Date().getTime()}.jpg`, { type: 'image/jpeg' }); // 修改文件的名字
    read.readAsArrayBuffer(files[0]);
    read.file = newfile;
    read.onloadend = function (e) {
      const {
        md5, uploadImg, that, CL, file,
      } = this;
      const formData = new FormData();
      formData.append('file', file);
      const Xmd5 = md5.base64(e.target.result);

      const uploadSettings = {
        method: 'post',
        timeout: 600000,
        url: uploadImg.url,
        processData: false,
        data: formData,
        withCredentials: true,
        headers: {
          'X-md5': Xmd5,
          discountOrderApplicationId: insert,
        },
      };
      function fn(res) {
        if (res.code == '200') {
          console.log('上传成功');
        } else {
          alert('上传失败，请重新上传！');
        }
      }
      CL.clReqwest({ settings: uploadSettings, fn });
    };
  }

  getAddressBookType = () => {
      let _this = this;
      const settings = {
          contentType,
          method: getNewAddressBookInfo.type,
          url: getNewAddressBookInfo.url + `/${this.props.match.params.applicationId}`
      };

      function fn(res) {
          if (res && res.data) {
              let addressBookType = res.data;
              _this.setState({addressBookType})
          }
      }

      CL.clReqwest({settings, fn});
  };

  handleChange = ({ fileList }) => this.setState({ fileList })

  handleCancel1 = (e) => {
    this.setState({ Blacklist: false });
  }
  handleCancel2 = (e) => {
    this.setState({ Discount: false });
  }

  timeChange(e) {
    const date = e.format('YYYY-MM-DD HH:mm');
    this.setState({ promiseTime: new Date(date).getTime() });
  }

  selectChange(e) {
    this.setState({ pressStatus: e });
  }

  noteChange(e) {
    if (e.target.value.length > 2000) {
      message.error('The number of words exceeds 2000 characters');
      return;
    }
    this.setState({ pressDescription: e.target.value });
  }

  inputMoney(value) {
    this.setState({ DiscountAmount: value });
  }
  customRequest(info) {
    const that = this;
    const fileList = that.state.fileList;
    const arr = that.state.arr;
    info.onSuccess = function (e) { that.setState({ banner: e }); };
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
        that.setState({ arr: arr, info: info, fileList: fileList });
      };
    }
  }

  save() {
    const id = this.props.match.params.orderId;
    const pressStatus = this.state.pressStatus;
    const pressDescription = this.state.pressDescription;
    const promiseTime = this.state.promiseTime;
    const that = this;
    that.setState({ loading: true });
    if (!pressStatus) {
      that.setState({ loading: false });
      message.error('“Credit Collction” is required.');
      return;
    }

    if (!pressDescription) {
      that.setState({ loading: false });
      message.error('“Notes” is required.');
      return;
    }

    const data = {
      id,
      pressStatus,
      pressDescription,
    };

    if (promiseTime) {
      data.promiseTime = promiseTime;
    }

    const settings = {
      contentType,
      method: saveCreditCollectionInfo.type,
      url: saveCreditCollectionInfo.url,
      data: JSON.stringify(data),
    };

    function saveData(res) {
      that.setState({ loading: false });
      if (res.data) {
        message.success(res.result);
        location.hash = '/uplending/creditcollection';
      }
    }

    CL.clReqwest({ settings, fn: saveData });
  }

  renderBody() {
    const that = this;
    const { previewVisible, previewImage, fileList } = this.state;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    if (!this.state.loanBasisInfo) {
      return (
        <div className="full-loading" key="full-loading">
          <Spin size="large" />
        </div>
      );
    }

    let {
      loanBasisInfo,
      loanBasisInfo1,
      orderInfo,
      userData,
      contactPerson,
      deviceCheck,
      sameUser,
      orderPreStatus,
      mark,
      userApp = {},
    } = this.state;

    loanBasisInfo = loanBasisInfo || {};
    orderInfo = orderInfo || {};
    deviceCheck = deviceCheck || {};
    userData = userData || {};
    contactPerson = contactPerson || {};
    orderPreStatus = orderPreStatus || [];
    mark = mark || {};

    let { usersOfTheSameDevice } = deviceCheck;
    usersOfTheSameDevice = usersOfTheSameDevice || {};

    const sameDevice = [];
    _.each(usersOfTheSameDevice, (doc, index) => {
      _.each(doc, (subItem, subIndex) => {
        if (!_.find(sameDevice, (o) => { return o.telephoneNo === subItem.telephoneNo; })) {
          sameDevice.push(subItem);
        }
      });
    });

    const CreditTopSettings = {
      loanBasisInfo, orderInfo, deviceCheck, sameUser, sameDevice, tags: that.state.tags, userApp: userApp,
    };
    const UserInfoSettings = { loanBasisInfo, orderInfo, dataCode: that.state.dataCode };
    const ChargeDetailsSettings = { loanBasisInfo, orderInfo };
    const ChargeDetails2Settings = { loanBasisInfo, orderInfo };
    const IdentificationInfoSettings = {
      loanBasisInfo, deviceCheck, sameUser, sameDevice,loanBasisInfo1,
    };
    const BasicInfoSettings = { loanBasisInfo, mark };
    const EmploymentInfoSettings = { loanBasisInfo, mark };
    const four = (contactPerson && contactPerson.loanContactPersonInfoRequired && contactPerson.loanContactPersonInfoRequired[1] ? contactPerson.loanContactPersonInfoRequired[1].telephoneNo : '') ||
    (contactPerson && contactPerson.loanContactPersonInfoOptional && contactPerson.loanContactPersonInfoOptional[0] ? contactPerson.loanContactPersonInfoOptional[0].telephoneNo : '');
    const DetailsRemarkSettings = {
      appId: that.state.applicationId,
      callTitle: 'Call log by Evaluation',
      disabled: true,
      visible: false,
      phoneData: {
        1: loanBasisInfo.memberPhone,
        2: loanBasisInfo.companyTelephone,
        3: contactPerson && contactPerson.loanContactPersonInfoRequired && contactPerson.loanContactPersonInfoRequired[0] ? contactPerson.loanContactPersonInfoRequired[0].telephoneNo : '',
        4: four,
      },
    };
    const DisbursementSettings = { loanBasisInfo, mark };
    const ContactInfoSettings = {
      contactPerson, mark, memberId: that.state.memberId, sendMessaageCom: true, applyId: that.state.applicationId,
    };
    // const FacebookInfoSettings = { loanBasisInfo, userData };

    const specialStatus = that.props.match.params.specialStatus;
    const canDisCountSave = (_.indexOf(JSON.parse(sessionStorage.getItem('roles')), 'discountSave') > -1) && specialStatus !== '102' ? true : false;

    return (
      <div className="credit-collection-information" key="credit-collection-details">

        <CredtCollectionDetail settings={CreditTopSettings} />
        <div className="credit-collection-middle" style={{ borderBottom: '8px #108ee9 solid' }}>
          <ContactInfo settings={ContactInfoSettings} />

          {this.state.addressBookType ? (this.state.addressBookType === "show_original" ?
              <DetailsRemark {...DetailsRemarkSettings} /> :
              <AddressBookNew memberId={that.state.memberId}
                              weatherCollection={true}
                              addressBookType = {this.state.addressBookType}
                              appId={this.props.match.params.applicationId}/>) : null
          }
          <AddressBook memberId={that.state.memberId} credit isloanApply={false} appId={this.props.match.params.applicationId} sendMessaageCom />
          <CreditCollectionInfo orderId={that.state.orderId} memberId={that.state.memberId} />

          <Row className="fill-content" gutter={16}>
            <Col span={4} className="title">Credit collection status</Col>
            <Col span={20}>
              <Select defaultValue="" style={{ width: 240 }} onChange={that.selectChange}>
                {
                  _.map(orderPreStatus, (doc, index) => {
                    return (
                      <Select.Option key={`${doc.type}${index}`} value={doc.type.toString()}>{doc.typeName}</Select.Option>
                    );
                  })
                }
              </Select>
            </Col>
          </Row>

          <Row className="fill-content" gutter={16}>
            <Col span={4} className="title">Promise date</Col>
            <Col span={17}>
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                onChange={that.timeChange}
              />
            </Col>
            {
              canDisCountSave ? (<Col span={2} className="btn">
                <Button type="danger" onClick={that.showDSModal} loading={that.state.loading}>Discount Save</Button>
              </Col>) : ''
            }
          </Row>

          <Row className="fill-content" gutter={16}>
            <Col span={4} className="title">Note</Col>
            <Col span={18}>
              <TextArea placeholder="" autosize={{ minRows: 2, maxRows: 6 }} onBlur={that.noteChange} />
            </Col>
            <Col span={2} className="btn">
              <Button type="primary" onClick={that.save} loading={that.state.loading}>Save</Button>
            </Col>
          </Row>

          <Row className="fill-content" gutter={16}>
            <Col span={21} className="title">
              <CheckboxGroup options={that.state.tags} onChange={that.checkboxChange} />
            </Col>
            <Col span={3} className="btn">
              <Button type="primary" onClick={that.orderMarkSave} loading={that.state.loading}>Collection Tags Save</Button>
            </Col>
          </Row>
          <br />


          {/* /增加黑名单，打折按钮* */}
          <Row className="fill-content" gutter={3}>
            <Col span={3} className="btn" offset={18}>
              <Button type="primary" onClick={that.BlacklistApproval} loading={that.state.loading}>  Add to blacklist  </Button>
            </Col>
            <Col span={3} className="btn">
              <Button type="primary" onClick={that.DiscountApproval} loading={that.state.loading}>  Apply for discount    </Button>
            </Col>
          </Row>
          <br />
          <br />
        </div>


        <UserInfo settings={UserInfoSettings} dataCode={that.state.dataCode} dataCodes />
        <ChargeDetails settings={ChargeDetailsSettings} />
        <ChargeDetails2 settings={ChargeDetails2Settings} />
        <IdentificationInfo settings={IdentificationInfoSettings} />
        <BasicInfo settings={BasicInfoSettings} />
        <EmploymentInfo settings={EmploymentInfoSettings} />
        <Disbursement settings={DisbursementSettings} />
        <LoanRecord memberId={that.state.memberId} />
        <RepaymentRecord appId={this.props.match.params.applicationId} />
        <AddressBookInfo memberId={that.state.memberId} mark={mark} showMark={false} />
        <AppFromAddressBook memberId={that.state.memberId} />
        {/* <FacebookInfo settings={FacebookInfoSettings} /> */}

        <Modal
          title="<div>Discount Save</div>"
          visible={that.state.dsModal}
          onOk={that.discountSaveFn}
          onCancel={that.handleCancel}
          okText="Continue"
          cancelText="Cancel"
          mask={false}
          style={{ width: '2000px' }}
        >
          The application will be closed, sure to continue?
        </Modal>
        <Modal
          title="Apply for blacklist"
          visible={that.state.Blacklist}
          onOk={this.Blacklist}
          onCancel={that.handleCancel1}
          okText="Save"
          cancelText="Cancel"
          mask={false}
          style={{ width: '2000px' }}
        >
          <p>will be submitted to the audit and will be blacklisted if the audit is approved</p>
          <TextArea placeholder="Please input the reason..." autosize={{ minRows: 2, maxRows: 6 }} onChange={that.noteChange} />
        </Modal>
        <Modal
          title="Apply for discount"
          visible={that.state.Discount}
          onOk={that.Discount}
          onCancel={that.handleCancel2}
          okText="Save"
          cancelText="Cancel"
          mask={false}
          style={{ width: '2000px', height: '2000px' }}
        >
          <p>will be submitted to the audit and will be discount if the audit is approved</p>
          <TextArea placeholder="Please input the reason..." autosize={{ minRows: 2, maxRows: 6 }} onChange={that.noteChange} />
          <br /><br />
          <b>Discount amount(PHP) : </b><InputNumber min={1} onChange={that.inputMoney} />
          <br /><br />
          <div className="clearfix">
            <b>Proof of repayment : </b>
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
            <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
              <img alt="example" style={{ width: '100%' }} src={previewImage} />
            </Modal>
          </div>
        </Modal>
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
export default CreditCollectionDetails;
