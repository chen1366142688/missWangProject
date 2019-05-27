import React from 'react';
import {Button, Form, Input, Select, Tooltip, Row, Col  } from 'antd';
import _ from 'lodash';
import { Interface } from '../../../src/lib/config/index';
const { contentType, ruleSavePost, ruleSavePatch, metricListgz, ruleListGet, } = Interface;
import { CL } from '../../lib/tools';
const {TextArea} = Input;
let name = sessionStorage.getItem("loginName");
class AddRelateds extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isEdit: false,//编辑true，查看false
            logicSymbol:[
                {
                    name:'等于',
                    value:'=',
                },
                {
                    name:'小于',
                    value:'<',
                },
                {
                    name:'小于等于',
                    value:'<=',
                },
                {
                    name:'大于',
                    value:'>',
                },
                {
                    name:'大于等于',
                    value:'>=',
                },
                {
                    name:'不等于',
                    value:'!=',
                },
                {
                    name:'不包含',
                    value:'ni',
                },
                {
                    name:'包含',
                    value:'in',
                },
                {
                    name:'区间',
                    value:'be',
                },
            ],
            variableList: [],
            conditionList: [
                {
                    logic: null,
                    position: 0,
                    valueList: [],
                    data:{}
                },
            ],
        }
    }

    componentDidMount() {
        if(window.location.href.split('=')[2] =='1' || window.location.href.split('=')[2] =='2'){
            this.loadData();
        }
        this.metricList();
    }

    loadData() {
        let that = this;
        const settings = {
            contentType,
            method: 'get',
            url: ruleListGet.url+`${window.location.href.split('=')[1] || ''}`,
            headers: {
                "CMS-ACCESS-TOKEN": name
            },
        }
        function fn(res){
            if(res && res.code == 200){
                let conditionList=that.state.conditionList;
                conditionList=res.data.conditionList;
                for(let val of conditionList){val.data={}}
                that.setState({ conditionList:conditionList });
                if(window.location.href.split('=')[2] =='1'){ //查看 
                    that.setState({isEdit:true})
                    that.props.form.setFieldsValue({
                        name: res.data.name,
                        action: res.data.action, 
                        email: res.data.email,
                        telephone: res.data.telephone,
                        message: res.data.message,
                        cron: res.data.cron,
                    });
                }else if(window.location.href.split('=')[2] =='2'){ //编辑
                    that.setState({isEdit:false})
                    that.props.form.setFieldsValue({
                        name: res.data.name,
                        action: res.data.action, 
                        email: res.data.email,
                        telephone: res.data.telephone,
                        message: res.data.message,
                        cron: res.data.cron,
                    });
                }
            }else{
                message.error(res.message);
            }
        }
        CL.clReqwest({settings,fn});
    }

    metricList = () => {
        let that = this;
        let settings = {
            contentType,
            method: 'get',
            url: metricListgz.url,
            headers: {
                "CMS-ACCESS-TOKEN": name
            },
        }
        function fn(res){
            if(res){
                let variableList = [];
                _.map(res.data,(doc) => {
                    variableList.push({
                        name: doc.name,
                        value: doc.id,
                    });
                });
                that.setState({variableList});
            }
        }
        CL.clReqwest({settings,fn});
    }

    setScoreRuleField = (id, name, value,position) => {
      let conditionList = this.state.conditionList;
      let item = _.find(conditionList, itr => {
        return itr.position === position;
    });
        item.data[name] = value;
        this.setState({ conditionList })
    };
    addScoreRule = (position) => {
        let conditionList = this.state.conditionList;
        let item = _.find(conditionList, itr => {
            return itr.position === position;
        });
        if(!item.data.compare || !item.data.logic || !item.data.value || !item.data.metricId){
            alert("请选择或填写")
        return;
        }
        if(conditionList[position].valueList == undefined){
            conditionList[position].valueList=[]
            item.data.position=conditionList[position].valueList.length;
        }else{
            item.data.position=conditionList[position].valueList.length
        }
            item.data.type = 'F';
            conditionList[position].valueList.push(item.data)
            item.data = {};
            this.setState({ conditionList })
        };

    deleteScoreItem = (pos, position) => {
        let conditionList = this.state.conditionList;
        conditionList[pos].valueList.splice(position,1)
        this.setState({ conditionList })
    };

    newScoreModule = () => {
        let conditionList = this.state.conditionList;
        conditionList.push({
              logic: null,
              position: conditionList.length,
              valueList: [],
              data:{}
          })
        this.setState({ conditionList })
    };

    setScoreType = (id, logic,position) => {
        let conditionList = this.state.conditionList;
        let item = _.find(conditionList, itr => {
            return itr.position === position;
        });
        item.logic = logic;
        this.setState({ conditionList })
    };

    scoreModule = (id, logic, list,data,position) => {
        return <div className="score-module">
            <div className="score-module-title">
                <span className="ml50">与下一组：</span>
                <Select className="width140" value={logic} onChange={(e) => this.setScoreType(id, e,position)} disabled={this.state.isEdit}>
                    <Select.Option value="&">AND</Select.Option>
                    <Select.Option value="|">OR</Select.Option>
                </Select>
            </div>
            <table>
            <tbody>
                <tr>
                    <th width="350">变量</th>
                    <th width="100">比较类型</th>
                    <th width="250">阈值</th>
                    <th width="100">逻辑符号</th>
                    <th width="50">操作</th>
                </tr>
                {
                    _.map(list, (item, index) => {
                        return <tr>
                            <td>
                                {_.map(this.state.variableList, (doc)=>{
                                    if(doc.value == item.metricId){
                                        return doc.name;
                                    }
                                })}
                            </td>
                            <td>{item.compare}</td>
                            <td>{item.value}</td>
                            <td>{(item.logic === "&" ? "AND" : (item.logic === "|" && "OR"))}</td>
                            <td><Button size="small" onClick={() => this.deleteScoreItem(position, index)} disabled={this.state.isEdit}>删除</Button></td>
                        </tr>
                    })
                }
                
                  <tr>
                      <td>
                          <Select className="border-none" value={data.metricId}
                                  onChange={(e) => this.setScoreRuleField(id, 'metricId', e,position)} disabled={this.state.isEdit}>
                              {
                                  _.map(this.state.variableList, item => {
                                      return <Select.Option value={item.value}>{item.name}</Select.Option>
                                  })
                              }
                          </Select>
                      </td>
                      <td><Select className="border-none" value={data.compare} disabled={this.state.isEdit}
                                  onChange={(e) => this.setScoreRuleField(id, 'compare', e,position)}>
                              {
                                  _.map(this.state.logicSymbol, item => {
                                      return <Select.Option value={item.value}>{item.name}</Select.Option>
                                  })
                              }
                          </Select>
                      </td>
                      <td><Input className="border-none" value={data.value} placeholder="please input"
                                onChange={(e) => this.setScoreRuleField(id, 'value', e.target.value,position)} disabled={this.state.isEdit}/>
                      </td>
                      <td>
                          <Select className="border-none" value={data.logic}
                                  onChange={(e) => this.setScoreRuleField(id, 'logic', e,position)} disabled={this.state.isEdit}>
                              <Select.Option value="&">AND</Select.Option>
                              <Select.Option value="|">OR</Select.Option>
                          </Select>
                      </td>
                      <td><Button type="primary" size="small" onClick={() => this.addScoreRule(position)} disabled={this.state.isEdit}>添加</Button></td>
                  </tr>
                </tbody>
            </table>
        </div>
    };

    onRuleTypeChange = (e) => {
        this.setState({
            isRequreEmail: e=="M"?false:true,
            isRequrePhone: e=="E"?false:true
        })
    };
    

    save = () => {
        let that = this;
        that.props.form.validateFieldsAndScroll((err,values) => {
          for(let val of that.state.conditionList){
             val.data = {};
          }
          if(window.location.href.split('=')[2] =='2'){
            const settings = {
                contentType,
                method: 'patch',
                url: ruleSavePatch.url,
                data: JSON.stringify({
                    action: values.action,
                    cron: values.cron,
                    email: values.email,
                    message: values.message,
                    name: values.name,
                    telephone: values.telephone,
                    conditionList: that.state.conditionList,
                    id: window.location.href.split('=')[1] || '',
                }),
                headers: {
                    "CMS-ACCESS-TOKEN": name
                },
            }
            function fn(res){
                if(res.code === 200){
                  let conditionList=that.state.conditionList;
                  for(let val of conditionList){
                    val.data={}
                 }
                 that.setState({conditionList})
                  that.cancel();
                }
            }
            CL.clReqwest({settings,fn});
          }else{
            const settings = {
                contentType,
                method: 'post',
                url: ruleSavePost.url,
                data: JSON.stringify({
                    action: values.action,
                    cron: values.cron,
                    email: values.email,
                    message: values.message,
                    name: values.name,
                    telephone: values.telephone,
                    conditionList: that.state.conditionList
                }),
                headers: {
                    "CMS-ACCESS-TOKEN": name
                },
            }
            function fn(res){
                if(res.code === 200){
                  let conditionList=that.state.conditionList;
                  for(let val of conditionList){
                    val.data={}
                 }
                 that.setState({conditionList})
                  that.cancel();
                }
            }
            CL.clReqwest({settings,fn});
          }
        })
    }

    cancel = () => {
        location.hash = '#/uplending/rulesRelated'
    };

    render() {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 3},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 10},
            },
        };
        const InstancePrompt = <div>
            示例：<br/>
            每天早上9点执行：0 0 9 * * ? <br/>
            每月1号早上8点执行：0 0 8 1 * ? <br/>
            每周1早上10点执行：0 0 10 0 0 1 <br/>
            每隔2小时执行：0 0 0/2 * * ? <br/>
            更多配置参见: <a target="_blank" href='http://www.bejson.com/othertools/cron/'>http://www.bejson.com/othertools/cron/</a></div>
        const remarkStyle = {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
            maxWidth: '500px',
            fontSize: '12px',
        };

        return (<div className="RULE-CREATOR">
            <div className="form-title">
                <Button className="ml5" type="primary" loading={this.state.saveLoading}
                        onClick={this.save} disabled={this.state.isEdit}>保存</Button>
                <Button onClick={this.cancel}>取消</Button>
            </div>
            <Form>
                <Form.Item
                    {...formItemLayout}
                    label="名称">
                    {getFieldDecorator('name', {
                        rules: [{
                            required: true, message: 'Please input',
                        }]
                    })(
                        <Input disabled={this.state.isEdit}/>
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="报警类型"
                >
                    {getFieldDecorator('action', {
                        rules: [{
                            required: true, message: 'Please select',
                        }]
                    })(
                        <Select onChange={this.onRuleTypeChange}  disabled={this.state.isEdit}>
                            <Select.Option value="M">短信</Select.Option>
                            <Select.Option value="E">邮件</Select.Option>
                        </Select>
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="邮箱地址"
                >
                    {getFieldDecorator('email', {
                        rules: [{
                            required: this.state.isRequreEmail, message: 'Please input',
                        }]
                    })(
                        <Input disabled={this.state.isEdit} placeholder='多个邮箱请用英文逗号分隔'/>
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="手机号"
                >
                    {getFieldDecorator('telephone', {
                        rules: [{
                            required: this.state.isRequrePhone, message: 'Please input',
                        }]
                    })(
                        <Input disabled={this.state.isEdit} placeholder='输入手机号时请加上 86, 多个用英文逗号分隔'/>
                    )}
                </Form.Item>
                <Form.Item label="消息" {...formItemLayout}>
                    {getFieldDecorator('message', {
                        rules: [{required: true, message: '该项是必填项，请输入!'}],
                    })(
                    <TextArea autosize={{ minRows: 2, maxRows: 6 }}  disabled={this.state.isEdit}/>
                    )}
                </Form.Item>
                <Form.Item label="Cron表达式" {...formItemLayout}>
                    {getFieldDecorator('cron', {
                        rules: [{required: true, message: '该项是必填项，请输入!'}],
                    })(<Input disabled={this.state.isEdit}/>)}
                    <p>
                        <Tooltip 
                        placement="top" 
                        title={InstancePrompt} 
                        defaultVisible={false} 
                        overlayStyle={{ wordWrap: 'break-word' }}>
                            <Col span={16} style={remarkStyle}>
                            示例：每天早上9点执行：0 0 9 * * ? <a>点击查看更多...</a>
                            </Col>
                        </Tooltip>
                    </p>
                </Form.Item>
                <div className="score-area">
                    <span className="new-module-label">新建规则组合</span>
                    <Button className="new-module-button" type="primary"
                            onClick={this.newScoreModule} disabled={this.state.isEdit}>新建规则组合</Button>
                    <span className="clear"></span>
                    {
                        _.map(this.state.conditionList, item => {
                            return this.scoreModule(item.id, item.logic, item.valueList,item.data,item.position);
                        })
                    }
                </div>
            </Form>
        </div>)
    }
}

const RuleForm = Form.create({})(AddRelateds);

export default RuleForm;