import React from 'react';
import {CLComponent} from 'Lib/component/index';
import CLList from 'Lib/component/CLlist.jsx';
import _ from 'lodash';
import {CL} from 'Lib/tools/index';
import {Interface} from 'Lib/config/index';
import moment from 'moment';
import {Button, Modal} from 'antd';
import tableexport from 'tableexport';
let TB;

let {contentType, getAppNameList, getBIAppLoginList} = Interface;

export default class LoginProcess extends CLComponent {
    constructor(props) {
        super(props);

        this.state = {
            list: [],
            search: {
                page: 1,
                pageSize: 10
            },
            loading: false,
            pagination: {
                total: 0,
                currentPage: 1,
                pageSize: 10
            },
            options: {
                flatformOpt: [],
            },
            showTableExport: false
        }
    }

    componentDidMount() {
        this.loadData();
        this.flatformOptMth();
    }

    flatformOptMth = () => {
        const _this = this;
        const settings = {
            contentType,
            method: getAppNameList.type,
            url: getAppNameList.url
        };

        function fn(res) {
            if (res && res.data) {
                let list = [], options = _this.state.options;
                _.each(res.data, (item) => {
                    list.push({
                        value: item.type,
                        name: item.typeName
                    })
                })
                options["flatformOpt"] = list;
                _this.setState({options})
            }
        }

        CL.clReqwest({settings, fn});
    };

    dealDate = (myDate, whetherStart) => {
        return myDate ? moment(myDate.format("YYYY-MM-DD") + (whetherStart ? " 00:00:00" : " 23:59:59")).unix() :
            (moment(moment().format("YYYY-MM-DD") + (whetherStart ? " 00:00:00" : " 23:59:59")).unix());
    };

    loadData = (search) => {
        search = search || this.state.search;
        const _this = this;
        const settings = {
            contentType,
            method: getBIAppLoginList.type,
            url: getBIAppLoginList.url,
            data: JSON.stringify({
                page: {
                    currentPage: search.page,
                    pageSize: search.pageSize
                },
                appVersion: search.appVersion,
                startDate: search.startDate && this.dealDate(search.startDate, true) * 1000,
                endDate: search.endDate && this.dealDate(search.endDate) * 1000
            })
        };

        this.setState({
            loading: true
        })

        function fn(res) {
            if (res && res.data) {

                var id = 0;
                const pagination = _this.state.pagination;
                pagination.total = res.data.totalCount;
                _this.setState({list: res.data.result && res.data.result.map(item => {
                    item.id = id;
                    id++;
                    return item;
                }), loading: false});
            }
        }

        CL.clReqwest({settings, fn});
    };

    getFormFields = (fields) => {
        let {search, pagination}  = this.state;
        pagination.currentPage = 1;
        search.page = 1;
        if (fields.dateRanger) {
            search.startDate = fields.dateRanger[0];
            search.endDate = fields.dateRanger[1];
        }
        search = _.assign(search, fields);

        this.setState({search, pagination});
        this.loadData(search);
    };

    pageChange = (e) => {
        let pagination = {
            currentPage: e.current,
            pageSize: e.pageSize,
            total: this.state.pagination.total
        };
        let search = this.state.search;
        search.page = e.current;
        search.pageSize = e.pageSize;

        this.setState({search, pagination});
        this.loadData(search);

    };

    onDownload = (e) => {
        this.setState({ showTableExport: true });
        setTimeout(() => {
            TB = tableexport(document.querySelector('#ex-table-login-process'), { formats: ['csv', 'txt', 'xlsx'] });
        }, 100);
    };

    getExportTableHead = () =>{
        return [
            "日期", "app激活数", "验证码登录数", "密码登录数", "点击登录数", "开始登录转化率", "无登录态登录成功数", "登录成功率", "登陆用户数",
            "登录且无在途订单用户数", "申请成功数", "登录申请转化率"
        ]
    };

    handleCancel = () => {
        this.setState({showTableExport: false});
        if (TB) {
            TB.remove();
        }
    };

    handleReset = () => {
        let {search} = this.state;
        search.page = 1;
        search.dateRanger = [];
        delete search.startDate;
        delete search.endDate;
        delete search.appVersion;

        this.setState({search});
    };

    render() {

        const operation = [{
            id: "dateRanger",
            type: "rangePicker",
            label: "时间",
            placeholder: "ranger",
        }, {
            id: "appVersion",
            type: "select",
            label: "平台",
            placeholder: "Please select",
            options: this.state.options["flatformOpt"]
        }];

        let th = this.getExportTableHead();

        const columns = [
            {
                title: "日期",
                dataIndex: "date",
                width: "8%",
                render(text, data) {
                    return moment(text).format("YYYY-MM-DD")
                }
            },
            {
                title: "app激活数",
                dataIndex: "activationNumber",
                width: "8%"
            },
            {
                title: "验证码登录数",
                dataIndex: "verificationCodeLogins",
                width: "8%"
            },
            {
                title: "密码登录数",
                dataIndex: "passwordLogins",
                width: "8%"
            },
            {
                title: "点击登录数",
                dataIndex: "clickMemberLogins",
                width: "8%"
            },
            {
                title: "开始登录转化率",
                dataIndex: "startLoginConversionRate",
                width: "8%",
                render(text, data) {
                    return Math.ceil(text * 10000) / 100 + '%';
                }
            },
            {
                title: "无登录态登录成功数",
                dataIndex: "successLogins",
                width: "8%"
            },
            {
                title: "登录成功率",
                dataIndex: "successLoginRate",
                width: "8%",
                render(text, data) {
                    return Math.ceil(text * 10000) / 100 + '%';
                }
            },
            {
                title: "登陆用户数",
                dataIndex: "loginUsers",
                width: "8%"
            },
            {
                title: "登录且无在途订单用户数",
                dataIndex: "loginUserNoApplications",
                width: "8%"
            },
            {
                title: "申请成功数",
                dataIndex: "loginUserCommitApplications",
                width: "8%"
            },
            {
                title: "登录申请转化率",
                dataIndex: "loginApplicationConversionRate",
                width: "8%",
                render(text, data) {
                    return Math.ceil(text * 10000) / 100 + '%';
                }
            }
        ];

        const settings = {
            data: this.state.list,
            operation: operation,
            columns: columns,
            getFields: this.getFormFields,
            pagination: this.state.pagination || {},
            pageChange: this.pageChange,
            tableLoading: this.state.loading,
            search: this.state.search,
            handleReset: this.handleReset,
            btn: [
                {
                    title: 'Download',
                    fn: this.onDownload,
                },
            ],
        };

        return (
            <div className="login-process">
                <CLList settings={settings}/>
                <Modal
                    className="te-modal"
                    title="Download"
                    closable
                    visible={this.state.showTableExport}
                    width="100%"
                    style={{ top: 0 }}
                    onCancel={this.handleCancel}
                    footer={[
                        <Button key="back" size="large" onClick={this.handleCancel}>Cancel</Button>,
                    ]}
                >
                    <table className="ex-table" id="ex-table-login-process">
                        <thead>
                        <tr>
                            {th.map((doc) => {
                                return (<th key={doc}>{doc}</th>);
                            })}
                        </tr>
                        </thead>
                        <tbody>
                        {
                            this.state.list && this.state.list.map((record, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{moment(record.date).format("YYYY-MM-DD")}</td>
                                        <td>{record.activationNumber}</td>
                                        <td>{record.verificationCodeLogins}</td>
                                        <td>{record.passwordLogins}</td>
                                        <td>{record.clickMemberLogins}</td>
                                        <td>{`${Math.ceil(record.startLoginConversionRate*10000)/100}%`}</td>
                                        <td>{record.successLogins}</td>
                                        <td>{`${Math.ceil(record.successLoginRate*10000)/100}%`}</td>
                                        <td>{record.loginUsers}</td>
                                        <td>{record.loginUserNoApplications}</td>
                                        <td>{record.loginUserCommitApplications}</td>
                                        <td>{`${Math.ceil(record.loginApplicationConversionRate*10000)/100}%`}</td>
                                    </tr>
                                );
                            })
                        }
                        </tbody>
                    </table>
                </Modal>
            </div>
        )
    }
}
