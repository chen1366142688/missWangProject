import React from 'react';
import {CLComponent} from 'Lib/component/index';
import CLList from 'Lib/component/CLlist.jsx';
import _ from 'lodash';
import {CL} from 'Lib/tools/index';
import {Interface} from 'Lib/config/index';
import {Button, Modal, message, Tooltip} from 'antd';
import ActivityEditor from './activiyEditor';
import moment from 'moment';

const {
  contentType, activityManageList, activityManagePulldown, activityManageAdd, activityManageModify,
} = Interface;

const confirm = Modal.confirm;
export default class ActivityManagement extends CLComponent {
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
        statusOpt: [],
      },
      visible: false,
      isEdit: false,
      detail: {},
    };
  }

  componentDidMount() {
    this.loadData();
    this.statusOptMth();
  }

  statusOptMth = () => {
    const that = this;
    let list = [],
      options = that.state.options;
    const settings = {
      contentType,
      method: activityManagePulldown.type,
      url: activityManagePulldown.url,
    };

    function fn(res) {
      if (res && res.data) {
        _.map(res.data.statusMap, (doc, index) => {
          list.push({
            value: index,
            name: doc == 'pre publish' ? '未开启' : doc == 'active' ? '活动中' : '已结束',
          });
        });
        options.statusOpt = list;
        that.setState({options});
      }
    }

    CL.clReqwest({settings, fn});
  };

  loadData = (search, pagination) => {
    const that = this;
    that.setState({
      loading: true,
    });
    const params = {
      page: {
        currentPage: search && search.currentPage || 1,
        pageSize: search && search.pageSize || 20,
      },
      activity: {
        status: search && search.status,
      },
    };
    const settings = {
      contentType,
      method: activityManageList.type,
      url: activityManageList.url,
      data: JSON.stringify(params),
    };

    function fn(res) {
      if (res && res.data) {
        that.setState({list: res.data.result, loading: false,});
      }
    }

    CL.clReqwest({settings, fn});
  };

  getFormFields = (fields) => {
    const pagination = this.state.pagination;
    pagination.currentPage = 1;
    this.setState({search: fields, pagination});
    this.loadData(fields, pagination);
  };

  pageChange = (e) => {
    const pagination = {
      currentPage: e.current,
      pageSize: e.pageSize,
      total: this.state.pagination.total,
    };

    this.setState({pagination});
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
      detail: data,
      id: data.id,
    });
  };

  getFields = (fields, that, err) => {
    if (err) return;
    if (this.state.isEdit) {
      // TODO: 编辑
      let _this = this;
      confirm({
        title: 'Whether to do ? ',
        onOk() {
          const params = {
            version: fields.version,
            name: fields.name,
            activityDesc: fields.activityDesc,
            validBeginDate: fields.activityDate[0].unix() * 1000,
            validEndDate: fields.activityDate[1].unix() * 1000,
          };
          let detail = _this.state.detail;
          let newJson = {};
          Object.getOwnPropertyNames(detail).forEach(function (val, idx, array) {
            Object.getOwnPropertyNames(params).forEach(function (val, idx, array) {
              if (detail[val] !== params[val]) {
                newJson[val] = params[val]
              }
            });

          });
          newJson.id = _this.state.id;
          const settings = {
            contentType,
            method: activityManageModify.type,
            url: activityManageModify.url,
            data: JSON.stringify(newJson),
          };

          function fn(res) {
            if (res && res.code == 200) {
              message.success('success');
              _this.setState({
                visible: false,
              });
              _this.loadData();
            }
          }

          CL.clReqwest({settings, fn});
        }
      });

    } else {
      // TODO: 新增
      let that = this;
      confirm({
        title: 'Whether to do ? ',
        onOk() {
          const params = {
            name: fields.name,
            version: fields.version,
            activityDesc: fields.activityDesc,
            validBeginDate: fields.activityDate[0].unix() * 1000,
            validEndDate: fields.activityDate[1].unix() * 1000,
          };
          const settings = {
            contentType,
            method: activityManageAdd.type,
            url: activityManageAdd.url,
            data: JSON.stringify(params),
          };

          function fn(res) {
            if (res && res.code == 200) {
              message.success('success');
              that.setState({
                visible: false,
              });
              that.loadData();
            }
          }

          CL.clReqwest({settings, fn});
        }
      });
    }
  };

  handleCancel = () => {
    this.setState({
      visible: false,
      isEdit: false,
      detail: null,
    });
  };

  render() {
    const _this = this;
    const remarkStyle = {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
      maxWidth: '300px',
    };
    const operation = [
      {
        id: 'status',
        type: 'select',
        label: '活动状态',
        placeholder: 'Please select',
        options: this.state.options.statusOpt,
      },
    ];

    const columns = [
      {
        title: '活动Id',
        dataIndex: 'id',
        width: '8%',
      },

      {
        title: '活动名称',
        dataIndex: 'name',
        width: '9%',
      },

      {
        title: '活动日期',
        dataIndex: 'validBeginDate',
        width: '15%',
        render(text, record) {
          return `${moment(record.validBeginDate).format('YYYY-MM-DD hh:mm')}~${moment(record.validEndDate).format('YYYY-MM-DD hh:mm')}`;
        },
      },

      {
        title: '活动状态',
        dataIndex: 'status',
        width: '9%',
        render(text, record) {
          if (!record.status && record.status !==0) {
            return '-';
          } else if (record.status == 0) {
            return '未开启';
          } else if (record.status == 1) {
            return '活动中';
          } else if (record.status == 2) {
            return '已结束';
          }
        },
      },

      {
        title: '活动描述',
        dataIndex: 'activityDesc',
        // width: '18%',
        render: function (index, record) {
          return (
            <div style={{ position: 'relative' }}>
              <Tooltip placement="top" title={record.activityDesc} defaultVisible={false} overlayStyle={{ wordWrap: 'break-word' }}>
                <p style={remarkStyle}>{record.activityDesc}</p>
              </Tooltip>
            </div>
          );
        },
      },

      {
        title: 'App',
        dataIndex: 'version',
        width: '9%',
        render(text, record){
          if(!record.version && record.version !==0){
            return '-';
          }else if (record.version == '0') {
            return 'CashLending';
          }else if (record.version == '1') {
            return 'LoanIt';
          }else if (record.version == '2') {
            return 'SwakCash';
          }
        }
      },

      {
        title: 'createBy',
        dataIndex: 'creator',
        width: '8%',
      },

      {
        title: 'createTime',
        dataIndex: 'createTime',
        width: '8%',
        render: function (text, record) {
          return moment(record.createTime).format('YYYY-MM-DD HH:mm');
        },
      },

      {
        title: '操作',
        dataIndex: 'resideCity',
        width: '11%',
        render(text, data) {
          return <Button type="default" onClick={() => _this.onEdit(data)}>编辑</Button>;
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
      defaultbtn: [{
        title: 'Create',
        type: 'primary',
        fn: this.onCreate,
      }],
    };

    return (
      <div className="activity-management">
        <CLList settings={settings}/>
        <Modal
          title={`${this.state.isEdit ? 'Edit' : 'Create'} Activity`}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          footer={null}
        >
          <ActivityEditor
            isEdit={this.state.isEdit}
            detail={this.state.detail}
            getFields={this.getFields}
          />
        </Modal>
      </div>
    );
  }
}
