import React from 'react';
import {CLComponent, CLForm, CLlist} from 'Components/index';
import {Interface} from 'Lib/config/index';
import {Button, Row, Col, Modal, message} from 'antd';
import {CL} from 'Lib/tools/index';

const {
    contentType, getCompanyList, addCompany, editCompany
} = Interface;

export default class CompanyManagement extends CLComponent {

    constructor(props) {
        super(props);

        const _this = this;

        this.state = {
            tableLoading: false,
            pagination: {
                total: 0,
                pageSize: 10,
                currentPage: 1,
            },
            visible: false,
            list: [],
            isEdit: false,
            data: {},
            columns: [{
                title: 'Company',
                dataIndex: 'name',
                width: '15%',
            }, {
                title: 'Collector Amount',
                dataIndex: 'collectorAmount',
                width: '15%',
            }, {
                title: 'Status',
                width: '15%',
                render(text, data) {
                    return data.status ? "Y" : "N";
                }
            }, {
                title: 'Create by/Update by',
                width: '20%',
                render(text, data) {
                    return (data.createByName || '—') + ' / ' + (data.updateByName || '—');
                }
            }, {
                title: 'Create time/Update time',
                width: '20%',
                render(text, data) {
                    return (data.createTime || '—') + ' / ' + (data.updateTime || '—');
                }
            }, {
                title: 'Operate',
                width: '15%',
                render(text, data) {
                    return <Button type="default" onClick={() => _this.openEditWin(data.id, data)}>Edit</Button>
                }
            }]
        }
    }

    componentWillMount() {
        this.getList(this.state.pagination.currentPage, this.state.pagination.pageSize);
    }

    getList = (currentPage, pageSize) => {
        const settings = {
            contentType,
            method: getCompanyList.type,
            url: getCompanyList.url,
            data: JSON.stringify({
                pageRequestDto: {
                    currentPage: currentPage,
                    limit: pageSize,
                    order: 'desc',
                    sort: ['id']
                }
            })
        };

        return CL.clReqwestPromise(settings)
            .then((res) => {
                if (res.status === "SUCCESS") {
                    let pagination = this.state.pagination;
                    pagination.total = res.response.total;
                    pagination.limit = res.response.limit;
                    this.setState({
                        list: res.response.rows,
                        pagination
                    })

                } else {
                    message.error(res.msg);
                }
            });

    };

    openEditWin = (id, data) => {
        const _this = this;
        this.setState({visible: true, isEdit: true, id, name: data.name, data});
    };

    // 获取搜索项
    getFormFields(fields) {
        const search = {};
        _.map(fields, (doc, index) => {
            if (doc) {
                search[index] = doc;
            }
        });

        const pagination = this.state.pagination;
        pagination.currentPage = 1;

        this.setState({search: search, pagination: pagination});
        this.loadData2(search, pagination, this.state.sorter);
    }

    openCreateCompanyWin = () => {
        this.setState({visible: true, isEdit: false});
    };

    pageChange = (e, filters, sorter) => {
        const pagination = {
            total: e.total,
            pageSize: e.pageSize,
            currentPage: e.current
        };

        this.setState({
            pagination
        });

        this.getList(e.current, e.pageSize);
    };

    handleCancel = () => {
        this.setState({visible: false});
    };

    submit = () => {
        const _this = this;
        this.form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }

            this.getFields(values);
        });

    };

    getForm = (form) => {
        this.form = form;
    };

    getFields = (fields) => {
        const _this = this;
        let url = {}, msg = "";

        if (!this.state.isEdit) {
            url = addCompany;
        } else {
            fields.id = this.state.id;
            // 当name没有改变时去掉name字段，避免后端查重
            fields.name === this.state.name && delete fields.name;
            url = editCompany;
        }
        const settings = {
            contentType,
            method: url.type,
            url: url.url,
            data: JSON.stringify(fields)
        };

        return CL.clReqwestPromise(settings)
            .then((res) => {
                if (res.code === 'SY0105') {
                    message.error(res.msg);
                } else if (res.status === "SUCCESS") {
                    _this.getList(this.state.pagination.currentPage, this.state.pagination.pageSize);
                    message.success("success");

                    this.setState({visible: false})
                }
            });
    };

    render() {
        let settings = {
            data: this.state.list,
            columns: this.state.columns,
            operation: null,
            pagination: this.state.pagination,
            pageChange: this.pageChange,
            tableLoading: this.state.tableLoading
        }

        return (<div className="company-management">
            <Row>
                <Col offset={15} className="title">
                    <Button type="primary" onClick={this.openCreateCompanyWin}>
                        Create Company
                    </Button>
                </Col>
            </Row>
            <CLlist settings={settings}/>
            <Modal
                title="Create Company"
                visible={this.state.visible}
                onOk={this.submit}
                onCancel={this.handleCancel}
                cancelText="Cancel"
                okText="Save">
                <CreateCompany handleCancel={this.handleCancel} getForm={this.getForm}
                               isEdit={this.state.isEdit} data={this.state.data}/>
            </Modal>
        </div>)
    }
}


class CreateCompany extends CLComponent {

    constructor(props) {
        super(props);

        this.state = {
            statusList: [{
                name: "Y",
                value: "1"
            }, {
                name: "N",
                value: "0"
            }],
            loading: false
        }
    }

    componentDidMount() {
        this.setFields();

    }

    componentDidUpdate() {
        this.setFields();
    }

    limitCharacter = (rule, value, callback, number) => {
        if (value && value.length > number) {
            callback(`Limit ${number} characters`);
        } else {
            callback();
        }
    };

    getForm = (form) => {
        this.form = form;
        this.props.getForm(form);
    };

    setFields = () => {
        if (this.props.isEdit) {
            let data = this.props.data;
            let setting = {
                account: data.account,
                synopsis: data.synopsis,
                status: data.status + '',
                name: data.name
            };
            this.form.setFieldsValue(setting);
        } else {
            this.form.resetFields();
        }
    };

    render() {
        const options = [
            {
                id: 'name',
                type: 'text',
                label: 'Company',
                placeholder: 'Limit 30 characters',
                rules: [{required: true, message: 'Please input company!'},
                    {validator: (rule, value, callback) => this.limitCharacter(rule, value, callback, 30)}]
            },
            {
                id: 'synopsis',
                type: 'textarea',
                label: 'Notes',
                placeholder: 'Limit 100 characters',
                rules: [{validator: (rule, value, callback) => this.limitCharacter(rule, value, callback, 100)}]
            },
            {
                id: 'status',
                type: 'select',
                label: 'Status',
                placeholder: 'Please select',
                options: this.state.statusList,
                rules: [{required: true, message: 'Please select status!'}]
            },
            {
                type: 'words',
                content: "N status means they can't sign in Back-end"
            },
            {
                id: 'account',
                type: 'text',
                label: 'Initial Account',
                placeholder: 'Limit 30 characters',
                disabled: this.props.isEdit,
                rules: [{required: !this.state.isEdit, message: 'Please select initial account!'},
                    {validator: (rule, value, callback) => this.limitCharacter(rule, value, callback, 30)}]
            },
            {
                id: 'password',
                type: 'text',
                label: 'Initial Password',
                disabled: true,
                initialValue: '123456'
            }
        ];

        const settings = {
            options: options,
            getFields: this.getFields,
            values: {},
            disableDefaultBtn: true,
            formItemLayout: {
                labelCol: {
                    xs: {span: 24},
                    sm: {span: 6},
                },
                wrapperCol: {
                    xs: {span: 24},
                    sm: {span: 16},
                },
            },
            getForm: this.getForm
        };

        return (<div className="create-company-modal">
            <CLForm settings={settings}/>
        </div>)
    }
}