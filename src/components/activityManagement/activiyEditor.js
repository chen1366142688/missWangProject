import React from 'react';
import {CLComponent, CLForm} from 'Lib/component/index';
import {CL} from 'Lib/tools/index';
import _ from 'lodash';
import {Interface} from 'Lib/config/index';
import moment from 'moment';

let {contentType, couponManagePulldownList} = Interface;

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
      this.activityOptMth();
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
            activityDate: [moment(detail.validBeginDate), moment(detail.validEndDate)],
            activityDesc: detail.activityDesc,
            version: detail.version + '',
        })
    };

    activityOptMth = () => {
      const that = this;
      const settings = {
        contentType,
        method: couponManagePulldownList.type,
        url: couponManagePulldownList.url,
      };

      function fn(res) {
        if (res && res.data) {
          const versionList = _.map(res.data.version, (doc, index) => {
            return {
              value: index,
              name: doc,
            };
          });
          const options = that.state.options;
          options.versionList = versionList;
          that.resetFields();
          that.setState({options});
        }
      }

      CL.clReqwest({settings, fn});
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
                label: "活动名称",
                placeholder: "Limit 30 charactors",
                rules: [{required: true, message: "Please enter activity name!"},
                    {validator: (rule, value, callback) => this.limitLengthValid(rule, value, callback, 30)},
                ]
            },

            {
                id: "activityDate",
                type: "rangePicker",
                label: "活动日期",
                placeholder: "Please select",
                rules: [{required: true, message: "Please enter activity name!"}]
            },

            {
                id: 'version',
                key: 'version',
                type: 'select',
                label: 'App',
                placeholder: 'Please select',
                options: this.state.options.versionList,
                // mode: 'multiple',
                rules: [{required: true, message: ''}],
            },

            {
                id: "activityDesc",
                type: "textarea",
                label: "描述",
                placeholder: "Please input",
                rules: [{required: true, message: ''}],
            },
        ];

        const settings = {
            options: options,
            getFields: this.getFields,
            values: this.state.data,
            getForm: this.getForm
        };

        return (
            <div className="activity-editor">
                <CLForm settings={settings}/>
            </div>
        )
    }
}
