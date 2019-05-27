import React from 'react';
import {CLComponent} from 'Lib/component/index';
import {CL} from 'Lib/tools/index';
import {Interface} from 'Lib/config/index';
import {Table, DatePicker, Button, message, Select, Modal} from 'antd';
import moment from 'moment';

const {Column, ColumnGroup} = Table;
const {RangePicker, MonthPicker} = DatePicker;
let {contentType, getDailyMonitorList, getChannelList} = Interface;
import tableexport from 'tableexport';
let TB;

export default class Mylist extends CLComponent {
    constructor(props) {
        super(props);

        this.state = {
            list: [],
            search: {},
            options: {
                appNameOpt: [{
                    key: "com.unipeso.phone",
                    value: "Cashlending"
                }, {
                    key: "com.unipeso.variant",
                    value: "Loanit"
                }, {
                    key: "com.unipeso.swakcash",
                    value: "SwakCash"
                }],
                networkList: []
            },
            startDate: null,
            endDate: null,
            startDateStr: new moment(),
            endDateStr: new moment(),
            hbStartDateStr: new moment().add(-1, 'd'),
            hbEndDateStr: new moment().add(-1, 'd'),
            loading: false,
            showTableExport: false
        }
    }

    componentDidMount() {
        this.loadData();
        this.getNetworkListMth();
    }

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
        let hbLength = (e[1].unix() - e[0].unix()) / (60 * 60 * 24) + 1;
        this.setState({
            month: null,
            startDate: e[0],
            endDate: e[1],
            startDateStr: e[0],
            endDateStr: e[1],
            hbStartDateStr: moment(e[0]).add(-hbLength, "d"),
            hbEndDateStr: moment(e[1]).add(-hbLength, "d")
        })
    };

    onMonthChange = (e) => {
        let start = e.date(1), end = moment(e.date(1)).add(1, "M").add(-1, "d");
        let hbLength = (end.unix() - start.unix()) / (60 * 60 * 24) + 1;
        this.setState({
            startDate: null,
            endDate: null,
            month: e,
            startDateStr: start,
            endDateStr: end,
            hbStartDateStr: moment(start).add(-hbLength, "d"),
            hbEndDateStr: moment(end).add(-hbLength, "d")
        })
    };

    dealDate = (myDate, whetherStart) => {
        return myDate ? moment(myDate.format("YYYY-MM-DD") + (whetherStart ? " 00:00:00" : " 23:59:59")).unix() :
            (moment(moment().format("YYYY-MM-DD") + (whetherStart ? " 00:00:00" : " 23:59:59")).unix());
    };

    loadData = () => {
        let {startDateStr, endDateStr, hbStartDateStr, hbEndDateStr, app, mainChannel} = this.state;
        startDateStr = this.dealDate(startDateStr, true);
        endDateStr = this.dealDate(endDateStr);
        hbStartDateStr = this.dealDate(hbStartDateStr, true);
        hbEndDateStr = this.dealDate(hbEndDateStr);
        const settings = {
            contentType,
            method: getDailyMonitorList.type,
            url: getDailyMonitorList.url,
            data: JSON.stringify({
                startDate: startDateStr * 1000,
                endDate: endDateStr * 1000,
                appName: app || undefined,
                mainChannel
            }),
        };

        const settingsHB = {
            contentType,
            method: getDailyMonitorList.type,
            url: getDailyMonitorList.url,
            data: JSON.stringify({
                startDate: hbStartDateStr * 1000,
                endDate: hbEndDateStr * 1000,
                appName: app || undefined,
                mainChannel
            }),
        };

        this.setState({
            loading: true
        });

        Promise.all([CL.clReqwestPromise(settings),
            CL.clReqwestPromise(settingsHB)])
            .then((res) => {
                if (res[0].code == 200 && res[0] && res[0].data) {
                    if (res[1].data) {
                        _.each(res[0].data, item => {
                            let hb = _.find(res[1].data, itr => {
                                return itr.mainChannel == item.mainChannel;
                            });

                            _.each(hb, (value, key) => {
                                if (typeof value == "number") {
                                    item[key + "Rate"] = Math.round((item[key] - value) / (value || 1) * 10000) / 100;
                                }
                            })
                        })
                    }

                    this.setState({
                        list: res[0].data,
                        loading: false
                    })
                } else {
                    message.error("获取日常监控列表失败！");
                }
            })
    };

    getNetworkListMth = () => {
        const settings = {
            contentType,
            method: getChannelList.type,
            url: getChannelList.url
        };

        CL.clReqwestPromise(settings)
            .then((res) => {
                if (res.code == 200) {
                    let options = this.state.options;
                    options.networkList = _.map(res.data, (item) => {
                        return {
                            key: item,
                            value: item
                        }
                    });
                    this.setState({options})
                }
            })
    };

    onClear = () => {
        this.setState({
            startDate: null,
            endDate: null,
            month: null,
            app: null,
            mainChannel: null
        })
    };

    onAppChange = (e) => {
        this.setState({
            app: e
        })
    };

    onChannelChange = (e) => {
        this.setState({
            mainChannel: e
        })
    };

    onDownload = (e) => {
        this.setState({ showTableExport: true });
        setTimeout(() => {
            TB = tableexport(document.querySelector('#ex-table'), { formats: ['csv', 'txt', 'xlsx'] });
        }, 100);
    };

    getExportTableHead = () =>{
        return [
            "主渠道", "注册人数", "开始申请人数", "完善资料人数", "申请人数", "风控通过单数", "风控拒绝单数", "风控通过占比", "人审单数", "人审通过单数",
            "人审申请通过率", "放款人数", "放款金额", "到期订单数", "应收本息", "逾期单数", "逾期单本息", "自然逾期率", "还款单数", "还款率", "逾期还款单数",
            "逾期未还单数", "逾期还款率"
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
                        <RangePicker onChange={this.onDateChange} value={[this.state.startDate, this.state.endDate]}/>
                        <span style={{marginLeft: "50px"}}>月筛选：</span>
                        <MonthPicker onChange={this.onMonthChange} placeholder="Select month" value={this.state.month}/>
                        <span style={{marginLeft: "50px"}}>App：</span>
                        <Select placeholder="Please select"
                                value={this.state.app}
                                onChange={this.onAppChange}
                                style={{width: 200}}>
                            {_.map(this.state.options.appNameOpt, app => {
                                return <Option value={app.key}>{app.value}</Option>
                            })}
                        </Select>
                        <span style={{marginLeft: "50px"}}>渠道：</span>
                        <Select placeholder="Please select"
                                value={this.state.mainChannel}
                                onChange={this.onChannelChange}
                                style={{width: 200}}>
                            {_.map(this.state.options.networkList, app => {
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
                       scroll={{x: 3000, y: 450}}
                       loading={this.state.loading}
                       pagination={false}>
                    <ColumnGroup title="App数据">
                        <Column
                            title="主渠道"
                            dataIndex="mainChannel"
                            key="mainChannel"
                            width={200}
                        />
                        <Column
                            title="注册人数"
                            dataIndex="registeredNumOfPeople"
                            key="registeredNumOfPeople"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text}</p>,
                                    <p style={{margin: 0}}
                                       class={data['registeredNumOfPeopleRate'] < 0 ? "green-label" :
                                           (data['registeredNumOfPeopleRate'] > 5 ? "red-label" : "")}>{data['registeredNumOfPeopleRate']}%</p>]
                            }}
                        />
                        <Column
                            title="开始申请人数"
                            dataIndex="startUpApplyNumOfPeople"
                            key="startUpApplyNumOfPeople"
                            width={130}
                            render={(text, data) => {
                                return [<p>{text}</p>,
                                    <p style={{margin: 0}}
                                       class={data['startUpApplyNumOfPeopleRate'] < 0 ? "green-label" :
                                           (data['startUpApplyNumOfPeopleRate'] > 5 ? "red-label" : "")}>{data['startUpApplyNumOfPeopleRate']}%</p>]
                            }}
                        />
                        <Column
                            title="完善资料人数"
                            dataIndex="completeMtNumOfPeople"
                            key="completeMtNumOfPeople"
                            width={130}
                            render={(text, data) => {
                                return [<p>{text}</p>,
                                    <p style={{margin: 0}}
                                       class={data['completeMtNumOfPeopleRate'] < 0 ? "green-label" :
                                           (data['completeMtNumOfPeopleRate'] > 5 ? "red-label" : "")}>{data['completeMtNumOfPeopleRate']}%</p>]
                            }}
                        />
                        <Column
                            title="申请人数"
                            dataIndex="applyNumOfPeople"
                            key="applyNumOfPeople"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text}</p>,
                                    <p style={{margin: 0}} class={data['applyNumOfPeopleRate'] < 0 ? "green-label" :
                                        (data['applyNumOfPeopleRate'] > 5 ? "red-label" : "")}>{data['applyNumOfPeopleRate']}%</p>]
                            }}
                        />
                    </ColumnGroup>
                    <ColumnGroup title="审核数据">
                        <Column
                            title="风控通过单数"
                            dataIndex="riskCtPassNumOfOrder"
                            key="riskCtPassNumOfOrder"
                            width={130}
                            render={(text, data) => {
                                return [<p>{text}</p>,
                                    <p style={{margin: 0}} class={data['riskCtPassNumOfOrderRate'] < 0 ? "green-label" :
                                        (data['riskCtPassNumOfOrderRate'] > 5 ? "red-label" : "")}>{data['riskCtPassNumOfOrderRate']}%</p>]
                            }}
                        />
                        <Column
                            title="风控拒绝单数"
                            dataIndex="riskCtRefuseNumOfOrder"
                            key="riskCtRefuseNumOfOrder"
                            width={130}
                            render={(text, data) => {
                                return [<p>{text}</p>,
                                    <p style={{margin: 0}}
                                       class={data['riskCtRefuseNumOfOrderRate'] < 0 ? "green-label" :
                                           (data['riskCtRefuseNumOfOrderRate'] > 5 ? "red-label" : "")}>{data['riskCtRefuseNumOfOrderRate']}%</p>]
                            }}
                        />
                        <Column
                            title="风控通过占比"
                            dataIndex="riskCtPassRate"
                            key="riskCtPassRate"
                            width={130}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil(text * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}} class={data['riskCtPassRateRate'] < 0 ? "green-label" :
                                        (data['riskCtPassRateRate'] > 5 ? "red-label" : "")}>{data['riskCtPassRateRate']}%</p>]
                            }}
                        />
                        <Column
                            title="人审单数"
                            dataIndex="personAuditNum"
                            key="personAuditNum"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text}</p>,
                                    <p style={{margin: 0}} class={data['personAuditNumRate'] < 0 ? "green-label" :
                                        (data['personAuditNumRate'] > 5 ? "red-label" : "")}>{data['personAuditNumRate']}%</p>]
                            }}
                        />
                        <Column
                            title="人审通过单数"
                            dataIndex="personAuditPassNum"
                            key="personAuditPassNum"
                            width={130}
                            render={(text, data) => {
                                return [<p>{text}</p>,
                                    <p style={{margin: 0}} class={data['personAuditPassNumRate'] < 0 ? "green-label" :
                                        (data['personAuditPassNumRate'] > 5 ? "red-label" : "")}>{data['personAuditPassNumRate']}%</p>]
                            }}
                        />
                        <Column
                            title="人审申请通过率"
                            dataIndex="personAuditPassRate"
                            key="personAuditPassRate"
                            width={130}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil(text * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}} class={data['personAuditPassRateRate'] < 0 ? "green-label" :
                                        (data['personAuditPassRateRate'] > 5 ? "red-label" : "")}>{data['personAuditPassRateRate']}%</p>]
                            }}
                        />
                        <Column
                            title="放款人数"
                            dataIndex="loanNumOfPeople"
                            key="loanNumOfPeople"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text}</p>,
                                    <p style={{margin: 0}} class={data['loanNumOfPeopleRate'] < 0 ? "green-label" :
                                        (data['loanNumOfPeopleRate'] > 5 ? "red-label" : "")}>{data['loanNumOfPeopleRate']}%</p>]
                            }}
                        />
                        <Column
                            title="放款金额"
                            dataIndex="loanAmount"
                            key="loanAmount"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text}</p>,
                                    <p style={{margin: 0}} class={data['loanAmountRate'] < 0 ? "green-label" :
                                        (data['loanAmountRate'] > 5 ? "red-label" : "")}>{data['loanAmountRate']}%</p>]
                            }}
                        />
                    </ColumnGroup>
                    <ColumnGroup title="还款数据（当日到款订单）">
                        <Column
                            title="到期订单数"
                            dataIndex="expireNumOfOrder"
                            key="expireNumOfOrder"
                            width={130}
                            render={(text, data) => {
                                return [<p>{text}</p>,
                                    <p style={{margin: 0}} class={data['expireNumOfOrderRate'] < 0 ? "green-label" :
                                        (data['expireNumOfOrderRate'] > 5 ? "red-label" : "")}>{data['expireNumOfOrderRate']}%</p>]
                            }}
                        />
                        <Column
                            title="应收本息"
                            dataIndex="receivablesAndPrincipals"
                            key="receivablesAndPrincipals"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text}</p>,
                                    <p style={{margin: 0}}
                                       class={data['receivablesAndPrincipalsRate'] < 0 ? "green-label" :
                                           (data['receivablesAndPrincipalsRate'] > 5 ? "red-label" : "")}>{data['receivablesAndPrincipalsRate']}%</p>]
                            }}
                        />
                        <Column
                            title="逾期单数"
                            dataIndex="overdueNumOfOrder"
                            key="overdueNumOfOrder"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text}</p>,
                                    <p style={{margin: 0}} class={data['overdueNumOfOrderRate'] < 0 ? "green-label" :
                                        (data['overdueNumOfOrderRate'] > 5 ? "red-label" : "")}>{data['overdueNumOfOrderRate']}%</p>]
                            }}
                        />
                        <Column
                            title="逾期单本息"
                            dataIndex="overduePrincipalInterest"
                            key="overduePrincipalInterest"
                            width={130}
                            render={(text, data) => {
                                return [<p>{text}</p>,
                                    <p style={{margin: 0}}
                                       class={data['overduePrincipalInterestRate'] < 0 ? "green-label" :
                                           (data['overduePrincipalInterestRate'] > 5 ? "red-label" : "")}>{data['overduePrincipalInterestRate']}%</p>]
                            }}
                        />
                        <Column
                            title="自然逾期率"
                            dataIndex="naturalOverdueRate"
                            key="naturalOverdueRate"
                            width={130}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil(text * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}} class={data['naturalOverdueRateRate'] < 0 ? "green-label" :
                                        (data['naturalOverdueRateRate'] > 5 ? "red-label" : "")}>{data['naturalOverdueRateRate']}%</p>]
                            }}
                        />
                        <Column
                            title="还款单数"
                            dataIndex="repaymentNumOfOrder"
                            key="repaymentNumOfOrder"
                            width={100}
                            render={(text, data) => {
                                return [<p>{text}</p>,
                                    <p style={{margin: 0}} class={data['repaymentNumOfOrderRate'] < 0 ? "green-label" :
                                        (data['repaymentNumOfOrderRate'] > 5 ? "red-label" : "")}>{data['repaymentNumOfOrderRate']}%</p>]
                            }}
                        />
                        <Column
                            title="还款率"
                            dataIndex="repaymentRate"
                            key="repaymentRate"
                            width={100}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil(text * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}} class={data['repaymentRateRate'] < 0 ? "green-label" :
                                        (data['repaymentRateRate'] > 5 ? "red-label" : "")}>{data['repaymentRateRate']}%</p>]
                            }}
                        />
                        <Column
                            title="逾期还款单数"
                            dataIndex="overdueRepaymentNumOfOrder"
                            key="overdueRepaymentNumOfOrder"
                            width={130}
                            render={(text, data) => {
                                return [<p>{text}</p>,
                                    <p style={{margin: 0}}
                                       class={data['overdueRepaymentNumOfOrderRate'] < 0 ? "green-label" :
                                           (data['overdueRepaymentNumOfOrderRate'] > 5 ? "red-label" : "")}>{data['overdueRepaymentNumOfOrderRate']}%</p>]
                            }}
                        />
                        <Column
                            title="逾期未还单数"
                            dataIndex="overdueNotRepNumOfOrder"
                            key="overdueNotRepNumOfOrder"
                            width={130}
                            render={(text, data) => {
                                return [<p>{text}</p>,
                                    <p style={{margin: 0}}
                                       class={data['overdueNotRepNumOfOrderRate'] < 0 ? "green-label" :
                                           (data['overdueNotRepNumOfOrderRate'] > 5 ? "red-label" : "")}>{data['overdueNotRepNumOfOrderRate']}%</p>]
                            }}
                        />
                        <Column
                            title="逾期还款率"
                            dataIndex="overdueRepaymentRate"
                            key="overdueRepaymentRate"
                            width={130}
                            render={(text, data) => {
                                return [<p>{`${Math.ceil(text * 10000) / 100}%`}</p>,
                                    <p style={{margin: 0}} class={data['overdueRepaymentRateRate'] < 0 ? "green-label" :
                                        (data['overdueRepaymentRateRate'] > 5 ? "red-label" : "")}>{data['overdueRepaymentRateRate']}%</p>]
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
                    style={{ top: 0 }}
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
                                        <td>{record.startUpApplyNumOfPeople}</td>
                                        <td>{record.completeMtNumOfPeople}</td>
                                        <td>{record.applyNumOfPeople}</td>
                                        <td>{record.riskCtPassNumOfOrder}</td>
                                        <td>{record.riskCtRefuseNumOfOrder}</td>
                                        <td>{`${Math.ceil(record.riskCtPassRate*10000)/100}%`}</td>
                                        <td>{record.personAuditNum}</td>
                                        <td>{record.personAuditPassNum}</td>
                                        <td>{`${Math.ceil(record.personAuditPassRate*10000)/100}%`}</td>
                                        <td>{record.loanNumOfPeople}</td>
                                        <td>{record.loanAmount}</td>
                                        <td>{record.expireNumOfOrder}</td>
                                        <td>{record.receivablesAndPrincipals}</td>
                                        <td>{record.overdueNumOfOrder}</td>
                                        <td>{record.overduePrincipalInterest}</td>
                                        <td>{record.naturalOverdueRate}</td>
                                        <td>{record.repaymentNumOfOrder}</td>
                                        <td>{`${Math.ceil(record.repaymentRate*10000)/100}%`}</td>
                                        <td>{record.overdueRepaymentNumOfOrder}</td>
                                        <td>{record.overdueNotRepNumOfOrder}</td>
                                        <td>{`${Math.ceil(record.overdueRepaymentRate*10000)/100}%`}</td>
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
