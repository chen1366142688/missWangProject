import React from 'react';
import {CLComponent, CLRadio} from 'Lib/component/index';
import {CL} from 'Lib/tools/index';
import _ from 'lodash';
import {Interface} from 'Lib/config/index';
import {Button, Modal, Row, Col, Input, Tabs, Form, message} from 'antd';
import CLlist from 'Src/lib/component/CLlist';
import {SessionManagement} from 'Lib/tools/index';

const {enumDefinition} = require("Lib/tools/index");

const {contentType, Details, loanBasisInfoShowFlow, loanBasisInfoDealFlow} = Interface;
const {TabPane} = Tabs;
const FormItem = Form.Item;

const sessionCode = SessionManagement.getStorageList().Demo;

export default class MyForm extends CLComponent {
    constructor(props) {
        super(props);
        this.submitData = {};
        this.resData = {};
        this.params = {};
        this.state = {
            type: '1',
            data: {},
            array: {},
            formData: {},
            loading: false,
            options: {
                interestRateMethodOpt: [],
            },
            arr: [],
            visible: false,
            visibles: false,
            disabled: false,
            formDefination: {},
            details: {
                1: {}, 2: {}, 3: {}
            },  // 表单初始值
            keyValue: '',
        }

    };

    componentWillMount() {
        const type = sessionStorage.getItem('typeChange') || '1';
        this.interestRateMethodOptMth();
    }

    switchShowType = (showType, code, disabled) => {
        let type = "0", list = [];
        switch (showType) {
            case 2:
                type = "0";
                list = [{
                    key: 1,
                    value: 'yes',
                }, {
                    key: 2,
                    value: 'no',
                }, {
                    key: 3,
                    value: 'uncertain',
                }];
                break;
            case 1:
                type = "0";
                list = [{
                    key: 1,
                    value: 'yes',
                }, {
                    key: 2,
                    value: 'no',
                }];
                break;
            case 3:
                type = "1";
                list = [{
                    key: 1,
                    value: 'yes',
                    input: 'php',
                    inputWidth: '100px',
                    placeholder: 'PHP',
                    disabled,
                }, {
                    key: 2,
                    value: 'no',
                }];
                break;
            case 4:
                type = "2";
                list = [{
                    key: 1,
                    value: 'yes',
                    inputOne: 'php',
                    inputTwo: 'platformNumber',
                    inputWidth: '100px',
                    placeholderInputOne: 'PHP',
                    placeholderInputTwo: 'Number',
                    disabled,
                }, {
                    key: 2,
                    value: 'no',
                }];
                break;
        }
        if (code == 21) {
            list = [{
                key: 1,
                value: 'yes',
                input: 'php',
                inputWidth: '150px',
                placeholder: '639xxxxxxxxx',
                disabled,
            }, {
                key: 2,
                value: 'no',
            }];
        }
        return {
            type, list
        };
    };

    interestRateMethodOptMth = () => {
        const that = this;
        let list = [],
            options = this.state.options;
        for (let i = 0; i < 5; i++) {
            const data = {
                name: Math.ceil(Math.random() * 10000),
                value: Math.ceil(Math.random() * 10000),
            };

            list.push(data);
        }
        options.interestRateMethodOpt = list;
        this.setState({options});


        const settings = {
            contentType,
            method: Details.loanBasisInfoShowFlow.type,
            url: Details.loanBasisInfoShowFlow.url + that.props.appId,
        };

        function fn(res) {
            if (res && res.data) {
                that.resData = res.data;
                let disabled = false;
                _.each(res.data, (item, key) => {
                    if (key == 2) {
                        disabled = true;
                        that.setState({disabled: true});
                    }
                    that.setState({keyValue: key});
                })

                let result = res.data[that.get_object_first_attribute(res.data)];

                var keys = Object.keys(result);
                let formDefination = {}, details = {}, formData = {};
                _.each(keys, key => {
                    formDefination[`form${key}`] = [], formData[`form${key}`] = {};
                    _.each(result[key], (item, index) => {
                        details[key] = details[key] || {};
                        let arr = item.values == null ? item.values : (item.values.toString().indexOf(',') == -1 ? item.values : item.values.split(','));
                        details[key][item.code + ""] = arr && arr[0] * 1;  // 构建填入表单的初始值对
                        if (item.showType == 3) {
                            formData[`form${key}`][item.code + "InputValue"] = arr && arr.length > 1 ? arr[1] : null
                        } else if (item.showType == 4) {
                            formData[`form${key}`][item.code + "InputOneValue"] = arr && arr.length > 1 ? arr[1] : null
                            formData[`form${key}`][item.code + "InputTwoValue"] = arr && arr.length > 2 ? arr[2] : null
                        }
                        let {type, list} = that.switchShowType(item.showType, item.code, disabled,);
                        let child = {
                            content: (index + 1 + '. ') + item.content,
                            key: item.code + "",
                            type,
                            disabled,
                            required: true,
                            requiredMsg: 'please select',
                            list,
                            className: key !== 2 && item.isError ? "radio-has-history" : '',
                        };
                        formDefination[`form${key}`].push(child)
                    })
                })

                that.setState({formDefination, details, formData});

                setTimeout(() => {
                    that[`form${that.state.type}`].setFieldsValue(details[that.state.type])
                }, 100)
            }
        }


        CL.clReqwest({settings, fn,});
    };

    get_object_first_attribute = (data) => {
        for (let key in data)
            return key;
    }

    analysisFormData = (formData, err) => {
        // 处理Input组件的值
        _.each(formData, (value, key) => {
            if (!!key.match(/([\s\S]+)Input$/) && !value) {
                let fieldName = key.replace(/([\s\S]+)Input$/, '$1');
                err = err || {};
                err[fieldName] = "please input";
            }
            if (!!key.match(/([\s\S]+)InputOne$/) && !value) {
                let fieldName = key.replace(/([\s\S]+)InputOne$/, '$1');
                err = err || {};
                err[fieldName] = "please input";
            }
            if (!!key.match(/([\s\S]+)InputTwo$/) && !value) {
                let fieldName = key.replace(/([\s\S]+)InputTwo$/, '$1');
                err = err || {};
                err[fieldName] = "please input";
            }
        })
        return err;
    }

    tabChange = (e) => {
        const _this = this;

        // 验证上一个表单的值
        let prevType = this.state.type;
        let form = this[enumDefinition("auditRadioFormType").convertToValue(prevType)];
        let formDefination = this.state.formDefination;
        let options = formDefination[`form${prevType}`];

        this.validSingleForm(form, options)
            .then((res) => {
                if (res.err.length > 0) {
                    this.setState({resList: res.err, visible: true});
                }
                this.submitData[`form${prevType}`] = {
                    values: res.values,
                    err: res.err
                };
                setTimeout(() => {
                    _this[`form${e}`] && _this[`form${e}`].setFieldsValue((_this.submitData[`form${e}`] && _this.submitData[`form${e}`].values) || _this.state.details[e])
                }, 100)
            })


        this.setState({
            type: e,
        });
        SessionManagement.setSession(sessionCode, 'typeChange', e);

    };

    validSingleForm = (form, options) => {
        const _this = this;
        return new Promise(function (resolve, reject) {
            form.validateFields((err, values) => {
                let resList = [];
                let inputData = form.formData;
                err = _this.analysisFormData(inputData, err);

                _.each(err, (field, key) => {
                    let findItem = _.find(options, option => {
                        return option.key == key;
                    })

                    findItem && resList.push(findItem.content)
                })
                resolve({err: resList, values});
            })
        })
    };

    getFields = (fields) => {
        alert(JSON.stringify(fields));
        this.setState({resList, visible: true});
    };

    handleOk = (e) => {
        this.setState({visible: false,});
    };
    handleOk1 = (e) => {
        let params = this.state.paramsData;
        params.page = 2;
        let settings = {
            contentType,
            method: loanBasisInfoDealFlow.type,
            url: loanBasisInfoDealFlow.url,
            data: JSON.stringify(params),
        };

        function fn(res) {
            if(res.code == 200){
                message.success('success');
                location.hash = '/uplending/loanaudit';
            }
            console.log(res);
        }
        CL.clReqwest({settings, fn,});
        this.setState({
            visibles: false,
        });
    };

    handleCancel = (e) => {
        this.setState({
            visible: false,
            visibles: false,
        });
    };

    limitLengthValid = (rule, value, callback, limit) => {
        if (value && value.length > limit) {
            callback(`Limit ${limit} characters`);
        } else {
            callback();
        }
    };

    limitValueValid = (rule, value, callback, max, min) => {
        if (value && typeof max === 'number' && value > max) {
            callback(`The maximum cannot exceed ${max}`);
        } else if (value && typeof min === 'number' && value < min) {
            callback(`The minimum cannot below ${min}`);
        } else {
            callback();
        }
    };

    getForm = (form) => {
        const type = Number(this.state.type);
        if (type == 1) {
            this.form1 = form;
        } else if (type == 2) {
            this.form2 = form;
        } else if (type == 3) {
            this.form3 = form;
        }
    }

    submit = () => {
        const _this = this;
        let formGroup = [{
            name: 'form1',
            form: this.form1
        }, {
            name: 'form2',
            form: this.form2
        }, {
            name: 'form3',
            form: this.form3
        }];
        let formDefination = this.state.formDefination;

        this.validSingleForm(this[`form${this.state.type}`], formDefination[`form${this.state.type}`])
            .then((res) => {
                _this.submitData[`form${_this.state.type}`] = {
                    values: res.values,
                    err: res.err
                };

                // 未通过验证的字段， 未渲染的form
                let validRes = [], invalidForm = [];

                _.each(_this.submitData, item => {
                    if (item) {
                        invalidForm.push(item);
                    }
                    validRes = validRes.concat(item.err);
                })

                if (validRes.length) {
                    this.setState({
                        resList: validRes,
                        visible: true
                    })
                    return;
                } else if (invalidForm.length < 3) {
                    message.error("请填写所有表单！");
                    return
                } else {
                    let sendData = this.resData[1] || this.resData[2] || this.resData[3] || this.resData[4];
                    _.each(_this.submitData, (item, formKey) => {
                        formKey = formKey[formKey.length - 1];
                        _.each(item.values, (value, valueKey) => {
                            let tgt = _.find(sendData[formKey], sendItem => {
                                return sendItem.code == valueKey;
                            })

                            if (tgt)
                                tgt.values = value + "";
                        })

                    })

                    _.each(formGroup, group => {
                        let fd = group.form.formData;
                        let formKey = group.name[group.name.length - 1];
                        _.each(fd, (value, key) => {
                            if (typeof value === "number") {
                                key = key.split('Input')[0];
                                let tgt = _.find(sendData[formKey], sendItem => {
                                    return sendItem.code == key;
                                })
                                if (tgt)
                                    tgt.values = tgt.values + "," + value;
                            }
                        })
                    })
                    let params = this.params;
                    let keyValue = this.state.keyValue;
                    let listMap = {};
                    listMap = sendData;
                    params.listMap = listMap;
                    params.page = 1;
                    params.applicationId = _this.props.appId;

                    let settings = {
                        contentType,
                        method: loanBasisInfoDealFlow.type,
                        url: loanBasisInfoDealFlow.url,
                        data: JSON.stringify(params),
                    };

                    function fn(res) {
                        if (res && res.data) {
                            _this.setState({
                                paramsData: res.data,
                                resLists: res.data.resultList,
                                resValue: res.data.res,
                                visibles: true
                            });
                        }
                    }

                    CL.clReqwest({settings, fn,});
                }
            })
    };

    render() {
        const type = Number(this.state.type);
        let formDefination = this.state.formDefination;
        const settings = {
            options: formDefination[`form${type}`] || [],
            getFields: this.getFields,
            values: this.state.data,
            getForm: this.getForm,
            formData: this.state.formData[`form${type}`] || {}   // input数据
        };

        return (
            <div className="my-form" style={{position: 'relative'}}>
                <Tabs defaultActiveKey={this.state.type} onChange={this.tabChange}>
                    {
                        <TabPane tab="Part1: 申请信息验证" key="1">
                            <CLRadio settings={settings}/>
                        </TabPane>
                    }
                    {
                        <TabPane tab="Part2: 联系人(单位电核)" key="2">
                            <CLRadio settings={settings}/>
                        </TabPane>
                    }
                    {
                        <TabPane tab="Part3: 本人电核" key="3">
                            <CLRadio settings={settings}/>
                        </TabPane>
                    }
                </Tabs>
                <p style={{
                    position: 'absolute',
                    top: '5px',
                    right: '300px'
                }}>
                    <Button type="primary" onClick={this.submit} disabled={this.state.disabled}>Submit</Button>
                </p>
                <Modal
                    title="以下选项未勾选"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                >
                    {
                        _.map(this.state.resList, (item, index) => {
                            return (
                                <p>{item}</p>
                            );
                        })
                    }
                </Modal>
                <Modal
                    title="提交确认"
                    visible={this.state.visibles}
                    onOk={this.handleOk1}
                    onCancel={this.handleCancel}
                >
                    <p>经过评估,系统将执行操作 -- <p style={{display:'inline-block',color:'red'}}>{this.state.resValue == 1 ? '同意' : this.state.resValue == 2 ? '拒绝' : '回滚'} </p></p>
                    {
                        _.map(this.state.resLists, (item, index) => {
                            return (
                                <p>{item}</p>
                            );
                        })
                    }
                    <p>是否提交?</p>
                </Modal>
            </div>
        );
    }

}
