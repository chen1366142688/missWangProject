import React from 'react';
import moment from 'moment';
import CLComponent from './CLComponent.jsx';
import {Drawer, Form, Select, Col, Button, InputNumber, Radio} from 'antd';
import _ from 'lodash';

const Option = Select.Option;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const MIN = 1;


class CLRadio extends CLComponent {
    constructor(props) {
        super(props);
        this.formData = {};

        this.state = {}
    }

    componentDidMount() {
        // 父组件获取表单的入口
        this.props.settings.getForm && this.props.settings.getForm(this.props.form)
        // 初始化自定义验证结果
        this.initFormData(this.props.settings.options);
    }

    initFormData = (options) => {
        // 单Input类型
        _.each(options, option => {
            if (option.type == 1) {
                this.formData[`${option.key}Input`] = true;
            } else if (option.type == 2) {
                this.formData[`${option.key}InputOne`] = true;
                this.formData[`${option.key}InputTwo`] = true;
            } else if (option.type == 3) {
                this.formData[`${option.key}SelectOne`] = true;
                this.formData[`${option.key}SelectTwo`] = true;
            }
        });

        this.formData = _.assign(this.formData, this.props.settings.formData || {});
        this.setState(this.formData);
        this.props.form.formData = this.formData;
    };

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            // 自定义验证规则（Input与radio的组合验证）
            if (err) {
                return;
            }
            this.props.settings.getFields(values);
        });
    };

    validRadio = (rule, value, callback, name, type) => {
        this.props.form.getFieldValue(name)
        if (type == 1) {
            this.validRadioOne(rule, value, callback, name);
        } else if (type == 2) {
            this.validRadioTwo(rule, value, callback, name);
        } else if (type == 3) {
            this.validRadioThree(rule, value, callback, name);
        } else {
            callback();
        }
    };

    validRadioOne = (rule, value, callback, name) => {
        this.onInputChange(this.formData[`${name}InputValue`], name, 'Input', value);
        this.setState(this.formData);
        this.props.form.formData = this.formData;
        callback();
    };

    validRadioTwo = (rule, value, callback, name) => {
        this.onInputMulChange(this.formData[`${name}InputOneValue`], name, 'InputOne', value);
        this.setState(this.formData);
        this.props.form.formData = this.formData;
        callback();
    };

    validRadioThree = (rule, value, callback, name) => {
        this.onSelectMulChange(this.formData[`${name}SelectOneValue`], name, 'SelectOne', value);
        this.setState(this.formData);
        this.props.form.formData = this.formData;
        callback();
    };

    onInputChange = (e, key, inputWords, radioVal) => {
        if ((e + "").length > 12) {
            e = (e + "").replace(/^([0-9]{12})[0-9]+$/, '$1');
        }
        const radioValue = this.props.form.getFieldValue(key);
        this.formData = _.assign(this.formData, {
            [key + inputWords]: this.validInput(e, radioVal, radioValue),
            [`${key + inputWords}Value`]: e
        });
    };

    onInputMulChange = (e, key, inputWords, radioVal) => {
        if ((e + "").length > 12) {
            e = (e + "").replace(/^([0-9]{12})[0-9]+$/, '$1');
        }
        const radioValue = this.props.form.getFieldValue(key);
        const brother = this.state[key + (inputWords === 'InputOne' ? 'InputTwoValue' : 'InputOneValue')];
        this.formData = _.assign(this.formData, {
            [key + inputWords]: this.validInputMul(e, brother, radioVal, radioValue),
            [`${key + inputWords}Value`]: e,
            [key + (inputWords === 'InputOne' ? 'InputTwo' : 'InputOne')]:
                this.validInputMul(brother, e, radioVal, radioValue)
        });
    };

    onSelectMulChange = (e, key, selectWords, radioVal) => {
        const radioValue = this.props.form.getFieldValue(key);
        const brother = this.state[key + (selectWords === 'SelectOne' ? 'SelectTwoValue' : 'SelectOneValue')];
        this.formData = _.assign(this.formData, {
            [key + selectWords]: !(radioValue == 1 && (!e && !brother)),
            [`${key + selectWords}Value`]: e,
            [key + (selectWords === 'SelectOne' ? 'SelectTwo' : 'SelectOne')]: !(radioValue == 1 && (!e && !brother))
        });
        this.setState(this.formData);
    };

    onInputBlur = () => {
        this.setState(this.formData);
        this.props.form.formData = this.formData;
    };

    validInputMul = (value, brother, radioSelf, radioValue) => {
        if ((value + "").match(/^[0-9]*$/)) {
            value = value * 1;
        }
        if ((brother + "").match(/^[0-9]*$/)) {
            brother = brother * 1;
        }
        if (typeof value === 'number' && value <= 0) {
            return false;
        } else if (typeof value === 'undefined' || value == null) {
            if (radioValue == 1 && !this.validNumber(brother)) {
                return false;
            }
        } else if (typeof value !== 'number') {
            return false;
        }
        return true;
    };

    /**
     * Input验证
     * @param value input值
     * @param radioSelf input所在radio选项值
     * @param radioValue radio当前选中值
     * @returns {boolean}
     */
    validInput = (value, radioSelf, radioValue) => {
        if ((value + "").match(/^[0-9]*$/)) {
            value = value * 1;
        }
        if (this.validNumber(value) || (typeof radioValue === 'number' && radioValue != 1) || typeof radioValue === 'undefined') {
            return true;
        }
        return false;
    };

    validNumber = (value) => {
        return typeof value === 'number' && value > 0;
    };

    renderFormInputItem = (fn, key, radio, inputWords, placeholder) => {
        const inputStyle = {
            display: 'inline-block',
            marginTop: '-5px'
        };
        const radioValue = this.props.form.getFieldValue(key);
        const validStatus = this.state[key + inputWords] ? 'success' : 'error';

        return (<FormItem
            key={Math.ceil(Math.random() * 100000000)}
            style={inputStyle}
            validateStatus={validStatus}
            help={!this.state[key + inputWords] && 'please input'}
        >
            <InputNumber
                placeholder={placeholder}
                min={MIN}
                onChange={e => fn(e, key, inputWords, radio.key)}
                onBlur={this.onInputBlur}
                value={this.state[`${key + inputWords}Value`]}
                disabled={radio.disabled}
                style={{
                    width: radio.inputWidth,
                    margin: '0 10px',
                }}
            />
        </FormItem>);
    };

    renderFormSelectItem = (fn, key, radio, selectWords, placeholder, options) => {
        const inputStyle = {
            display: 'inline-block',
            marginTop: '-5px'
        };

        const radioValue = this.props.form.getFieldValue(key);
        const validStatus = this.state[key + selectWords] ? 'success' : 'error';

        return (<FormItem
            key={Math.ceil(Math.random() * 100000000)}
            style={inputStyle}
            validateStatus={validStatus}
            help={!this.state[key + selectWords] && 'please select'}
        >
            <Select allowClear
                placeholder={placeholder}
                onChange={e => fn(e, key, selectWords, radio.key)}
                value={this.state[`${key + selectWords}Value`]}
                disabled={radio.disabled}
                style={{
                    width: radio.selectWidth,
                    margin: '0 10px',
                }}>
                {
                    _.map(options, (opt) => {
                        return <Option value={opt.key} title={opt.value}>{opt.value}</Option>
                    })
                }
            </Select>
        </FormItem>);
    };


    renderFormItems = (radio, type, key) => {
        // 单Input类型
        if (type == 1) {
            return radio.input ? this.renderFormInputItem(this.onInputChange, key, radio, 'Input', radio.placeholder) : null;
        } else if (type == 2) {
            // 双Input类型
            return radio.inputOne ? [
                this.renderFormInputItem(this.onInputMulChange, key, radio, 'InputOne', radio.placeholderInputOne),
                <span>or</span>,
                this.renderFormInputItem(this.onInputMulChange, key, radio, 'InputTwo', radio.placeholderInputTwo)
            ] : null;
        } else if (type == 3) {
            // 双Select类型
            return radio.selectOneOpts ? [
                this.renderFormSelectItem(this.onSelectMulChange, key, radio, 'SelectOne', radio.placeholderSelectOne, radio.selectOneOpts),
                <span>or</span>,
                this.renderFormSelectItem(this.onSelectMulChange, key, radio, 'SelectTwo', radio.placeholderSelectTwo, radio.selectTwoOpts)
            ] : null;
        }
        return null;
    };

    renderRadioGroup = (item) => {
        const _this = this;
        return (<RadioGroup
            disabled={item.disabled}>
            {
                _.map(item.list, (radio) => {
                    return (<Radio value={radio.key}>
                        {radio.value}
                        {
                            ((rdo, type, key) => {
                                return _this.renderFormItems(rdo, type, key);
                            })(radio, item.type, item.key)
                        }

                    </Radio>);
                })
            }
        </RadioGroup>);
    };

    render() {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {span: 14},
            wrapperCol: {
                span: 6,
                offset: 2,
            },
        };

        return (
            <div className="radio-form" key="radioForm">
                <Form onSubmit={this.handleSubmit}>
                    {
                        _.map(this.props.settings.options, (item) => {
                            return (<FormItem
                                // key={Math.ceil(Math.random() * 10000)}
                                {...formItemLayout}
                                label={item.content}
                                className={item.className}
                            >
                                {getFieldDecorator(item.key, {
                                    rules: [{
                                        required: item.required,
                                        message: item.requiredMsg
                                    }, {
                                        validator: (rule, value, callback) => this.validRadio(rule, value, callback, item.key, item.type),
                                    }],
                                })(
                                    this.renderRadioGroup(item),
                                )}
                            </FormItem>);
                        })
                    }
                    {this.props.settings.useDefaultBtn ? <FormItem
                        wrapperCol={{span: 24, offset: 18}}
                    >
                        <Button type="primary" htmlType="submit">Submit</Button>
                    </FormItem> : null}
                </Form>
            </div>
        );
    }
}

const RadioForm = Form.create()(CLRadio);
export default RadioForm;
