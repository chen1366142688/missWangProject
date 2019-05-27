import React from 'react';
import {CLComponent, CLForm} from 'Lib/component/index';
import _ from 'lodash';


export default class DetailsData extends CLComponent {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            loading: false,
            disabled: false,
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
        }, 50)
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
            appName: detail.appName,
            gpLinkShort: detail.gpLinkShort,
            packetName: detail.packetName,
            version: detail.version,
            alternateLinkShort: detail.alternateLinkShort
        })
    };

    getFields = (detail, that, err) => {
        this.props.getFields(detail, that, err);
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
                id: "appName",
                type: "text",
                label: "App name",
                disabled: this.props.disabled,
                placeholder: "Please Input",
                rules: [{required: true, message: "Please enter App name!"},
                    {validator: (rule, value, callback) => this.limitLengthValid(rule, value, callback, 30)},
                ]
            },

            {
                id: "version",
                type: "text",
                label: "Version",
                disabled: this.props.disabled,
                placeholder: "Please Input",
                rules: [{required: true, message: "Please enter Version!"}]
            },

            {
                id: "packetName",
                type: "text",
                label: "packet name",
                disabled: this.props.disabled,
                placeholder: "Please Input",
                rules: [{required: true, message: "Please enter packet name!"}]
            },

            {
                id: "gpLinkShort",
                type: "text",
                label: "Google Play link",
                placeholder: "Please Input",
            },

            {
                id: "alternateLinkShort",
                type: "text",
                label: "Alternative link",
                placeholder: "Please Input",
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
