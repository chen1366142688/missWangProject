import React from 'react';
import {CLComponent} from 'Lib/component/index';
import CLList from 'Lib/component/CLlist.jsx';
import _ from 'lodash';
import {CL} from 'Lib/tools/index';
import {Interface} from 'Lib/config/index';
import moment from 'moment';
import {Button, Modal} from 'antd';

let {contentType, getAppNameList, getBIAppLoanList} = Interface;
import tableexport from 'tableexport';

let TB;


export default class LoanProcess extends CLComponent {
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
                page: 1,
                pageSize: 10
            },
            options: {
                flatformOpt: [],
                userOpt: [],
            },
            showTableExport: false
        }
    }

    componentDidMount() {
        this.loadData();
        this.flatformOptMth();
        this.userOptMth();
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
    userOptMth = () => {
        let options = this.state.options;
        options["userOpt"] = [{
            name: "新用户",
            value: '0'
        }, {
            name: "老用户",
            value: '1'
        }];
        this.setState({options});
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
            method: getBIAppLoanList.type,
            url: getBIAppLoanList.url,
            data: JSON.stringify({
                page: search.page,
                pageSize: search.pageSize,
                version: search.version,
                isOlder: search.isOld,
                startTime: search.startDate && this.dealDate(search.startDate, true) * 1000,
                endTime: search.endDate && this.dealDate(search.endDate) * 1000
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
                _this.setState({list: res.data.result.map(item => {
                    item.id = id;
                    id++;
                    return item;
                }), loading: false});
            }
        }

        CL.clReqwest({settings, fn});
    };

    onDownload = (e) => {
        this.setState({showTableExport: true});
        setTimeout(() => {
            TB = tableexport(document.querySelector('#ex-table-loan-process'), {formats: ['csv', 'txt', 'xlsx']});
        }, 100);
    };

    handleCancel = () => {
        this.setState({showTableExport: false});
        if (TB) {
            TB.remove();
        }
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

    getExportTableHead = () =>{
        return [
            "日期", "申请单数", "通过单数", "通过率", "放款单数", "放款成功率", "放款率", "放款金额", "件均(php)",
            "7天产品放款数", "7天产品放款率", "7天产品放款数占比", "14天产品放款数", "14天产品放款率", "14天产品放款数占比", "平均借款期限(天)", "审核完成度"
        ]
    };

    handleReset = () => {
        let {search} = this.state;
        search.page = 1;
        search.dateRanger = [];
        delete search.startDate;
        delete search.endDate;
        delete search.version;
        delete search.isOld;

        this.setState({search});
    };

    render() {
        let th = this.getExportTableHead();

        const operation = [
            {
                id: "dateRanger",
                type: "rangePicker",
                label: "时间",
                placeholder: "ranger",

            },

            {
                id: "version",
                type: "select",
                label: "平台",
                placeholder: "Please select",
                options: this.state.options["flatformOpt"]
            },

            {
                id: "isOld",
                type: "select",
                label: "用户群体",
                placeholder: "Please select",
                options: this.state.options["userOpt"]
            },
        ];

        const columns = [
            {
                title: "日期",
                dataIndex: "dateStr",
                width: "6%",
                render(text, data){
                    return moment(text).format("YYYY-MM-DD")
                }
            },

            {
                title: "申请单数",
                dataIndex: "applyNumOfOrder",
                width: "6%"
            },

            {
                title: "通过单数",
                dataIndex: "applyPassNumOfOrder",
                width: "6%"
            },

            {
                title: "通过率",
                dataIndex: "applyPassRate",
                width: "6%",
                render(text, data){
                    return `${Math.round(text*10000)/100}%`
                }
            },

            {
                title: "放款单数",
                dataIndex: "loanNumOfOrder",
                width: "6%"
            },

            {
                title: "放款成功率",
                dataIndex: "loanSuccessRate",
                width: "6%",
                render(text, data){
                    return `${Math.round(text*10000)/100}%`
                }
            },

            {
                title: "放款率",
                dataIndex: "loanRate",
                width: "6%",
                render(text, data){
                    return `${Math.round(text*10000)/100}%`
                }
            },

            {
                title: "放款金额",
                dataIndex: "loanAmount",
                width: "6%"
            },

            {
                title: "件均(php)",
                dataIndex: "averageAmount",
                width: "6%",
                render(text, data){
                    return `${Math.round(text*100)/100}`
                }
            },

            {
                title: "7天产品放款数",
                dataIndex: "loan7DaysNumOfOrder",
                width: "6%"
            },

            {
                title: "7天产品放款率",
                dataIndex: "loan7DaysRate",
                width: "6%",
                render(text, data){
                    return `${Math.round(text*10000)/100}%`
                }
            },

            {
                title: "7天产品放款数占比",
                dataIndex: "loan7DaysProportion",
                width: "6%",
                render(text, data){
                    return `${Math.round(text*10000)/100}%`
                }
            },

            {
                title: "14天产品放款数",
                dataIndex: "loan14DaysNumOfOrder",
                width: "6%"
            },

            {
                title: "14天产品放款率",
                dataIndex: "loan14DaysRate",
                width: "6%",
                render(text, data){
                    return `${Math.round(text*10000)/100}%`
                }
            },

            {
                title: "14天产品放款数占比",
                dataIndex: "loan14DaysProportion",
                width: "6%",
                render(text, data){
                    return `${Math.round(text*10000)/100}%`
                }
            },

            {
                title: "平均借款期限(天)",
                dataIndex: "averageLoanLimitTime",
                width: "6%",
                render(text, data){
                    return `${Math.round(text*100)/100}`
                }
            },

            {
                title: "审核完成度",
                dataIndex: "auditComplateRate",
                width: "6%",
                render(text, data){
                    return `${Math.round(text*10000)/100}%`
                }
            },
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
            <div className="loan-process">
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
                    <table className="ex-table" id="ex-table-loan-process">
                        <thead>
                        <tr>
                            {th.map((doc) => {
                                return (<th key={doc}>{doc}</th>);
                            })}
                        </tr>
                        </thead>
                        <tbody>
                        {
                            this.state.list.map((record, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{record.dateStr}</td>
                                        <td>{record.applyNumOfOrder}</td>
                                        <td>{record.applyPassNumOfOrder}</td>
                                        <td>{`${Math.ceil(record.applyPassRate*10000)/100}%`}</td>
                                        <td>{record.loanNumOfOrder}</td>
                                        <td>{`${Math.ceil(record.loanSuccessRate*10000)/100}%`}</td>
                                        <td>{`${Math.ceil(record.loanRate*10000)/100}%`}</td>
                                        <td>{record.loanAmount}</td>
                                        <td>{Math.ceil(record.averageAmount*100)/100}</td>
                                        <td>{record.loan7DaysNumOfOrder}</td>
                                        <td>{`${Math.ceil(record.loan7DaysRate*10000)/100}%`}</td>
                                        <td>{`${Math.ceil(record.loan7DaysProportion*10000)/100}%`}</td>
                                        <td>{record.loan14DaysNumOfOrder}</td>
                                        <td>{`${Math.ceil(record.loan14DaysRate*10000)/100}%`}</td>
                                        <td>{`${Math.ceil(record.loan14DaysProportion*10000)/100}%`}</td>
                                        <td>{record.averageLoanLimitTime}</td>
                                        <td>{`${Math.ceil(record.auditComplateRate*10000)/100}%`}</td>
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