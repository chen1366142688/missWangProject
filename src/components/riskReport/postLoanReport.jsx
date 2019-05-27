import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import {CLComponent, CLBlockList } from '../../../src/lib/component/index';
import CLList from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import _ from 'lodash';

import { Button, message, Table , Icon, Spin, Tabs, DatePicker, Row, Col ,Modal} from 'antd';
let {contentType, postLoanReportData, getUserTypeList, postLoanType} = Interface;
let TB;

class PostLoanReport extends CLComponent {
  state = {
    search: {},
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1
    },
    tableLoading: false,
    showTableExport: false,
    data: [],
    userTypeList: [],
    postLoantype: [],
  }

  constructor (props) {
    super(props);
    this.bindCtx([
      "renderBody",
      "loadData",
      "download",
      "pageChage",
      "handleCancel",
      "getFormFields",
    ]);
  }


  componentDidMount() {
    const that = this;
    //搜索条件
    let sessionSearch = sessionStorage.getItem('search');
    let search = this.state.search;
    if (sessionSearch) {
      search = JSON.parse(sessionSearch);
    }

    //分页
    let sessionPagination = sessionStorage.getItem('pagination');
    let pagination = this.state.pagination;
    if (sessionPagination) {
      pagination = JSON.parse(sessionPagination);
    }

    //排序
    let sessionSorter = sessionStorage.getItem('sorter');
    let sorter = this.state.sorter;
    if (sessionSorter) {
      sorter = JSON.parse(sessionSorter);
    }

    let type = sessionStorage.getItem("operateDataType") || "1";
    this.setState({type: type});
    this.userTypeList();
    this.postLoanType();
    this.loadData(this.state.search,this.state.pagination, this.state.sorter);
  }

  userTypeList = () => {
    const _this = this;

    const settings = {
      contentType,
      method: getUserTypeList.type,
      url: getUserTypeList.url
    };

    function fn(res) {
      if (res && res.data) {
        let userTypeList = res.data.map(item => {
          return {
            name: item.typeName,
            value: item.type
          };
        });
        _this.setState({ userTypeList });
      }
    }

    CL.clReqwest({ settings, fn });
  };

  postLoanType = () => {
    const that = this;
    const settings = {
      contentType,
      method: postLoanType.type,
      url: postLoanType.url,
    }
    function fn(res){
      if(res && res.data){
        let postLoantype = res.data.map(doc => {
          return {
            name: doc.typeName,
            value: doc.type,
          }
        })
        that.setState({ postLoantype });
      }
    }

    CL.clReqwest({ settings, fn });
  }



  loadData (search, page, sorter) {
    const that = this;
    that.setState({tableLoading: true});
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
      url: postLoanReportData.url,
      data: JSON.stringify(params)
    }

    function fn(res) {

      that.setState({ tableLoading: false });

      if (res.data) {

        const pagination = {
          total: res.data.totalCount,
          pageSize: res.data.pageSize,
          currentPage: res.data.currentPage,
        };

        sessionStorage.setItem('pagination', JSON.stringify(pagination));

        sessionStorage.setItem('search', JSON.stringify(search));

        that.setState({
          pagination: pagination,
          data: res.data.result,
          search: search
        });
      }
    }

    CL.clReqwest({settings, fn});
  }

  download (target) {
    const that = this;
    that.setState({showTableExport: true});
    const {tableexport} = that.props;
    setTimeout(() => {
      TB = tableexport(document.querySelector("#ex-table-post-loan-report"), {formats: ['csv','txt','xlsx']});
    }, 100);
  }

  handleCancel () {
    const that = this;
    that.setState({showTableExport: false});
    if (TB) {
      TB.remove();
    }
  }

  getFormFields (fields) {
    let search = {};
    _.map(fields, function (doc, index) {
      if (doc) {
        if (index === "sRepaymentTime") {
          search.beginTime = new Date(doc[0].format("YYYY-MM-DD HH:mm")).getTime();
          search.endTime = new Date(doc[1].format("YYYY-MM-DD HH:mm")).getTime();
        } else{
          search[index] = doc;
        }
      }
    })
    const pagination = this.state.pagination;
    pagination.currentPage = 1;

    search.userType = fields.userType;

    this.setState({search: search, pagination: pagination});
    this.loadData(search, pagination);
  }

  pageChage (e, filters, sorter) {//list 切换页面
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

    this.setState({pagination: pagination, sorter: sorterClient})
    this.loadData(this.state.search, pagination, sorterClient)
  }

  renderBody() {
    let that = this;
    const {data,} = that.state;
    const {download} = that.props;
    const columns = [
      {
        title: '应还款时间',
        dataIndex: 'shouldRepaymentTime',
        width: 200,
        render(index,record){
          return record.shouldRepaymentTime
        }
      },
      {
        title: '应收金额',
        dataIndex: 'receivableAmount',
        width: 200,
        render(index, record) {
          return CL.cf(record.receivableAmount, 2)
        }
      },
      {
        title: '逾期金额',
        dataIndex: 'overDueAmount',
        width: 200,
        render(index, record) {
          return CL.cf(record.overDueAmount, 2)
        }
      },
      {
        title: '应收笔数',
        dataIndex: 'receivableNumber',
        width: 200,
        render(index, record) {
          return CL.cf(record.receivableNumber, 0)
        }
      },
      {
        title: '逾期笔数',
        dataIndex: 'overDueNumber',
        width: 200,
        render(index, record) {
          return CL.cf(record.overDueNumber, 0)
        }
      }, {
        title: '自然逾期率',
        dataIndex: 'overDueRate',
        width: 200,
        render(index, record) {
          return CL.cf(record.overDueRate, 2)+'%'
        }
      }, {
        title: '逾期1天损失金额',
        dataIndex: 'overDueAmountInOneDay',
        width: 200,
        render(index, record) {
          return CL.cf(record.overDueAmountInOneDay, 2)
        }
      }, {
        title: '逾期3天损失金额',
        dataIndex: 'overDueAmountInThreeDay',
        width: 200,
        render(index, record) {
          return CL.cf(record.overDueAmountInThreeDay, 2)
        }
      }, {
        title: '逾期5天损失金额',
        dataIndex: 'overDueAmountInFiveDay',
        width: 200,
        render(index, record) {
          return CL.cf(record.overDueAmountInFiveDay, 2)
        }
      }, {
        title: '逾期1天损失率',
        dataIndex: 'overDueRateInOneDay',
        width: 200,
        render(index, record) {
          return CL.cf(record.overDueRateInOneDay, 2)+'%'
        }
      }, {
        title: '逾期3天损失率',
        dataIndex: 'overDueRateInThreeDay',
        width: 200,
        render(index, record) {
          return CL.cf(record.overDueRateInThreeDay, 2)+'%'
        }
      }, {
        title: '逾期5天损失率',
        dataIndex: 'overDueRateInFiveDay',
        width: 200,
        render(index, record) {
          return CL.cf(record.overDueRateInFiveDay, 2)+'%'
        }
      }, {
        title: '逾期11天损失率',
        dataIndex: 'overDueRateInElevenDay',
        width: 200,
        render(index, record) {
          return CL.cf(record.overDueRateInElevenDay, 2)+'%'
        }
      }, {
        title: '逾期31天损失率',
        dataIndex: 'overDueRateInThirtyOneDay',
        width: 200,
        render(index, record) {
          return CL.cf(record.overDueRateInThirtyOneDay, 2)+'%'
        }
      },{
        title: '逾期61天损失率',
        dataIndex: 'overDueRateInSixtyOneDay',
        width: 200,
        render(index, record) {
          return CL.cf(record.overDueRateInSixtyOneDay, 2)+'%'
        }
      },{
        title: '损失率',
        dataIndex: 'lossRate',
        width: 200,
        render(index, record) {
          return CL.cf(record.lossRate, 2)+'%'
        }
      },
      {
        title: '借款7天笔数',
        dataIndex: 'loanSevenDayNumber',
        width: 200,
        render(index, record) {
          return CL.cf(record.loanSevenDayNumber, 0)
        }
      },
      {
        title: '借款14天笔数',
        dataIndex: 'loanFourteenDayNumber',
        width: 200,
        render(index, record) {
          return CL.cf(record.loanFourteenDayNumber, 0)
        }
      },
      {
        title: '借款7天占比',
        dataIndex: 'loanSevenDayRate',
        width: 200,
        render(index, record) {
          return CL.cf(record.loanSevenDayRate, 2)+'%'
        }
      },{
        title: '借款14天占比',
        dataIndex: 'lonFourteenDayRate',
        width: 200,
        render(index, record) {
          return CL.cf(record.lonFourteenDayRate, 2)+'%'
        }
      },{
        title: '逾期用户回收金额',
        dataIndex: 'overDueAlreadyBackAmount',
        width: 200,
        render(index, record) {
          return CL.cf(record.overDueAlreadyBackAmount, 2)
        }
      },{
        title: '实际回收率',
        dataIndex: 'overDueArleadyBackRate',
        width: 200,
        render(index, record) {
          return CL.cf(record.overDueArleadyBackRate, 2)+'%'
        }
      },

    ];

    const operation = [
      {
        id: 'sRepaymentTime',
        type: 'rangePicker',
        label: '日期',
        placeholder: 'ranger',
      },
      {
        id: 'userType',
        type: 'select',
        label: '用户类型',
        options: this.state.userTypeList,
        placeholder: 'Please select',
      },
      {
        id: 'loanDays',
        type: 'select',
        label: '借款期限',
        options: this.state.postLoantype,
        placeholder: 'Please select',
      }
    ];


      let makeUserType = () => {
          const _this = this;
          let user = _.find(this.state.userTypeList, usr => {
              return usr.value == _this.state.search.userType;
          });
          return user ? user.name : "全部客户";
      };

    let settings = {
      data: data.map((doc, index) =>{
        doc.id = index;
        return doc;
      }),
      operation:operation,
      columns: columns,
      getFields: that.getFormFields,
      pagination: that.state.pagination || {},
      pageChange: that.pageChage,
      tableLoading: that.state.tableLoading,
      search: that.state.search,
      defaultdate: [
        {
            name: `用户类型 : ` + makeUserType(),
        }
      ],
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
      '应还款时间',
      '应收金额',
      '逾期金额',
      '应收笔数',
      '逾期笔数',
      '自然逾期率',
      '逾期1天损失金额',
      '逾期3天损失金额',
      '逾期5天损失金额',
      '逾期1天损失率',
      '逾期3天损失率',
      '逾期5天损失率',
      '逾期11天损失率',
      '逾期31天损失率',
      '逾期61天损失率',
      '损失率',
      '借款7天笔数',
      '借款14天笔数',
      '借款7天占比',
      '借款14天占比',
      '逾期用户回收金额',
      '实际回收率'
    ];

    return (
      <div className="credit-collection" key="credit-collection">
        <CLList settings={settings} />

        <Modal
           className="te-modal"
           title="Download"
           closable={true}
           visible={that.state.showTableExport}
           width = {"100%"}
           style={{ top: 0}}
           onCancel = {that.handleCancel}
           footer={[
             <Button key="back" size="large" onClick={that.handleCancel}>Cancel</Button>,
           ]}
           >
           <table className="ex-table" id="ex-table-post-loan-report">
             <thead>
               <tr>
                 {th.map( function (doc) {
                   return (<th key={doc}>{doc}</th>)
                 })}
               </tr>
             </thead>
             <tbody>
               {
                 data.map( function (record, index) {
                   return (
                     <tr key={index}>
                       <td>{record.shouldRepaymentTime}</td>
                       <td>{CL.cf(record.receivableAmount,2)}</td>
                       <td>{CL.cf(record.overDueAmount,2)}</td>
                       <td>{CL.cf(record.receivableNumber,2)}</td>
                       <td>{CL.cf(record.overDueNumber,2)}</td>
                       <td>{CL.cf(record.overDueRate, 2)}</td>
                       <td>{CL.cf(record.overDueAmountInOneDay,2)}</td>
                       <td>{CL.cf(record.overDueAmountInThreeDay,2)}</td>
                       <td>{CL.cf(record.overDueAmountInFiveDay,2)}</td>
                       <td>{CL.cf(record.overDueRateInOneDay,2)+'%'}</td>
                       <td>{CL.cf(record.overDueRateInThreeDay,2)+'%'}</td>
                       <td>{CL.cf(record.overDueRateInFiveDay,2)+'%'}</td>
                       <td>{CL.cf(record.overDueRateInElevenDay,2)+'%'}</td>
                       <td>{CL.cf(record.overDueRateInThirtyOneDay,2)+'%'}</td>
                       <td>{CL.cf(record.overDueRateInSixtyOneDay,2)+'%'}</td>
                       <td>{CL.cf(record.lossRate,2)+'%'}</td>
                       <td>{CL.cf(record.loanSevenDayNumber,2)}</td>
                       <td>{CL.cf(record.loanFourteenDayNumber,2)}</td>
                       <td>{CL.cf(record.loanSevenDayRate,2)+'%'}</td>
                       <td>{CL.cf(record.lonFourteenDayRate,2)+'%'}</td>
                       <td>{CL.cf(record.overDueAlreadyBackAmount,2)}</td>
                       <td>{CL.cf(record.overDueArleadyBackRate,2)+'%'}</td>
                     </tr>
                   )
                 })
               }
             </tbody>
           </table>
        </Modal>
      </div>
    )

  }




  render (data) {
    return (
      <QueueAnim className="animate-content">
        {this.renderBody()}
      </QueueAnim>
    )
  }
}
export default PostLoanReport;

//add something for commit
