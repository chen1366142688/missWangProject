import React from 'react';
import {CLComponent} from 'Lib/component/index';
import {CL} from 'Lib/tools/index';
import {Interface} from 'Lib/config/index';
import {Table, DatePicker, Button, message, Select, Modal, InputNumber} from 'antd';
import moment from 'moment';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';
import ReactDom from 'react-dom';

const {RangePicker} = DatePicker;
let {contentType, getAppNameList, getBIMemberConversionRate} = Interface;
import tableexport from 'tableexport';

let TB;

export default class UserRetainMonitor extends CLComponent {
    constructor(props) {
        super(props);

        this.state = {
            list: [],
            search: {
                minMonth: 1,
                maxMonth: 1
            },
            options: {
                flatformOpt: [],
                userOpt: [],
            },
            loading: false,
            startDate: null,
            endDate: null,
            appVersion: "",
            retain: "",
            showTableExport: false,
            mapTitle: ""
        }
    }

    componentDidMount() {
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
            value: "新增放款用户",
            key: '0'
        }, {
            value: "复贷第一笔用户",
            key: '1'
        }, {
            value: "复贷第二笔用户",
            key: '2'
        }];
        this.setState({options});
    };

    getFormFields = (fields) => {
        const pagination = this.state.pagination;
        pagination.page = 1;

        this.setState({search: fields, pagination});
        this.loadData(fields);
    };

    onDateChange = (e) => {
        let start = moment(moment(e[0]).format('YYYY-MM-01 00:00:00')),
            end = moment(e[1].endOf('month').format("YYYY-MM-DD 23:59:59"));
        let search = this.state.search;
        search.startDate = start;
        search.endDate = end;
        this.setState({
            startDate: start,
            endDate: end,
            search
        })
    };

    dealDate = (myDate, whetherStart) => {
        return myDate ? moment(myDate.format("YYYY-MM-DD") + (whetherStart ? " 00:00:00" : " 23:59:59")).unix() :
            (moment(moment().format("YYYY-MM-DD") + (whetherStart ? " 00:00:00" : " 23:59:59")).unix());
    };

    loadData = (search) => {
        search = search || this.state.search;
        if (!this.state.search.retain) {
            message.warn("请选择留存群体！");
            return;
        }
        const _this = this;
        const settings = {
            contentType,
            method: getBIMemberConversionRate.type,
            url: getBIMemberConversionRate.url,
            data: JSON.stringify({
                appVersion: search.appVersion,
                startDate: search.startDate && this.dealDate(search.startDate, true) * 1000,
                endDate: search.endDate && this.dealDate(search.endDate) * 1000,
                startKeepRange: search.minMonth,
                endKeepRange: search.maxMonth,
                keepMemberType: search.retain
            })
        };

        this.setState({
            loading: true
        });

        function fn(res) {
            if (res && res.data) {
                let mapList = _.map(res.data, item => {
                    let data = [];
                    _.each(item.keepList, itr => {
                        let keyArr = Object.keys(itr);
                        (itr[keyArr[0]] != null && item.memberCount > 0) && data.push(Math.ceil((itr[keyArr[0]] / item.memberCount) * 10000) / 100)
                    })
                    return {
                        date: moment(item.processDate + "-01").format("YYYY年MM月"),
                        data
                    }
                });
                let tableList = _.map(res.data, item => {
                    let dt = {
                        date: moment(item.processDate + "-01").format("YYYY年MM月"),
                        userNumber: item.memberCount
                    };
                    let idx = search.minMonth;
                    _.each(item.keepList, itr => {
                        let keyArr = Object.keys(itr);
                        dt[`retain${idx}Month`] = (itr[keyArr[0]] == null || item.memberCount <= 0) ? null : Math.ceil((itr[keyArr[0]] / item.memberCount) * 10000) / 100;
                        idx++;
                    })
                    return dt;
                });
                _this.refreshEcharts(_this.state.search.minMonth, _this.state.search.maxMonth, mapList);
                _this.setState({list: tableList || [], loading: false});
            }
        }

        CL.clReqwest({settings, fn});
    };

    onClear = () => {
        this.setState({
            startDate: null,
            endDate: null,
            search: {}
        })
    };

    onAppNameChange = (e) => {
        let {search} = this.state;
        search.appVersion = e;
        this.setState({
            search
        })
    };

    onDownload = (e) => {
        this.setState({showTableExport: true});
        setTimeout(() => {
            TB = tableexport(document.querySelector('#ex-table-retain-process'), {formats: ['csv', 'txt', 'xlsx']});
        }, 100);
    };

    getExportTableHead = (minMonth, maxMonth) => {
        let columns = ['日期', '用户数'];
        if (typeof minMonth == "number" && typeof maxMonth == "number") {
            while (minMonth <= maxMonth) {
                columns.push(`第${minMonth}月留存率`);
                minMonth++;
            }
        }

        return columns;
    };

    getExportTableBody = (minMonth, maxMonth, record, index) => {
        let columms = [<td>{record.date}</td>,
            <td>{record.userNumber}</td>];

        if (typeof minMonth == "number" && typeof maxMonth == "number") {
            while (minMonth <= maxMonth) {
                columms.push(
                    <td>{record[`retain${minMonth}Month`] != null && (record[`retain${minMonth}Month`] + '%')}</td>);
                minMonth++;
            }
        }
        return <tr key={index}>
            {columms}
        </tr>
    };

    handleCancel = () => {
        this.setState({showTableExport: false});
        if (TB) {
            TB.remove();
        }
    };

    onRetainChange = (e) => {
        let {search} = this.state;
        search.retain = e;
        let item = _.find(this.state.options.userOpt, itr => {
            return itr.key == e;
        })
        this.setState({
            search,
            mapTitle: item.value
        })
    };

    onMinMonthChange = (e) => {
        let {search} = this.state;
        if (typeof e == "number" || e == "") {
            search.minMonth = e;
        }
        this.setState({
            search
        })
    };

    onMaxMonthChange = (e) => {
        let {search} = this.state;
        if (typeof e == "number" || e == "") {
            search.maxMonth = e;
        }
        this.setState({
            search
        })
    };

    getOption = (minMonth, maxMonth, list) => {
        let xAxis = [];
        if (typeof minMonth == "number" && typeof maxMonth == "number") {
            while (minMonth <= maxMonth) {
                xAxis.push(`第${minMonth}月留存率`);
                minMonth++;
            }
        }

        let series = [], lines = [];

        list = list || this.state.list;

        _.each(list, item => {
            lines.push(item.date);
            series.push({
                name: item.date,
                type: 'line',
                data: item.data
            });
        })

        let mapBottom = (Math.ceil(list.length / 15) + 1) * 7;
        let option = {
            title: {
                text: this.state.mapTitle,
                left: 'center',
                top: 10
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: lines,
                x: 'center',
                y: 'bottom'
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: mapBottom + '%',
                containLabel: true,
            },
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: xAxis
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '{value} %'
                }
            },
            series: series
        };

        return option;
    };

    refreshEcharts = (minMonth, maxMonth, list) => {
        ReactDom.unmountComponentAtNode(document.getElementById('echart-area'));
        ReactDom.render(
            <ReactEcharts style={{marginTop: "15px"}} option={this.getOption(minMonth, maxMonth, list)}/>,
            document.getElementById('echart-area'),
        );
    };

    render() {
        let {minMonth, maxMonth} = this.state.search;

        let columns = getColumnsList(minMonth, maxMonth);

        let th = this.getExportTableHead(minMonth, maxMonth);

        return (
            <div className="daily-monitor">
                <div className="select-panel">
                    <p>
                        <span>日期：</span>
                        <RangePicker onPanelChange={this.onDateChange}
                                     format="YYYY-MM"
                                     mode={["month", "month"]}
                                     value={[this.state.startDate, this.state.endDate]}/>
                        <span style={{marginLeft: "60px"}}>留存区间：</span>
                        <span style={{marginRight: "5px"}}>第</span>
                        <InputNumber min={1} value={minMonth} onChange={this.onMinMonthChange} style={{width: "50px"}}/>
                        <span style={{marginLeft: "5px"}}>月 - </span>
                        <span style={{marginRight: "5px"}}>第</span>
                        <InputNumber min={1} value={maxMonth} onChange={this.onMaxMonthChange} style={{width: "50px"}}/>
                        <span style={{marginLeft: "5px"}}>月</span>
                        <span style={{marginLeft: "50px"}}>平台：</span>
                        <Select placeholder="Please select"
                                value={this.state.search.appVersion}
                                allowClear
                                onChange={this.onAppNameChange}
                                style={{width: 200}}>
                            {_.map(this.state.options.flatformOpt, app => {
                                return <Option value={app.value}>{app.name}</Option>
                            })}
                        </Select>
                        <span style={{marginLeft: "50px"}}>留存群体：</span>
                        <Select placeholder="Please select"
                                value={this.state.search.retain}
                                onChange={this.onRetainChange}
                                style={{width: 200}}>
                            {_.map(this.state.options.userOpt, app => {
                                return <Option value={app.key}>{app.value}</Option>
                            })}
                        </Select>
                    </p>
                    <p className="daily-monitor-footer">
                        <Button type="primary" onClick={() => this.loadData()}
                                loading={this.state.loading}>Search</Button>
                        <Button type="default" onClick={this.onClear}>Clear</Button>
                        <Button type="default" onClick={this.onDownload}>Download</Button>
                    </p>
                </div>
                <Table dataSource={this.state.list}
                       columns={columns}
                       bordered
                       pagination={false}
                       loading={this.state.loading}
                       scroll={{x: (maxMonth - minMonth + 3) * 120, y: 400}}>
                </Table>
                <div id="echart-area" style={{margin: "10px"}}>
                </div>
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
                    <table className="ex-table" id="ex-table-retain-process">
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
                                    this.getExportTableBody(minMonth, maxMonth, record, index)
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

let getColumnsList = (minMonth, maxMonth) => {
    let columns = [{
        title: '日期',
        dataIndex: 'date',
        width: 120,
        fixed: 'left'
    }, {
        title: '用户数',
        dataIndex: 'userNumber',
        fixed: 'left',
        width: 100
    }];
    if (typeof minMonth == "number" && typeof maxMonth == "number") {
        while (minMonth <= maxMonth) {
            if (minMonth == 1) {
                let column = {
                    title: `当月留存率`,
                    dataIndex: `retain${minMonth}Month`,
                    render(text, data) {
                        return text != null && (text + '%');
                    }
                };
                if ((maxMonth - minMonth) > 0) {
                    column.width = 120;
                }

                columns.push(column);
            } else {
                let column = {
                    title: `第${minMonth}月留存率`,
                    dataIndex: `retain${minMonth}Month`,
                    render(text, data) {
                        return text != null && (text + '%');
                    }
                };
                if ((maxMonth - minMonth) > 0) {
                    column.width = 120;
                }

                columns.push(column);
            }
            minMonth++;
        }

    }
    return columns;
}