import React from 'react';
import QueueAnim from 'rc-queue-anim';

import {CLComponent, CLForm} from '../../../src/lib/component/index';
import { CLAnimate, CL} from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';

import _ from 'lodash';
import { message, Collapse, Row, Col, Icon, Input, Button } from 'antd';
const Panel = Collapse.Panel;
let  {getResourcesTree, contentType, saveSource, deleteResources} = Interface;

let setTree = function (data) {
  let menu = [];
  _.each(data, function (doc, index) {
    if (doc.parentId === 1) {
      menu.push({
        label: doc.remark,
        value: doc.id.toString(),
        key: doc.remark,
        children: []
      })
    }
  });

  menu = _.map(menu, function (item, index) {
    _.each(data, function (doc, index) {
      if (doc.parentId.toString() === item.value) {
        item.children.push({
          label: doc.remark,
          value: doc.id.toString(),
          key: doc.remark
        });
      }
    })
    return item;
  });

  return menu;
}


class ResourceManagement extends CLComponent {
  state = {
    tableLoading: false,
    data: [],
    search: {},
    resource: [],
    showBlock: true,
    sourceInfo: {},
    loading: false,
  }

  constructor (props) {
    super(props);
    this.bindCtx([
      "renderBody",
      "addResource",
      "setValue",
      "deleteResource"
    ]);
  }

  componentDidMount() {
    this.loadData()
  }

  loadData () {
    const that = this;
    const resourceSettings = {
      contentType,
      method: getResourcesTree.type,
      url: getResourcesTree.url,
    }

    function fn (res) {
      if (res.data) {
        that.setState({
          resource: setTree(res.data)
        });
      }
    }

    CL.clReqwest({settings: resourceSettings, fn});
  }

  addResource (e) {
    const that = this;
    const {sourceInfo} = that.state;
    e.target.parentElement.parentElement.firstChild.value = "";
    that.setState({loading: true});
    const settings = {
      contentType,
      method: saveSource.type,
      url: saveSource.url,
      data: JSON.stringify(sourceInfo)
    }

    function fn (res) {
      that.setState({loading: false});

      if (res.data) {
        that.loadData();
        message.success("save success");
      }
    }

    CL.clReqwest({settings, fn});
  }

  deleteResource (e) {
    const id = JSON.parse(e.target.dataset.doc).value;
    e.stopPropagation();
    const that = this;
    const settings = {
      contentType,
      method: deleteResources.type,
      url: deleteResources.url + id,
    }
    function fn (res) {
      if (res.data) {
        that.loadData();
      }
    }

    CL.clReqwest({settings, fn});
  }

  setValue (e) {
    const that = this;
    const doc = JSON.parse(e.target.dataset.doc);
    const value = e.target.value;
    const sourceInfo = {
      "resource": value,
      "parentId": doc.value,
      "remark": value
    }
    that.setState({sourceInfo: sourceInfo});
  }

  renderBody() {
    let that = this;
    const resource = that.state.resource;
    return (
      <Row className="resource-management" key="resource-management">
        <Col span={12} push={1} >
          <Collapse defaultActiveKey={['1']} onChange={that.callback}>
            {
              resource.map(function (doc, index) {
                return (
                  <Panel header={(<div className="resource-header">
                    <p>{doc.label}</p>
                    <p><Icon type="delete" data-doc= {JSON.stringify(doc)} onClick={that.deleteResource}/></p>
                  </div>)} key={doc.value + index}>
                    {
                      doc.children.map( function (subItem, index) {
                        return (
                        <div key={subItem.key} className="resource-item">
                          <p>{subItem.label}</p>
                          <p><Icon type="delete" data-doc= {JSON.stringify(subItem)} onClick={that.deleteResource}/></p>
                        </div>)
                      })
                    }
                    <Row>
                      <Col span= {12}>
                        <div className="input">
                          <Input onChange={that.setValue} data-doc= {JSON.stringify(doc)} addonAfter={<Button loading={that.state.loading} type="primary" onClick={that.addResource}>add</Button>}/>
                        </div>
                      </Col>
                    </Row>
                  </Panel>
                )
              })
            }
            <Row>
              <Col span= {12}>
                <div className="input">
                  <Input onChange={that.setValue} data-doc= {JSON.stringify({value: "1"})} addonAfter={<Button loading={that.state.loading} type="primary" onClick={that.addResource}>add</Button>}/>
                </div>
              </Col>
            </Row>
          </Collapse>
        </Col>
      </Row>
    )
  }

  render (data) {
    return (
      <QueueAnim className="animate-content">
        {this.renderBody()}
      </QueueAnim>
    )
  }
}
export default ResourceManagement;