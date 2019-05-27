import React from 'react';
import {CLComponent, CLRadio} from 'Lib/component/index';
import {CL} from 'Lib/tools/index';
import _ from 'lodash';
import {Interface} from 'Lib/config/index';
import {Button, Modal, Row, Col, Input, Tabs, Form, message} from 'antd';
import {SessionManagement} from 'Lib/tools/index';
import $ from 'jquery';

const {enumDefinition} = require("Lib/tools/index");
const {TextArea} = Input;
const {contentType, Details, loanBasisInfoShowFlow, loanBasisInfoDealFlow, loanBasisInfoSaveFlow} = Interface;
const {TabPane} = Tabs;
const FormItem = Form.Item;

const sessionCode = SessionManagement.getStorageList().Demo;

//判断表单是否有改动
let whetherChanged = false;

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
                interestRateMethodOpt: []
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
            loadingForm: false
        }

    };

    componentWillMount() {
        const type = sessionStorage.getItem('typeChange') || '1';
        this.interestRateMethodOptMth();
    }

    switchShowType = (data, showType, code, disabled) => {
        let type = "0", list = [];
        let SensitivePositionsType = data.SensitivePositionsType.map(item => {
            return {
                key: item.type + "",
                value: item.typeName
            }
        });
        let SensitiveIndustryType = data.SensitiveIndustryType.map(item => {
            return {
                key: item.type + "",
                value: item.typeName
            }
        });
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
            case 5:
                type = "3";
                list = [{
                    key: 1,
                    value: 'yes',
                    selectOneOpts: SensitivePositionsType,
                    selectTwoOpts: SensitiveIndustryType,
                    selectWidth: '100px',
                    placeholderSelectOne: 'Sensitive positions',
                    placeholderSelectTwo: 'Sensitive industry',
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
                    if (key == 'status' && item === "notApplying") {
                        disabled = true;
                        that.setState({disabled: true});
                    }
                    that.setState({keyValue: key});
                })

                let result = res.data['beforeList'] || res.data['saveList'] || res.data['newList'] || res.data['onlyReadList'] || res.data['notingList'] || {};

                var keys = Object.keys(result);

                let formDefination = {}, details = {}, formData = {};

                //将后台格式数据进行提取和转换
                _.each(keys, key => {
                    formDefination[`form${key}`] = [], formData[`form${key}`] = {};
                    _.each(result[key], (item, index) => {
                        let arr = (item.values === null || item.values === "null") ? null
                            : (item.values.toString().indexOf(',') === -1 ? item.values : item.values.split(','));
                        details[key] = details[key] || {};
                        details[key][item.code + ""] = arr && arr[0] * 1;  // 构建填入表单的初始值对
                        if (item.showType == 3) {
                            formData[`form${key}`][item.code + "InputValue"] = that.getVal(arr, 1);
                        } else if (item.showType == 4) {
                            formData[`form${key}`][item.code + "InputOneValue"] = that.getVal(arr, 1);
                            formData[`form${key}`][item.code + "InputTwoValue"] = that.getVal(arr, 2);
                        } else if (item.showType == 5) {
                            formData[`form${key}`][item.code + "SelectOneValue"] = that.getVal(arr, 1);
                            formData[`form${key}`][item.code + "SelectTwoValue"] = that.getVal(arr, 2);
                        }
                        let {type, list} = that.switchShowType(res.data, item.showType, item.code, disabled);
                        let child = {
                            content: (index + 1 + '. ') + item.content,
                            key: item.code + "",
                            type,
                            disabled,
                            required: true,
                            requiredMsg: 'please select',
                            list,
                            className: item.isError ? "radio-has-history" : '',
                        };
                        formDefination[`form${key}`].push(child);
                    })
                });

                that.setState({formDefination, details, formData, typeValue: res.data.user, loadingForm: true});

                setTimeout(() => {
                    that[`form${that.state.type}`].setFieldsValue(details[that.state.type])
                }, 100)
            }
        }


        CL.clReqwest({settings, fn});
    };

    getVal = (arr, num) => {
        return arr && arr.length > num && arr[num] != 'null' ? arr[num] : null;
    };

    analysisFormData = (formData, err) => {
        // 处理组件的值
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
            if (!!key.match(/([\s\S]+)SelectOne$/) && !value) {
                let fieldName = key.replace(/([\s\S]+)SelectOne$/, '$1');
                err = err || {};
                err[fieldName] = "please select";
            }
            if (!!key.match(/([\s\S]+)SelectTwo$/) && !value) {
                let fieldName = key.replace(/([\s\S]+)SelectTwo$/, '$1');
                err = err || {};
                err[fieldName] = "please select";
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

                _.each(values, item => {
                    if (item != null)
                        whetherChanged = true;
                });

                resolve({err: resList, values});
            })
        })
    };

    getFields = (fields) => {
        this.setState({resList, visible: true});
    };

    handleOk = (e) => {
        this.setState({visible: false});
    };
    handleOk1 = (e) => {
        let params = this.state.paramsData;
        params.listMap = this.state.listMap;
        params.page = 2;
        params.rollback = this.state.fallBackMessage;
        params.applicationId = this.props.appId;
        if (this.state.resValue == 'rollback' && this.state.fallBackMessage == undefined) {
            message.error('Detailed information is required')
        } else {
            let settings = {
                contentType,
                method: loanBasisInfoDealFlow.type,
                url: loanBasisInfoDealFlow.url,
                data: JSON.stringify(params),
            };

            function fn(res) {
                if (res.code == 200) {
                    message.success('success');
                    location.hash = '/uplending/loanaudit';
                }
            }

            CL.clReqwest({settings, fn,});
            this.setState({
                visibles: false,
            });
        }
    };

    handleCancel = (e) => {
        this.setState({
            visible: false,
            visibles: false,
        });
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

    setFallBackMessage = (e) => {
        if (e.target.value.length > 1000) {
            message.error('Exceeding the word limit.');
            return;
        }
        this.setState({fallBackMessage: e.target.value});
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
            name: 'form3' || '',
            form: this.form3 || ''
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
                } else {
                    let sendData = this.resData['beforeList'] || this.resData['saveList'] || this.resData['newList'] || this.resData['onlyReadList'] || this.resData['notingList'];
                    _.each(_this.submitData, (item, formKey) => {
                        formKey = formKey[formKey.length - 1];
                        _.each(item.values, (value, valueKey) => {
                            let tgt = _.find(sendData[formKey], sendItem => {
                                return sendItem.code == valueKey;
                            })

                            if (tgt)
                                tgt.values = value + "";
                        })

                    });

                    this.dealFormData(formGroup, sendData);

                    _this.setState({
                        listMap: sendData,
                    });
                    let params = this.params;
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
                                listMap: res.data.listMap,
                                visibles: true
                            });
                        }
                    }

                    CL.clReqwest({settings, fn,});
                }
            })
    };

    dealFormData = (formGroup, sendData) => {
        _.each(formGroup, group => {
            let fd = group.form ? group.form.formData : {};
            let formKey = group.name[group.name.length - 1];
            _.each(fd, (value, key) => {
                if (key.match(/^([\s\S]+)InputValue$/) || key.match(/^([\s\S]+)InputOneValue$/)) {
                    key = key.split('Input')[0];
                    let tgt = _.find(sendData[formKey], sendItem => {
                        return sendItem.code == key;
                    })
                    if (tgt && value != null && typeof value != "undefined")
                        tgt.values = tgt.values + "," + value;
                } else if (key.match(/^([\s\S]+)InputTwoValue$/)) {
                    key = key.split('Input')[0];
                    let tgt = _.find(sendData[formKey], sendItem => {
                        return sendItem.code == key;
                    })
                    if (tgt && value != null && typeof value != "undefined") {
                        let lg = tgt.values.split(',').length;
                        if (lg < 2) {
                            tgt.values = tgt.values + ",null";
                        }
                        tgt.values = tgt.values + "," + value;
                    }

                } else if (key.match(/^([\s\S]+)SelectOneValue$/)) {
                    key = key.split('Select')[0];
                    let tgt = _.find(sendData[formKey], sendItem => {
                        return sendItem.code == key;
                    })
                    if (tgt && value != null && typeof value != "undefined")
                        tgt.values = tgt.values + "," + value;
                } else if (key.match(/^([\s\S]+)SelectTwoValue$/)) {
                    key = key.split('Select')[0];
                    let tgt = _.find(sendData[formKey], sendItem => {
                        return sendItem.code == key;
                    })
                    if (tgt && value != null && typeof value != "undefined") {
                        let lg = tgt.values.split(',').length;
                        if (lg < 2) {
                            tgt.values = tgt.values + ",null";
                        }
                        tgt.values = tgt.values + "," + value;
                    }

                }
            })
        })
        return formGroup;
    }

    saveForm = () => {
        const _this = this;
        let formGroup = [{
            name: 'form1',
            form: this.form1
        }, {
            name: 'form2',
            form: this.form2
        }, {
            name: 'form3' || '',
            form: this.form3 || ''
        }];

        let fields = this[`form${this.state.type}`].getFieldsValue();

        _.each(fields, item => {
            if (item != null)
                whetherChanged = true;
        });

        if (!whetherChanged) {
            message.error("Save failure.Nothing to save.");
            return;
        }

        _this.submitData[`form${_this.state.type}`] = {
            values: fields
        };

        let sendData = this.resData['beforeList'] || this.resData['saveList'] || this.resData['newList'] || this.resData['onlyReadList'] || this.resData['notingList'];
        _.each(_this.submitData, (item, formKey) => {
            formKey = formKey[formKey.length - 1];
            _.each(item.values, (value, valueKey) => {
                let tgt = _.find(sendData[formKey], sendItem => {
                    return sendItem.code == valueKey;
                })

                if (tgt && value != null && typeof value != "undefined")
                    tgt.values = value + "";
            })

        });

        this.dealFormData(formGroup, sendData);

        this.setState({
            listMap: sendData,
        });

        this.save(sendData)
    };

    save = (sendData) =>{
        let params = this.params;
        params.listMap = sendData;
        params.page = 1;
        params.applicationId = this.props.appId;

        let settings = {
            contentType,
            method: loanBasisInfoSaveFlow.type,
            url: loanBasisInfoSaveFlow.url,
            data: JSON.stringify(params),
        };

        function fn(res) {
            if (res && res.data) {
                message.success("success");
            }
        }

        CL.clReqwest({settings, fn,});
    }

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
                        this.state.typeValue == 'newUser' ?
                            <TabPane tab="Part1: Application Evaluation" key="1">
                                {this.state.loadingForm && <CLRadio settings={settings}/>}
                            </TabPane> :
                            <TabPane tab="Part1: Contact-company reference" key="1">
                                {this.state.loadingForm && <CLRadio settings={settings}/>}
                            </TabPane>

                    }
                    {
                        this.state.typeValue == 'newUser' ?
                            <TabPane tab="Part2: Contact-company reference" key="2">
                                {this.state.loadingForm && <CLRadio settings={settings}/>}
                            </TabPane> :
                            <TabPane tab="Part2: User phone call verification" key="2">
                                {this.state.loadingForm && <CLRadio settings={settings}/>}
                            </TabPane>

                    }
                    {
                        formDefination[`form${3}`] ? <TabPane tab="Part3: User phone call verification" key="3">
                            {this.state.loadingForm && <CLRadio settings={settings}/>}
                        </TabPane> : ''
                    }
                </Tabs>
                <p style={{
                    position: 'absolute',
                    top: '5px',
                    right: '150px'
                }}>
                    <Button type="default" onClick={this.saveForm} disabled={this.state.disabled}>Save</Button>
                    <Button type="primary" onClick={this.submit} disabled={this.state.disabled}
                            style={{marginLeft: "8px"}}>Submit</Button>
                </p>
                <Modal
                    title="The following options are not checked: "
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
                    title="Submit and approve"
                    visible={this.state.visibles}
                    onOk={this.handleOk1}
                    onCancel={this.handleCancel}
                >
                    <p>{`The system will ${this.state.resValue && this.state.resValue.toUpperCase()} the application after evaluation for the reasons --`}
                        <p style={{
                            display: 'inline-block',
                            color: 'red'
                        }}>{this.state.resValue}</p></p>
                    {
                        _.map(this.state.resLists, (item, index) => {
                            return (
                                <p>{item}</p>
                            );
                        })
                    }
                    <p>Submit or not ?</p>
                    {
                        this.state.resValue == 'rollback' ? (
                            <p>
                                <TextArea autosize={{
                                    minRows: 3,
                                    maxRows: 7,
                                }} placeholder='The details will be displayed on the app...'
                                          onChange={this.setFallBackMessage}/>
                            </p>
                        ) : ''
                    }
                </Modal>
            </div>
        );
    }

}
