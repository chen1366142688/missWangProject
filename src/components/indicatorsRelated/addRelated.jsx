import React from 'react';
import {CLComponent, CLForm} from 'Lib/component/index';
import _ from 'lodash';


export default class ActivityEditor extends CLComponent {
    constructor(props) {
        super(props);

        this.state = {
            data: {},
            loading: false,
          options: {
            versionList: [],
          },
        }
    }

    componentDidMount() {
        if (this.props.isEdit) {
            this.fillFields(this.props.detail);
        }
    }

    componentWillReceiveProps(nextProps) {
        const _this = this;
        if (nextProps.isEdit && nextProps.detail !== this.props.detail) {
          setTimeout(() => {
            _this.fillFields(nextProps.detail);
          }, 100)
        } else if (!nextProps.isEdit) {
          this.form.resetFields();
        }
      }

    resetFields = ()=>{
      const that = this;
      let detail = this.form.getFieldsValue();
      setTimeout(() => {
        that.form.setFieldsValue(detail);
      }, 100)
    };

    fillFields = (detail) => {
        detail && this.form.setFieldsValue({
            name: detail.name,
            command: detail.command,
        })
    };

    getFields = (fields, that, err) => {
        this.props.getFields(fields, that, err);
    };

    getForm = (form) => {
        this.form = form;
    };

    limitLengthValid = (rule, value, callback, limit) => {
        if (value && value.length > limit) {
            callback(`Limit ${limit} characters`);
        } else {
            callback();
        }
    };

    render() {
        const options = [
            {
                id: "name",
                type: "text",
                label: "名称",
                placeholder: "Limit 30 charactors",
                rules: [{required: true, message: "Please enter name!"},
                    {validator: (rule, value, callback) => this.limitLengthValid(rule, value, callback, 30)},
                ]
            },
            {
                id: "command",
                type: "textarea",
                label: "指令",
                placeholder: "输入查询单个结果的sql. 长度限制0/1000",
                autosize:{minRows: 22, maxRows: 6},
                rules: [{required: true, message: "Please enter command!"},
                {validator: (rule, value, callback) => this.limitLengthValid(rule, value, callback, 1000)},
            ]
            },
        ];

        const settings = {
            options: options,
            getFields: this.getFields,
            values: this.state.data,
            getForm: this.getForm,
            formItemLayout:{labelCol:{span: 6}, wrapperCol:{span: 15}},
        };

        return (
            <div className="activity-editor">
                <CLForm settings={settings}/>
            </div>
        )
    }
}