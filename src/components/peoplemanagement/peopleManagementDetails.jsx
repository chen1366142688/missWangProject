import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';

import { Interface } from '../../../src/lib/config/index';
import { CLComponent, CLForm } from '../../../src/lib/component/index';
import CLBlockList from '../../../src/lib/component/CLBlockList.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Button, Row, Col, Card, Table, Input, message, Spin, Modal } from 'antd';

const {
  contentType, operatorDetails, createOrModifyOperator, getOperatorRole, saveOperatorRole, deleteOperatorRole,
} = Interface;
// type 1 //查看
//      2 // 修改
//      3 // 添加角色
//      4 // 新建

class PeopleManagementDetails extends CLComponent {
  state = {
    data: null,
    pagination: false,
    type: this.props.match.params.type,
    options: {
      sex: [],
      status: [],
      roleId: [],
    },
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'loadData',
      'getFields',
    ]);
  }

  componentDidMount() {
    CLAnimate.inAndOut(this);
    this.loadData(this.props.match.params);
  }

  loadData(params) {
    const that = this;
    let settings = {
      contentType,
      method: operatorDetails.type,
      url: operatorDetails.url + params.id,
    };

    if (params.type === '3') {
      settings = {
        contentType,
        method: getOperatorRole.type,
        url: getOperatorRole.url + params.id,
      };
    }

    function fn(res) {
      if (res.data) {
        that.setState({
          data: res.data,
          options: {
            status: CL.setOptions(res.data.statusList || []),
            sex: CL.setOptions(res.data.sexList || []),
            roleId: _.map((res.data.roles || []), (value, index) => {
              return {
                name: value.roleName,
                value: value.id,
              };
            }),
          },
        });
      }
    }
    CL.clReqwest({ settings, fn });
  }


  getFields(data, thatForm) {
    const that = this;
    const { id, type } = that.props.match.params;
    let settings = {};
    for(let i in data) {
      data[i] = typeof (data[i]) == 'string' ? _.trim(data[i]) : data[i];
    }
    data.createTime = data.createTime ? data.createTime._i.getTime() : new Date().getTime();
    data.updateTime = (new Date()).getTime();

    if (type === '2') { // 修改
      data.id = id;
    } else if (type === '1') { // 查看资料，不可修改
      thatForm.setState({ loading: false });
      message.error("you can't modify this data");
      return;
    } else if (type === '4') { // 新建账号
      data.password = '123456';
      data.confirmPassword = '123456';
    }

    function fn(res) {
      thatForm.setState({ loading: false });
      if (res.data) {
        message.success(res.result);
        location.hash = '/uplending/peoplemanagement';
      }
    }


    if (type === '3') { // 先删除权限，然后添加权限
      settings = {
        contentType,
        method: saveOperatorRole.type,
        url: saveOperatorRole.url,
        data: JSON.stringify({
          userId: id,
          roleIdList: data.roleId,
        }),
      };
      CL.clReqwest({ settings, fn });
      // if (that.state.data.userRole && that.state.data.userRole.length) {
      //   let deleteSetings = {
      //     contentType,
      //     method: deleteOperatorRole.type,
      //     url: deleteOperatorRole.url,
      //     data: JSON.stringify({
      //       userId: id,
      //       roleId: that.state.data.userRole[0].roleId
      //     })
      //   }
      //   function deleteFn (res) {
      //     if (res.data) {
      //       CL.clReqwest({settings, fn});
      //     }
      //   }
      //   CL.clReqwest({settings: deleteSetings, fn: deleteFn});
      // } else {
      //   CL.clReqwest({settings, fn});
      // }
    } else {
      settings = {
        contentType,
        method: createOrModifyOperator.type,
        url: createOrModifyOperator.url,
        data: JSON.stringify(data),
      };
      CL.clReqwest({ settings, fn });
    }
  }

  renderBody() {
    const { selectedRowKeys } = this.state;
    const that = this;
    const type = that.state.type;

    if (!this.state.data) {
      return (
        <div className="full-loading" key="full-loading">
          <Spin size="large" />
        </div>
      );
    }

    const values = _.pick(that.state.data.operator, [
      'address',
      'loginName',
      'fullName',
      'email',
      'phone',
      'mobile',
      'sex',
      'status',
      'companyName',
      'createTime',
      'description',
      'updateTime',
    ]);
    values.createTime = moment(new Date(values.createTime));
    values.updateTime = moment(new Date(values.updateTime));
    values.status = values.status ? values.status.toString() : '';
    values.sex = values.sex ? values.sex.toString() : '';

    let options = [
      {
        id: 'loginName',
        type: 'text',
        label: '账户名',
        placeholder: 'Please type login name',
        rules: [{ required: true, message: 'Please input login name!' }],
      },
      {
        id: 'fullName',
        type: 'text',
        label: '账户名全称',
        placeholder: 'Please type full name',
        rules: [{ required: true, message: 'Please input full name!' }],
      },
      {
        id: 'email',
        type: 'text',
        label: '邮箱',
        placeholder: 'Please type email',
      },
      {
        id: 'phone',
        type: 'text',
        label: '座机号',
        placeholder: 'Please type phone',
      },
      {
        id: 'mobile',
        type: 'text',
        label: '手机号',
        placeholder: 'Please type mobile',
      },
      {

        id: 'sex',
        type: 'select',
        label: '性别',
        placeholder: 'Please select',
        options: that.state.options.sex,
        rules: [{ required: true, message: 'You must select sex!' }],
      },
      {
        id: 'status',
        type: 'select',
        label: '状态',
        placeholder: 'Please select',
        options: that.state.options.status,
        rules: [{ required: true, message: 'You must select status!' }],
      },
      {
        id: 'companyName',
        type: 'text',
        label: '公司',
        placeholder: 'Please type company name',
      },
      {
        id: 'description',
        type: 'text',
        label: '备注',
        placeholder: 'Please type description',
      },
      {
        id: 'address',
        type: 'text',
        label: '住址',
        placeholder: 'Please type address',
      },
      {
        id: 'createTime',
        type: 'dateTime',
        label: '创建时间',
        placeholder: '',
        disabled: true,
      },
      {
        id: 'updateTime',
        type: 'dateTime',
        label: '修改时间',
        placeholder: '',
        disabled: true,
      },
    ];

    if (type === '2') {
      options[0].disabled = true;
    }

    if (type === '1' || type === '3') {
      options = _.map(options, (doc) => {
        doc.disabled = true;
        return doc;
      });
    }

    if (type === '3') { // 角色配置
      options.push(
        {
          id: 'roles',
          type: 'text',
          label: '当前角色',
          placeholder: '',
          disabled: true,
        },
        {
          id: 'roleId',
          type: 'select',
          label: '角色',
          placeholder: 'Please select',
          options: that.state.options.roleId,
          rules: [{ required: true, message: 'You must select roles!' }],
          mode: 'multiple',
        });


      values.roles = that.state.data && _.map(that.state.data.userRole, (value, index) => {
        return value.roleName;
      }).join('/');
    }


    const settings = {
      options: options,
      getFields: that.getFields,
      values: values,
    };


    return (
      <div className="people-management-details" key="people-management-details">
        <CLForm settings={settings} />
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
export default PeopleManagementDetails;
