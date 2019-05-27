import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import {CLComponent, CLBlockList} from '../../../src/lib/component/index';
import CLList from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import _ from 'lodash';

import { Button, message, Table , Icon, Spin, Tabs, DatePicker, Row, Col ,Modal} from 'antd';
let {contentType, postLoanReportData,getCreditCollectionList} = Interface;
let TB;
//PromiseToPay
class PromiseToPay extends CLComponent {
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
        sorter: {
            sortFieldType: 3,
            sortType: 1
          },
      }
  constructor (props) {
    super(props);
    this.bindCtx([
      "renderBody",
      "pageChage",
      "loadDataTab2"
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
      // this.loadDataTab2(this.state.search,this.state.pagination, this.state.sorter);
  }

  loadDataTab2 (search, page, sorter) {
      const that = this;
      let search2 = {
        endPromiseTime: new Date().getTime() +  30 * 60 * 1000,
        startPromiseTime: new Date("2019-01-01").getTime(),
        collectStatusRange: ["12"],
        repaymentStatus: "4"
      };

      let params = {
        page: {
          currentPage: page.currentPage || 1,
          pageSize: page.pageSize || 10
        },
        loanBasisInfoJoinOrderInfo: search2,
      }

      const settings = {
        contentType,
        method: 'post',
        url: getCreditCollectionList.url,
        data: JSON.stringify(params)
      }

      function fn (res) {


        that.setState({tableLoading: false});
        let data = res.data;
        if (data) {
          let pagination = {
            total: data.page.totalCount,
            pageSize: page.pageSize,
            currentPage: page.currentPage,
          }
          sessionStorage.setItem("pagination", JSON.stringify(pagination));
          sessionStorage.setItem("search", JSON.stringify(search));
          sessionStorage.setItem("sorter", JSON.stringify(sorter));


          let cityArr = [];
          //city 去重
          _.each(data.creditCity, function (doc) {
            let fn = _.find(cityArr, {creditName: doc.creditName});
            if (!fn) {
              cityArr.push(doc);
            }
          });

          const otherRepaymentStatus = CL.setOptions(data.specialStatus);

          that.setState({
            pagination: pagination,
            data: data.page.result || [],
          })
        }
      }


      CL.clReqwest({settings, fn});
    }


  pageChage (e, filters, sorter) {//list 切换页面

      let pagination = {
        currentPage: e.current,
        pageSize: e.pageSize,
        total: this.state.pagination.total
      }


      this.setState({pagination: pagination});

      // this.loadDataTab2(this.state.search, pagination, this.state.sorter);
    }

  renderBody() {
      let that = this;
      // const {data,} = that.state;

      let settings = this.props.settings;
      // settings.data = data;
      // settings.pagination = that.state.pagination || {};
      settings.pageChange =  that.pageChage;

    return (
      <div className="credit-collection" key="credit-collection">
        <CLList settings={settings} />
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


export default PromiseToPay;

//add something for commit
