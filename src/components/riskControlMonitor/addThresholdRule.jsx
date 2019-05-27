import React from 'react';
import {CLComponent, CLForm} from 'Lib/component/index';
import {CL} from 'Lib/tools/index';
import _ from 'lodash';
import {Interface} from 'Lib/config/index';

let {contentType, alert} = Interface;
let {addThreshold, editThreshold, getDatasourceList} = alert;

export default class AddThresholdRule extends CLComponent {
    constructor(props) {
        super(props);

        this.state = {
            data: {},
            loading: false,
            options: {
                datasourceIdOpt: [],
                typeOpt: [],
                logicOpt: []
            }
        }
    }

    componentWillMount() {
        this.datasourceIdOptMth();
        this.typeOptMth();
        this.logicOptMth();
    }

    componentDidMount() {
        if (this.props.detail) {
            setTimeout(() => {
                this.form.setFieldsValue(this.setColumns(this.props.detail));
            }, 500);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.detail && nextProps.detail !== this.props.detail) {
            setTimeout(() => {
                this.form.setFieldsValue(this.setColumns(nextProps.detail));
            }, 500);
        }
    }

    setColumns = (data) => {
        let {datasourceId, fieldName, mailRecipient, minuteInterval, name, tableName, template, logic, threshold, type, timeField} = data;

        return {
            datasourceId: datasourceId + "",
            fieldName,
            mailRecipient,
            minuteInterval,
            name,
            tableName,
            template,
            logic,
            threshold,
            type,
            timeField
        }
    };

    datasourceIdOptMth = () => {
        let options = this.state.options;
        const _this = this;

        const settings = {
            contentType,
            method: getDatasourceList.type,
            url: getDatasourceList.url
        };

        CL.clReqwestPromise(settings)
            .then((res) => {
                if (res && res.data) {
                    options["datasourceIdOpt"] = res.data.map((item) => {
                        return {
                            name: item.name,
                            value: item.id
                        }
                    });
                    _this.setState({options});
                }
            });
    };
    typeOptMth = () => {
        let options = this.state.options;
        options["typeOpt"] = [{
            name: "single",
            value: "single"
        },
            //     {
            //     name: "avg",
            //     value: "avg"
            // }, {
            //     name: "max",
            //     value: "max"
            // }, {
            //     name: "min",
            //     value: "min"
            // }
        ];
        this.setState({options})
    };

    logicOptMth = () => {
        let options = this.state.options;
        options["logicOpt"] = [{
            name: ">",
            value: ">"
        }, {
            name: "<",
            value: "<"
        }, {
            name: ">=",
            value: ">="
        }, {
            name: "<=",
            value: "<="
        }, {
            name: "=",
            value: "="
        }, {
            name: "!=",
            value: "!="
        }];
        this.setState({options})
    };

    getFields = (fields) => {
        //　新增
        if (!this.props.detail) {
            const _this = this;
            const settings = {
                contentType,
                method: addThreshold.type,
                url: addThreshold.url,
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
            const _this = this;
            const settings = {
                contentType,
                method: editThreshold.type,
                url: editThreshold.url + this.props.detail.mapId,
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
                label: "规则名称",
                placeholder: "limit 30 charactors",
                rules: [{required: true, message: "Please enter rule name!"},
                    {validator: (rule, value, callback) => this.limitLengthValid(rule, value, callback, 30)},
                ]
            }, {
                id: "datasourceId",
                type: "select",
                label: "数据源",
                placeholder: "Please select",
                options: this.state.options["datasourceIdOpt"],
                rules: [{required: true, message: "Please select datasource!"},

                ]
            }, {
                id: "type",
                type: "select",
                label: "类型",
                placeholder: "Please select",
                options: this.state.options["typeOpt"],
                rules: [{required: true, message: "Please select type!"},

                ]
            }, {
                id: "logic",
                type: "select",
                label: "逻辑符号",
                placeholder: "Please select",
                options: this.state.options["logicOpt"],
                rules: [{required: true, message: "Please select logic!"},

                ]
            }, {
                id: "threshold",
                type: "number",
                label: "阈值",
                placeholder: "number",
                rules: [{required: true, message: "please enter"}]
            }, {
                id: "tableName",
                type: "text",
                label: "表名",
                placeholder: "limit 30 charactors",
                rules: [{required: true, message: "Please enter table name!"},
                    {validator: (rule, value, callback) => this.limitLengthValid(rule, value, callback, 30)},
                ]
            }, {
                id: "fieldName",
                type: "text",
                label: "字段名",
                placeholder: "limit 30 charactors",
                rules: [{required: true, message: "Please enter field name!"},
                    {validator: (rule, value, callback) => this.limitLengthValid(rule, value, callback, 30)},
                ]
            }, {
                id: "minuteInterval",
                type: "number",
                label: "报警周期（分）",
                placeholder: "number",
                rules: [{required: true, message: "please enter"}]
            }, {
                id: "timeField",
                type: "text",
                label: "报警时间字段",
                placeholder: "limit 30 charactors",
                rules: [{required: true, message: "Please enter time field!"},
                    {validator: (rule, value, callback) => this.limitLengthValid(rule, value, callback, 30)},
                ]
            }, {
                id: "template",
                type: "textarea",
                label: "报警模板",
                placeholder: "Please enter template!",
                rules: [{
                    required: true, message: "数据源名称：${datasourceName}，表名：${tableName}，字段名：${fieldName}，逻辑符号：${logic}，" +
                    "阈值：${threshold}，异常发现时间：${abnormalTime}"
                }]
            }, {
                id: "mailRecipient",
                type: "text",
                label: "邮件接收者",
                placeholder: "please enter mail recipient",
                rules: [{
                    required: true, message: "please enter"
                }]
            },
        ];

        const settings = {
            options: options,
            getFields: this.getFields,
            values: this.state.data,
            getForm: this.getForm
        };

        return (
            <div className="add-threshold-rulei">
                <CLForm settings={settings}/>
            </div>
        )
    }
}
