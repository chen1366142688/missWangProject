import React from 'react';
import {CLComponent} from 'Lib/component/index';
import CLList from 'Lib/component/CLlist.jsx';
import _ from 'lodash';
import {CL} from 'Lib/tools/index';
import {Interface} from 'Lib/config/index';
import {Button, Modal, message } from 'antd';
import MjbEditor from './MjbEditor';

const {
  contentType, appConfigList, appConfigAppNameList, appConfigUpdateList, appConfigAdd
} = Interface;

const confirm = Modal.confirm;
export default class ActivityManagement extends CLComponent {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      search: {},
      loading: false,
      options: {
        appName: [],
      },
      visible: false,
      isEdit: false,
      disabled: false,
      detail: {},
    };
  }

  componentDidMount() {
    this.loadData();
    this.appNameLiat();
  }

  appNameLiat = () => {
    const that = this;
    let list = [],
      options = that.state.options;
    const settings = {
      contentType,
      method: appConfigAppNameList.type,
      url: appConfigAppNameList.url,
    };

    function fn(res) {
      if (res && res.data) {
        let arr = res.data;
        for(let key in arr){
            list.push({
                name: arr[key],
                value: arr[key]
            });
        }
        options.appName = list;
        that.setState({options});
      }
    }

    CL.clReqwest({settings, fn});
  };

  loadData = (search) => {
    const that = this;
    that.setState({
      loading: true,
    });
    const settings = {
      contentType,
      method: appConfigList.type,
      url: appConfigList.url,
      data: JSON.stringify(search || {}),
    };

    function fn(res) {
      if (res && res.data) {
        that.setState({data: res.data, loading: false,});
      }
    }

    CL.clReqwest({settings, fn});
  };

  getFormFields = (fields) => {
    this.setState({search: fields});
    this.loadData(fields);
  };

  onCreate = () => {
    this.setState({
      visible: true,
      isEdit: false,
      disabled: false,
    });
  };

  onEdit = (data) => {
    this.setState({
      visible: true,
      isEdit: true,
      detail: data,
      id: data.packetName,
      disabled: true,
    });
  };

  getFields = (fields, that, err) => {
    if (err) return;
    if (this.state.isEdit) {
      // TODO: 编辑
      let _this = this;
      confirm({
        title: 'Whether to continue ?',
        onOk() {
          const params = {
            appName: fields.appName,
            gpLinkShort: fields.gpLinkShort,
            packetName: fields.packetName,
            version: fields.version,
            alternateLinkShort: fields.alternateLinkShort
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
          newJson.packetName = _this.state.id;
          const settings = {
            contentType,
            method: appConfigUpdateList.type,
            url: appConfigUpdateList.url,
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
        title: 'Whether to continue ?',
        onOk() {
          const params = {
            appName: fields.appName,
            gpLinkShort: fields.gpLinkShort,
            packetName: fields.packetName,
            version: fields.version,
            alternateLinkShort: fields.alternateLinkShort
          };
          const settings = {
            contentType,
            method: appConfigAdd.type,
            url: appConfigAdd.url,
            data: JSON.stringify(params),
          };

          function fn(res) {
            if (res && res.code == 200) {
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
    const operation = [
      {
        id: 'appName',
        type: 'select',
        label: 'App name',
        placeholder: 'Please select',
        options: _this.state.options.appName,
      },
    ];

    const columns = [
      {
        title: 'No.',
        dataIndex: 'id',
        width: '14%',
      },

      {
        title: 'App name',
        dataIndex: 'appName',
        width: '14%',
      },

      {
        title: 'Version',
        dataIndex: 'version',
        width: '14%',
      },

      {
        title: 'Packet name',
        dataIndex: 'packetName',
        width: '14%',
      },

      {
        title: 'Google play link',
        dataIndex: 'gpLinkShort',
        width: '14%',
        render(index,record){
            return record.gpLinkShort ? record.gpLinkShort : '-';
        }
      },

      {
        title: 'Alternative link',
        dataIndex: 'alternateLinkShort',
        width: '14%',
        render(index, record){
            return record.alternateLinkShort ? record.alternateLinkShort : '-';
        }
      },
      {
        title: 'Operation',
        dataIndex: 'resideCity',
        render(text, data) {
          return <Button type="default" onClick={() => _this.onEdit(data)}>Edit</Button>;
        },
      },
    ];

    const settings = {
      data: _this.state.data,
      operation: operation,
      columns: columns,
      getFields: _this.getFormFields,
      pagination: false,
      pageChange: false,
      tableLoading: _this.state.loading,
      search: _this.state.search,
      defaultbtn: [{
        title: 'Add',
        type: 'primary',
        fn: _this.onCreate,
      }],
    };

    return (
      <div className="activity-management">
        <CLList settings={settings}/>
        <Modal
          title={`${_this.state.isEdit ? 'Edit' : 'Add'} `}
          visible={_this.state.visible}
          onCancel={_this.handleCancel}
          footer={null}
        >
          <MjbEditor
            isEdit={_this.state.isEdit}
            detail={_this.state.detail}
            getFields={_this.getFields}
            disabled={_this.state.disabled}
          />
        </Modal>
      </div>
    );
  }
}
