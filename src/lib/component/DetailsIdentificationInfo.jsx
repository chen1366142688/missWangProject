import React from 'react';
import moment from 'moment';
import { message, Icon, Modal, Row, Col, } from 'antd';
import { CL } from '../tools/index';
import CLComponent from './CLComponent.jsx';
import CLBlockList from './CLBlockList.jsx';
import { Interface } from '../config/index.js';

const { getAppInfoByMemberId, modificationUpdate, typyOfId, contentType } = Interface;

class IdentificationInfo extends CLComponent {
  constructor(props) {
    super(props);
    this.bindCtx([
      'getApplyInfo',
      'saveModify',
    ]);
  }
  state = {
    loanBasisInfo: this.props.settings.loanBasisInfo || {},
    modifyConfirmModal: false,
    mParams: [],
    list: [],
    lists: [],
  }
  componentDidMount(){
    this.typyOfIdData();
  }

  typyOfIdData = () => {
    let that = this;
    let settings = {
      contentType,
      method: 'get',
      url: typyOfId.url,
    }
    function fn(res){
      let list = [];
      let lists = [];
      if(res && res.data ){
        _.map(res.data,(doc)=>{
          list.push({
            name: doc.typeName,
            value: doc.typeName,
          });
        })
        _.map(res.data,(doc)=>{
          lists.push({
            name: doc.typeName,
            value: doc.type,
          });
        })
        that.setState({list, lists});
      }
    }
    CL.clReqwest({settings,fn});
  }

  getApplyInfo(doc) {
    const settings = {
      contentType,
      method: getAppInfoByMemberId.type,
      url: getAppInfoByMemberId.url,
      data: JSON.stringify({
        memberId: doc,
      }),
    };

    function fn(res) {
      if (res.data && res.data.id) {
        window.open(`${location.origin}${location.pathname}#/uplending/loanauditdetails/${res.data.id}/0`);
      }
    }
    CL.clReqwest({ settings, fn });
  }

  saveModify() {
    const that = this;
    const loanBasisInfo = that.state.loanBasisInfo;
    const { params } = that.state;
    _.map(that.state.lists,(doc)=>{
      if(doc.name == params.certificateType){
        params.certificateType = doc.value
      }
    })
    params.applicationId = loanBasisInfo.appId;
    const settings = {
      contentType,
      method: modificationUpdate.type,
      url: modificationUpdate.url,
      data: JSON.stringify(params),
    };

    that.setState({ modifyConfirmModal: false });

    function fn(res) {
      if (res.result && res.result === 'save success') {
        message.success('Save success');
        CL.removeEditFlag('Identification');
        that.props.settings.reload();
      }
    }

    CL.clReqwest({ settings, fn });
  }

  hideModal=()=> {
    this.setState({
      modifyConfirmModal: false,
    });
  }

  render() {
    const that = this;
    const {
      loanBasisInfo, loanBasisInfo1, deviceCheck, sameUser, sameDevice, edit,
    } = that.props.settings;
    let Identification;
    const { lifetimeId, showPaymentCode } = that.props;
    const Identification1 = {
      title: 'Identification',
      titleConfig: [
        {
          btnType: 'primary',
          text: 'Save',
          fn: function (e, data, those) {
            const params = {};
            const mParams = [];
            data = _.map(data, (doc) => {
              if (doc.edit && doc.content !== doc.editValue) {
                if (doc.editType === 'select') {
                  params[doc.tag] = (_.find(doc.getList(), { name: doc.editValue }) || {}).value || null;
                } else {
                  params[doc.tag] = doc.editValue || null;
                }

                mParams.push(_.pick(doc, ['editValue', 'content', 'title']));
              }

              doc.eidting = false;
              return doc;
            });

            those.setState({ data: data });

            // 未修改任何值
            if (!_.values(params).length) {
              message.error('You modified nothing');
              CL.removeEditFlag('Identification');
              return;
            }

            // // 检查未通过
            // if (!that.checkParams(params)) {
            //   return;
            // }

            that.setState({
              params,
              mParams,
              modifyConfirmModal: true,
            });
          },
        },
        {
          btnType: 'danger',
          text: 'Reset',
          fn: function (e, data, those) {
            data = _.map(data, (doc) => {
              if (doc.content !== doc.editValue) {
                doc.editValue = doc.content;
              }
              doc.eidting = false;
              return doc;
            });

            // 删除修改的标记
            CL.removeEditFlag('Identification');

            those.setState({ data: data });
          },
        },
      ],
      data: [
        {
          title: 'Name',
          content: loanBasisInfo.name,
          type: 'text',
          edit: edit,
          editType: 'input',
          editValue: loanBasisInfo.name,
          editPlaceholder: 'Please input name',
          tag: 'name',

        },
        {
          title: 'E-mail',
          content: loanBasisInfo.email,
          type: 'text',

        },
        {
          title: 'Type of ID',
          content: loanBasisInfo.certificateTypeName,
          type: 'text',
          edit: edit,
          editType: 'select',
          editValue: loanBasisInfo.certificateTypeName,
          editPlaceholder: 'Please select Type of ID',
          list: that.state.list,
          getList: function () {
            return that.state.list;
          },
          tag: 'certificateType',
        },
        {
          title: 'ID number',
          content: loanBasisInfo.certificateNo,
          type: 'text',
          edit: edit,
          editType: 'input',
          editValue: loanBasisInfo.certificateNo,
          editPlaceholder: 'Please input ID number',
          tag: 'idNo',

        },
        // {
        //   title: 'Device ID',
        //   content: deviceCheck.unique ? 'unique' : (deviceCheck.deviceList && deviceCheck.deviceList.length ? deviceCheck.deviceList.map((doc) => {
        //     return doc.deviceId;
        //   }).join(',') : '-'),
        //   type: 'text',

        // },
        {
          title: 'Phone number',
          content: loanBasisInfo.memberPhone,
          type: 'text',
        },
        // {
        //   title: 'Users of the same name',
        //   content: sameUser,
        //   type: 'text',
        //   render: function () {
        //     if (!sameUser) {
        //       return (<Icon type="minus" />);
        //     }
        //     return (<div>
        //       {sameUser.map((doc, index) => {
        //             return (<a key={index} onClick={() => { that.getApplyInfo(doc.memberId); }}>{doc.telephoneNo}, </a>);
        //           })}
        //             </div>);
        //   },
        // },
        // {
        //   title: 'Users of the same device ID',
        //   content: sameDevice,
        //   type: 'text',
        //   render: function () {
        //     if (!sameDevice.length) {
        //       return (<Icon type="minus" />);
        //     }
        //     return (<div>
        //       {sameDevice.map((doc, index) => {
        //             return (<a key={index} onClick={() => { that.getApplyInfo(doc.memberId); }}>{doc.telephoneNo},  </a>);
        //           })}
        //     </div>);
        //   },
        // },
        {
          title: 'ID positive photo',
          content: 'ID positive photo',
          type: 'img',
          url: loanBasisInfo.positivePhoto || '-',

        },
        {
          title: 'Hand-held ID card',
          content: 'Hand-held ID card',
          url: loanBasisInfo.handheldPhoto || '-',
          type: 'img',

        },
        {
          title: 'Face Recongnition image',
          content: 'faceImg',
          url: `data:image/png;base64,${loanBasisInfo1}`,
          type: 'img',
        },
      ],
      tag: 'Identification',
    };
    const Identification2 = {
      title: 'Identification',
      titleConfig: [
        {
          btnType: 'primary',
          text: 'Save',
          fn: function (e, data, those) {
            const params = {};
            const mParams = [];
            data = _.map(data, (doc) => {
              if (doc.edit && doc.content !== doc.editValue) {
                if (doc.editType === 'select') {
                  params[doc.tag] = (_.find(doc.getList(), { name: doc.editValue }) || {}).value || null;
                } else {
                  params[doc.tag] = doc.editValue || null;
                }

                mParams.push(_.pick(doc, ['editValue', 'content', 'title']));
              }

              doc.eidting = false;
              return doc;
            });

            those.setState({ data: data });

            // 未修改任何值
            if (!_.values(params).length) {
              message.error('You modified nothing');
              CL.removeEditFlag('Identification');
              return;
            }

            // // 检查未通过
            // if (!that.checkParams(params)) {
            //   return;
            // }

            that.setState({
              params,
              mParams,
              modifyConfirmModal: true,
            });
          },
        },
        {
          btnType: 'danger',
          text: 'Reset',
          fn: function (e, data, those) {
            data = _.map(data, (doc) => {
              if (doc.content !== doc.editValue) {
                doc.editValue = doc.content;
              }
              doc.eidting = false;
              return doc;
            });

            // 删除修改的标记
            CL.removeEditFlag('Identification1');

            those.setState({ data: data });
          },
        },
      ],
      data: [
        {
          title: 'Name',
          content: loanBasisInfo.name,
          type: 'text',
          edit: edit,
          editType: 'input',
          editValue: loanBasisInfo.name,
          editPlaceholder: 'Please input name',
          tag: 'name',

        },
        {
          title: 'E-mail',
          content: loanBasisInfo.email,
          type: 'text',

        },
        {
          title: 'Type of ID',
          content: loanBasisInfo.certificateTypeName,
          type: 'text',
          edit: edit,
          editType: 'select',
          editValue: loanBasisInfo.certificateTypeName,
          editPlaceholder: 'Please select Type of ID',
          list: that.state.list,
          getList: function () {
            return that.state.list;
          },
          tag: 'certificateType',
        },
        {
          title: 'ID number',
          content: loanBasisInfo.certificateNo,
          type: 'text',
          edit: edit,
          editType: 'input',
          editValue: loanBasisInfo.certificateNo,
          editPlaceholder: 'Please input ID number',
          tag: 'idNo',

        },
        {
          title: 'Phone number',
          content: loanBasisInfo.memberPhone,
          type: 'text',
        },
        {
          title: 'ID positive photo',
          content: 'ID positive photo',
          type: 'img',
          url: loanBasisInfo.positivePhoto || '-',

        },
        {
          title: 'Hand-held ID card',
          content: 'Hand-held ID card',
          url: loanBasisInfo.handheldPhoto || '-',
          type: 'img',

        },
        {
          title: 'Face Recongnition image',
          content: 'faceImg',
          url: `data:image/png;base64,${loanBasisInfo1}`,
          type: 'img',
        },
      ],
      tag: 'Identification1',
    };
    if(loanBasisInfo.applicationType == 'older'){
      Identification = Identification1;
    }else{
      Identification = Identification2;
    }

    if (showPaymentCode) {
      Identification.data.push(
        {
          title: 'Reference No.',
          content: lifetimeId,
          type: 'text',
        },
      );
    }

    // 如果有活体检测照片
    // if (loanBasisInfo.livingPhotoBase64) {
    //   Identification.data.push(
    //     {

    //       title: "Face Recongnition image",
    //       content: "faceImg",
    //       url: `data:image/png;base64,${loanBasisInfo.livingPhotoBase64}`,
    //       type: 'img',
    //     }
    //   )
    // }
    return (
      <div>
        <CLBlockList settings={Identification} />
        <Modal
          title="Modification Save"
          visible={that.state.modifyConfirmModal}
          onOk={that.saveModify}
          onCancel={that.hideModal}
          okText="Comfirm"
          cancelText="Cancel"
          mask={false}
        >
          <Row style={{ marginTop: 20 }}>
            <Col span={20} offset={1}>
              {
                that.state.mParams.map((doc, index) => {
                  return (
                    <p key={doc.title}><strong>{index + 1}</strong>. <strong>{doc.title}: </strong> {doc.content} ====> <span style={{ color: 'red' }}>{doc.editValue}</span></p>
                  );
                })
              }
            </Col>
          </Row>
        </Modal>
      </div>
    );
  }
}
export default IdentificationInfo;
