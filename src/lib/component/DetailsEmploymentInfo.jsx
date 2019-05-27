import React from 'react';
import moment from 'moment';
import { Table, Icon } from 'antd';
import { CL } from '../tools/index';
import CLComponent from './CLComponent.jsx';
import CLBlockList from './CLBlockList.jsx';
import { Interface } from '../config/index.js';
import { Row, Col, Button, message, Modal } from 'antd';
import CF from 'currency-formatter';
import RedBox from 'redbox-react';

const {
  getCityListIF,
  getBarangaysListIF,
  getUserInfoListIF,
  modificationSave,
  modificationHis,
  occupationInfoList,
  contentType
} = Interface;


class EmploymentInfo extends CLComponent {
  state = {
    cityList: [],
    bglist: [],
    edList: [],
    pcList: [],
    rtList: [],
    wtList: [],
    modifyConfirmModal: false,
    mParams: [],
    loanBasisInfo: this.props.settings.loanBasisInfo || {},
    modifyHis: {},
    dataList: {},
    clientTpye: '',
    client: '',
  };
 
  constructor(props) {
    super(props);
    this.bindCtx([
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

  componentDidMount() {
    this.loadModiyHis();
    this.getBList(this.state.loanBasisInfo.resideCity);
    this.occupationInfoList();
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.state.loanBasisInfo) !== JSON.stringify(nextProps.settings.loanBasisInfo)) {
      this.setState({
        loanBasisInfo: nextProps.settings.loanBasisInfo,
        modifyHis: {}
      });

      this.loadModiyHis();
    }
  }

  //首次进入加载list, 或者根据用户输入项filter
  getCList() {
    const that = this;
    let cityList = [];
    let sessionCity;

    //从内存中取出city数据
    if (that.state.cityList && that.state.cityList.length) {
      return that.state.cityList;
    }

    //从浏览器本地存储中取出city数据
    sessionCity = sessionStorage.getItem('city');
    if (sessionCity) {
      return JSON.parse(sessionCity);
    }

    //从服务器取数据
    const settings = {
      contentType,
      method: getCityListIF.type,
      url: getCityListIF.url
    };

    function fn(res) {
      if (res.data) {
        const cityList = _.map(res.data.cities, function (doc) {
          return {
            name: doc,
            value: doc
          };
        });

        sessionStorage.setItem('cityList', JSON.stringify(cityList));
        that.setState({
          cityList
        });
      }
    }

    CL.clReqwest({
      settings,
      fn
    });
  }

  //区域筛选，首先加载li, 然后根据用户输入的项 filter,根据title
  getBList(city) {
    const that = this;
    let bglist = [];

    const settings = {
      contentType,
      method: getBarangaysListIF.type,
      url: getBarangaysListIF.url,
      data: JSON.stringify({ city: city })
    };

    function fn(res) {
      if (res.data) {
        that.setState({
          bglist: _.map(res.data.barangays, function (doc) {
            return {
              name: doc.title,
              value: doc.title
            };
          })
        });
      }
    }

    CL.clReqwest({
      settings,
      fn
    });
  }

  occupationInfoList = () => {
    const that = this;
    const settings = {
      contentType,
      method: occupationInfoList.type,
      url: occupationInfoList.url + that.state.loanBasisInfo.appId
    };

    function fn(res) {
      if(res && res.data){
        that.setState({
          dataList: res.data,
          client: res.data.infaceUse,
          clientTpye: res.data.type,
        });
      }
    }

    CL.clReqwest({settings,fn });
  }

  //获取用户信息列表
  getUIfoList() {
    const that = this;
    let bglist = [];
    if (that.state.edList && that.state.edList.length) {
      return;
    }

    const settings = {
      contentType,
      method: getUserInfoListIF.type,
      url: getUserInfoListIF.url
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

    CL.clReqwest({
      settings,
      fn
    });
  }

  toolOpt(arr) {
    if (!arr || !arr.length) {
      return [];
    }

    return arr.map(function (doc) {
      return {
        name: doc.typeName,
        value: doc.type
      };
    });
  }

  hideModal() {
    this.setState({
      modifyConfirmModal: false
    });
  }

  loadModiyHis() {
    const that = this;
    const loanBasisInfo = that.state.loanBasisInfo;
    let modifyHis = [];

    const settings = {
      contentType,
      method: modificationHis.type,
      url: modificationHis.url,
      data: JSON.stringify({
        infoModificationLog: {
          applicationId: loanBasisInfo.appId,
          memberId: loanBasisInfo.memberId,
        }
      })
    };

    function fn(res) {
      if (res.data) {
        that.setState({
          modifyHis: res.data.basisInfoModificationLog || {}
        });
      }
    }

    CL.clReqwest({
      settings,
      fn
    });
  }

  saveModify() {
    const that = this;
    const loanBasisInfo = that.state.loanBasisInfo;
    const { params } = that.state;
    const settings = {
      contentType,
      method: modificationSave.type,
      url: modificationSave.url,
      data: JSON.stringify({
        infoModificationLog: _.extend(params, {
          applicationId: loanBasisInfo.appId,
          memberId: loanBasisInfo.memberId,
        })
      })
    };
    that.setState({ modifyConfirmModal: false });

    function fn(res) {
      if (res.result && res.result === 'save success') {
        message.success('Save success');
        CL.removeEditFlag('EmploymentInformaiton');
        that.props.settings.reload();
        star;
      }
    }

    CL.clReqwest({settings,fn});
  }

  checkParams(params) {
    let flag = true;
    let message = '';
    //检查学历
    if ((params.occupation && !_.find(this.state.edList, { value: params.occupation })) || _.isNull(params.occupation)) {
      flag = false;
      message = `Occupation background error`;
    }

    //检查城市
    if ((params.cityOfCompany && !_.find(this.state.cityList, { value: params.cityOfCompany })) || _.isNull(params.cityOfCompany)) {
      flag = false;
      message = `City of company error`;
    }

    //检查区域
    if ((params.barangyOfCompany && !_.find(this.state.bglist, { value: params.barangyOfCompany })) || _.isNull(params.barangyOfCompany)) {
      flag = false;
      message = `Barangy of company error`;
    }

    //检查居住时长
    if ((params.yearsInCurrentCompany && !_.find(this.state.rtList, { value: params.yearsInCurrentCompany })) || _.isNull(params.yearsInCurrentCompany)) {
      flag = false;
      message = `Years in currentCompany error`;
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
      return (<div></div>);
    }

    console.log(that.state.clientTpye);
    const EmploymentInformaiton = {
      title: 'Employment Informaiton',
      titleConfig: [
        {
          btnType: 'primary',
          text: 'Save',
          fn: function (e, data, those) {
            let params = {};
            let mParams = [];
            data = _.map(data, function (doc) {
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
            if (!_.values(params).length) {
              message.error('You modified nothing');
              CL.removeEditFlag('EmploymentInformaiton');
              return;
            }

            //检查未通过
            if (!that.checkParams(params)) {
              return;
            }

            that.setState({
              params,
              mParams,
              modifyConfirmModal: true
            });


          }
        },
        {
          btnType: 'danger',
          text: 'Reset',
          fn: function (e, data, those) {
            data = _.map(data, function (doc) {
              if (doc.content !== doc.editValue) {
                doc.editValue = doc.content;
              }
              doc.eidting = false;
              return doc;
            });
            //删除修改的标记
            CL.removeEditFlag('EmploymentInformaiton');
            those.setState({ data: data });
          }
        }
      ],
      data: [
        {
          title: 'Occupation',
          content: loanBasisInfo.industryName,
          type: 'text',
          // check: CL.setMark(mark.socialStatus),
          // edit: edit,
          // editType: 'select',
          // editValue: loanBasisInfo.industryName,
          // editPlaceholder: 'Please select barangy',
          // list: that.state.pcList,
          // getList: function () {
          //   return that.state.pcList;
          // },
          // loadDataByParams(those) { //级联选择，根据前一个选择项目，加载后一个数据
          //   that.getUIfoList();
          // },
          // tag: 'occupation',
          // modified: modifyHis.occupation,

        },
        {
          title: 'Company name',
          content: loanBasisInfo.companyName,
          type: 'text',
          // edit: edit,
          // editType: 'input',
          // editValue: loanBasisInfo.companyName,
          // editPlaceholder: 'Please input company name',
          // tag: 'companyName',
          // modified: modifyHis.companyName,

        },
        // {
        //   title: 'Position in company',
        //   content: loanBasisInfo.jobPosition,
        //   type: 'text',
        // },
        // {
        //   title: 'City/District of company',
        //   content: loanBasisInfo.companyCity,
        //   type: 'text',
        //   // check: CL.setMark(mark.companyCity),
        //   edit: edit,
        //   editType: 'select',
        //   editValue: loanBasisInfo.companyCity,
        //   editPlaceholder: 'Please select city',
        //   list: that.state.cityList,
        //   getList: function () {
        //     return that.state.cityList;
        //   },
        //   loadDataByParams(those) { //级联选择，根据前一个选择项目，加载后一个数据
        //     that.getCList();
        //   },
        //   tag: 'cityOfCompany',
        //   modified: modifyHis.cityOfCompany,
        // },
        // {
        //   title: 'Barangy of company',
        //   content: loanBasisInfo.companyBarangay,
        //   type: 'text',
        //   edit: edit,
        //   editType: 'select',
        //   editValue: loanBasisInfo.companyBarangay,
        //   editPlaceholder: 'Please select barangy',
        //   list: that.state.bglist,
        //   getList: function () {
        //     return that.state.bglist;
        //   },
        //   loadDataByParams(those) { //级联选择，根据前一个选择项目，加载后一个数据
        //     let city;
        //     _.each(those.state.data, function (doc) {
        //       if (doc.title === 'City/District of company') {
        //         city = doc.editValue || doc.content;
        //       }
        //     });
        //     that.getBList(city);
        //   },
        //   tag: 'barangyOfCompany',
        //   modified: modifyHis.barangyOfCompany,
        // },
        // {
        //   title: 'Detail address of company',
        //   content: loanBasisInfo.companyAddress,
        //   type: 'text',
        //   edit: edit,
        //   editType: 'input',
        //   editValue: loanBasisInfo.companyAddress,
        //   editPlaceholder: 'Please input company address',
        //   tag: 'detailAddressOfCompany',
        //   modified: modifyHis.detailAddressOfCompany,
        // },
        {
          title: 'Office phone number',
          content: loanBasisInfo.companyTelephone,
          type: 'text',
          // edit: edit,
          // editType: 'input',
          // editValue: loanBasisInfo.companyTelephone,
          // editPlaceholder: 'Please input office phone no',
          // tag: 'officePhoneNumber',
          // modified: modifyHis.officePhoneNumber,
        },
        // {
        //   title: 'Paycheck/Payroll',
        //   content: 'Paycheck/Payroll',
        //   type: 'img',
        //   url: loanBasisInfo.salaryRecordPhoto
        // },
      ],
      tag: 'EmploymentInformaiton'
    };
    const EmploymentInformaiton1 = {
      title: 'Employment Informaiton',
      data: [
        {
          title: 'Occupation',
          content: that.state.dataList.occupation,
          type: 'text',
        },
        // {
        //   title: 'Industry',
        //   content: that.state.dataList.industry,
        //   type: 'text',
        // },
        {
          title: 'Company Name',
          content: that.state.dataList.coSchName,
          type: 'text',
        },
        
        // {
        //   title: 'Year in current company',
        //   content: that.state.dataList.workingTime,
        //   type: 'text',
        // },
        
        // {
        //   title: 'Monthly Salary',
        //   content: that.state.dataList.income,
        //   type: 'text',
        // },
        
        {
          title: 'Office phone number',
          content: that.state.dataList.coTelephone,
          type: 'text',
        },
        
        // {
        //   title: 'Payday1',
        //   content: that.state.dataList.payDay1,
        //   type: 'text',
        // },
        
        // {
        //   title: 'Payday2',
        //   content: that.state.dataList.payDay2,
        //   type: 'text',
        // },
        
        // {
        //   title: 'Work address',
        //   content: that.state.dataList.coSchAddress,
        //   type: 'text',
        // },
      ],
      tag: 'EmploymentInformaiton'
    };
    const EmploymentInformaiton2 = {
      title: 'Employment Informaiton',
      data: [
        {
          title: 'Occupation',
          content: that.state.dataList.occupation,
          type: 'text',
        },
        // {
        //   title: 'General Workaddress',
        //   content: that.state.dataList.coSchAddress,
        //   type: 'text',
        // },
        // {
        //   title: 'Monthly Salary',
        //   content: that.state.dataList.income,
        //   type: 'text',
        // },
        {
          title: 'Company Name',
          content: that.state.dataList.coSchName,
          type: 'text',
        },
        {
          title: 'Office phone number',
          content: that.state.dataList.coTelephone,
          type: 'text',
        },
      ],
      tag: 'EmploymentInformaiton'
    };
    const EmploymentInformaiton3 = {
      title: 'Employment Informaiton',
      data: [
        {
          title: 'Occupation',
          content: that.state.dataList.occupation,
          type: 'text',
        },
        {
          title: 'Company Name',
          content: that.state.dataList.coSchName,
          type: 'text',
        },
        {
          title: 'Office phone number',
          content: that.state.dataList.coTelephone,
          type: 'text',
        },
        // {
        //   title: 'Year in current company',
        //   content: that.state.dataList.workingTime,
        //   type: 'text',
        // },
        
        // {
        //   title: 'Number of Employee',
        //   content: that.state.dataList.employeeNum,
        //   type: 'text',
        // },
        // {
        //   title: 'Work address',
        //   content: that.state.dataList.coSchAddress,
        //   type: 'text',
        // },
        // {
        //   title: 'Monthly Salary',
        //   content: that.state.dataList.income,
        //   type: 'text',
        // },
      ],
      tag: 'EmploymentInformaiton'
    };
    const EmploymentInformaiton4 = {
      title: 'Employment Informaiton',
      data: [
        {
          title: 'Occupation',
          content: that.state.dataList.occupation,
          type: 'text',
        },
        {
          title: 'Company Name',
          content: that.state.dataList.coSchName,
          type: 'text',
        },
        {
          title: 'Office phone number',
          content: that.state.dataList.coTelephone,
          type: 'text',
        },
      ],
      tag: 'EmploymentInformaiton'
    };
    const EmploymentInformaiton5 = {
      title: 'Employment Informaiton',
      data: [
        {
          title: 'Occupation',
          content: that.state.dataList.occupation,
          type: 'text',
        },
        {
          title: 'Company Name',
          content: that.state.dataList.coSchName,
          type: 'text',
        },
        {
          title: 'Office phone number',
          content: that.state.dataList.coTelephone,
          type: 'text',
        },
        // {
        //   title: 'School',
        //   content: that.state.dataList.coSchName,
        //   type: 'text',
        // },
        
        // {
        //   title: 'School Address',
        //   content: that.state.dataList.coSchAddress,
        //   type: 'text',
        // },
      ],
      tag: 'EmploymentInformaiton'
    };
    const EmploymentInformaiton6 = {
      title: 'Employment Informaiton',
      data: [
        {
          title: 'Occupation',
          content: that.state.dataList.occupation,
          type: 'text',
        },
        {
          title: 'Company Name',
          content: that.state.dataList.coSchName,
          type: 'text',
        },
        {
          title: 'Office phone number',
          content: that.state.dataList.coTelephone,
          type: 'text',
        },
        // {
        //   title: 'Year of being Unemployed',
        //   content: that.state.dataList.workingTime,
        //   type: 'text',
        // },
        
        // {
        //   title: 'Monthly Income',
        //   content: that.state.dataList.income,
        //   type: 'text',
        // },
      ],
      tag: 'EmploymentInformaiton'
    };
    const EmploymentInformaiton7 = {
      title: 'Employment Informaiton',
      data: [
        {
          title: 'Occupation',
          content: that.state.dataList.occupation,
          type: 'text',
        },
        {
          title: 'Company Name',
          content: that.state.dataList.coSchName,
          type: 'text',
        },
        {
          title: 'Office phone number',
          content: that.state.dataList.coTelephone,
          type: 'text',
        },
        // {
        //   title: 'Pre-retirement industry',
        //   content: that.state.dataList.industry,
        //   type: 'text',
        // },
        
        // {
        //   title: 'Retirement time',
        //   content: that.state.dataList.retireUnTime,
        //   type: 'text',
        // },
        
        // {
        //   title: 'Retirement Salary',
        //   content: that.state.dataList.income,
        //   type: 'text',
        // },
        
        // {
        //   title: 'Work Address',
        //   content: that.state.dataList.coSchAddress,
        //   type: 'text',
        // },
      ],
      tag: 'EmploymentInformaiton'
    };

    let type = that.state.clientTpye;
    let EmploymentInformaitonOne = {};
    if(type == 1){
      EmploymentInformaitonOne = EmploymentInformaiton1;
    }else if(type == 2){
      EmploymentInformaitonOne = EmploymentInformaiton2;
    }else if(type == 3){
      EmploymentInformaitonOne = EmploymentInformaiton3;
    }else if(type == 4){
      EmploymentInformaitonOne = EmploymentInformaiton4;
    }else if(type == 5){
      EmploymentInformaitonOne = EmploymentInformaiton5;
    }else if(type == 6){
      EmploymentInformaitonOne = EmploymentInformaiton6;
    }else if(type == 7){
      EmploymentInformaitonOne = EmploymentInformaiton7;
    }
    
    // if (!loanBasisInfo.salaryRecordPhoto) {
    //   EmploymentInformaiton.data.pop();
    //   EmploymentInformaiton.data.push({
    //     title: 'Paycheck/Payroll',
    //     content: loanBasisInfo.salaryRecordPhoto,
    //     type: 'text'
    //   });
    // }


    // if (loanBasisInfo.billingPhotoUrl) {
    //   EmploymentInformaiton.data.push({
    //     title: 'Proof of billing',
    //     content: 'Proof of billing',
    //     type: 'img',
    //     url: loanBasisInfo.billingPhotoUrl
    //   });
    // } else {
    //   EmploymentInformaiton.data.push({
    //     title: 'Proof of billing',
    //     content: loanBasisInfo.billingPhotoUrl,
    //     type: 'text'
    //   });
    // }

    // EmploymentInformaiton.data.push(
    //   {
    //     title: 'Payday 1',
    //     content: loanBasisInfo.payDay1,
    //     type: 'text'
    //   },
    //   {
    //     title: 'Payday 2',
    //     content: loanBasisInfo.payDay2,
    //     type: 'text'
    //   },
    // );

    //如果有营业执照
    // if (loanBasisInfo.businessPermitPhotoUrl) {
    //   // Bussiness permit/DTI
    //   EmploymentInformaiton.data.push(
    //     {
    //       title: 'Bussiness permit/DTI',
    //       content: 'dit',
    //       type: 'img',
    //       url: loanBasisInfo.businessPermitPhotoUrl
    //     }
    //   );
    // }
    return (
      <div>
        <Modal
          title="Modification Save"
          visible={that.state.modifyConfirmModal}
          onOk={that.saveModify}
          onCancel={that.hideModal}
          okText={'Comfirm'}
          cancelText={'Cancel'}
          mask={false}
        >
          <Row style={{ marginTop: 20 }}>
            <Col span={20} offset={1}>
              {
                that.state.mParams.map(function (doc, index) {
                  return (
                    <p key={doc.title}><strong>{index + 1}</strong>. <strong>{doc.title}: </strong> {doc.content} ====> <span style={{ color: 'red' }}>{doc.editValue}</span></p>
                  );
                })
              }
            </Col>
          </Row>
        </Modal>
        {that.state.client == 'new' ? 
        <CLBlockList settings={EmploymentInformaitonOne}/>: 
        <CLBlockList settings={EmploymentInformaiton}/>}
      </div>
    );
  }
}

export default EmploymentInfo;
