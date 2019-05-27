import React from 'react';
import {CLComponent} from 'Lib/component/index';
import {Interface} from 'Lib/config/index';
import {Form,Input,Button,Select, Row, Col, Tooltip, InputNumber, Radio, Upload, Icon, message } from 'antd';
import { CL } from '../../lib/tools';
const {TextArea} = Input;
const RadioGroup = Radio.Group;
const { contentType, ruleActionRulese, ruleActionRulefile } = Interface;
let name = sessionStorage.getItem("loginName");
class ClForm extends CLComponent {
  constructor(props) {
    super(props);
    this.bindCtx([
      'handleSubmit',
      'handleReset',
    ]);
  }

  state = {
    autoCompleteResult: [],
    numberList: [
      {name: '0',value: '0'},
      {name: '1',value: '1'},
      {name: '2',value: '2'},
      {name: '3',value: '3'},
      {name: '4',value: '4'},
      {name: '5',value: '5'},
      {name: '6',value: '6'},
      {name: '7',value: '7'},
      {name: '8',value: '8'},
      {name: '9',value: '9'},
    ],
    radioList: [
      {name:'SQL', value: '1'},
      {name:'TXT', value: '2'},
    ],
    senderIdList: [],
    styleState: false,
    isRequreContent: false,
    fileList: [],
    redioState: 1,
    sourceState: this.props.detail.sourceType == 'file'? '2':'1',
  }

  componentDidMount() {
    if (this.props.isEdit) {
      this.fillFields(this.props.detail);
    }
    this.senderIdList();
  }

  fillFields = (detail) => {
    let extra = '';
    _.map(detail.actionList,(doc,index)=>{
      if(doc.type == 'M'){
        extra = doc.extra;
      }
    })
    detail && this.props.form.setFieldsValue({
        name: detail.name,
        code: detail.code,
        source: detail.source,
        extra: extra,
        message: detail.message,
        pushTitle: detail.pushTitle,
        pushContent: detail.pushContent,
        couponId: detail.couponId,
        description: detail.description,
        digits: detail.digits.split(','),
        cron: detail.cron,
    })
  };

  componentWillReceiveProps(nextProps) {
    const _this = this;
    if (nextProps.isEdit && nextProps.detail !== this.props.detail && !nextProps.stateIsEdit) {
      setTimeout(() => {
        _this.fillFields(nextProps.detail);
      }, 100)
    } else if (!nextProps.isEdit && !nextProps.stateIsEdit) {
      _this.props.form.resetFields();
    }else if(nextProps.stateIsEdit){
      _this.resetField();
    }
  }

  resetFields = ()=>{
    const that = this;
    let detail = that.props.form.getFieldsValue();
    setTimeout(() => {
      that.props.form.setFieldsValue(detail);
    }, 100)
  };

  resetField = ()=>{};


  handleSearch = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      console.log('Received values of form: ', values);
    });
  }

  senderIdList = () => {
    let that = this;
    let settings = {
        contentType,
        method: 'get',
        // url: 'http://118.25.213.60:9088/sender/list',
        url: ruleActionRulese.url,
        headers: {
            "AMS-ACCESS-TOKEN":name
          }
    }
    function fn(res){
        if(res && res.data){
            let senderIdList = that.state.senderIdList;
            let data = res.data;
            for(let key in data){
                senderIdList.push({
                  name: data[key],
                  value: data[key],
                });
            }
            that.setState({senderIdList});
        }
    }
    CL.clReqwest({settings,fn});
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
      let radioValue = this.state.sourceState;
      radioValue == 2 ? values.source = this.state.fileName || this.props.detail.source:radioValue == 1 ?values.source=values.source:'';
      values.type = 'O';
      radioValue == 2 ? values.sourceType = 'file' : values.sourceType = 'sql';
      this.props.getFields(err,values,this.state.TextAreaValue || '');
    });
  }

  handleReset = () => {
    this.props.form.resetFields();
  }

  limitCharacter = (rule, value, callback, number) => {
    if (value && value.length > number) {
        callback(`Limit ${number} characters`);
    } else {
        callback();
    }
  };

  TextAreaState = (e) => {
    let that = this;
    if(e.target.value.length >= 153){
     that.setState({styleState: true});
    }else{
      that.setState({styleState: false});
    }
    that.setState({TextAreaValue: e.target.value});
  }

  radioChange = (e) => {
      this.setState({ sourceState: e.target.value});
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
        let formData = new FormData(info.file);
        formData.append('file', info.file);
        let settings = {
          contentType,
          method: 'post',
          // url: 'http://118.25.213.60:9088/rule/file',
          url: ruleActionRulefile.url,
          data: formData,
          processData: false,
          headers: {
            "AMS-ACCESS-TOKEN":name
          },
        }
        function fn(res){
          if(res.code == 200){
            that.setState({ fileName: res.data });
          }else{
            message.error(res.message);
            
          }
        }
        CL.clReqwest({settings, fn});
      };
    }
  };

  onRemoves = (e) => {
    this.setState({fileList: [], info: {}});
  };

  onRuleTypeChange = (e) => {
    this.setState({ isRequreContent: !e ? false : true });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let fileList = this.state.fileList;
    const uploadButton = (<Button><Icon type="upload"/> 上传txt (取member id)</Button>);
    const props = {
        listType: 'picture',
        defaultFileList: [...fileList],
        accept: ".txt",
        customRequest: this.customRequest,
        onRemove: this.onRemoves,
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
    };
    return (
      <div className="CreateRules" key="cl-form">
         <Form onSubmit={this.handleSubmit}
               className="login-form"
         >
           <Form.Item label="策略类型" labelCol={{span: 6}} wrapperCol={{span: 15}}>
                {getFieldDecorator('name', {
                    rules: [{required: true, message: '该项是必填项，请输入!'}],
                })(<Input/>)}
            </Form.Item>
            <Form.Item label="策略代码" labelCol={{span: 6}} wrapperCol={{span: 15}}>
                {getFieldDecorator('code', {
                    rules: [{required: true, message: '该项是必填项，请输入!'}],
                })(<Input/>)}
            </Form.Item>
            <Form.Item label="目标群体导入" labelCol={{span: 6}} wrapperCol={{span: 15}}>
                {getFieldDecorator('sourceType', {
                    rules: [{required: true, message: '该项是必填项，请输入!'}],
                    initialValue: this.state.sourceState
                })(
                    <RadioGroup 
                    onChange={(e)=>this.radioChange(e)}
                    >
                      {_.map(this.state.radioList,(doc,index) => {
                        return <Radio key={index} value={doc.value}>{doc.name}</Radio>
                      })}
                    </RadioGroup>
                )}
            </Form.Item>
            {this.state.sourceState == 1? 
                <Form.Item label="SQL" labelCol={{span: 6}} wrapperCol={{span: 15}}>
                    {getFieldDecorator('source', {
                        rules: [{required: true, message: '该项是必填项，请输入!'}],
                    })(
                    <TextArea autosize={{ minRows: 2, maxRows: 6 }} />
                    )}
                </Form.Item> :this.state.sourceState == 2?
                <Form.Item label="文件" labelCol={{span: 6}} wrapperCol={{span: 15}}>
                    {getFieldDecorator('source', {
                        rules: [{required: true, message: '该项是必填项，请输入!'}],
                    })(
                        <Upload {...props}>
                            {fileList.length >= 1 ? null : uploadButton}
                        </Upload>
                    )}
                </Form.Item> : ''
            }
            <Form.Item label="Sender id" labelCol={{span: 6}} wrapperCol={{span: 15}} id='area' style={{ Padding: 100, Height: 1000, Background: '#eee', Position: 'relative' }}>
                {getFieldDecorator('extra',{
                })(
                  <Select onChange={this.onRuleTypeChange} allowClear>
                      {
                          this.state.senderIdList.map((doc, index) => {
                              return (
                              <Select.Option key={index} value={doc.value}>{doc.name}</Select.Option>);
                          })
                      }
                  </Select>
                )}
            </Form.Item>
            <Form.Item label="短信内容" labelCol={{span: 6}} wrapperCol={{span: 15}}>
                {getFieldDecorator('message', {
                    rules: [{required: this.state.isRequreContent, message: '该项是必填项，请输入!'}],
                })(
                  <TextArea placeholder="0/153" style={{color: (this.state.styleState) ? 'red' : '#000'}} onChange={this.TextAreaState} autosize={{ minRows: 2, maxRows: 6 }} />
                )}
            </Form.Item>
            {
              this.state.styleState ? <p style={{color:'red',margin:'-23px 0 15px 180px',fontSize:12}}>内容将拆分多条短信发送</p> : ''
            }
            <Form.Item label="推送标题" labelCol={{span: 6}} wrapperCol={{span: 15}}>
                {getFieldDecorator('pushTitle', {
                })(<Input/>)}
            </Form.Item>
            <Form.Item label="推送内容" labelCol={{span: 6}} wrapperCol={{span: 15}}>
                {getFieldDecorator('pushContent', {
                })(
                  <TextArea autosize={{ minRows: 2, maxRows: 6 }} />
                )}
            </Form.Item>
            <Form.Item label="优惠劵" labelCol={{span: 6}} wrapperCol={{span: 15}}>
                {getFieldDecorator('couponId', {
                })(<InputNumber style={{width: 407}}/>)}
            </Form.Item>
            <Form.Item label="执行时间" labelCol={{span: 6}} wrapperCol={{span: 15}}>
                {getFieldDecorator('cron', {
                    rules: [{required: true, message: '该项是必填项，请输入!'}],
                })(<Input/>)}
            </Form.Item>
            <Row style={{fontSize: 12,marginBottom: 20, marginTop: -25,marginLeft: -78}}>  
            <Tooltip placement="top" title={InstancePrompt} defaultVisible={false} overlayStyle={{ wordWrap: 'break-word' }}>
              <Col offset={8} span={16} style={remarkStyle}>
                 示例：每天早上9点执行：0 0 9 * * ? <a>点击查看更多...</a>
                </Col>
              </Tooltip>
            </Row>
            <Form.Item label="备注" labelCol={{span: 6}} wrapperCol={{span: 15}}>
                {getFieldDecorator('description', {
                })(
                  <TextArea autosize={{ minRows: 2, maxRows: 6 }} />
                )}
            </Form.Item>
            <Form.Item label="灰度控制" labelCol={{span: 6}} wrapperCol={{span: 15}} id='area' style={{ Padding: 100, Height: 1000, Background: '#eee', Position: 'relative' }}>
                {getFieldDecorator('digits',{
                    rules: [{required: true, message: '该项是必填项，请输入!'}],
                })(
                  <Select mode="multiple">
                      {
                          this.state.numberList.map((doc, index) => {
                              return (
                              <Select.Option mode="multiple" getPopupContainer={() => document.getElementById('area')} key={index} value={doc.value}>{doc.name}</Select.Option>);
                          })
                      }
                  </Select>
                )}
            </Form.Item>
            <Form.Item style={{marginLeft: 260}}>
                <Button type="primary" htmlType="submit">Confirm</Button>
                <Button style={{marginLeft: 8}} onClick={this.handleReset}>Clear</Button>
            </Form.Item>
        </Form>
      </div>
    );
  }
}

const CLForm = Form.create({ name: 'normal_login' })(ClForm)
export default CLForm;