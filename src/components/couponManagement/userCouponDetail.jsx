import React from 'react';
import { CLComponent } from 'Lib/component/index';
import moment from 'moment';
import CLList from 'Lib/component/CLlist.jsx';
import _ from 'lodash';
import { CL } from 'Lib/tools/index';
import { Interface } from 'Lib/config/index';
import { Button, Modal, message, Row, Col, Upload, Icon, Input, Select, } from 'antd';

const Option = Select.Option;
const confirm = Modal.confirm;
const {TextArea} = Input;
const {
  contentType,
  couponManageUserList,
  couponManagePulldownList,
  couponManageList,
  activityManageList,
  userPullDown,
  couponManageCouponType,
  couponManageImportData,
} = Interface;

export default class Mylist extends CLComponent {
  constructor(props) {
    super(props);

    this.state = {
      list: [],
      search: {},
      loading: false,
      couponsModal: false,
      pagination: {
        total: 0,
        page: 1,
        pageSize: 20,
      },
      options: {
        couponOpt: [],
        activityOpt: [],
        statusOpt: [],
        userOpt: [],
        statusMap: [],
      },
      fileList: [],
      couponManage: [],
      CouponList: {
        couponDefId: '',
      },
    };
  }

  componentDidMount() {
    this.loadData();
    this.userOptMth();
    this.couponOptMth();
    this.activityOptMth();
    this.userPullDown();
    this.couponManageCouponType();
  }

    userOptMth = () => {
      const that = this;
      let list = [],
        options = that.state.options;
      const settings = {
        contentType,
        method: couponManagePulldownList.type,
        url: couponManagePulldownList.url,
      };

      function fn(res) {
        if (res && res.data) {
          _.map(res.data.status, (doc, index) => {
            list.push({
              value: index,
              name: doc,
            });
          });
          options.userOpt = list;
          that.setState({ options });
        }
      }
      CL.clReqwest({ settings, fn });
    };

    couponOptMth = () => {
      const that = this;
      const params = {
        page: {
          currentPage: 1,
          pageSize: 20,
        },
        couponDef: {},
      };
      const settings = {
        contentType,
        method: couponManageList.type,
        url: couponManageList.url,
        data: JSON.stringify(params),
      };

      function fn(res) {
        if (res && res.data) {
          const couponOpt = _.map(res.data.result, (item) => {
            return {
              value: item.id,
              name: `${item.id}-${item.name}`,
            };
          });
          const options = that.state.options;
          options.couponOpt = couponOpt;
          that.setState({ options, loading: false });
        }
      }

      CL.clReqwest({ settings, fn });
    };

    userPullDown = () =>{
      let that = this;
      const settings = {
        contentType,
        method: userPullDown.type,
        url: userPullDown.url,
      };

      function fn(res) {
        if (res && res.data) {
          const statusMap = _.map(res.data.statusMap, (item, index) => {
            return {
              value: index,
              name: item == 'invalid'? '未生效' : item == 'unused' ? '未使用' : item == 'used' ? '已使用' : '过期',
            };
          });
          const options = that.state.options;
          options.statusMap = statusMap;
          that.setState({ options, loading: false });
        }
      }

      CL.clReqwest({ settings, fn });
    }

    activityOptMth = () => {
      const that = this;
      const params = {
        page: {
          currentPage: 1,
          pageSize: 20,
        },
        activity: {},
      };
      const settings = {
        contentType,
        method: activityManageList.type,
        url: activityManageList.url,
        data: JSON.stringify(params),
      };

      function fn(res) {
        if (res && res.data) {
          const couponOpt = _.map(res.data.result, (item) => {
            return {
              value: item.id,
              name: `${item.id}-${item.name}`,
            };
          });
          const options = that.state.options;
          options.activityOpt = couponOpt;
          that.setState({ options, loading: false });
        }
      }

      CL.clReqwest({ settings, fn });
    };

    loadData = (search, pagination) => {
      const that = this;
      that.setState({
        loading: true,
      });
      const params = {
        page: {
          currentPage: pagination && pagination.currentPage || 1,
          pageSize: pagination && pagination.pageSize || 20,
        },
        coupon: {
            user: search && search.user,
            activityId: search && search.activityId,
            status: search && search.status,
            couponDefId: search && search.couponDefId,
        },
      };
      const settings = {
        contentType,
        method: couponManageUserList.type,
        url: couponManageUserList.url,
        data: JSON.stringify(params),
      };

      function fn(res) {
        if (res && res.data) {
          const pagination = {
            total: res.data.totalCount,
            pageSize: res.data.pageSize,
            currentPage: res.data.currentPage,
          };
          that.setState({ list: res.data.result, pagination: pagination, loading: false });
        }
      }

      CL.clReqwest({ settings, fn });
    };

    getFormFields = (fields, that, err) => {
      const pagination = this.state.pagination;
      pagination.currentPage = 1;

      this.setState({ search: fields, pagination });
      this.loadData(fields, pagination);
    };

    pageChange = (e) => {
      const pagination = {
        currentPage: e.current,
        pageSize: e.pageSize,
        total: this.state.pagination.total,
      };

      this.setState({ pagination });
      this.loadData(this.state.search, pagination);
    };

    couponManageCouponType = () => {
      const that = this;
      const settings = {
        contentType,
        method: couponManageCouponType.type,
        url: couponManageCouponType.url,
      };

      function fn(res) {
        if (res && res.data) {
          const couponManage = _.map(res.data, (item) => {
            return {
              value: item.id,
              name: item.id +'-'+ item.name,
            };
          });
          that.setState({couponManage: couponManage, loading: false,});
        }
      }

      CL.clReqwest({ settings, fn });
    };

    onCreate = () => {
      this.setState({ couponsModal: true });
    };

    handleCancel = () => {
      this.setState({couponsModal: false, fileList: [], CouponList: {}});
    };

    couponsSave = () => {
      const that = this;
      if(!that.state.info){
        message.error('Excel is required');
      }else if(!that.state.CouponList.couponDefId) {
        message.error('couponDefId is required');
      }else{
        confirm({
          content: 'Whether to submit?',
          onOk(){
            let formData = new FormData(that.state.info.file);
            formData.append('file', that.state.info.file);
            formData.append('couponDefId',that.state.CouponList.couponDefId)
            const settings = {
              contentType,
              method: couponManageImportData.type,
              url: couponManageImportData.url,
              data: formData,
              processData: false,
            };

            function fn(res) {
              if(res && res.code === 200){
                message.success('发劵成功,一共发劵'+ res.data +'个');
                that.loadData(that.state.search, that.state.pagination);
                that.setState({couponsModal: false, fileList: [], CouponList: {}});
              }
            }
            CL.clReqwest({ settings, fn });
          }
        })
      }
    };

    onChange = (e, target) => {
      let CouponList = this.state.CouponList;
      CouponList[target] = e;
      this.setState({CouponList});
    }

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
    }

    render() {
      let that = this;
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

      const operation = [
        {
          id: 'user',
          type: 'text',
          label: 'User',
          placeholder: 'Please input',
        },
        {
          id: 'couponDefId',
          type: 'select',
          label: '券',
          placeholder: 'Please select',
          options: this.state.options.couponOpt,
        },
        {
          id: 'activityId',
          type: 'select',
          label: '活动',
          placeholder: 'Please select',
          options: this.state.options.activityOpt,
        },
        {
          id: 'status',
          type: 'select',
          label: '券状态',
          placeholder: 'Please select',
          options: this.state.options.statusMap,
        },
      ];

      const columns = [
        {
          title: 'User',
          dataIndex: 'user',
          width: '11%',
        },
        {
          title: 'App',
          dataIndex: 'versionName',
          width: '9%',
        },
        {
          title: '活动名称/Id',
          dataIndex: 'activityName',
          width: '11%',
          render(text, record){
              if(!record.activityName){
               return '-';
              }else {
                  return record.activityName + '/' + record.activityId;
              }
          }
        },
        {
          title: '领取时间',
          dataIndex: 'createTime',
          width: '13%',
          render: function (text, record) {
            return moment(record.createTime).format('YYYY-MM-DD HH:mm');
          },
        },
        {
          title: '券名称/Id',
          dataIndex: 'couponDefName',
          width: '11%',
          render(text, record){
            if(!record.couponDefName){
              return '-';
            }else {
              return record.couponDefName;
            }
          }
        },
        {
          title: '券类型',
          dataIndex: 'couponDefTypeDesc',
          width: '11%',
          render(text, record){
            if(!record.couponDefTypeDesc){
              return '-';
            }else {
              return record.couponDefTypeDesc;
            }
          }
        },
        {
          title: '券金额(PHP)',
          dataIndex: 'deductAmt',
          width: '11%',
          render(text, record){
            if(!record.deductAmt){
              return '-';
            }else {
              return record.deductAmt;
            }
          }
        },
        {
          title: '券状态',
          dataIndex: 'statusDesc',
          width: '11%',
          render(text, record){
            if(!record.statusDesc){
              return '-';
            }else if (record.statusDesc == 'invalid') {
              return '未生效';
            }else if (record.statusDesc == 'unused') {
              return '未使用';
            }else if (record.statusDesc == 'used') {
              return '已使用';
            }else if (record.statusDesc == 'expired') {
              return '过期';
            }
          }
        },
        {
          title: '券截止时间',
          dataIndex: 'validEndDate',
          render: function (text, record) {
            return moment(record.validEndDate).format('YYYY-MM-DD HH:mm');
          },
        },
      ];

      const settings = {
        data: this.state.list,
        operation: operation,
        columns: columns,
        getFields: this.getFormFields,
        pagination: this.state.pagination || {},
        pageChange: this.pageChange,
        tableLoading: this.state.loading,
        search: this.state.search,
        btn: [{
          title: '发券',
          type: 'primary',
          fn: this.onCreate,
        }],
      };

      return (
        <div className="couponsList" key="couponsList">
          <CLList settings={settings} />
          <Modal
            visible={that.state.couponsModal}
            onOk={that.couponsSave}
            onCancel={that.handleCancel}
            okText="Save"
            cancelText="Cancel"
            mask={false}
            style={{width: '2000px'}}
            title="发劵"
          >
            <Row>
              <Col span={3} offset={1}><strong>卷Id :</strong></Col>
              <Col span={16}>
                <Select
                  style={{ width: 330 }}
                  onChange={(e) => {that.onChange(e, 'couponDefId')}}
                  value={that.state.CouponList.couponDefId}
                >
                  {
                    that.state.couponManage.map((doc, index) => {
                      return (
                        <Option key={`${doc.type}${index}`} value={doc.value}>{doc.name}</Option>
                      );
                    })
                  }
                </Select>
              </Col>
            </Row>
            <Row style={{marginTop: 20}}>
              <Col span={3} offset={1}><strong>用户名单 :</strong></Col>
              <Col span={6} offset={1} style={{marginRight: 10}} key={Math.random()}>
                <Upload {...props} onChange={(e) => {that.onChange(e, 'fileList')}}>
                  {fileList.length >= 1 ? null : uploadButton}
                </Upload>
              </Col>
              <Col span={6} style={{paddingTop: 0}}>
                限Excel文件，只member_id,不含表头
              </Col>
            </Row>
          </Modal>
        </div>
      );
    }
}
