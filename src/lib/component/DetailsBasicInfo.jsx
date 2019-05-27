import React from 'react';
import moment from 'moment';
import { Table, Icon, Button, Modal, Row, Col, message } from 'antd';
import { CL } from '../tools/index';
import CLComponent from './CLComponent.jsx';
import CLBlockList from './CLBlockList.jsx';

import { Interface } from '../config/index.js';

const {
  getDistanceInfo,
  contentType,
  getCityListIF,
  getBarangaysListIF,
  getUserInfoListIF,
  modificationUpdate,
  modificationHis,
} = Interface;



class BasicInfo extends CLComponent {
  constructor(props) {
    super(props);
    this.bindCtx([
      'toggleMapModal',
      'setDistanceInfo',
      'removeDistanceInfo',
      'getCList',
      'getBList',
      'getUIfoList',
      'toolOpt',
      'hideModal',
      'saveModify',
      'loadModiyHis',
      'checkParams',
    ]);
  }

  state = {
    mapDisplay: false,
    homeDis: 0,
    companyDis: 0,
    cityList: [],
    bglist: [],
    edList: [],
    pcList: [],
    rtList: [],
    wtList: [],
    gender: [
      {name:'MALE', value: 'MALE' },
      {name:'FEMALE', value: 'FEMALE' }
    ],
    modifyConfirmModal: false,
    mParams: [],
    loanBasisInfo: this.props.settings.loanBasisInfo || {},
    modifyHis: {},
  }

  componentDidMount() {
    this.loadData();
    this.getBList(this.state.loanBasisInfo.resideCity);
    this.loadModiyHis();
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.state.loanBasisInfo) !== JSON.stringify(nextProps.settings.loanBasisInfo)) {
      this.setState({
        loanBasisInfo: nextProps.settings.loanBasisInfo,
        modifyHis: {},
      });

      this.loadModiyHis();
    }
  }

  loadData() {
    const that = this;
    const { loanBasisInfo } = this.props.settings;
    const settings = {
      contentType,
      method: getDistanceInfo.type,
      url: getDistanceInfo.url,
      data: JSON.stringify({
        applicationId: loanBasisInfo.appId,
      }),
    };
    function fn(res) {
      if (res.data) {
        that.setState({
          homeDis: (res.data || {}).homeLbsDistance,
          companyDis: (res.data || {}).workLbsDistance,
        });
      }
    }

    CL.clReqwest({ settings, fn });
  }

  toggleMapModal(e) {
    if (this.state.mapDisplay) {
      this.removeDistanceInfo();
      this.loadData();
    } else {
      this.setDistanceInfo();
    }

    this.setState({
      mapDisplay: !this.state.mapDisplay,
    });
  }

  setDistanceInfo() {
    const { loanBasisInfo } = this.props.settings;
    const obj = {
      Home: {
        city: loanBasisInfo.resideCity,
        barangay: loanBasisInfo.resideBarangay,
        detail: loanBasisInfo.resideAddress,
      },
      Lbs: loanBasisInfo.geographicalLocation,
      Company: {
        city: loanBasisInfo.companyCity,
        barangay: loanBasisInfo.companyBarangay,
        detail: loanBasisInfo.companyAddress,
        companyName: loanBasisInfo.companyName,
      },
      appId: loanBasisInfo.appId,
    };

    sessionStorage.setItem('distance', JSON.stringify(obj));
  }

  removeDistanceInfo() {
    sessionStorage.removeItem('distance');
  }


  // 首次进入加载list, 或者根据用户输入项filter
  getCList() {
    const that = this;
    const cityList = [];
    let sessionCity;

    // 从内存中取出city数据
    if (that.state.cityList && that.state.cityList.length) {
      return that.state.cityList;
    }

    // 从浏览器本地存储中取出city数据
    sessionCity = sessionStorage.getItem('city');
    if (sessionCity) {
      return JSON.parse(sessionCity);
    }

    // 从服务器取数据
    const settings = {
      contentType,
      method: getCityListIF.type,
      url: getCityListIF.url,
    };

    function fn(res) {
      if (res.data) {
        const cityList = _.map(res.data.cities, (doc) => {
          return {
            name: doc,
            value: doc,
          };
        });

        sessionStorage.setItem('cityList', JSON.stringify(cityList));
        that.setState({
          cityList,
        });
      }
    }

    CL.clReqwest({ settings, fn });
  }

  // 区域筛选，首先加载li, 然后根据用户输入的项 filter,根据title
  getBList(city) {
    const that = this;
    const bglist = [];

    const settings = {
      contentType,
      method: getBarangaysListIF.type,
      url: getBarangaysListIF.url,
      data: JSON.stringify({ city: city }),
    };

    function fn(res) {
      if (res.data) {
        that.setState({
          bglist: _.map(res.data.barangays, (doc) => {
            return {
              name: doc.title,
              value: doc.title,
            };
          }),
        });
      }
    }

    CL.clReqwest({ settings, fn });
  }
  // 获取用户信息列表
  getUIfoList() {
    const that = this;
    const bglist = [];
    if (that.state.edList && that.state.edList.length) {
      return;
    }

    const settings = {
      contentType,
      method: getUserInfoListIF.type,
      url: getUserInfoListIF.url,
    };

    function fn(res) {
      if (res.data && res.data.industryType) {
        that.setState({
          edList: that.toolOpt(res.data.educationType),
          pcList: that.toolOpt(res.data.industryType),
          rtList: that.toolOpt(res.data.resideTimeType),
          wtList: that.toolOpt(res.data.workingTimePeriod),
        });
      }
    }

    CL.clReqwest({ settings, fn });
  }

  toolOpt(arr) {
    if (!arr || !arr.length) {
      return [];
    }

    return arr.map((doc) => {
      return {
        name: doc.typeName,
        value: doc.type,
      };
    });
  }

  hideModal() {
    this.setState({
      modifyConfirmModal: false,
    });
  }

  loadModiyHis() {
    const that = this;
    const loanBasisInfo = that.state.loanBasisInfo;
    const modifyHis = [];

    const settings = {
      contentType,
      method: modificationHis.type,
      url: modificationHis.url,
      data: JSON.stringify({
        infoModificationLog: {
          applicationId: loanBasisInfo.appId,
          memberId: loanBasisInfo.memberId,
        },
      }),
    };

    function fn(res) {
      if (res.data) {
        that.setState({
          modifyHis: res.data.basisInfoModificationLog || {},
        });
      }
    }

    CL.clReqwest({ settings, fn });
  }

  saveModify() {
    const that = this;
    const loanBasisInfo = that.state.loanBasisInfo;
    const { params } = that.state;
    params.applicationId = loanBasisInfo.appId;
    const settings = {
      contentType,
      method: modificationUpdate.type,
      url: modificationUpdate.url,
      data: JSON.stringify(params),
    };

    
    function fn(res) {
      if (res.result && res.result === 'save success') {
        that.setState({ modifyConfirmModal: false });
        message.success('Save success');
        CL.removeEditFlag('BasicInformation');
        that.props.settings.reload();
      }
    }

    CL.clReqwest({ settings, fn });
  }

  checkParams(params) {
    let flag = true;
    let message = '';
    // 检查学历
    if ((params.educationBackground && !_.find(this.state.edList, { value: params.educationBackground })) || _.isNull(params.educationBackground)) {
      flag = false;
      message = 'Education background error';
    }

    // 检查城市
    if ((params.city && !_.find(this.state.cityList, { value: params.city })) || _.isNull(params.city)) {
      flag = false;
      message = 'City error';
    }

    if ((params.barangay && !_.find(this.state.bglist, { value: params.barangay })) || _.isNull(params.barangay)) {
      flag = false;
      message = 'Barangay error';
    }

    // 检查居住时长
    if ((params.lengthOfResidence && !_.find(this.state.rtList, { value: params.lengthOfResidence })) || _.isNull(params.lengthOfResidence)) {
      flag = false;
      message = 'Length of residence error';
    }

    if (!flag) {
      message.error(message);
    }

    return flag;
  }

  render() {
    const that = this;
    const { mark, edit } = that.props.settings;
    const loanBasisInfo = that.state.loanBasisInfo;
    const modifyHis = that.state.modifyHis;

    if (!_.values(loanBasisInfo).length) {
      return (<div />);
    }
    let BasicInformation;

    const BasicInformation1 = {
      title: 'Basic Information',
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
              CL.removeEditFlag('BasicInformation');
              return;
            }

            // 检查未通过
            if (!that.checkParams(params)) {
              return;
            }

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
            CL.removeEditFlag('BasicInformation');

            those.setState({ data: data });
          },
        },
      ],
      data: [
        {
          title: 'Marital status',
          content: loanBasisInfo.maritalStatusName,
          type: 'text',

        },
        {
          title: 'City/District',
          content: loanBasisInfo.resideCity,
          type: 'text',
          // check: CL.setMark(mark.city),
          // edit: edit,
          // editType: 'select',
          // editValue: loanBasisInfo.resideCity,
          // editPlaceholder: 'Please select city',
          // list: that.state.cityList,
          // getList: function () {
          //   return that.state.cityList;
          // },
          // loadDataByParams(those) { // 级联选择，根据前一个选择项目，加载后一个数据
          //   that.getCList();
          // },
          // tag: 'city',
          // modified: modifyHis.city,

        },
        {
          title: 'Barangay',
          content: loanBasisInfo.resideBarangay,
          type: 'text',
          // edit: edit,
          // editType: 'select',
          // editValue: loanBasisInfo.resideBarangay,
          // editPlaceholder: 'Please select barangy',
          // list: that.state.bglist,
          // getList: function () {
          //   return that.state.bglist;
          // },
          // loadDataByParams(those) { // 级联选择，根据前一个选择项目，加载后一个数据
          //   let city;
          //   _.each(those.state.data, (doc) => {
          //     if (doc.title === 'City/District') {
          //       city = doc.editValue || doc.content;
          //     }
          //   });
          //   that.getBList(city);
          // },
          // tag: 'barangay',
          // modified: modifyHis.barangay,

        },
        {
          title: 'Length of residence',
          content: loanBasisInfo.resideTimeName,
          type: 'text',
          // check: CL.setMark(mark.lengthResidence),
          // edit: edit,
          // editType: 'select',
          // editValue: loanBasisInfo.resideTimeName,
          // editPlaceholder: 'Please select length of residence',
          // list: that.state.rtList,
          // getList: function () {
          //   return that.state.rtList;
          // },
          // loadDataByParams(those) { // 级联选择，根据前一个选择项目，加载后一个数据
          //   that.getUIfoList();
          // },
          // tag: 'lengthOfResidence',
          // modified: modifyHis.lengthOfResidence,

        },
        {
          title: 'Date of birth',
          content: moment(new Date(loanBasisInfo.birthday)).format('YYYY-MM-DD'),
          type: 'text',
          edit: edit,
          editType: 'date',
          editValue: moment(new Date(loanBasisInfo.birthday)).format('YYYY-MM-DD'),
          editPlaceholder: 'Please input date',
          tag: 'birthday',
          modified: modifyHis.birthday,

        },
        {
          title: 'Detail address',
          content: loanBasisInfo.resideAddress,
          type: 'text',
          // edit: edit,
          // editType: 'input',
          // editValue: loanBasisInfo.resideAddress,
          // editPlaceholder: 'Please input company address',
          // tag: 'detailAddress',
          // modified: modifyHis.detailAddress,

        },
        {
          title: 'Gender',
          content: loanBasisInfo.sexName,
          type: 'text',
          edit: edit,
          editType: 'select',
          editValue: loanBasisInfo.sexName,
          editPlaceholder: 'Please select Gender',
          list: that.state.gender,
          getList: function () {
            return that.state.gender;
          },
          tag: 'sex',
          modified: modifyHis.sex,

        },
        {
          title: 'LBS information',
          content: loanBasisInfo.geographicalLocation,
          type: 'text',
          // check: CL.setMark(mark.LBS),
        },
        {
          title: 'Permanent address',
          content: `${loanBasisInfo.permanentAddress || '-'}, ${loanBasisInfo.permanentBarangay || '-'}, ${loanBasisInfo.permanentCity || '-'}`,
          type: 'text',
        },

        {
          title: 'Distance from LBS to home',
          content: setDistance('homeDis'),
          type: 'text',
        },
        {
          title: 'Distance from LBS to work',
          content: setDistance('companyDis'),
          type: 'text',
        },
      ],
      tag: 'BasicInformation',
    };
    const BasicInformation2 = {
      title: 'Basic Information',
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
              CL.removeEditFlag('BasicInformation');
              return;
            }

            // 检查未通过
            if (!that.checkParams(params)) {
              return;
            }

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
            CL.removeEditFlag('BasicInformation');

            those.setState({ data: data });
          },
        },
      ],
      data: [
        {
          title: 'Marital status',
          content: loanBasisInfo.maritalStatusName,
          type: 'text',

        },
        {
          title: 'Date of birth',
          content: moment(new Date(loanBasisInfo.birthday)).format('YYYY-MM-DD'),
          type: 'text',
          edit: edit,
          editType: 'date',
          editValue: moment(new Date(loanBasisInfo.birthday)).format('YYYY-MM-DD'),
          editPlaceholder: 'Please input date',
          tag: 'birthday',
          modified: modifyHis.birthday,
        },
        {
          title: 'Gender',
          content: loanBasisInfo.sexName,
          type: 'text',
          edit: edit,
          editType: 'select',
          editValue: loanBasisInfo.sexName,
          editPlaceholder: 'Please select Gender',
          list: that.state.gender,
          getList: function () {
            return that.state.gender;
          },
          tag: 'sex',
          modified: modifyHis.sex,
        },
      ],
      tag: 'BasicInformation',
    };

    function setDistance(tag) {
      return (
        <div key="loanss">
          <span>{`${that.state[tag] || 0}KM  `}</span>
          <a onClick={that.toggleMapModal}>
            {

              tag === 'companyDis' ? (
                <Button type="primary" >google map</Button>
              ) : ''
            }
          </a>
        </div>

      );
    }
    if(loanBasisInfo.applicationType == 'older'){
      BasicInformation = BasicInformation2;
    }else{
      BasicInformation = BasicInformation2;
    }

    return (
      <div key="loans">
        <CLBlockList settings={BasicInformation} />
        <Modal
          title="Distance from LBS"
          style={{ top: 20 }}
          visible={this.state.mapDisplay}
          width="100%"
          closable={false}
          footer={[
            <Button key="back" onClick={() => this.toggleMapModal()}>Close</Button>,
            ]}
        >
          <iframe
            src="./static/googlemap.html"
            width="100%"
            height="500px"
          />
        </Modal>

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
export default BasicInfo;