import React from 'react';
import {Button, Modal, Popconfirm} from 'antd';
import AddDatasource from './addDatasource';
import {CLComponent} from 'Lib/component/index';
import CLList from 'Lib/component/CLlist.jsx';
import _ from 'lodash';
import {CL} from 'Lib/tools/index';
import {Interface} from 'Lib/config/index';

let {contentType, alert} = Interface;
let {getDatasourceList, delDatasource, detailDatasource} = alert;

export default class Datasource extends CLComponent {
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
            visible: false
        }
    }

    componentDidMount() {
        this.loadData();
    }


    loadData = () => {
        const settings = {
            contentType,
            method: getDatasourceList.type,
            url: getDatasourceList.url
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
            method: detailDatasource.type,
            url: detailDatasource.url + id
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
            method: delDatasource.type,
            url: delDatasource.url + id
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
                title: "名称",
                dataIndex: "name",
                width: "21%"
            },
            {
                title: "IP",
                dataIndex: "ip",
                width: "21%"
            },
            {
                title: "端口",
                dataIndex: "port",
                width: "21%"
            },
            {
                title: "数据库名",
                dataIndex: "dbName",
                width: "21%"
            },
            {
                title: "操作",
                dataIndex: "resideCity",
                render(text, data) {
                    return [<Button type="primary" onClick={() => _this.edit(data.id)}>修改</Button>,
                        <Popconfirm placement="left" title="Are you sure to delete this datasource?"
                                    onConfirm={() => _this.del(data.id)} okText="Yes" cancelText="No">
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
            search: this.state.search
        };

        return (
            <div className="datasource">
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
                    <AddDatasource detail={this.state.detail} ok={this.handleOk}/>
                </Modal>
            </div>
        )
    }
}
