import React from 'react';
import moment from 'moment';
import { CLComponent } from '../../../src/lib/component/index';
import { Button, message, Table , Icon, Spin, Tabs, DatePicker, Row, Col } from 'antd';
import { Interface } from '../../../src/lib/config/index';
import { CL } from '../../../src/lib/tools/index';
import CF from 'currency-formatter';

let  { analysisList, contentType, userActive } = Interface;
function strMapToObj(strMap) {
  let obj = Object.create(null);
  for (let [k,v] of strMap) {
    obj[k] = v;
  }
  return obj;
}

const NAME = {
  newLoanAmount: 'Borrowing Amount',
  newRegister: 'Registration Account',
  newLoanAmountUser: 'Application Account',
  newLoanDataSuceeUser: 'Disbrusment Account',
  newCompleteDataUser: 'Fillout Account',
  newLoanAmountFeMaleUser: 'Application FA',
  newLoanDataSuceeFeMaleUser: 'Disbrusment FA',
  "activeUser": "Active users"
}


class LoanData extends CLComponent {
  constructor (props) {
    super(props);
    this.bindCtx([
      "renderBody",
      "getData1",
      "formatData",
      "getComputeData",
      "getData1s",
      "search",
      "dateChange",
    ]);
  }

  state = {
    columns: [],
    data: []
  }

  componentDidMount() {
    this.getData1();
  }

  getData1 (date) {
    const that = this;
    if (!date) {
     date = {
      beginTime: moment().subtract(6, "days").format("YYYY-MM-DD") + ' 00:00:00',
      endTime: moment().format("YYYY-MM-DD") + ' 23:59:59',
     }
    }

    let settings = {
      contentType,
      method: "post",
      url: analysisList.url,
      data: JSON.stringify(date)
    }

    function fn (res) {
      that.setState({tableLoading: false});
      const data = res.data;
      if (data) {
        that.getData1s();
        that.setState({data: that.formatData(data)})
      }
    }
    CL.clReqwest({settings, fn});
  }

  getData1s (date) {
    const that = this;
    if (!date) {
     date = {
      startAccessDate: moment().subtract(6, "days").format("YYYY-MM-DD") + ' 00:00:00',
      endAccessDate: moment().format("YYYY-MM-DD") + ' 23:59:59',
     }
    }


    let settings = {
      contentType,
      method: userActive.type,
      url: userActive.url,
      data: JSON.stringify({
        memberAccessLog: date
      })
    }

    function fn (res) {
      that.setState({tableLoading: false});
      const info = res.data;
      const data = that.state.data;
      if (info) {
        const active = _.extend(info.active, {
          index: "activeUser" ,
          name: "Active users"
        });

        data.push(active)
        that.setState({data})
      }
    }
    CL.clReqwest({settings, fn});
  }

  dateChange (e) {
    const that = this;
    that.setState({
      endTime: e.format('YYYY-MM-DD') + ' 23:59:59'
    })
  }

  search () {
    let date = {
      endTime: this.state.endTime,
      beginTime: moment(this.state.endTime).subtract(6, "days").format("YYYY-MM-DD") + " 00:00:00",
    }
    this.getData1(date);
  }

  formatData(data) {
    const that = this;
    let arr = [];
    _.each(data, function (doc, index) {
      let obj = new Map();
      _.each(doc, function (subItem, subIndex) {
        obj.set(subIndex, subItem);
      });

      obj = strMapToObj(obj);

      that.setState({columns: _.keys(obj)});
      obj.index = index;
      obj.name = NAME[index];


      arr.push(obj);
    });

    arr.push(that.getComputeData(data.newCompleteDataUser, data.newRegister, "cdr", "Borrow/Registered Ratio"));
    arr.push(that.getComputeData(data.newLoanDataSuceeUser, data.newLoanAmountUser, "ldsucdu", "Pass/Apply Ratio"));
    arr.push(that.getComputeData(data.newLoanAmountUser, data.newRegister, "ldsu", "Apply/Registered Ratio"));
    arr.push(that.getComputeData(data.newLoanAmountFeMaleUser, data.newLoanAmountUser, "lafemalau", "Proportion of Application FA"));
    arr.push(that.getComputeData(data.newLoanDataSuceeFeMaleUser, data.newLoanDataSuceeUser, "ldsfemaldsu", "Proportion of Disbrusment FA"));
    return arr;
  }

  getComputeData (a, b, index, name) {
    let obj = new Map();

    _.each(a, function (doc, index) {
      const r = parseFloat(doc || 0);
      const l = parseFloat(b[index] || 0);
      if (!r || !l) {
        obj.set(index, 0)
      } else {
        obj.set(index, ((r / l) * 100).toFixed(2) + "%");
      }

    })

    obj = strMapToObj(obj);
    obj.index = index;
    obj.name = name;
    return obj
  }

  renderBody () {
    const that = this;
    const columns = that.state.columns;
    const {data = {}} = that.state;
    function currentFormat(index, value) {
      // 不保留两位小数
      let dataArr = [
        "newRegister",
        "newLoanAmountUser",
        "newLoanDataSuceeUser",
        "newCompleteDataUser",
        "newLoanAmountFeMaleUser",
        "newLoanDataSuceeFeMaleUser",
        "activeUser",
      ]

      //保留两位小数
      let amountArr = ["newLoanAmount"];

      if (dataArr.indexOf(index) > -1 && value) {
        return CF.format(value, {precision: 0})
      }

      if (amountArr.indexOf(index) > -1 && value) {
        return CF.format(value, {})
      }

      return value || (<Icon type="minus" />);
    }

    const column = [
      {
        title: 'Title',
        dataIndex: 'name'
      },
      {
        title: columns[0],
        dataIndex: columns[0],
        render: function (index, doc) {
          return currentFormat(doc.index, doc[columns[0]])
        }
      },
      {
        title: columns[1],
        dataIndex: columns[1],
        render: function (index, doc) {
          return currentFormat(doc.index, doc[columns[1]])
        }
      },
      {
        title: columns[2],
        dataIndex: columns[2],
        render: function (index, doc) {
          return currentFormat(doc.index, doc[columns[2]])
        }
      },
      {
        title: columns[3],
        dataIndex: columns[3],
        render: function (index, doc) {
          return currentFormat(doc.index, doc[columns[3]])
        }
      },
      {
        title: columns[4],
        dataIndex: columns[4],
        render: function (index, doc) {
          return currentFormat(doc.index, doc[columns[4]])
        }
      },
      {
        title: columns[5],
        dataIndex: columns[5],
        render: function (index, doc) {
          return currentFormat(doc.index, doc[columns[5]])
        }
      },
      {
        title: columns[6],
        dataIndex: columns[6],
        render: function (index, doc) {
          return currentFormat(doc.index, doc[columns[6]])
        }
      }
    ];

    const settings = {
      data: data,
      columns: column
    }
    const {beginTime, endTime} = that.state;

    return (
      <div>
        <Row className="table-wrap">
          <Col span={3} offset={1}>
            End Time:
          </Col>
          <Col span={6}>
            <DatePicker
              showTime
              format="YYYY/MM/DD"
              onChange={that.dateChange}
              allowClear = {true}
              // value = {!beginTime ? null : moment(new Date(beginTime))}
            />
          </Col>
          <Col span={2}>
            <Button type="primary" onClick={that.search}>search</Button>
          </Col>
        </Row>

        <Table  bordered  className="charge-details cl-table"
          loading = {!data}
          pagination = {false}
          columns={settings.columns}
          rowKey={record =>  record.index}
          dataSource={settings.data}
        />
      </div>)
  }

  render () {
    return this.renderBody();
  }
}

export default LoanData;
