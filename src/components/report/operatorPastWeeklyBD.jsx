import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent, CLBlockList } from '../../../src/lib/component/index';
import CLlist from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import _ from 'lodash';

import { Button, message, Table, Icon, Spin, Tabs, DatePicker, Row, Col, Modal } from 'antd';

let { contentType, getWeekBusinessReport } = Interface;
let TB;

//运营周报 业务方向  历史周业务

class OperatorPastWeeklyBD extends CLComponent {
    state = {
        search: {},
        pagination: {
            total: 0,
            pageSize: 10,
            currentPage: 1
        },
        tableLoading: false,
        showTableExport: false,
        data: []
    }

    constructor( props ) {
        super( props );
        this.bindCtx( [
            "renderBody",
            "loadData",
            "download",
            "pageChage",
            "handleCancel",
            "getFormFields",
        ] );
    }


    componentDidMount() {
        const that = this;
        //搜索条件
        let sessionSearch = sessionStorage.getItem( 'search' );
        let search = this.state.search;
        if ( sessionSearch ) {
            search = JSON.parse( sessionSearch );
        }

        //分页
        let sessionPagination = sessionStorage.getItem( 'pagination' );
        let pagination = this.state.pagination;
        if ( sessionPagination ) {
            pagination = JSON.parse( sessionPagination );
        }

        //排序
        let sessionSorter = sessionStorage.getItem( 'sorter' );
        let sorter = this.state.sorter;
        if ( sessionSorter ) {
            sorter = JSON.parse( sessionSorter );
        }

        let type = sessionStorage.getItem( "operateDataType" ) || "1";
        this.setState( { type: type } )
        this.loadData( this.state.search, this.state.pagination, this.state.sorter );
    }





    loadData( search, page, sorter ) {
        const that = this;
        that.setState( { tableLoading: true } );

        let params = {
            page: {
                currentPage: page.currentPage || 1,
                pageSize: page.pageSize || 10
            },
            searchCondition: search || this.state.search
        }

        const settings = {
            contentType,
            method: 'post',
            url: getWeekBusinessReport.url,
            data: JSON.stringify( params )
        }

        function fn( res ) {

            that.setState( { tableLoading: false } );

            if ( res.data ) {

                const pagination = {
                    total: res.data.page.totalCount,
                    pageSize: res.data.page.pageSize,
                    currentPage: res.data.page.currentPage,
                }

                sessionStorage.setItem( "pagination", JSON.stringify( pagination ) );

                sessionStorage.setItem( "search", JSON.stringify( search ) );

                that.setState( {
                    pagination: pagination,
                    data: res.data.page.result,
                    search: search
                } )
            }
        }

        CL.clReqwest( { settings, fn } );
    }


    download( target ) {
        const that = this;
        that.setState( { showTableExport: true } );
        const { tableexport } = that.props;
        setTimeout(() => {
            TB = tableexport( document.querySelector( "#ex-table-operator-past-weekly-bd" ), {formats: ['csv','txt','xlsx']});
        }, 100 );
    }

    handleCancel() {
        const that = this;
        that.setState( { showTableExport: false } );
        if ( TB ) {
            TB.remove();
        }
    }

    getFormFields( fields ) {
        let search = {};
        _.map( fields, function( doc, index ) {
            if ( doc ) {
                if ( index === "sRepaymentTime" ) {
                    search.beginTime = new Date( doc[0].format( "YYYY-MM-DD HH:mm" ) ).getTime();
                    search.endTime = new Date( doc[1].format( "YYYY-MM-DD HH:mm" ) ).getTime();
                } else {
                    search[index] = doc;
                }
            }
        } )
        const pagination = this.state.pagination;
        pagination.currentPage = 1;
        console.log( "this is search debug" + search.beginTime + search.endTime );
        this.setState( { search: search, pagination: pagination } );
        this.loadData( search, pagination );
    }

    pageChage( e, filters, sorter ) {//list 切换页面
        let pagination = {
            currentPage: e.current,
            pageSize: e.pageSize,
            total: this.state.pagination.total
        }

        const SORTDIC = {
            "applicationTime": 2,
            "memberRegisterDate": 1,
            "descend": 1,
            "ascend": 2
        }

        let sorterClient = {
            sortFieldType: SORTDIC[sorter.field] || 2,
            sortType: SORTDIC[sorter.order] || 1,
        }

        this.setState( { pagination: pagination, sorter: sorterClient } )
        this.loadData( this.state.search, pagination, sorterClient )
    }

    renderBody() {
        let that = this;
        const { data, } = that.state;
        const { download } = that.props;
        const columns = [
            {
                title: '日期',
                dataIndex: 'strDate',
                width: 200,
                render( index, record ) {
                    return record.strDate
                }
            },
            {
                title: '放款笔数',
                dataIndex: 'lendingCount',
                width: 200,
                render( index, record ) {
                    return CL.cf( record.lendingCount, 0 )
                }
            }, {
                title: '放款金额',
                dataIndex: 'lendingAmount',
                width: 200,
                render( index, record ) {
                    return CL.cf( record.lendingAmount, 2 )
                }
            }, {
                title: '申请笔数',
                dataIndex: 'applicationCount',
                width: 200,
                render( index, record ) {
                    return CL.cf( record.applicationCount, 0 )
                }
            }, {
                title: '注册人数',
                dataIndex: 'registerCount',
                width: 200,
                render( index, record ) {
                    return CL.cf( record.registerCount, 0 )
                }
            }
        ];


        const operation = [
            {
                id: "sRepaymentTime",
                type: 'rangePicker',
                label: '日期',
                placeholder: 'ranger',
            },
        ];

        let settings = {
            data: data,
            columns: columns,
            operation: operation,
            getFields: that.getFormFields,
            pagination: that.state.pagination || {},
            pageChange: that.pageChage,
            tableLoading: that.state.tableLoading,
            search: that.state.search,
            btn: [
                {
                    title: "Download",
                    type: "danger",
                    fn: that.download
                }
            ],
        }


        //下载表格
        const th = [
            '日期',
            '放款笔数',
            '放款金额',
            '申请笔数',
            '注册人数',
        ];

        return (
            <div className="credit-collection" key="credit-collection">
                <CLlist settings={settings} />

                <Modal
                    className="te-modal"
                    title="Download"
                    closable={true}
                    visible={that.state.showTableExport}
                    width={"100%"}
                    style={{ top: 0 }}
                    onCancel={that.handleCancel}
                    footer={[
                        <Button key="back" size="large" onClick={that.handleCancel}>Cancel</Button>,
                    ]}
                >
                    <table className="ex-table" id="ex-table-operator-past-weekly-bd">
                        <thead>
                            <tr>
                                {th.map( function( doc ) {
                                    return ( <th key={doc}>{doc}</th> )
                                } )}
                            </tr>
                        </thead>
                        <tbody>
                            {
                                data.map( function( record, index ) {
                                    return (
                                        <tr key={index}>
                                            <td>{record.strDate}</td>
                                            <td>{CL.cf( record.lendingCount, 0 )}</td>
                                            <td>{CL.cf( record.lendingAmount, 2 )}</td>
                                            <td>{CL.cf( record.applicationCount, 0)}</td>
                                            <td>{CL.cf( record.registerCount, 0 )}</td>
                                        </tr>
                                    )
                                } )
                            }
                        </tbody>
                    </table>
                </Modal>
            </div>
        )

    }




    render( data ) {
        return (
            <QueueAnim className="animate-content">
                {this.renderBody()}
            </QueueAnim>
        )
    }
}
export default OperatorPastWeeklyBD;

//add something for commit