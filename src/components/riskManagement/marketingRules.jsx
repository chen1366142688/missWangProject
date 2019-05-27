import React from 'react';
import {CLComponent} from 'Lib/component/index';
import CLList from 'Lib/component/CLlist.jsx';
import _ from 'lodash';
import {CL} from 'Lib/tools/index';
import {Interface} from 'Lib/config/index';
import {Modal, message, Switch, Select, Row, Col, Input, Tooltip } from 'antd';
import CreateTask from './createTask';
import CreateRules from './createRules';
import CheckRules from './checkRules';
const { contentType, rulePageList, ruleOn, ruleOff, ruleListOne, ruleListEdit, ruleListAdd,ruleActionLists, ruleActionRules, ruleActionRulebc, ruleActionRuletc } = Interface;

const confirm = Modal.confirm;
const Option = Select.Option;
const { TextArea } = Input;
let name = sessionStorage.getItem("loginName");
export default class MjbManagement extends CLComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      search: {},
      loading: false,
      options: {
        appName: [],
      },
      visible: false,
      isEdit: false,
      stateIsEdit: false,
      visibleTask: false,
      compensationModal: false,
      detail: {},
      datails: {},
      compensationData: {},
      statusList: [
        {name: 'Y', value: 'Y'},
        {name: 'N', value: 'N'},
      ],
      pagination: {
        total: 0,
        pageSize: 10,
        currentPage: 1,
      },
      contentMessage: '',
      contentValue: '',
    };
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = (search, page) => {
    const that = this;
    that.setState({
      loading: true,
    });
    let currentPage = page ? page.currentPage : '1';
    let pageSize = page ? page.pageSize : '10';
    let state = search ? search.state : '';
    let nameValue = search ? search.nameValue : '';
    const settings = {
      contentType,
      method: 'get',
      // url: 'http://118.25.213.60:9088/rule/page?currentPage='+currentPage+'&pageSize='+pageSize+(nameValue?'&name='+nameValue:'')+(state?'&state='+state:''),
      url: rulePageList.url+'currentPage='+currentPage+'&pageSize='+pageSize+(nameValue?'&name='+nameValue:'')+(state?'&state='+state:''),
      headers: {
        "AMS-ACCESS-TOKEN":name
      }
    };

    function fn(res) {
      if (res) {
        let pagination = {
          total: res.page.count,
          pageSize: res.page.size,
          currentPage: res.page.currentPage,
        }
        that.setState({data: res.data || [],pagination, loading: false,});
      }
    }
    CL.clReqwest({settings, fn});
  };

  getFormFields = (fields) => {
    const pagination = this.state.pagination;
    pagination.currentPage = 1;
    this.setState({search: fields, pagination: pagination});
    this.loadData(fields, pagination);
  };

  pageChage = (e) => {
    const pagination = {
      currentPage: e.current,
      pageSize: e.pageSize,
      total: this.state.pagination.total,
    };

    this.setState({pagination: pagination});
    this.loadData(this.state.search, pagination);
  }

  onCreate = () => {
    this.setState({
      visible: true,
      isEdit: false,
      stateIsEdit: true,
    });
  };

  onCreateTask = () => {
    this.setState({
      visibleTask: true,
      isEdit: false,
      stateIsEdit: true,
    });
  }

  handleCancel = () => {
    this.setState({
      visible: false,
      checkVisible: false,
      isEdit: false,
      stateIsEdit: false,
      visibleTask: false,
      detail: {},
      compensationModal: false,
      compensationData: {},
    });
  };


  switchChange = (id,data) => {
    let idValue = data.id;
    if(id == true){
      const settings = {
        contentType,
        method: 'patch',
        // url: `http://118.25.213.60:9088/rule/on/`+idValue,
        url: ruleOn.url+idValue,
        headers: {
          "AMS-ACCESS-TOKEN":name
        }
      };

      function fn(res) {
        if (res && res.code == 200) {
          this.loadData(this.state.search,this.state.pagination);
        }
      }
      CL.clReqwest({settings, fn});
      }else if(id == false){
        const settings = {
          contentType,
          method: 'patch',
          // url: `http://118.25.213.60:9088/rule/off/`+idValue,
          url: ruleOff.url+idValue,
          headers: {
            "AMS-ACCESS-TOKEN":name
          }
        };
        function fn(res) {
          if (res && res.code == 200) {
            this.loadData(this.state.search,this.state.pagination);
          }
        }
        CL.clReqwest({settings, fn});
      }
  }

  handleChange = (e, data) => { //点击操作的时候对应更改
    let that = this;
    const settings = {
      contentType,
      method: 'get',
      // url: `http://118.25.213.60:9088/rule/`+ data.id,
      url: ruleListOne.url+ data.id,
      headers: {
        "AMS-ACCESS-TOKEN":name
      }
    };
    function fn(res) {
      if (res && res.code == 200) {
        let obj = {};
        _.map(res.data.actionList,(doc)=>{
          if(doc.type == 'M'){
            obj.message= doc.content;
            obj.extra = doc.extra;
          }else if(doc.type == 'P'){
            obj.pushContent = doc.content;
            obj.pushTitle = doc.extra;
          }else if(doc.type == 'C'){
            obj.couponId = doc.content;
            obj.extra = doc.extra;
          }
        })
        let datails = Object.assign(obj,res.data)
        if(e=='2' && data.type == 'C'){
          that.setState({
            visible: true,
            isEdit: true,
            stateIsEdit: false,
            detail: datails,
            id: res.data.id,
          });
        }else if(e=='2' && data.type == 'O'){
          that.setState({
            visibleTask: true,
            isEdit: true,
            stateIsEdit: false,
            detail: datails,
            id: res.data.id,
          });
        }else if(e == '3'){
          that.setState({
            checkVisible: true,
            datails: datails,
          });
        }
      }
    }
    CL.clReqwest({settings, fn});
    if( e == 4 ){
      that.setState({contentMessage: '',contentValue: '',});
      let settings = {
        contentType,
        method: 'get',
        // url: 'http://118.25.213.60:9088/rule/action/'+data.id+'/'+'R',
        url: ruleActionLists.url + data.id+'/R',
        headers: {
          "AMS-ACCESS-TOKEN":name
        }
      }
      function fn(res){
        if(res.code == 200 && !res.data){
          that.setState({ compensationModal: true, modalName: '新增补偿', ruleId:data.id, });
        }else if(res.code == 200 && res.data){
          that.setState({
            compensationModal: true, 
            compensationData: res.data, 
            modalName: '编辑补偿',
            contentMessage: res.data.content,
            contentValue: res.data.extra,
            ruleId:res.data.id,
          });
        }
      }
      CL.clReqwest({ settings, fn });
    }
    if(e == 5){
      let settings = {
        contentType,
        method: 'delete',
        // url: 'http://118.25.213.60:9088/rule/' + data.id,
        url: ruleActionRules.url + data.id,
        headers: {
          "AMS-ACCESS-TOKEN":name
        }
      }
      function fn(res){
        if(res.code == 200){
          message.success('SUCCESS');
          that.loadData();
        }
      }
      CL.clReqwest({settings,fn});
    }
  }

  getFields = (err, values,Title) => {
    let that = this;
    if(err){
      message.error(err);
    }else{
      values.message = Title;
      if(values.digits){
        values.digits = values.digits instanceof Array ? values.digits.join(',') : values.digits;
      }
      for(let i in values) {
        values[i] = typeof (values[i]) == 'string' ? _.trim(values[i]) : values[i];
      }
      if(!values.message && !values.pushTitle && !values.pushContent && !values.couponId){
        message.error('请至少选择短信、推送、优惠券中一项！');
      } else if (!((!values.pushTitle && !values.pushContent) || (values.pushTitle && values.pushContent))) {
        message.error('请推送标题和推送内容都填！');
      }else{
        let actionList = [];
        if(values && values.message){
          actionList.push({
            content: values.message,
            extra:values.extra,
            type: 'M',
          },)
        } 
        if(values && values.pushTitle){
          actionList.push({
            content: values.pushContent,
            extra: values.pushTitle,
            type: 'P',
          },)
        }
        if(values && values.couponId){
          actionList.push({
            content: values.couponId,
            type: 'C',
          },)
        }
        if(this.state.isEdit){       //编辑
          confirm({
            title: 'Whether to continue?',
            onOk() {
              const settings = {
                contentType,
                method: 'patch',
                // url: `http://118.25.213.60:9088/rule/`,
                url: ruleListEdit.url,
                headers: {
                  "AMS-ACCESS-TOKEN":name
                },
                data: JSON.stringify({
                  id: that.state.id,
                  actionList,
                  code:values.code,
                  cron:values.cron,
                  description:values.description,
                  digits:values.digits,
                  name:values.name,
                  source:values.source || that.state.datails.source,
                  sourceType:values.sourceType,
                }),
              };
              function fn(res) {
                if (res && res.code == 200) {
                  message.success('Success');
                  that.loadData(that.state.search, that.state.pagination);
                  that.setState({visible: false, visibleTask: false});
                }else{
                  message.error(res.message);
                }
              }
              CL.clReqwest({settings, fn});
            }
          });
        }else{//新增
          confirm({
            title: 'Whether to continue?',
            onOk() {
              const settings = {
                contentType,
                method: 'post',
                // url: `http://118.25.213.60:9088/rule/`,
                url: ruleListAdd.url,
                headers: {
                  "AMS-ACCESS-TOKEN":name
                },
                data: JSON.stringify({
                  actionList,
                  code:values.code,
                  cron:values.cron,
                  description:values.description,
                  digits:values.digits,
                  name:values.name,
                  source:values.source,
                  type:values.type,
                  sourceType:values.sourceType,
                }),
              };
              function fn(res) {
                if (res && res.code == 200) {
                  message.success('Success');
                  that.loadData(that.state.search, that.state.pagination);
                  that.setState({visible: false, visibleTask: false});
                }else{
                  message.error(res.message);
                }
              }
              CL.clReqwest({settings, fn});
            }
          });
        }
      }
    }
  }

  onChangeInput = (e) => {
    this.setState({contentValue: e.target.value});
  }

  textChange = (e) => {
    this.setState({contentMessage: e.target.value});
  }

  contentSave = () => {
    let that = this;
    if(this.state.modalName == '新增补偿'){
      let settings = {
        contentType,
        method: 'post',
        // url: 'http://118.25.213.60:9088/rule/action',
        url: ruleActionRulebc.url,
        headers: {
          'AMS-ACCESS-TOKEN': name,
        },
        data:JSON.stringify({
          content: that.state.contentMessage,
          extra: that.state.contentValue,
          ruleId: that.state.ruleId,
          type: 'R',
        }),
      }
      function fn(res) {
        if(res.code == 200 && res.data){
          message.success('SUCCESS');
          that.setState({compensationModal: false});
          that.loadData();
        }
      }
      CL.clReqwest({settings,fn});
    }else{
      let settings = {
        contentType,
        method: 'patch',
        // url: 'http://118.25.213.60:9088/rule/action',
        url: ruleActionRuletc.url,
        headers: {
          'AMS-ACCESS-TOKEN': name,
        },
        data:JSON.stringify({
          content: that.state.contentMessage,
          extra: that.state.contentValue,
          id: that.state.ruleId,
        }),
      }
      function fn(res) {
        if(res.code == 200 && res.data){
          message.success('SUCCESS');
          that.setState({compensationModal: false});
          that.loadData();
        }
      }
      CL.clReqwest({settings,fn});
    }
  }

  render() {
    const _this = this;
    const remarkStyle = {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
      maxWidth: '100px',
    };
    const operation = [
      {
        id: 'nameValue',
        type: 'text',
        label: '策略名称',
        placeholder: 'Please Input',
      },
      {
        id: 'state',
        type: 'select',
        label: '状态',
        placeholder: 'Please select',
        options: _this.state.statusList,
      },
    ];

    const columns = [
      {
        title: '任务类型',
        dataIndex: 'type',
        width: '8%',
        render(index,record){
          return record.type == 'C'? '自动规则':record.type == 'O'?'单次任务':'-';
        }
      },
      {
        title: '策略名称',
        dataIndex: 'name',
        width: '9%',
      },
      {
        title: '策略代码',
        dataIndex: 'code',
        width: '9%',
      },

      {
        title: '营销方式',
        dataIndex: 'action',
        width: '9%',
        render(index, record){
          return record.action ? record.action : '-';
        }
      },

      {
        title: '执行时间',
        dataIndex: 'cron',
        width: '9%',
      },

      {
        title: '灰度控制',
        dataIndex: 'rate',
        width: '6%',
        render(index,record){
            return record.rate ? record.rate : '-';
        }
      },

      {
        title: '状态',
        dataIndex: 'state',
        width: '8%',
        render: function render(text, data) {
            return (<div>
              <Switch 
                checkedChildren="开启" 
                unCheckedChildren="关闭" 
                defaultChecked={data.state == 'N'? false : true} 
                onChange={(e) => {
                  _this.switchChange(e, data);
                }}
                 />
            </div>
            );
        }
      },

      {
        title: '备注',
        dataIndex: 'description',
        width: '12%',
        render: function (index, record) {
          return (
            <div style={{ position: 'relative' }}>
              <Tooltip placement="top" title={record.description} defaultVisible={false} overlayStyle={{ wordWrap: 'break-word' }}>
                <p style={remarkStyle}>{record.description || '-'}</p>
              </Tooltip>
            </div>
          );
        },
      },

      {
        title: '创建人',
        dataIndex: 'author',
        width: '8%',
        render(index, record){
            return record.author ? record.author : '-';
        }
      },

      {
        title: '补偿机制',
        dataIndex: 'remedy',
        width: '9%',
        render: function (index, record) {
          return (
            <div style={{ position: 'relative' }}>
              <Tooltip placement="top" title={record.remedy} defaultVisible={false} overlayStyle={{ wordWrap: 'break-word' }}>
                <p style={remarkStyle}>{record.remedy || '-'}</p>
              </Tooltip>
            </div>
          );
        },
      },
      {
        title: '操作',
        dataIndex: 'resideCity',
        render(text, data) {
          return (<div>
            <Select id='select' value='1' style={{ width: 120 }} onChange={(e) => {
                  _this.handleChange(e, data);
                }}>
              <Option value="1">选择操作</Option>
              <Option value="2">编辑</Option>
              <Option value="3">更多明细</Option>
              <Option value="4">补偿</Option>
              {
                data.type == 'O'? <Option value="5">删除</Option>:''
              }
            </Select>
          </div>);
        },
      },
    ];

    const settings = {
      data: _this.state.data,
      operation: operation,
      columns: columns,
      getFields: _this.getFormFields,
      pagination: _this.state.pagination || {},
      pageChange: _this.pageChage,
      tableLoading: _this.state.loading,
      search: _this.state.search,
      defaultbtn: [{
        title: '创建规则',
        fn: _this.onCreate,
      }],
      defaultbtnTow: [{
        title: '单次任务',
        fn: _this.onCreateTask,
      }],
    };

    return (
      <div className="activity-management">
        <CLList settings={settings}/>
        <Modal
          title={`${_this.state.isEdit ? '编辑' : '创建规则'} `}
          visible={_this.state.visible}
          onCancel={_this.handleCancel}
          mask={true}
          maskClosable={false}
          footer={null}
        >
          <CreateRules
            isEdit={_this.state.isEdit}
            stateIsEdit={_this.state.stateIsEdit}
            detail={_this.state.detail}
            getFields={_this.getFields}
          />
        </Modal>
        <Modal
          title={`${_this.state.isEdit ? '编辑' : '单次任务'} `}
          visible={_this.state.visibleTask}
          onCancel={_this.handleCancel}
          mask={true}
          maskClosable={false}
          footer={null}
        >
          <CreateTask
            isEdit={_this.state.isEdit}
            stateIsEdit={_this.state.stateIsEdit}
            detail={_this.state.detail}
            getFields={_this.getFields}
          />
        </Modal>
        <Modal
            title='更多明细'
            visible={_this.state.checkVisible}
            onCancel={_this.handleCancel}
            footer={null}
        >
            <CheckRules
                datails={_this.state.datails}
                isEdit={_this.state.isEdit}
            />
        </Modal>
        <Modal
          visible={_this.state.compensationModal}
          onOk={_this.contentSave}
          onCancel={_this.handleCancel}
          maskClosable={false}
          title={_this.state.modalName}
        >
          <Row>
            <Col span={24} offset={8}>推送发送失败,补偿发送短信</Col>
          </Row>
          <Row style={{marginTop: 20}}>
            <Col span={3} offset={1}>短信内容 :</Col>
            <Col span={12} offset={1} style={{marginRight: 10, width: 450}}>
              <TextArea placeholder="请输入短信内容. Limit 153 character..."
                        autosize={{minRows: 2, maxRows: 7}}
                        onChange={(e)=>_this.textChange(e)}
                        value={_this.state.contentMessage}
              />
            </Col>
          </Row>
          <Row style={{marginTop: 20}}>
            <Col span={3} offset={1}>说明 :</Col>
            <Col span={6} offset={1} style={{marginRight: 10, width: 450}}>
              <Input 
                value={_this.state.contentValue} 
                placeholder='请输入说明...'
                onChange={(e)=>_this.onChangeInput(e)}
              />
            </Col>
          </Row>
        </Modal>
      </div>
    );
  }
}
