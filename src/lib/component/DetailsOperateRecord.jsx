import React from 'react';
import moment from 'moment';
import {Table} from 'antd';
import {CL} from '../tools/index';
import CLComponent from './CLComponent.jsx';
import {Interface} from "../config/index.js";
import { Tooltip } from 'antd';
const {Details, contentType} = Interface;

class OperateRecord extends CLComponent {
    state = {}

    constructor(props) {
        super(props);
        this.bindCtx([
            'loadData',
        ]);
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        const that = this;
        const memberId = that.props.memberId;
        const applicationId = that.props.applicationId;

        const operateRecordHistorySettings = {
            contentType,
            method: Details.getOperateRecordHistory.type,
            url: Details.getOperateRecordHistory.url,
            data: JSON.stringify({
                memberId,
                lessId: applicationId
            })
        }

        function operateRecordHistoryFn(res) {
            if (res.data) {
                that.setState({operateRecordHistory: res.data || []});
            }
        }

        if (memberId && applicationId) {
            CL.clReqwest({settings: operateRecordHistorySettings, fn: operateRecordHistoryFn});
        } else {
            that.setState({operateRecordHistory: []});
        }
    }


    render() {
        const that = this;
        const remarkStyle = {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
            width: '200px',
        };
        const operationRecord = {
            columns: [
                {
                    title: 'Application No',
                    dataIndex: 'applicationId',
                    // width:'10%',
                },
                {
                    title: 'Operation',
                    dataIndex: 'operateStatusName',
                    width:'15%',
                    render: function (text, record) {
                        let warn = {color: "red"}
                        if (record.operateStatusName === "Rollback") {
                            return (<span style={warn}>{record.operateStatusName}</span>)
                        } else {
                            return record.operateStatusName;
                        }
                    }
                },
                {
                    title: 'Operator',
                    dataIndex: 'fullName',
                    width:'10%',
                },
                {
                    title: 'Operate date',
                    dataIndex: 'operateTime',
                    width:'15%',
                    render: function (text, record) {
                        return moment(new Date(record.operateTime)).format("YYYY-MM-DD HH:mm");
                    }
                },
                {
                    title: 'Comment',
                    dataIndex: 'operateDesc',
                    width:'25%',
                    render: function (index, record) {
                        return (
                            <div style={{position: 'relative'}}>
                                <Tooltip placement="top" title={record.operateDesc} defaultVisible={false}
                                         overlayStyle={{wordWrap: 'break-word'}}>
                                    <p style={remarkStyle}>{record.operateDesc}</p>
                                </Tooltip>
                            </div>
                        );
                    },
                },
                {
                    title: 'Operate Reason',
                    dataIndex: 'operateReasonDesc',
                    width:'25%',
                    render: function (index, record) {
                        return (
                            <div style={{position: 'relative'}}>
                                <Tooltip placement="top" title={record.operateReasonDesc} defaultVisible={false}
                                         overlayStyle={{wordWrap: 'break-word'}}>
                                    <p style={remarkStyle}>{record.operateReasonDesc}</p>
                                </Tooltip>
                            </div>
                        );
                    },
                },

            ],
            data: (that.state.operateRecordHistory || []).map((doc, index) => {
                doc.index = index + 1;
                return _.pick(doc, [
                    "index",
                    "applicationId",
                    "operateStatusName",
                    "fullName",
                    "operateTime",
                    "operateDesc",
                    "operateReasonDesc"
                ]);

            })
        }

        return (
            <Table bordered className="rollback-log cl-table" key="rollback-log cl-table"
                   title={() => (<h4 className="table-title"> Operation Record </h4>)}
                   loading={!that.state.operateRecordHistory}
                   pagination={false}
                   columns={operationRecord.columns}
                   rowKey={record => record.index}
                   scroll={{ y: 320 }}
                   dataSource={operationRecord.data}/>
        );
    }
}

export default OperateRecord;
