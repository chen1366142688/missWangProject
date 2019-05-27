import React from 'react';
import CLComponent from './CLComponent.jsx';
import {
    Form,
    Row,
    Col,
    Input,
    Button,
    Icon,
    InputNumber,
    Select,
    DatePicker,
    RangePicker,
    Checkbox,
    TreeSelect
} from 'antd';
import _ from 'lodash';
import moment from 'moment';

const {TextArea} = Input;

const FormItem = Form.Item;

class MyLRForm extends CLComponent {
    constructor(props) {
        super(props);

        this.state = {
            loading: false
        }
    }

    getFields = (options) => {
        const children = [];
        const {getFieldDecorator} = this.props.form;

        for (let i = 0; i < options.length; i = i + 2) {
            children.push(
                <Col span={12} key={i}>
                    <FormItem label={options[i].label}>
                        {getFieldDecorator(options[i].id, {
                            rules: options[i].rules,
                            initialValue: options[i].initialValue
                        })(
                            this.switchComponent(options[i])
                        )}
                    </FormItem>
                </Col>
            );
            options[i + 1] && children.push(
                <Col span={12} key={i + 1}>
                    <FormItem label={options[i + 1].label}>
                        {getFieldDecorator(options[i + 1].id, {
                            rules: options[i + 1].rules,
                            initialValue: options[i + 1].initialValue
                        })(
                            this.switchComponent(options[i + 1])
                        )}
                    </FormItem>
                </Col>
            );
        }
        return children;
    };

    switchComponent = (option) => {
        let formItem;

        switch (option.type) {
            case 'text':
                formItem = (
                    <Input type={option.inputType}
                           disabled={option.disabled}
                           placeholder={`${option.placeholder}`}/>
                );
                break;

            case 'textarea':
                formItem = (
                    <TextArea type={option.inputType}
                              autosize={{minRows: 2, maxRows: 6}}
                              disabled={option.disabled}
                              placeholder={`${option.placeholder}`}/>
                );
                break;

            case 'number':
                formItem = (
                    <InputNumber type={option.inputType}
                                 disabled={option.disabled}
                                 placeholder={`${option.placeholder}`}/>
                );
                break;

            case 'select':
                formItem = (
                    <Select mode={option.mode}
                            disabled={option.disabled}
                            type={option.inputType}>
                        {
                            option.options.map(function (doc, index) {
                                return (<Select.Option key={`${doc.id}${index}`}
                                                       value={doc.value.toString()}>{doc.name}</Select.Option>)
                            })
                        }
                    </Select>
                );
                break;

            case 'dateTime':
                formItem = (
                    <DatePicker label={option.placeholder}
                                disabled={option.disabled}
                                type={option.inputType}
                                format={option.format || "YYYY/MM/DD HH:mm"}/>
                );
                break;

            case 'rangePicker':
                formItem = (
                    <DatePicker.RangePicker
                        type={option.inputType}
                        disabled={option.disabled}
                        showTime
                        ranges={{Today: [moment(), moment()], 'This Month': [moment(), moment().endOf('month')]}}
                        format="YYYY/MM/DD HH:mm"
                    />
                );
                break;

            case 'checkbox':
                formItem = (
                    <Checkbox disabled={option.disabled} type={option.inputType}>
                        {option.placeholder}
                    </Checkbox>
                );
                break;
            case 'treeSelect':
                formItem = (
                    <TreeSelect
                        disabled={option.disabled}
                        allowClear={true}
                        type={option.inputType}
                        treeData={option.treeData}
                        size={"large"}
                        showCheckedStrategy={TreeSelect.SHOW_ALL}
                        treeCheckable={true}
                        placeholder={option.placeholder}
                    />
                );
                break;
        }
        return formItem;
    };

    handleReset = () => {
        this.props.form.resetFields();
    };

    handleSubmit = (e) => {
        e.preventDefault();
        this.setState({
            loading: true
        });

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) {
                this.setState({
                    loading: false
                });
                return;
            }

            this.props.settings.getFields(values, this, err, () => {
                this.setState({
                    loading: false
                });
            });
        });
    };

    render() {
        const {settings} = this.props;

        let options = settings.options;

        return (<div className="lr-form">
            <Form
                className="ant-advanced-search-form"
                onSubmit={this.handleSubmit}
            >
                <Row gutter={24}>{this.getFields(options)}</Row>
                <Row>
                    <Col span={13} style={{textAlign: 'right'}}>
                        {settings.disableDefaultBtn ? null :
                            [<Button type="primary" htmlType="submit" loading={this.state.loading}>save</Button>,
                                < Button style={{marginLeft: 15}} onClick={this.handleReset}>
                                    Clear
                                </Button>]
                        }
                    </Col>
                </Row>
            </Form>
        </div>)
    }
}


const LRForm = Form.create({
    mapPropsToFields(props) {
        const values = props.settings.values || {};
        let formSearch = {};
        _.each(values, function (value, index) {
            formSearch[index] = Form.createFormField({value: value});
        })

        return formSearch;
    }
})(MyLRForm);
export default LRForm;