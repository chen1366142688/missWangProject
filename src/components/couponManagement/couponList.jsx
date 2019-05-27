import React from 'react';
import { CLComponent } from 'Lib/component/index';
import moment from 'moment';
import CLList from 'Lib/component/CLlist.jsx';
import _ from 'lodash';
import { CL } from 'Lib/tools/index';
import { Interface } from 'Lib/config/index';
import { Button, Modal, message } from 'antd';
import CouponEditor from './couponEditor';

const confirm = Modal.confirm;
const { contentType, couponManageList, addCoupon, editCoupon } = Interface;

export default class Mylist extends CLComponent {
  constructor(props) {
    super(props);

    this.state = {
      list: [],
      search: {},
      loading: false,
      pagination: {
        total: 0,
        currentPage: 1,
        pageSize: 10,
      },
      options: {
        couponIdOpt: [],
      },
      visible: false,
      isEdit: false,
      disabled: false,
      visibleDetails: false,
      detail: {},
    };
  }

  componentDidMount() {
    this.loadData();
  }

    loadData = (search, pagination) => {
      this.setState({
        loading: true,
      });
      const that = this;
      const params = {
        page: {
          currentPage: pagination && pagination.currentPage || 1,
          pageSize: pagination && pagination.pageSize || 20,
        },
        couponDef: { id: search && search.couponId },
      };
      const settings = {
        contentType,
        method: couponManageList.type,
        url: couponManageList.url,
        data: JSON.stringify(params),
      };

      function fn(res) {
        if (res && res.data) {
          const pagination = {
            total: res.data.totalCount,
            pageSize: res.data.pageSize,
            currentPage: res.data.currentPage,
          };

          const couponIdOpt = _.map(res.data.result, (item) => {
            return {
              value: item.id,
              name: `${item.id}-${item.name}`,
            };
          });
          const options = that.state.options;
          options.couponIdOpt = couponIdOpt;
          that.setState({
            list: res.data.result, pagination: pagination, options, loading: false,
          });
        }
      }

      CL.clReqwest({ settings, fn });
    };

    getFormFields = (fields) => {
      const pagination = this.state.pagination;
      pagination.currentPage = 1;

      this.setState({ search: fields, pagination });
      this.loadData(fields, pagination);
    };

    pageChage = (e) => {
      const pagination = {
        currentPage: e.current,
        pageSize: e.pageSize,
        total: this.state.pagination.total,
      };

      this.setState({ pagination });
      this.loadData(this.state.search, pagination);
    };

    onCreate = () => {
      this.setState({
        visible: true,
        isEdit: false,
      });
    };

    onEdit = (data) => {
      this.setState({
        visible: true,
        isEdit: true,
        disabled: false,
        detail: data,
        idValue:data.id,
      });
    };

    onDetails = (data) => {
      this.setState({
        visibleDetails: true,
        isEdit: true,
        detail: data,
      });
    };


    getFields = (fields, that, err) => {
        if (err) {
            return;
        }
        const requestData = {
            name: fields.name, //券名称
            type: fields.couponType, // 券类型
            deductAmt: fields.deductAmt, //券金额
            validDays: fields.validDays, //有效期
            totalQuantity: fields.totalQuantity, //券量限制
            getType: fields.getType, //发放方式
            defDesc: fields.defDesc, //描述
            backgroundUrl: fields.backgroundUrl, //背景图
            validBeginDate: fields.getDay[0].unix() * 1000, // 券领取时间fields.activityDate[0].unix() * 1000,
            validEndDate: fields.getDay[1].unix() * 1000,  //券领取时间
            activityId: fields.activityId,//活动
            // version: fields.version,//版本
        };

        // 新增
        if (!this.state.isEdit) {
          let _this = this;
          confirm({
            title: 'Whether to do ? ',
            onOk() {
              const settings = {
                contentType,
                method: addCoupon.type,
                url: addCoupon.url,
                data: JSON.stringify(requestData),
              };

              CL.clReqwestPromise(settings)
                .then((res) => {
                  if(res && res.code == 200 ){
                    message.success('success');
                    _this.setState({
                      visible: false,
                    });
                    _this.loadData();
                  }
                });
            }
          });
        } else {
            // 编辑
          let that = this;
          let detail = that.state.detail;
          let newJson = {};
          Object.getOwnPropertyNames(detail).forEach(function (val, idx, array) {
            Object.getOwnPropertyNames(requestData).forEach(function (val, idx, array) {
              if (detail[val] !== requestData[val]) {
                newJson[val] = requestData[val]
              }
            });

          });
          confirm({
            title: 'Whether to do ? ',
            onOk() {
              newJson.id = that.state.idValue;
              const settings = {
                contentType,
                method: editCoupon.type,
                url: editCoupon.url,
                data: JSON.stringify(newJson),
              };

              CL.clReqwestPromise(settings)
                .then((res) => {
                  if(res && res.code == 200 ){
                    message.success('success');
                    that.setState({
                      visible: false,
                    });
                    that.loadData();
                  }
                });
            }
          });
        }
    }

    handleCancel = () => {
      this.setState({
        visible: false,
        visibleDetails: false,
        isEdit: false,
        detail: null,
      });
    };

    render() {
      const _this = this;
      const operation = [
        {
          id: 'couponId',
          type: 'select',
          label: '券',
          placeholder: 'Please select',
          options: this.state.options.couponIdOpt,
        },
      ];

      const columns = [
        {
          title: '券Id',
          dataIndex: 'id',
          key: 'id',
          width: '5%',
        },

        {
          title: '券名称',
          dataIndex: 'name',
          key: 'name',
          width: '8%',
        },

        {
          title: '类型',
          dataIndex: 'type',
          key: 'type',
          width: '6%',
          render(index, record) {
            if (record.type == 1) {
              return 'interest cut';
            } else if (record.type == 2) {
              return 'deduct';
            }
          },
        },

        {
          title: '金额（PHP）',
          dataIndex: 'deductAmt',
          key: 'deductAmt',
          width: '7%',
        },

        {
          title: '有效期（天）',
          dataIndex: 'validDays',
          key: 'validDays',
          width: '6%',
        },

        {
          title: '发放方式',
          dataIndex: 'getType',
          key: 'getType',
          width: '6%',
          render: function (text, record) {
            if (record.getType == 2) {
              return 'manual';
            } else if(record.getType == 1) {
              return 'automatic';
            }else{
              return record.getType;
            }
          },
        },

        {
          title: '领取有效期',
          dataIndex: 'validBeginDate',
          key: 'validBeginDate',
          width: '17%',
          render: function (text, record) {
            if (!record.validBeginDate) {
              return '-';
            }
            return (
              <div>{moment(record.validBeginDate).format('YYYY-MM-DD hh:mm')} ~ {moment(record.validEndDate).format('YYYY-MM-DD hh:mm')}</div>
            );
          },
        },

        {
          title: '已发券量/券量限制',
          dataIndex: 'avlQuantity',
          key: 'avlQuantity',
          width: '7%',
          render: function (text, record) {
            return `${(record.totalQuantity - record.avlQuantity) || '0'}/${record.totalQuantity || '0'}`;
          },
        },

        {
          title: '活动名称/Id',
          dataIndex: 'activityName',
          key: 'activityName',
          width: '8%',
          render: function (text, record) {
            return `${record.activityName || '-'}/${record.activityId || '-'}`;
          },
        },

        // {
        //   title: 'App',
        //   dataIndex: 'version',
        //   width: '7%',
        //   render(text, record){
        //     if(!record.version && record.version !==0){
        //       return '-';
        //     }else if (record.version == '0') {
        //       return 'CashLending';
        //     }else if (record.version == '1') {
        //       return 'LoanIt';
        //     }else if (record.version == '2') {
        //       return 'SwakCash';
        //     }
        //   }
        // },

        {
          title: 'createBy',
          dataIndex: 'creator',
          key: 'creator',
          width: '7%',
        },

        {
          title: 'createTime',
          dataIndex: 'createTime',
          key: 'createTime',
          width: '7%',
          render: function (text, record) {
            return moment(record.createTime).format('YYYY-MM-DD HH:mm');
          },
        },

        {
          title: '操作',
          dataIndex: 'resideCity',
          key: 'resideCity',
          render(text, data) {
            return [<Button type="default" onClick={() => _this.onEdit(data)}>编辑</Button>,
              <Button type="default" onClick={() => _this.onDetails(data)}>Details</Button>];
          },
        },
      ];

      const settings = {
        data: this.state.list,
        operation: operation,
        columns: columns,
        getFields: this.getFormFields,
        pagination: this.state.pagination || {},
        pageChange: this.pageChage,
        tableLoading: this.state.loading,
        search: this.state.search,
        defaultbtn: [{
          title: 'Create',
          type: 'primary',
          fn: this.onCreate,
        }],
      };

      return (
        <div className="my-list" key="my-list">
          <CLList settings={settings} />
          <Modal
            title={`${this.state.isEdit ? 'Edit' : 'Create'} Coupon`}
            visible={this.state.visible}
            onCancel={this.handleCancel}
            footer={null}
          >
            <CouponEditor visible={this.state.visible} isEdit={this.state.isEdit} detail={this.state.detail} getFields={this.getFields} />
          </Modal>
          <Modal
            title="Details"
            visible={this.state.visibleDetails}
            onCancel={this.handleCancel}
            footer={null}
          >
            <CouponEditor
              isEdit={this.state.isEdit}
              detail={this.state.detail}
              visible={this.state.visible}
              disabled
              disableDefaultBtn
            />
          </Modal>
        </div>
      );
    }
}
