import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { Interface } from '../../../src/lib/config/index';
import {CLComponent, CLForm} from '../../../src/lib/component/index';
import CLBlockList from '../../../src/lib/component/CLBlockList.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Button, Row, Col, Card, Table, Input, message, Spin, Modal} from 'antd';

const { contentType, checkAuthRole, createOrModifyAuthRole, getResourceTree, saveUserResource} = Interface;

// type 1 //查看
//      2 // 修改
//      4 // 新建
//      3 // 分配角色资源


let setTree = function (data) {
  let menu = [];
  let checked = [];
  let level1 = [];
  _.each(data, function (doc, index) {
    if (doc.checked) {
      checked.push(doc.id.toString());
    }

    if (doc.pId === 1) {
      menu.push({
        label: doc.name,
        value: doc.id.toString(),
        key: doc.name,
        children: []
      })
      level1.push(doc.id.toString());
    }
  });

  menu = _.map(menu, function (item, index) {
    
    _.each(data, function (doc, index) {
      if (doc.pId.toString() === item.value) {
        item.children.push({
          label: doc.name,
          value: doc.id.toString(),
          key: doc.name
        });
      }
    })
    return item;
  });

  return [menu, checked, level1];
}



class AuthRoleManagementDetails extends CLComponent {
  state = {
    data: null,
    pagination: false,
    type: this.props.match.params.type,
    tree: []
  }

  constructor (props) {
    super(props);
    this.bindCtx([
      "renderBody",
      "loadData",
      "getFields"
    ]);
  }

  componentDidMount() {
    CLAnimate.inAndOut(this);
    if (this.props.match.params.id !== "0") {
      this.loadData(this.props.match.params);
    } else {
      this.setState({data: {}})
    }
  }

  loadData (params) {
    const that = this;
    const settings = {
      contentType,
      method: checkAuthRole.type,
      url: checkAuthRole.url + params.id,
    }

    if (params.type === "3") {
      const resourceSettings = {
        contentType,
        method: getResourceTree.type,
        url: getResourceTree.url + params.id,
      }

      function getTree (res) {
        if (res.data) {
          that.setState({
            tree: setTree(res.data)
          });
        }
      }

      CL.clReqwest({settings: resourceSettings, fn: getTree});
    }

    function setData (res) {
      if (res.data) {
        that.setState({
          data: res.data
        });
      } else {
        that.setState({
          data: {}
        });
      }
    }
    CL.clReqwest({settings, fn: setData});
  }

  getFields (data, thatForm) {
    const that = this;
    const {id, type} = that.props.match.params;
    const menu = that.state.tree[0];
    let settings = {};

    data = _.omit(data, ['updateTime', 'createTime']);

    if (type === "2") { //修改
      data.id = id;
    } else if (type === "1") { //查看资料，不可修改
      message.error("you can't modify this data");
      thatForm.setState({loading: false});
      return;
    }

    function saveData (res) {
      thatForm.setState({loading: false});
      if (res.data) {
        message.success(res.result);
        location.hash = "/uplending/authrolemanagement";
      }
    }

    function save(settings) {
      CL.clReqwest({settings, fn: saveData});
    }

    if (type === "3") { //先删除权限，然后添加权限
      data.resource = _.uniq(data.resource.concat(that.state.tree[2]));
      settings = {
        contentType,
        method: saveUserResource.type,
        url: saveUserResource.url,
        data: JSON.stringify({
          id: id,
          resource: data.resource.join(",")
        })
      }
    } else {
      settings = {
        contentType,
        method: createOrModifyAuthRole.type,
        url: createOrModifyAuthRole.url,
        data: JSON.stringify(data)
      }
    }
    save(settings)
  }
 
  renderBody() {
    const { selectedRowKeys } = this.state;
    let that = this;
    const type = that.state.type;
    if (!this.state.data) {
      return (
        <div className="full-loading" key="full-loading">
          <Spin size="large" />
        </div>
      );
    }

    const gridStyle = {
      width: '20%',
      textAlign: 'center',
    };


    let values = _.pick(that.state.data, [
      "roleName",
      "remark",
      "createTime",
      "updateTime"
    ]);
    values.createTime = moment(new Date(values.createTime || _.now()));
    values.updateTime = moment(new Date(values.updateTime || _.now()));
    values.resource =  _.difference(that.state.tree[1], that.state.tree[2]);

    let options = [
      {  id: 'roleName',
        type: 'text',
        label: 'Role Name ',
        placeholder: 'Please type role name',
        rules: [{ required: true, message: 'Please input role name!' }]
      },
      {  id: 'remark',
        type: 'text',
        label: '备注',
        placeholder: 'Please type remark',
        rules: [{ required: true, message: 'Please input remark!' }]
      },
      {  id: 'createTime',
        type: 'dateTime',
        label: '创建时间',
        placeholder: '',
        disabled:  true
      },
      {  id: 'updateTime',
        type: 'dateTime',
        label: '修改时间',
        placeholder: '',
        disabled:  true
      }
    ];

    if (type === '1' || type === "3") {
      options = _.map(options, function (doc) {
        doc.disabled = true;
        return doc;
      })
    }

    if (type === '3') { //角色配置
      options.push(
        {  
          id: 'resource',
          type: 'treeSelect',
          label: '选择权限',
          placeholder: 'Please select resource',
          treeData: that.state.tree[0],
        }
      )
    }

    const settings = {
      options: options,
      getFields: that.getFields,
      values: values
    }


    return (
      <div className="people-management-details" key="people-management-details">
        <CLForm settings = {settings}/> 
      </div>
    )
  }

  render () {
    return (
      <QueueAnim className="animate-content" type={this.state.aniType}>
        {this.state.showBlock ? [ this.renderBody() ] : null}
      </QueueAnim>
    )
  }
}
export default AuthRoleManagementDetails;


