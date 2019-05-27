import React from 'react';
import moment from 'moment';
import {Row, Col, Input,Select, Button, Icon, Table, Modal, message  } from 'antd';
import { CL } from '../tools/index';
import CLComponent from './CLComponent.jsx';
import CLBlockList from './CLBlockList.jsx';
import _ from 'lodash';
import {Interface} from "../config/index.js";
const { contentType, auditListRemarkList, auditListRemarkSave} = Interface;
const {Option} = Select;
const {TextArea } = Input;

const dict = {
  1: 'User phone number',
  2: 'Office phone number',
  3: 'Required Contact',
  4: 'Alternate contact'
}


class DetailsRemark extends CLComponent {
  constructor(props) {
    super(props);
    this.bindCtx([
      'save',
      'loadData',
      'showModal',
      'onChange',
      'setRemark',
    ]);
  }

  state = {
    modal: false,
    loading: false,
    type: [],
    company: [],
    contact: [],
    personal: [],
    resultList: [],
    currentType: '',
    remark: '',
    result: '',
    currentPhone: ''
  }

  //渲染完成，立即调用接口，获取列表数据，获取选项数据
  componentDidMount() {
    this.loadData()
  }
  //点击保存按钮
  save() {
    const that = this;
    let param = {};

    const {remark, currentType, result, currentPhone,type} = that.state;
    const {appId} = that.props;

    if (!currentType) {
      message.error("you must pick a type");
      return;
    }

    if (!result) {
      message.error("you must pick a result");
      return;
    }

    if (!currentPhone) {
      message.error("phone Number error");
      return;
    }

    const settings = {
      contentType,
      method: auditListRemarkSave.type,
      url: auditListRemarkSave.url,
      data: JSON.stringify({
        telephoneAuditRecordList: [
          {
            applicationId: appId,
            telephoneType: currentType,
            telephone: currentPhone,
            result,
            remark
          }
        ]
      })
    }

    function fn (res) {
      console.log('提交成功')
      if (res.data) {
        message.success("Save success");
        that.loadData();
      }
    }
    that.showModal();
    CL.clReqwest({settings, fn});
  }

  //修改选项
  onChange(e, target, type) {
    console.log(e);
    const that = this;
    if (target === 'type') {
      if (e == '1') {
        that.setState({
          resultList: that.state.personal
        })
      }

      if (e == "2") {
        that.setState({
          resultList: that.state.company
        })
      }

      if (e == "3" || e == '4') {
        that.setState({
          resultList: that.state.contact
        })
      }

      that.setState({
        currentType: e,
        result: '',
        currentPhone: that.props.phoneData[e]
      })
    }

    if (target === 'result') {
      that.setState({
        result: e
      })
    }
  }

  setRemark (e) {
    this.setState({
      remark: e.target.value
    })
  }

  //加载列表
  loadData() {
    const that = this;
    this.setState({loading: true});
    const settings = {
      contentType,
      method: auditListRemarkList.type,
      url: auditListRemarkList.url,
      data: JSON.stringify({
        applicationId: that.props.appId
      })
    }
    function fn (res) {
      that.setState({loading: false});

      if (res.data) {
        that.setState({
          list: res.data.telephoneAuditRecordList,
          type: res.data.telephoneAuditType,
          company: res.data.companyCallsAuditType,
          personal: res.data.personalCallsAuditType,
          contact: res.data.contactCallsAuditType,
        })
      }
    }
    CL.clReqwest({settings, fn});
  }

  showModal(e) {
    this.setState({
      modal: !this.state.modal
    })
  }

  render() {
    const that = this;
    const settings = {}

    const mapDict = {
      1: that.state.personal,
      2: that.state.company,
      3: that.state.contact,
      4: that.state.contact
    }

    const columns = [
      {
        title: 'Application No.',
        dataIndex: 'applicationId',
        width: "14%",
        render(index, record) {
          return record.applicationId
        },
      },
      {
        title: 'Type',
        dataIndex: 'type',
        width: "14%",
        render (index, record) {
          return dict[record.telephoneType]
        }
      },
      {
        title: 'Phone No',
        dataIndex: 'telephone',
        width: "14%"
      },
      {
        title: 'Result',
        dataIndex: 'result',
        width: "14%",
        render (index, record) {
          const arr = mapDict[record.telephoneType];
          const doc = _.find(arr, {type: record.result}) || {}

          return `${doc.typeName} - ${record.result}`

        }
      },
      {
        title: 'Operate date',
        dataIndex: 'operateDate',
        width: "14%",
        render (index, record) {
          return moment(record.operateDate).format('YYYY-MM-DD HH:mm')
        }
      },
      {
        title: 'Operater',
        dataIndex: 'operatorName',
        width:"14%"
      },
      {
        title: 'Remark',
        dataIndex: 'remark'
      },
    ]

    return (
      <div style={{marginTop: '10px', border: 'solid 1px #eeeeee', marginLeft: '10px', marginRight: '10px'}}>
        <h4 className="table-title" style={{marginTop: '5px',marginLeft: '10px',}} >{this.props.callTitle}</h4>
        <Table  bordered  className="cl-table"
          // loading = {!that.state.collectHistoryLogList}
          pagination = {false}
          columns={columns}
          dataSource={this.state.list}
          rowKey={record =>  record.id}
          scroll={{ y: 300 }}
          loading={this.state.loading}
          />
          <Button type="primary" onClick={this.showModal} disabled={this.props.disabled}>add</Button>

          <Modal
            title="Save Call Log"
            visible={that.state.modal}
            onOk={that.save}
            onCancel={that.showModal}
            okText =  {"Save"}
            cancelText = {'Cancel'}
            mask = {false}
          >
            <Row style={{marginTop: 20}}>
              <Col span={3} offset={1}>
                Type
              </Col>
              <Col span={20}>
                <Select
                  onChange={(arg) => { that.onChange(arg, 'type')}}
                  style={{ width: 280 }}
                  value={that.state.currentType}
                >
                  {
                    that.state.type.map( doc => {
                      return (
                        <Option key={doc.type} value={doc.type}>{doc.typeName}</Option>
                      )
                    })
                  }
                </Select>
              </Col>
            </Row>
            <Row style={{marginTop: 20}}>
              <Col span={3} offset={1}>
                Phone Number
              </Col>
              <Col span={20}>
                {that.state.currentPhone}
              </Col>
            </Row>
            <Row style={{marginTop: 20}}>
              <Col span={3} offset={1}>
                Result:
              </Col>
              <Col span={20}>
                <Select
                  onChange={(arg) => { that.onChange(arg, 'result')}}
                  style={{ width: 280 }}
                  value={that.state.result}
                >
                  {
                    that.state.resultList.map( doc => {
                      return (
                        <Option key={doc.type} value={doc.type}>{doc.typeName + "-" + doc.type}</Option>
                      )
                    })
                  }
                </Select>
              </Col>
            </Row>
            <Row style={{marginTop: 20}}>
              <Col span={3} offset={1}>
                Remark
              </Col>
              <Col span={20}>
                <TextArea
                  placeholder="Please Input"
                  autosize={{ minRows: 2, maxRows: 12}}
                  onChange={that.setRemark}
                  value={that.state.remark}
                />
              </Col>
            </Row>
          </Modal>
      </div>
    );
  }
}

export default DetailsRemark;


