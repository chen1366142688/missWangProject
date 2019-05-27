import React from 'react';
import {CLComponent, CLForm} from 'Lib/component/index';
import {CL} from 'Lib/tools/index';
import _ from 'lodash';
import {Interface} from 'Lib/config/index';

let {contentType, alert} = Interface;
let {addDatasource, editDatasource} = alert;

export default class AddDatasource extends CLComponent {
    constructor(props) {
        super(props);

        this.state = {
            data: {},
            loading: false,
            options: {}
        }
    }

    componentDidMount() {
        if (this.props.detail) {
            this.form.setFieldsValue(this.setColumns(this.props.detail));
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.detail && nextProps.detail !== this.props.detail) {
            setTimeout(() => {
                this.form.setFieldsValue(this.setColumns(nextProps.detail));
            }, 100);
        }
    }

    setColumns = (data) => {
        let {ip, name, password, port, userName, dbName} = data;

        return {ip, name, password, port, userName, dbName}
    };

    getFields = (fields) => {
        const _this = this;
        //　新增
        if (!this.props.detail) {
            const settings = {
                contentType,
                method: addDatasource.type,
                url: addDatasource.url,
                data: JSON.stringify(fields)
            };

            CL.clReqwestPromise(settings)
                .then((res) => {
                    if (res && res.data) {
                        _this.props.ok && _this.props.ok();
                    }
                });

        } else {
            // 编辑
            const settings = {
                contentType,
                method: editDatasource.type,
                url: editDatasource.url + this.props.detail.id,
                data: JSON.stringify(fields)
            };

            CL.clReqwestPromise(settings)
                .then((res) => {
                    if (res && res.data) {
                        _this.props.ok && _this.props.ok();
                    }
                });
        }
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
                placeholder: "limit 30 charactors",
                rules: [{required: true, message: "Please enter datasource name!"},
                    {validator: (rule, value, callback) => this.limitLengthValid(rule, value, callback, 30)},
                ]
            },
            {
                id: "ip",
                type: "text",
                label: "IP",
                placeholder: "limit 128 charactors",
                rules: [{required: true, message: "Please enter datasource ip!"},
                    {validator: (rule, value, callback) => this.limitLengthValid(rule, value, callback, 128)},
                ]
            },
            {
                id: "port",
                type: "text",
                label: "端口",
                placeholder: "limit 5 charactors",
                rules: [{required: true, message: "Please enter datasource port!"},
                    {validator: (rule, value, callback) => this.limitLengthValid(rule, value, callback, 5)},
                ]
            },
            {
                id: "dbName",
                type: "text",
                label: "数据库名",
                placeholder: "limit 30 charactors",
                rules: [{required: true, message: "Please enter database name!"},
                    {validator: (rule, value, callback) => this.limitLengthValid(rule, value, callback, 30)},
                ]
            },
            {
                id: "userName",
                type: "text",
                label: "用户名",
                placeholder: "limit 30 charactors",
                rules: [{required: true, message: "Please enter user name!"},
                    {validator: (rule, value, callback) => this.limitLengthValid(rule, value, callback, 30)},
                ]
            },
            {
                id: "password",
                type: "text",
                label: "密码",
                placeholder: "limit 30 charactors",
                rules: [{required: true, message: "Please enter database password!"},
                    {validator: (rule, value, callback) => this.limitLengthValid(rule, value, callback, 30)},
                ]
            },
        ];

        const settings = {
            options: options,
            getFields: this.getFields,
            values: this.state.data,
            getForm: this.getForm
        };

        return (
            <div className="add-datasource">
                <CLForm settings={settings}/>
            </div>
        )
    }
}
