import {Row, Col, Select, Form, Input, Button, Checkbox, Radio, Tooltip, Icon,DatePicker} from 'antd';
import {Router, Route, browserHistory, hashHistory, IndexLink, Link} from 'react-router';
import React, {Component, PropTypes} from 'react'
import OperpConfig from './OperpConfig';

import css from '../css/activity.css';
import '../../../common/sass/operp/operp.scss';
var moment=require('moment');

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const RangePicker = DatePicker.RangePicker;

class CreateActivity extends React.Component {
    constructor(props) { 
        super(props);
        //取消
        this.handleCancel = this.handleCancel.bind(this);
        //提交订单
        this.handleSubmit = this.handleSubmit.bind(this);
        //审批
        this.handleApprove = this.handleApprove.bind(this);
    }
    /*生命周期函数--->该方法在完成首次渲染之前被调用*/
    componentWillMount() {
        /* 设置推荐时段的状态*/
        this.setState({
            disabledDates: false
        });
    }
    /*首次使用组建类时,组件已经被渲染，DOM操作请放在这*/
    componentDidMount() {
        let editDefaultformData = this.props.form.getFieldsValue();
    }

    /*存在期：随着应用状态的改变，以及组件逐渐受到影响，你将会看到下面的方法一次被调用：*/
    componentWillReceiveProps(nextProps) {
        let formData = this.props.form.getFieldsValue();
        /*当formData.timeFlag-1，代表不限时段，日期组件即将不可用，1是限时段日期组件可以选用*/
        if (formData.timeFlag === '-1') {
            this.props.form.resetFields([['timeRange']]);
            this.setState({
                disabledDates: true
            });
        } else {
            this.setState({
                disabledDates: false
            });
        }

    }

    /**
     *条件：当组件确定要更新，在 render 之前调用
     *用处：这个时候可以确定一定会更新组件，可以执行更新前的操作
     *注意：方法中不能使用 setState ，setState 的操作应该在 componentWillReceiveProps 方法中调用
     * @param nextProps
     * @param nextState
     */
    componentWillUpdate(nextProps, nextState) {
    }

    /**
     * 组件已经被更新后的方法
     * @param nextProps
     * @param nextState
     */
    componentDidUpdate(nextProps, nextState) {
        /*创建活动成功后跳转活动主界面*/
        if (this.props.createDatas.submitDatas.createSubmitSuccess == 'yes') {
            browserHistory.push('/activity');
        }
    }
    

    handleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFields((errors, values) => {
            if (errors) {
                console.log('Errors in form!!!');
                return;
            }
            //所有的form表单值，等同于values
            const formData = this.props.form.getFieldsValue();
            //从表单中获取日期timeRange的值(起始时间+结束时间)是个数组
            const timeRange = formData['timeRange'];
             /*若是不限时段 日期数组就为null*/
            if(timeRange===undefined || formData['timeFlag']==='-1'){
                formData.startDate=null;
                formData.endDate=null;
            }else if(timeRange!==undefined && formData['timeFlag']==='1'){
                //格式化时间数组为YYYYMMDD  startDate:起始时间 endDate：结束时间          
                formData.startDate=timeRange[0].format('YYYYMMDD');
                formData.endDate=timeRange[1].format('YYYYMMDD');
            }
            //默认添加创建人
            formData.createUser = '创建人1';
            this.props.createActions.createActivity(formData);
        });
    }

     /**
     * 判断推荐时间是否选择
     */
    dateSelect(rule, value, callback) {
        if(!this.state.disabledDates){
            if(value===undefined){
                callback(new Error("请输入时间段!"));
            }else{
                callback();
            }
        }else if(this.state.disabledDates){
            callback();
        } 
    }

    /**
     * 取消跳转到活动主界面
     */
    handleCancel() {
        console.log('取消跳转');
        browserHistory.push('/activity');
    }
    /**
     * 提交审批
     */
     handleApprove(e){
        alert('提交审批');
        console.log('提交审批');
     }
    render() {
        const {getFieldDecorator, getFieldError, isFieldValidating} = this.props.form;
        const formItemLayout = { labelCol: {span: 2}, wrapperCol: {span: 10},};
        //设置日期组件所选择的日期（所选择的日期只能是今天及今天以后的）
        const disabledDate = function (current) {
           return  current  <= (new Date()).getTime()-1000*60*60*24;
        };
        const date = new Date();
        const startDate=date.toLocaleDateString();
        const endDate = date.toLocaleDateString()+1;
        return (
            <div>
                <Row>
                    <Col span={24}>
                        <h1>新增推荐活动</h1>
                    </Col>
                </Row>
                <Row >
                    <Col span={24}>
                        <div className="edit-underline"></div>
                    </Col>
                </Row>
                <div className="text_dom">
                    <span className="span_text"><Icon type="exclamation-circle-o" className="icon_css"/> 
                    设置完成后，系统自动对同一运营位不同位置输出内容去重。 
                    </span>
                </div>
                <Form horizontal onSubmit={this.handleSubmit}>
                    <FormItem
                        {...formItemLayout}
                        label="活动名称"
                        required 
                    >
                        {getFieldDecorator('activityName', {
                            rules: [
                                {required: true,
                                  message: '活动名称不能为空!'},
                            ],

                        })(
                            <Input type="text" placeholder="请输入活动名称..."/>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="活动类型"
                    >
                        {getFieldDecorator('activityType', {initialValue: '1'})(
                            <RadioGroup>
                                <Radio value="1">正式运营</Radio>
                                <Radio value="2">A/B测试</Radio>
                            </RadioGroup>
                        )}
                    </FormItem>
                     <FormItem
                        {...formItemLayout}
                        label="推荐时段"
                    >
                        {getFieldDecorator('timeFlag', {initialValue: '1'})(
                            <RadioGroup>
                                <Radio value="1">限时段&nbsp;&nbsp;&nbsp;</Radio>
                                <Radio value="-1">不限时段</Radio>
                            </RadioGroup>
                        )}
                    </FormItem>
                     <FormItem wrapperCol={{span: 16, offset: 2}}>
                      {getFieldDecorator('timeRange', 
                            {initialValue:[moment(startDate).startOf('day'),moment(startDate).endOf('day')]},
                            {rules: [{validator: this.dateSelect.bind(this)},],}, 
                            {validateTrigger:'onChange'})
                      (<RangePicker disabled={this.state.disabledDates} disabledDate={disabledDate} />)}
                    </FormItem>
                    <FormItem {...formItemLayout} label="备注">
                        {getFieldDecorator('comments')(<Input type="textarea" />)}
                    </FormItem>
                    <FormItem wrapperCol={{span: 16, offset: 2}} style={{marginTop: 24}}>
                        <Button type="primary" htmlType="submit">保存</Button>
                        &nbsp;&nbsp;&nbsp;
                        <Button type="primary" onClick={this.handleApprove.bind(this)}>提交审批
                        </Button>
                        &nbsp;&nbsp;&nbsp;
                        <Button type="ghost" onClick={this.handleCancel}>取消</Button>
                    </FormItem>
                </Form>
            </div>
        )
            ;
    }
}
//定义组件默认的属性值(如果父组见没有传递数据，使用默认数据)
CreateActivity.defaultProps = {};
//校验从父组件传递的属性值是否符合
CreateActivity.propTypes = {
    createDatas: React.PropTypes.object,
    createActions: React.PropTypes.object.isRequired
};

export default CreateActivity = Form.create()(CreateActivity);