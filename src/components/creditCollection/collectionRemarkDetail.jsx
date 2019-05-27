import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import {CLComponent, CLBlockList} from '../../../src/lib/component/index';
import CLList from '../../../src/lib/component/CLlist.jsx';
import {CLAnimate, CL} from '../../../src/lib/tools/index';
import {Interface} from '../../../src/lib/config/index';
import _ from 'lodash';

import {Button, DatePicker, Modal} from 'antd';
import tableexport from 'tableexport';

const {contentType, collectionRemark, getAuthRoleList, operatorAndRole, collectHistoryLog, getCompanyList} = Interface;
let TB;

class CollectionRemarkDetail extends CLComponent {

    constructor(props) {
        super(props);

        this.state = {
            data: [],
            collectors: [],
            status: [],
            pagination: {
                total: 0,
                pageSize: 10,
                currentPage: 1
            },
            tableLoading: false,
            search: {
                time: []
            },
            companyList: []
        }
    }

    componentDidMount() {
        let search, pagination;
        let sessionSearch = sessionStorage.getItem('search');
        let sessionPagination = sessionStorage.getItem('pagination');
        try {
            search = (sessionSearch ? JSON.parse(sessionSearch) : this.state.search);
            pagination = (sessionPagination ? JSON.parse(sessionSearch) : this.state.pagination);
        }
        catch (e) {
            throw new Error("json parse error");
        }

        this.setState({search: search, pagination: pagination});

        this.getRolesList();
        this.getCollectionStatus();
        this.getCompanyListMth();
        this.loadTable(search || this.state.search, pagination || this.state.pagination);
    }

    getCompanyListMth = () => {
        let settings = {
            contentType,
            method: getCompanyList.type,
            url: getCompanyList.url,
            data: JSON.stringify({
                pageRequestDto: {
                    currentPage: 1,
                    limit: 1000,
                    order: 'desc',
                    sort: ['id']
                }
            })
        };

        CL.clReqwestPromise(settings)
            .then((res) => {
                if (res.status === "SUCCESS") {
                    let companyList = res.response.rows.map(item => {
                        return {
                            name: item.name,
                            value: item.id
                        }
                    }) || [];
                    companyList.unshift({
                        name: "Unipeso",
                        value: 0
                    });
                    this.setState({
                        companyList
                    })
                }
            });
    };

    getFormFields = (fields) => {
        const pagination = this.state.pagination;
        pagination.currentPage = 1;
        let search = this.state.search;
        search.collectorId = fields.collectorId;
        search.collectStatus = fields.collectStatus;
        search.companyId = fields.companyId;
        if (fields.time && fields.time.length) {
            search.startDate = fields.time[0];
            search.endDate = fields.time[1]
        } else {
            delete search.startDate;
            delete search.endDate;
        }
        this.setState({search, pagination});
        this.loadTable(search, pagination);
    }

    getRolesList = () => {
        const _this = this;
        const settings = {
            contentType,
            method: getAuthRoleList.type,
            url: getAuthRoleList.url,
            data: JSON.stringify(
                {
                    page: {currentPage: 1, pageSize: 200},
                    authRole: {
                        remark: '催收分单权限',
                    },
                },
            ),
        };

        function fn(res) {
            if (res && res.data) {
                const result = res.data.page.result;
                const arr = Array.from(new Set(result.map((doc) => {
                    return doc.id;
                })));

                const settings = {
                    contentType,
                    method: operatorAndRole.type,
                    url: operatorAndRole.url,
                    data: JSON.stringify({roleIdRange: arr}),
                };

                function fn(res) {
                    const arr = [];
                    res.data.userRole.map((doc) => {
                        if (!_.find(arr, {optId: doc.optId})) {
                            arr.push(doc);
                        }
                    });

                    _this.setState({
                        collectors: arr.map((doc) => {
                            return {
                                name: doc.roleName,
                                value: doc.optId,
                            };
                        }),
                    });
                }

                CL.clReqwest({settings, fn});
            }
        }

        CL.clReqwest({settings, fn});
    }

    getCollectionStatus = () => {
        const _this = this;
        const settings = {
            contentType,
            method: collectionRemark.type,
            url: collectionRemark.url
        };

        function fn(res) {
            if (res && res.data) {
                let status = res.data.map(status => {
                    return {
                        name: status.typeName,
                        value: status.type,
                    }
                });
                _this.setState({status});
            }
        }

        CL.clReqwest({settings, fn});
    }

    loadTable = (search, page) => {
        let _this = this;
        this.setState({tableLoading: true});
        let params = {
            collectorId: search && search.collectorId,
            collectStatus: search.collectStatus,
            companyId: search.companyId,
            start: search && search.startDate,
            end: search && search.endDate,
            currentPage: page.currentPage || 1,
            pageSize: page.pageSize || 10
        };
        const settings = {
            contentType,
            method: collectHistoryLog.type,
            url: collectHistoryLog.url,
            data: JSON.stringify(params),
        };

        function fn(res) {
            if (res && res.data) {
                const list = res.data.result;

                const pagination = {
                    total: res.data.totalCount,
                    pageSize: page.pageSize,
                    currentPage: page.currentPage,
                };
                // 保存当前的搜索条件 以及分页
                sessionStorage.setItem('pagination', JSON.stringify(pagination));
                sessionStorage.setItem('search', JSON.stringify(search));
                _this.setState({
                    data: list,
                    pagination: pagination,
                    tableLoading: false
                });
            }

        }

        CL.clReqwest({settings, fn});
    }

    pageChange = (e, filters) => {
        //list 切换页面
        let pagination = {
            currentPage: e.current,
            pageSize: e.pageSize,
            total: this.state.pagination.total
        }
        this.setState({pagination: pagination});
        this.loadTable(this.state.search, pagination)
    }

    render(data) {
        const {collectors} = this.state;
        const _this = this;
        const columns = [
            {
                title: '时间',
                dataIndex: 'collectorTime',
                key: 'collectorTime',
                width: '8%',
                render(index, record) {
                    return moment(record.collectorTime).format('YYYY-MM-DD HH:mm:ss')
                }
            },
            {
                title: '催收员',
                dataIndex: 'collectorName',
                key: 'collectorName',
                width: '5%'
            },
            {
                title: 'Company',
                dataIndex: 'companyName',
                width: '8%'
            },
            {
                title: '申请单号',
                dataIndex: 'applicationId',
                key: 'applicationId',
                width: '5%'
            },
            {
                title: '催记状态',
                dataIndex: 'collectStatus',
                key: 'collectStatus',
                width: '15%',
                render(index, record) {
                    let item = _.find(_this.state.status, status => {
                        return status.value == record.collectStatus;
                    })
                    return item && item.name

                }
            },
            {
                title: '催记内容',
                dataIndex: 'message',
                key: 'message',
                render(index, record) {
                    return <span style={{
                        maxWidth: "500px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "inline-block"
                    }} title={record.message}>{record.message}</span>
                }
            },
        ];

        const operation = [
            {
                id: 'time',
                type: 'rangePicker',
                label: '时间',
                placeholder: 'ranger',
            },

            {
                id: 'collectorId',
                type: 'select',
                label: '催收员',
                options: collectors,
                placeholder: 'Please select',
            },

            {
                id: 'collectStatus',
                type: 'select',
                label: '催记状态',
                options: this.state.status,
                placeholder: 'Please select',
            },
            {
                id: 'companyId',
                type: 'select',
                label: 'Company',
                placeholder: 'Please select',
                options: this.state.companyList || []
            }
        ];

        const settings = {
            data: this.state.data,
            operation: operation,
            columns: columns,
            getFields: this.getFormFields,
            pagination: this.state.pagination || {},
            pageChange: this.pageChange,
            tableLoading: this.state.tableLoading,
            search: this.state.search,
            defaultdate: []
        };

        return (
            <QueueAnim className="animate-content">
                <div className="collection-remark-detail">
                    <CLList settings={settings}/>
                </div>
            </QueueAnim>
        );
    }
}

export default CollectionRemarkDetail;
