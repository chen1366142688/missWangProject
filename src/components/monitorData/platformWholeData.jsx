import React from 'react';
import {CLComponent} from 'Lib/component/index';
import {CL} from 'Lib/tools/index';
import {Interface} from 'Lib/config/index';
import {Table, DatePicker, Button, message, Select, Modal} from 'antd';
import moment from 'moment';

const {Column, ColumnGroup} = Table;
const {RangePicker, MonthPicker} = DatePicker;
let {contentType, getPlatformWholeMonitorDataListOne, getPlatformWholeMonitorDataListTwo, getPlatformWholeMonitorDataListThree, getAppNameList} = Interface;
import tableexport from 'tableexport';

let TB;

export default class PlatformWholeData extends CLComponent {
    constructor(props) {
        super(props);

        this.state = {
            list: [],
            search: {},
            options: {
                versionOpt: [{
                    key: "0",
                    value: "Cashlending"
                }, {
                    key: "1",
                    value: "Loanit"
                }, {
                    key: "2",
                    value: "SwakCash"
                }],
            },
            startDate: null,
            endDate: null,
            startDateStr: moment(),
            endDateStr: moment(),
            hbStartDateStr: moment().add(-1, 'd'),
            hbEndDateStr: moment().add(-1, 'd'),
            loading: false,
            appList: [],
            app: "",
            month: [],
            showTableExport: false
        }
    }

    componentDidMount() {
        this.loadData();
        this.versionOptMth();
    }

    versionOptMth = () => {
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
                        key: item.type + "",
                        value: item.typeName
                    })
                })
                options["versionOpt"] = list;
                _this.setState({options})
            }
        }

        CL.clReqwest({settings, fn});
    };

    getFormFields = (fields) => {
        const pagination = this.state.pagination;
        pagination.currentPage = 1;

        this.setState({search: fields, pagination});
        this.loadData(fields, pagination);
    };

    pageChange = (e) => {
        let pagination = {
            currentPage: e.current,
            pageSize: e.pageSize,
            total: this.state.pagination.total
        };

        this.setState({pagination});
        this.loadData(this.state.search, pagination);

    };

    onDateChange = (e) => {
        this.setState({
            month: null,
            startDate: e[0],
            endDate: e[1],
            startDateStr: e[0],
            endDateStr: e[1],
            hbStartDateStr: moment(e[0]).add(-1, "d"),
            hbEndDateStr: moment(e[1]).add(-1, "d")
        })
    };

    dealDate = (myDate, whetherStart) => {
        return myDate ? moment(myDate.format("YYYY-MM-DD") + (whetherStart ? " 00:00:00" : " 23:59:59")).unix() :
            (moment(moment().format("YYYY-MM-DD") + (whetherStart ? " 00:00:00" : " 23:59:59")).unix());
    };

    loadData = () => {
        let {startDateStr, endDateStr, hbStartDateStr, hbEndDateStr, version} = this.state;

        startDateStr = this.dealDate(startDateStr, true);
        endDateStr = this.dealDate(endDateStr);
        hbStartDateStr = this.dealDate(hbStartDateStr, true);
        hbEndDateStr = this.dealDate(hbEndDateStr);

        const settings = {
            contentType,
            method: getPlatformWholeMonitorDataListOne.type,
            url: getPlatformWholeMonitorDataListOne.url,
            data: JSON.stringify({
                startDate: startDateStr * 1000,
                endDate: endDateStr * 1000,
                version: version || undefined
            }),
        };

        //请求环比数据
        const settingsHB = {
            contentType,
            method: getPlatformWholeMonitorDataListOne.type,
            url: getPlatformWholeMonitorDataListOne.url,
            data: JSON.stringify({
                startDate: hbStartDateStr * 1000,
                endDate: hbEndDateStr * 1000,
                version: version || undefined
            }),
        };

        this.setState({
            loading: true
        });

        Promise.all([CL.clReqwestPromise(settings),
            CL.clReqwestPromise(settingsHB)])
            .then((res) => {
                if (res[0].code == 200 && res[0] && res[0].data) {
                    let fields = ["dateOfData", "registeredNumOfPeople", "loginNumOfPerson", "applyNumOfOrder",
                        "applyAverageNumOfOrder", "loanNumOfOrder", "loanAmount", "loanAverageAmount"];

                    if (res[1].data) {
                        let list = _.map(res[0].data, item => _.pick(item, fields));
                        _.each(list, item => {
                            let hb = _.find(res[1].data, itr => {
                                return itr.dateOfData == moment(item.dateOfData).add(-1, 'd').format('YYYY-MM-DD');
                            });

                            _.each(hb, (value, key) => {
                                if (typeof value == "number" && _.findIndex(fields, item => {
                                        return item === key
                                    }) > -1) {
                                    item[key + "Rate"] = Math.round((item[key] - value) / (value || 1) * 10000) / 100;
                                }
                            })
                        })
                        this.setState({list})
                    }

                    this.DataListTwo(startDateStr, endDateStr, hbStartDateStr, hbEndDateStr, version);
                } else {
                    message.error("获取列表失败！");
                }
            })
    };

    DataListTwo = (startDateStr, endDateStr, hbStartDateStr, hbEndDateStr, version) => {
        const settings = {
            contentType,
            method: getPlatformWholeMonitorDataListTwo.type,
            url: getPlatformWholeMonitorDataListTwo.url,
            data: JSON.stringify({
                startDate: startDateStr * 1000,
                endDate: endDateStr * 1000,
                version: version || undefined
            }),
        };
        //请求环比数据
        const settingsHB = {
            contentType,
            method: getPlatformWholeMonitorDataListTwo.type,
            url: getPlatformWholeMonitorDataListTwo.url,
            data: JSON.stringify({
                startDate: hbStartDateStr * 1000,
                endDate: hbEndDateStr * 1000,
                version: version || undefined
            }),
        };

        Promise.all([CL.clReqwestPromise(settings),
            CL.clReqwestPromise(settingsHB)])
            .then((res) => {
                if (res[0].code == 200 && res[0] && res[0].data) {
                    let list = this.state.list;
                    if (res[1].data) {
                        let fields = ["applyNumOfPerson", "loanNumOfPerson", "applyLoanRate", "invitedNumOfPerson",
                            "invitedRegisterNumOfPerson", "invitedFirstLoanNumOfApply", "inviteUserFirstLoanNum",
                            "inviteUserFirstLoanPassRate", "numOfCustomerServiceConsultants", "artificialPendingNumOfOrderNum",
                            "appUploadProblemFeedbackNum"];

                        _.each(res[0].data, item => {
                            let old = _.find(list, child => {
                                return child.dateOfData === item.dateOfData;
                            });

                            let hb = _.find(res[1].data, itr => {
                                return itr.dateOfData === moment(item.dateOfData).add(-1, 'd').format('YYYY-MM-DD');
                            });

                            _.each(item, (value, key) => {
                                if (_.findIndex(fields, item => {
                                        return item === key
                                    }) > -1)
                                    old[key] = value;
                            });

                            _.each(hb, (value, key) => {
                                if (typeof value == "number" && _.findIndex(fields, item => {
                                        return item === key
                                    }) > -1) {
                                    old[key + "Rate"] = Math.round((item[key] - value) / (value || 1) * 10000) / 100;
                                }
                            });
                        })
                    }
                    this.setState({
                        list
                    })

                    this.DataListThree(startDateStr, endDateStr, hbStartDateStr, hbEndDateStr, version);
                } else {
                    message.error("获取列表失败！");
                }
            })
    };

    DataListThree = (startDateStr, endDateStr, hbStartDateStr, hbEndDateStr, version) => {
        const settings = {
            contentType,
            method: getPlatformWholeMonitorDataListThree.type,
            url: getPlatformWholeMonitorDataListThree.url,
            data: JSON.stringify({
                startDate: startDateStr * 1000,
                endDate: endDateStr * 1000,
                version: version || undefined
            }),
        };
        //请求环比数据
        const settingsHB = {
            contentType,
            method: getPlatformWholeMonitorDataListThree.type,
            url: getPlatformWholeMonitorDataListThree.url,
            data: JSON.stringify({
                startDate: hbStartDateStr * 1000,
                endDate: hbEndDateStr * 1000,
                version: version || undefined
            }),
        };

        Promise.all([CL.clReqwestPromise(settings),
            CL.clReqwestPromise(settingsHB)])
            .then((res) => {
                if (res[0].code == 200 && res[0] && res[0].data) {
                    let list = this.state.list;
                    if (res[1].data) {
                        let fields = ["firstLoanApplyNumOfOrder", "firstLoanNumOfOrder", "firstLoanAmount", "firstLoanAverageAmount",
                            "expireNumOfOrder", "borrow7DaysNumOfOrder", "borrow14DaysNumOfOrder", "naturalOverdueNumOfOrder",
                            "naturalOverdueRate", "borrow7DaysNaturalOverdueNumOfOrder", "borrow14DaysNaturalOverdueNumOfOrder",
                            "borrow7DaysNaturalOverdueRate", "borrow14DaysNaturalOverdueRate", "firstLoanNumOrOrder",
                            "firstLoanBorrow7DaysNumOfOrder", "firstLoanBorrow14DaysNumOfOrder", "firstLoanOverdueNumOfOrder",
                            "firstLoanOverdueNaturalRate", "firstLoan7DaysOverdueNaturalRate", "firstLoan14DaysOverdueNaturalRate",
                            "overdueReturnNumOfOrder", "overdueReturnRate", "borrow7DaysOverdueReturnRate", "borrow14DaysOverdueReturnRate"];

                        _.each(res[0].data, item => {
                            let old = _.find(list, child => {
                                return child.dateOfData === item.dateOfData;
                            });

                            let hb = _.find(res[1].data, itr => {
                                return itr.dateOfData === moment(item.dateOfData).add(-1, 'd').format('YYYY-MM-DD');
                            });

                            _.each(item, (value, key) => {
                                if (_.findIndex(fields, item => {
                                        return item === key
                                    }) > -1)
                                    old[key] = value;
                            });

                            _.each(hb, (value, key) => {
                                if (typeof value == "number" && _.findIndex(fields, item => {
                                        return item === key
                                    }) > -1) {
                                    old[key + "Rate"] = Math.round((item[key] - value) / (value || 1) * 10000) / 100;
                                }
                            });
                        })
                    }

                    this.setState({
                        list,
                        loading: false
                    })
                } else {
                    message.error("获取列表失败！");
                }
            })

    };

    onClear = () => {
        this.setState({
            startDate: null,
            endDate: null,
            month: null,
            version: null
        })
    };

    handleMonth = (e) => {
        let start = moment(moment(e[0]).format('YYYY-MM-01 00:00:00')),
            end = moment(e[1].endOf('month').format("YYYY-MM-DD 23:59:59"));
        this.setState({
            startDate: null,
            endDate: null,
            month: e,
            startDateStr: start,
            endDateStr: end,
            hbStartDateStr: moment(start).add(-1, "d"),
            hbEndDateStr: moment(end).add(-1, "d")
        })
    };

    onAppChange = (e) => {
        this.setState({
            version: e
        })
    };

    onDownload = (e) => {
        this.setState({showTableExport: true});
        setTimeout(() => {
            TB = tableexport(document.querySelector('#ex-table'), {formats: ['csv', 'txt', 'xlsx']});
        }, 100);
    };


    getExportTableHead = () => {
        return [
            "日期", "注册人数", "开始申请人数", "登录人数", "申请单数", "申请件均", "放款单数", "放款金额", "放款件均", "申请人数",
            "放款人数", "申请放款率", "申请单数", "放款单数", "放款金额", "放款件均", "到期单数", "借7天单数", "借14天单数", "自然逾期单数", "自然逾期率",
            "借7天自然逾期数", "借14天自然逾期数", "借7天自然逾期率", "借14天自然逾期率", "首贷单数", "首贷借7天单数", "首贷借14天单数", "首贷逾期单数",
            "首贷自然逾期率", "首贷借7天自然逾期率", "首贷借14天自然逾期率", "逾期还款单数", "逾期还款率", "借7天逾期还款率", "借14天逾期还款率", "邀请人数",
            "被邀请注册用户数", "被邀请用户首贷申请数", "被邀请用户首贷放款数", "被邀请用户首贷通过率", "客服咨询人数", "人工待审订单量", "app系统上传问题反馈人数"
        ]
    };

    handleCancel = () => {
        this.setState({showTableExport: false});
        if (TB) {
            TB.remove();
        }
    };

    render() {
        let {startDateStr, endDateStr} = this.state;
        startDateStr = startDateStr ? startDateStr.format("YYYYMMDD") : new moment().format("YYYYMMDD");
        endDateStr = endDateStr ? endDateStr.format("YYYYMMDD") : new moment().format("YYYYMMDD");

        let th = this.getExportTableHead();

        return (
            <div className="daily-monitor">
                <div className="select-panel">
                    <p>
                        <span>日期：</span>
                        <RangePicker
                            onChange={this.onDateChange}
                            value={[this.state.startDate, this.state.endDate]}
                        />
                        <span style={{marginLeft: "50px"}}>月筛选：</span>
                        <RangePicker
                            placeholder={['Start month', 'End month']}
                            format="YYYY-MM"
                            mode={['month', 'month']}
                            value={this.state.month}
                            onPanelChange={this.handleMonth}
                        />
                        <span style={{marginLeft: "50px"}}>App：</span>
                        <Select placeholder="Please select"
                                onChange={this.onAppChange}
                                value={this.state.version}
                                style={{width: 200}}>
                            {_.map(this.state.options.versionOpt, app => {
                                return <Option value={app.key}>{app.value}</Option>
                            })}
                        </Select>
                    </p>
                    <p className="daily-monitor-footer">
                        <Button type="primary" onClick={this.loadData} loading={this.state.loading}>Search</Button>
                        <Button type="default" onClick={this.onClear}>Clear</Button>
                        <Button type="default" onClick={this.onDownload}>Download</Button>
                    </p>
                </div>
                <p className="info-data">{`日期：${startDateStr} - ${endDateStr}
                 / 环比日期：${this.state.hbStartDateStr.format('YYYYMMDD')} - ${this.state.hbEndDateStr.format('YYYYMMDD')}`}</p>
                <Table dataSource={this.state.list}
                       bordered
                       scroll={{x: 6000, y: 450}}
                       pagination={false}>
                    <ColumnGroup title="App数据">
                        <Column
                            title="日期"
                            dataIndex="dateOfData"
                            key="dateOfData"
                            width={130}
                        />
                        <Column
                            title="注册人数"
                            dataIndex="registeredNumOfPeople"
                            key="registeredNumOfPeople"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}}
                                       class={data['registeredNumOfPeopleRate'] < 0 ? "green-label" :
                                           (data['registeredNumOfPeopleRate'] > 5 ? "red-label" : "")}>{data['registeredNumOfPeopleRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="登录人数"
                            dataIndex="loginNumOfPerson"
                            key="loginNumOfPerson"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}} class={data['loginNumOfPersonRate'] < 0 ? "green-label" :
                                        (data['loginNumOfPersonRate'] > 5 ? "red-label" : "")}>{data['loginNumOfPersonRate'] || 0}%</p>]
                            }}
                        />
                    </ColumnGroup>
                    <ColumnGroup title="申请放款数据">
                        <Column
                            title="申请单数"
                            dataIndex="applyNumOfOrder"
                            key="applyNumOfOrder"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}} class={data['applyNumOfOrderRate'] < 0 ? "green-label" :
                                        (data['applyNumOfOrderRate'] > 5 ? "red-label" : "")}>{data['applyNumOfOrderRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="申请件均"
                            dataIndex="applyAverageNumOfOrder"
                            key="applyAverageNumOfOrder"
                            width={100}
                            render={(text, data) => {
                                return [<p>{Math.ceil((text || 0) * 100) / 100 || 0}</p>,
                                    <p style={{margin: 0}}
                                       class={data['applyAverageNumOfOrderRate'] < 0 ? "green-label" :
                                           (data['applyAverageNumOfOrderRate'] > 5 ? "red-label" : "")}>{data['applyAverageNumOfOrderRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="放款单数"
                            dataIndex="loanNumOfOrder"
                            key="loanNumOfOrder"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}} class={data['loanNumOfOrderRate'] < 0 ? "green-label" :
                                        (data['loanNumOfOrderRate'] > 5 ? "red-label" : "")}>{data['loanNumOfOrderRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="放款金额"
                            dataIndex="loanAmount"
                            key="loanAmount"
                            width={100}
                            render={(text, data) => {
                                return [<p>{Math.ceil((text || 0) * 100) / 100 || 0}</p>,
                                    <p style={{margin: 0}} class={data['loanAmountRate'] < 0 ? "green-label" :
                                        (data['loanAmountRate'] > 5 ? "red-label" : "")}>{data['loanAmountRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="放款件均"
                            dataIndex="loanAverageAmount"
                            key="loanAverageAmount"
                            width={100}
                            render={(text, data) => {
                                return [<p>{Math.ceil((text || 0) * 100) / 100 || 0}</p>,
                                    <p style={{margin: 0}} class={data['loanAverageAmountRate'] < 0 ? "green-label" :
                                        (data['loanAverageAmountRate'] > 5 ? "red-label" : "")}>{data['loanAverageAmountRate'] || 0}%</p>]
                            }}
                        />
                    </ColumnGroup>
                    <ColumnGroup title="当天注册且当天申请">
                        <Column
                            title="申请人数"
                            dataIndex="applyNumOfPerson"
                            key="applyNumOfPerson"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}} class={data['applyNumOfPersonRate'] < 0 ? "green-label" :
                                        (data['applyNumOfPersonRate'] > 5 ? "red-label" : "")}>{data['applyNumOfPersonRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="放款人数"
                            dataIndex="loanNumOfPerson"
                            key="loanNumOfPerson"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}} class={data['loanNumOfPersonRate'] < 0 ? "green-label" :
                                        (data['loanNumOfPersonRate'] > 5 ? "red-label" : "")}>{data['loanNumOfPersonRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="申请放款率"
                            dataIndex="applyLoanRate"
                            key="applyLoanRate"
                            width={130}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil((text || 0) * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}} class={data['applyLoanRateRate'] < 0 ? "green-label" :
                                        (data['applyLoanRateRate'] > 5 ? "red-label" : "")}>{data['applyLoanRateRate'] || 0}%</p>]
                            }}
                        />
                    </ColumnGroup>
                    <ColumnGroup title="首贷数据">
                        <Column
                            title="申请单数"
                            dataIndex="firstLoanApplyNumOfOrder"
                            key="firstLoanApplyNumOfOrder"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}}
                                       class={data['firstLoanApplyNumOfOrderRate'] < 0 ? "green-label" :
                                           (data['firstLoanApplyNumOfOrderRate'] > 5 ? "red-label" : "")}>{data['firstLoanApplyNumOfOrderRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="放款单数"
                            dataIndex="firstLoanNumOfOrder"
                            key="firstLoanNumOfOrder"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}} class={data['firstLoanNumOfOrderRate'] < 0 ? "green-label" :
                                        (data['firstLoanNumOfOrderRate'] > 5 ? "red-label" : "")}>{data['firstLoanNumOfOrderRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="放款金额"
                            dataIndex="firstLoanAmount"
                            key="firstLoanAmount"
                            width={100}
                            render={(text, data) => {
                                return [<p>{Math.ceil((text || 0) * 100) / 100 || 0}</p>,
                                    <p style={{margin: 0}} class={data['firstLoanAmountRate'] < 0 ? "green-label" :
                                        (data['firstLoanAmountRate'] > 5 ? "red-label" : "")}>{data['firstLoanAmountRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="放款件均"
                            dataIndex="firstLoanAverageAmount"
                            key="firstLoanAverageAmount"
                            width={100}
                            render={(text, data) => {
                                return [<p>{Math.ceil((text || 0) * 100) / 100 || 0}</p>,
                                    <p style={{margin: 0}}
                                       class={data['firstLoanAverageAmountRate'] < 0 ? "green-label" :
                                           (data['firstLoanAverageAmountRate'] > 5 ? "red-label" : "")}>{data['firstLoanAverageAmountRate'] || 0}%</p>]
                            }}
                        />
                    </ColumnGroup>
                    <ColumnGroup title="当天到期订单数据">
                        <Column
                            title="到期单数"
                            dataIndex="expireNumOfOrder"
                            key="expireNumOfOrder"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}} class={data['expireNumOfOrderRate'] < 0 ? "green-label" :
                                        (data['expireNumOfOrderRate'] > 5 ? "red-label" : "")}>{data['expireNumOfOrderRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="借7天单数"
                            dataIndex="borrow7DaysNumOfOrder"
                            key="borrow7DaysNumOfOrder"
                            width={120}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}}
                                       class={data['borrow7DaysNumOfOrderRate'] < 0 ? "green-label" :
                                           (data['borrow7DaysNumOfOrderRate'] > 5 ? "red-label" : "")}>{data['borrow7DaysNumOfOrderRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="借14天单数"
                            dataIndex="borrow14DaysNumOfOrder"
                            key="borrow14DaysNumOfOrder"
                            width={120}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}}
                                       class={data['borrow14DaysNumOfOrderRate'] < 0 ? "green-label" :
                                           (data['borrow14DaysNumOfOrderRate'] > 5 ? "red-label" : "")}>{data['borrow14DaysNumOfOrderRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="自然逾期单数"
                            dataIndex="naturalOverdueNumOfOrder"
                            key="naturalOverdueNumOfOrder"
                            width={130}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}}
                                       class={data['naturalOverdueNumOfOrderRate'] < 0 ? "green-label" :
                                           (data['naturalOverdueNumOfOrderRate'] > 5 ? "red-label" : "")}>{data['naturalOverdueNumOfOrderRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="自然逾期率"
                            dataIndex="naturalOverdueRate"
                            key="naturalOverdueRate"
                            width={120}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil((text || 0) * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}} class={data['naturalOverdueRateRate'] < 0 ? "green-label" :
                                        (data['naturalOverdueRateRate'] > 5 ? "red-label" : "")}>{data['naturalOverdueRateRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="借7天自然逾期数"
                            dataIndex="borrow7DaysNaturalOverdueNumOfOrder"
                            key="borrow7DaysNaturalOverdueNumOfOrder"
                            width={170}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}}
                                       class={data['borrow7DaysNaturalOverdueNumOfOrderRate'] < 0 ? "green-label" :
                                           (data['borrow7DaysNaturalOverdueNumOfOrderRate'] > 5 ? "red-label" : "")}>{data['borrow7DaysNaturalOverdueNumOfOrderRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="借14天自然逾期数"
                            dataIndex="borrow14DaysNaturalOverdueNumOfOrder"
                            key="borrow14DaysNaturalOverdueNumOfOrder"
                            width={170}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}}
                                       class={data['borrow14DaysNaturalOverdueNumOfOrderRate'] < 0 ? "green-label" :
                                           (data['borrow14DaysNaturalOverdueNumOfOrderRate'] > 5 ? "red-label" : "")}>{data['borrow14DaysNaturalOverdueNumOfOrderRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="借7天自然逾期率"
                            dataIndex="borrow7DaysNaturalOverdueRate"
                            key="borrow7DaysNaturalOverdueRate"
                            width={170}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}}
                                       class={data['borrow7DaysNaturalOverdueRateRate'] < 0 ? "green-label" :
                                           (data['borrow7DaysNaturalOverdueRateRate'] > 5 ? "red-label" : "")}>{data['borrow7DaysNaturalOverdueRateRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="借14天自然逾期率"
                            dataIndex="borrow14DaysNaturalOverdueRate"
                            key="borrow14DaysNaturalOverdueRate"
                            width={170}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil((text || 0) * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}}
                                       class={data['borrow14DaysNaturalOverdueRateRate'] < 0 ? "green-label" :
                                           (data['borrow14DaysNaturalOverdueRateRate'] > 5 ? "red-label" : "")}>{data['borrow14DaysNaturalOverdueRateRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="首贷单数"
                            dataIndex="firstLoanNumOrOrder"
                            key="firstLoanNumOrOrder"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}} class={data['firstLoanNumOrOrderRate'] < 0 ? "green-label" :
                                        (data['firstLoanNumOrOrderRate'] > 5 ? "red-label" : "")}>{data['firstLoanNumOrOrderRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="首贷借7天单数"
                            dataIndex="firstLoanBorrow7DaysNumOfOrder"
                            key="firstLoanBorrow7DaysNumOfOrder"
                            width={170}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}}
                                       class={data['firstLoanBorrow7DaysNumOfOrderRate'] < 0 ? "green-label" :
                                           (data['firstLoanBorrow7DaysNumOfOrderRate'] > 5 ? "red-label" : "")}>{data['firstLoanBorrow7DaysNumOfOrderRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="首贷借14天单数"
                            dataIndex="firstLoanBorrow14DaysNumOfOrder"
                            key="firstLoanBorrow14DaysNumOfOrder"
                            width={170}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}}
                                       class={data['firstLoanBorrow14DaysNumOfOrderRate'] < 0 ? "green-label" :
                                           (data['firstLoanBorrow14DaysNumOfOrderRate'] > 5 ? "red-label" : "")}>{data['firstLoanBorrow14DaysNumOfOrderRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="首贷逾期单数"
                            dataIndex="firstLoanOverdueNumOfOrder"
                            key="firstLoanOverdueNumOfOrder"
                            width={150}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}}
                                       class={data['firstLoanOverdueNumOfOrderRate'] < 0 ? "green-label" :
                                           (data['firstLoanOverdueNumOfOrderRate'] > 5 ? "red-label" : "")}>{data['firstLoanOverdueNumOfOrderRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="首贷自然逾期率"
                            dataIndex="firstLoanOverdueNaturalRate"
                            key="firstLoanOverdueNaturalRate"
                            width={170}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}}
                                       class={data['firstLoanOverdueNaturalRateRate'] < 0 ? "green-label" :
                                           (data['firstLoanOverdueNaturalRateRate'] > 5 ? "red-label" : "")}>{data['firstLoanOverdueNaturalRateRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="首贷借7天自然逾期率"
                            dataIndex="firstLoan7DaysOverdueNaturalRate"
                            key="firstLoan7DaysOverdueNaturalRate"
                            width={200}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil((text || 0) * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}}
                                       class={data['firstLoan7DaysOverdueNaturalRateRate'] < 0 ? "green-label" :
                                           (data['firstLoan7DaysOverdueNaturalRateRate'] > 5 ? "red-label" : "")}>{data['firstLoan7DaysOverdueNaturalRateRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="首贷借14天自然逾期率"
                            dataIndex="firstLoan14DaysOverdueNaturalRate"
                            key="firstLoan14DaysOverdueNaturalRate"
                            width={200}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil((text || 0) * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}}
                                       class={data['firstLoan14DaysOverdueNaturalRateRate'] < 0 ? "green-label" :
                                           (data['firstLoan14DaysOverdueNaturalRateRate'] > 5 ? "red-label" : "")}>{data['firstLoan14DaysOverdueNaturalRateRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="逾期还款单数"
                            dataIndex="overdueReturnNumOfOrder"
                            key="overdueReturnNumOfOrder"
                            width={150}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}}
                                       class={data['overdueReturnNumOfOrderRate'] < 0 ? "green-label" :
                                           (data['overdueReturnNumOfOrderRate'] > 5 ? "red-label" : "")}>{data['overdueReturnNumOfOrderRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="逾期还款率"
                            dataIndex="overdueReturnRate"
                            key="overdueReturnRate"
                            width={130}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil((text || 0) * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}} class={data['overdueReturnRateRate'] < 0 ? "green-label" :
                                        (data['overdueReturnRateRate'] > 5 ? "red-label" : "")}>{data['overdueReturnRateRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="借7天逾期还款率"
                            dataIndex="borrow7DaysOverdueReturnRate"
                            key="borrow7DaysOverdueReturnRate"
                            width={170}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil((text || 0) * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}}
                                       class={data['borrow7DaysOverdueReturnRateRate'] < 0 ? "green-label" :
                                           (data['borrow7DaysOverdueReturnRateRate'] > 5 ? "red-label" : "")}>{data['borrow7DaysOverdueReturnRateRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="借14天逾期还款率"
                            dataIndex="borrow14DaysOverdueReturnRate"
                            key="borrow14DaysOverdueReturnRate"
                            width={150}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil((text || 0) * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}}
                                       class={data['borrow14DaysOverdueReturnRateRate'] < 0 ? "green-label" :
                                           (data['borrow14DaysOverdueReturnRateRate'] > 5 ? "red-label" : "")}>{data['borrow14DaysOverdueReturnRateRate'] || 0}%</p>]
                            }}
                        />
                    </ColumnGroup>
                    <ColumnGroup title="邀请好友数据">
                        <Column
                            title="邀请人数"
                            dataIndex="invitedNumOfPerson"
                            key="invitedNumOfPerson"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}} class={data['invitedNumOfPersonRate'] < 0 ? "green-label" :
                                        (data['invitedNumOfPersonRate'] > 5 ? "red-label" : "")}>{data['invitedNumOfPersonRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="被邀请注册用户数"
                            dataIndex="invitedRegisterNumOfPerson"
                            key="invitedRegisterNumOfPerson"
                            width={170}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}}
                                       class={data['invitedRegisterNumOfPersonRate'] < 0 ? "green-label" :
                                           (data['invitedRegisterNumOfPersonRate'] > 5 ? "red-label" : "")}>{data['invitedRegisterNumOfPersonRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="被邀请用户首贷申请数"
                            dataIndex="invitedFirstLoanNumOfApply"
                            key="invitedFirstLoanNumOfApply"
                            width={200}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}}
                                       class={data['invitedFirstLoanNumOfApplyRate'] < 0 ? "green-label" :
                                           (data['invitedFirstLoanNumOfApplyRate'] > 5 ? "red-label" : "")}>{data['invitedFirstLoanNumOfApplyRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="被邀请用户首贷放款数"
                            dataIndex="inviteUserFirstLoanNum"
                            key="inviteUserFirstLoanNum"
                            width={200}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}}
                                       class={data['inviteUserFirstLoanNumRate'] < 0 ? "green-label" :
                                           (data['inviteUserFirstLoanNumRate'] > 5 ? "red-label" : "")}>{data['inviteUserFirstLoanNumRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="被邀请用户首贷通过率"
                            dataIndex="inviteUserFirstLoanPassRate"
                            key="inviteUserFirstLoanPassRate"
                            width={200}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil((text || 0) * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}}
                                       class={data['inviteUserFirstLoanPassRateRate'] < 0 ? "green-label" :
                                           (data['inviteUserFirstLoanPassRateRate'] > 5 ? "red-label" : "")}>{data['inviteUserFirstLoanPassRateRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="客服咨询人数"
                            dataIndex="numOfCustomerServiceConsultants"
                            key="numOfCustomerServiceConsultants"
                            width={130}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}}
                                       class={data['numOfCustomerServiceConsultantsRate'] < 0 ? "green-label" :
                                           (data['numOfCustomerServiceConsultantsRate'] > 5 ? "red-label" : "")}>{data['numOfCustomerServiceConsultantsRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="人工待审订单量"
                            dataIndex="artificialPendingNumOfOrderNum"
                            key="artificialPendingNumOfOrderNum"
                            width={150}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}}
                                       class={data['artificialPendingNumOfOrderNumRate'] < 0 ? "green-label" :
                                           (data['artificialPendingNumOfOrderNumRate'] > 5 ? "red-label" : "")}>{data['artificialPendingNumOfOrderNumRate'] || 0}%</p>]
                            }}
                        />
                        <Column
                            title="app系统上传问题反馈人数"
                            dataIndex="appUploadProblemFeedbackNum"
                            key="appUploadProblemFeedbackNum"
                            width={200}
                            render={(text, data) => {
                                return [<p>{text || 0}</p>,
                                    <p style={{margin: 0}}
                                       class={data['appUploadProblemFeedbackNumRate'] < 0 ? "green-label" :
                                           (data['appUploadProblemFeedbackNumNum'] > 5 ? "red-label" : "")}>{data['appUploadProblemFeedbackNumRate'] || 0}%</p>]
                            }}
                        />
                    </ColumnGroup>
                </Table>
                <Modal
                    className="te-modal"
                    title="Download"
                    closable
                    visible={this.state.showTableExport}
                    width="100%"
                    style={{top: 0}}
                    onCancel={this.handleCancel}
                    footer={[
                        <Button key="back" size="large" onClick={this.handleCancel}>Cancel</Button>,
                    ]}
                >
                    <table id="ex-table">
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
                                        <td>{record.mainChannel}</td>
                                        <td>{record.registeredNumOfPeople}</td>
                                        <td>{record.loginNumOfPerson}</td>
                                        <td>{record.applyNumOfOrder}</td>
                                        <td>{record.applyAverageNumOfOrder}</td>
                                        <td>{record.loanNumOfOrder}</td>
                                        <td>{record.loanAmount}</td>
                                        <td>{record.loanAverageAmount}</td>
                                        <td>{record.applyNumOfPerson}</td>
                                        <td>{record.loanNumOfPerson}</td>
                                        <td>{`${Math.ceil(record.applyLoanRate * 10000) / 100}%`}</td>
                                        <td>{record.firstLoanApplyNumOfOrder}</td>
                                        <td>{record.firstLoanNumOfOrder}</td>
                                        <td>{record.firstLoanAmount}</td>
                                        <td>{record.firstLoanAverageAmount}</td>
                                        <td>{record.expireNumOfOrder}</td>
                                        <td>{record.borrow7DaysNumOfOrder}</td>
                                        <td>{record.borrow14DaysNumOfOrder}</td>
                                        <td>{record.naturalOverdueNumOfOrder}</td>
                                        <td>{`${Math.ceil(record.naturalOverdueRate * 10000) / 100}%`}</td>
                                        <td>{record.borrow7DaysNaturalOverdueNumOfOrder}</td>
                                        <td>{record.borrow14DaysNaturalOverdueNumOfOrder}</td>
                                        <td>{`${Math.ceil(record.borrow7DaysNaturalOverdueRate * 10000) / 100}%`}</td>
                                        <td>{`${Math.ceil(record.borrow14DaysNaturalOverdueRate * 10000) / 100}%`}</td>
                                        <td>{record.firstLoanNumOrOrder}</td>
                                        <td>{record.firstLoanBorrow7DaysNumOfOrder}</td>
                                        <td>{record.firstLoanBorrow14DaysNumOfOrder}</td>
                                        <td>{record.firstLoanOverdueNumOfOrder}</td>
                                        <td>{`${Math.ceil(record.firstLoanOverdueNaturalRate * 10000) / 100}%`}</td>
                                        <td>{`${Math.ceil(record.firstLoan7DaysOverdueNaturalRate * 10000) / 100}%`}</td>
                                        <td>{`${Math.ceil(record.firstLoan14DaysOverdueNaturalRate * 10000) / 100}%`}</td>
                                        <td>{record.overdueReturnNumOfOrder}</td>
                                        <td>{`${Math.ceil(record.overdueReturnRate * 10000) / 100}%`}</td>
                                        <td>{`${Math.ceil(record.borrow7DaysOverdueReturnRate * 10000) / 100}%`}</td>
                                        <td>{`${Math.ceil(record.borrow14DaysOverdueReturnRate * 10000) / 100}%`}</td>
                                        <td>{record.invitedNumOfPerson}</td>
                                        <td>{record.invitedRegisterNumOfPerson}</td>
                                        <td>{record.invitedFirstLoanNumOfApply}</td>
                                        <td>{record.inviteUserFirstLoanNum}</td>
                                        <td>{record.invitedFirstLoanNumOfApply}</td>
                                        <td>{`${Math.ceil(record.inviteUserFirstLoanPassRate * 10000) / 100}%`}</td>
                                        <td>{record.numOfCustomerServiceConsultants}</td>
                                        <td>{record.artificialPendingNumOfOrderNum}</td>
                                        <td>{record.appUploadProblemFeedbackNum}</td>
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
