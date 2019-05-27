import React from 'react';
import {Button, Popconfirm, Modal} from 'antd';
import AddThresholdRule from './addThresholdRule';
import {CLComponent} from 'Lib/component/index';
import CLList from 'Lib/component/CLlist.jsx';
import _ from 'lodash';
import {CL} from 'Lib/tools/index';
import {Interface} from 'Lib/config/index';

let {contentType, alert} = Interface;
let {getThresholdList, detailThreshold, delThreshold, getDatasourceList} = alert;

export default class ThresholdRule extends CLComponent {
    constructor(props) {
        super(props);

        this.state = {
            list: [],
            search: {},
            loading: false,
            pagination: {
                total: 0,
                page: 1,
                pageSize: 10
            },
            options: {},
            visible: false,
            dsList: []
        }
    }

    componentDidMount() {
        this.loadData();
        this.getDatasourceListMth();
    }


    loadData = () => {
        const settings = {
            contentType,
            method: getThresholdList.type,
            url: getThresholdList.url
        };

        CL.clReqwestPromise(settings)
            .then((res) => {
                if (res && res.data) {
                    this.setState({
                        list: res.data
                    });
                }
            });
    };

    getDatasourceListMth = () => {
        const settings = {
            contentType,
            method: getDatasourceList.type,
            url: getDatasourceList.url
        };

        CL.clReqwestPromise(settings)
            .then((res) => {
                if (res && res.data) {
                    this.setState({
                        dsList: res.data
                    });
                }
            });
    };

    getFormFields = (fields) => {
        const pagination = this.state.pagination;
        pagination.currentPage = 1;

        this.setState({search: fields, pagination});
        this.loadData(fields, pagination);
    };

    edit = (id) => {
        const _this = this;
        const settings = {
            contentType,
            method: detailThreshold.type,
            url: detailThreshold.url + id
        };

        CL.clReqwestPromise(settings)
            .then((res) => {
                if (res && res.data) {
                    _this.setState({
                        visible: true,
                        detail: res.data
                    })
                }
            });
    };

    del = (id) => {
        const _this = this;
        const settings = {
            contentType,
            method: delThreshold.type,
            url: delThreshold.url + id
        };

        CL.clReqwestPromise(settings)
            .then((res) => {
                if (res && res.data) {
                    _this.loadData();
                }
            });
    };

    create = () => {
        this.setState({
            visible: true
        });
    };

    handleOk = (e) => {
        this.setState({
            visible: false,
            detail: null
        });
        this.loadData();
    };

    handleCancel = (e) => {
        this.setState({
            visible: false,
            detail: null
        });
    };

    render() {
        let _this = this;

        const columns = [
            {
                title: "规则名称",
                dataIndex: "name",
                width: "12%"
            },

            {
                title: "数据源名称",
                dataIndex: "datasourceId",
                width: "12%",
                render(text, data) {
                    let ds = _.find(_this.state.dsList, item => {
                        return item.id == text;
                    })
                    return ds && ds.name;
                }
            },

            {
                title: "类型",
                dataIndex: "type",
                width: "10%"
            },

            {
                title: "逻辑符号",
                dataIndex: "logic",
                width: "10%"
            },

            {
                title: "阈值",
                dataIndex: "threshold",
                width: "10%"
            },

            {
                title: "表名",
                dataIndex: "tableName",
                width: "12%"
            },

            {
                title: "字段名",
                dataIndex: "fieldName",
                width: "12%"
            },

            {
                title: "报警周期",
                dataIndex: "minuteInterval",
                width: "10%"
            },

            {
                title: "操作",
                dataIndex: "resideCity",
                render(text, data) {
                    return [<Button type="primary" onClick={() => _this.edit(data.mapId)}>修改</Button>,
                        <Popconfirm placement="left" title="Are you sure to delete this rule?"
                                    onConfirm={() => _this.del(data.mapId)} okText="Yes" cancelText="No">
                            <Button style={{marginLeft: "10px"}} type="danger">删除</Button>
                        </Popconfirm>]
                }

            },
        ];

        const settings = {
            data: this.state.list,
            operation: [],
            columns: columns,
            getFields: this.getFormFields,
            pagination: false,
            tableLoading: this.state.loading,
            search: this.state.search,
            btn: [{
                title: "Create",
                type: "primary",
                fn: this.create
            }]
        };

        return (
            <div className="threshold-rule">
                <div style={{textAlign: "right", padding: "10px 10px"}}>
                    <Button onClick={this.create} type="primary">Create</Button>
                </div>
                <CLList settings={settings}/>
                <Modal
                    title="Create datasource"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    footer={null}
                >
                    <AddThresholdRule detail={this.state.detail} ok={this.handleOk}/>
                </Modal>
            </div>
        )
    }
}
