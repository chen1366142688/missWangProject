import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import { Table, Form, Row, Col, Input, Button, InputNumber, DatePicker, } from 'antd';
import CLComponent from './CLComponent.jsx';
const InputGroup = Input.Group;
const FormItem = Form.Item;
const {ColumnGroup, Column} = Table;
const tableHeight = document.body.clientHeight - 320;
const dateFormat = 'YYYY-MM-DD'

class Overddue extends CLComponent {
  state = {}
  constructor(props) {
    super(props);
    this.bindCtx([
      'onSelectChange',
      'handleSearch',
      'handleReset',
      'getFields',
      "setHeight",
      "toggleOption",

    ]);
  }

  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  }

  toggleOption (e) {
    const that = this;
    if (that.state.empty) {
      that.setState({empty: null})
    } else {
      that.setState({empty: []})
    }
  }

  setHeight (e) {
    const obj = document.getElementsByClassName("ant-table-body")[0];
    sessionStorage.setItem("tableScrollTop", obj.scrollTop)
  }

  handleSearch = (e) => { // 点击搜索按钮，把form数组传入到父级组件中
    e.preventDefault();
    const that = this;
    this.props.form.validateFields((err, values) => {
      that.props.settings.getFields(values);
    });
  }

  handleReset = () => {
    this.props.form.resetFields();
  }

  getFields(operation) {
    const formItemLayout = {
      labelCol: { span: 9, md: 10, lg: 8 },
      wrapperCol: { span: 15, md: 14, lg: 16 },
    };
    const that = this;
    const children = [];
    let formItem;
    const { getFieldDecorator } = this.props.form;
    let defaultSelectDate = {
      startDate: moment().subtract(1, 'months').startOf('month'),
      endDate: moment().subtract(1, 'months').endOf('month')
    }

    for (let i = 0; i < operation.length; i++) {
      switch (operation[i].type) {
        case 'rangePicker':
          formItem = (
            <FormItem {...formItemLayout} label={`${operation[i].label}`} key={`${operation[i].id}${i}`}>
              {getFieldDecorator(`${operation[i].id}`,{
                initialValue:[defaultSelectDate.startDate, defaultSelectDate.endDate]
              })(
                <DatePicker.RangePicker
                  showTime
                  size={"small"}
                  style={{maxWidth: "100%", fontSize: 10}}
                  allowClear = {false}
                  ranges={{ Today: [moment(moment().format("YYYY-MM-DD")), moment(moment().format("YYYY-MM-DD"))], 'This Month': [moment(moment().format("YYYY-MM-DD")), moment().endOf('month')] }}
                  format="YYYY/MM/DD"
                />
              )}
            </FormItem>
          );
          break;
        default:
          return '';
      }
      children.push(<Col span={8} key={i} style={{ display: 'block' }}>{formItem}</Col>);
    }
    return children;
  }
  componentDidUpdate (nextProps, nextState) {
    let top = sessionStorage.getItem("tableScrollTop");
    top = top ? parseFloat(top) : 0;
    if (this.props.settings.data && this.props.settings.data.length && top ) {
      const obj = document.getElementsByClassName("ant-table-body")[0];
      obj.scrollTop = top;
      sessionStorage.removeItem("tableScrollTop");
    }
  }

  render() {
    const {
      columns, data, operation, tableLoading, 
      btn, rowClass, rowSelection, expandedRowRender, expandedRowKeys, scroll = {}, columnGroup
    } = this.props.settings;
    const that = this;

    //标记行class
    function setTrClassName (record, index) {
      if (rowClass && rowClass.length) {
        return rowClass[index];
      } else {
        return "normal";
      }
    }

    return (
      <div className="Overddue" key="Overddue">
        { operation && operation.length ? (
          <Form
            className="ant-advanced-search-form cl-form"
            onSubmit={this.handleSearch}
          >
            <Row gutter={2}>{this.getFields(that.state.empty || operation)}</Row>
            <Row>
              <Col span={24} style={{ textAlign: 'right' }}>
                <Button type="primary" htmlType="submit">Search</Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>Clear</Button>
                {btn && btn.length ? btn.map((doc) => {
                  return (<Button key={doc.title} type={doc.type} style={{ marginLeft: 8 }} onClick={doc.fn}>{doc.title}</Button>);
                }) : ''}

              </Col>
            </Row>
          </Form>
        ) : ''}
        {
          columns && columns.length && !columnGroup ? (
            <Table
              id="cl-table"
              bordered
              size="small"
              rowSelection={rowSelection || null}
              columns={columns}
              dataSource={data}
              loading={tableLoading}
              className="cl-table"
              rowKey={record => record.id}
              scroll={{ y: tableHeight, x: scroll.x || undefined}}
              rowClassName={setTrClassName}
              expandedRowRender = {expandedRowRender}
              expandedRowKeys= {expandedRowKeys || []}
              expandIconAsCell={false}
              expandIconColumnIndex={-1}
              onRow={(record) => {
                return {
                  onClick: () => {that.setHeight},
                };
              }}
            />
          ): ''
        }


        {
          columns && columns.length && columnGroup ? (
            <Table
              id="cl-table"
              bordered
              size="small"
              rowSelection={rowSelection || null}
              dataSource={data}
              loading={tableLoading}
              className="cl-table"
              rowKey={record => record.id}
              scroll={{ y: tableHeight, x: scroll.x || undefined}}
              rowClassName={setTrClassName}
              expandedRowRender = {expandedRowRender}
              expandedRowKeys= {expandedRowKeys || []}
              expandIconAsCell={false}
              expandIconColumnIndex={-1}
              onRow={(record) => {
                return {
                  onClick: () => {that.setHeight},
                };
              }}
            >
              {
                columns.map((item, index)=> {
                  if (item.children) {
                    return (
                      <ColumnGroup title={item.title} width={item.width} key={index + parseInt(Math.random()* 10000)}>
                        {
                          item.children.map((doc, index)=> {
                            return (
                              <Column
                                title={doc.title}
                                dataIndex={doc.dataIndex}
                                key={index + parseInt(Math.random()* 10000)}
                                render= {(text, record)=> {return doc.render(text, record)}}
                                width={doc.width}
                              />
                            ) 
                          })
                        }
                      </ColumnGroup>
                    )
                  } else {
                    let obj = item;
                    return (
                      <Column
                        title={item.title}
                        dataIndex={item.dataIndex}
                        key={index + 1000}
                        render= {(text, record)=> {return item.render(text, record)}}
                        width={item.width}
                      />
                    )
                  }
                })
              }
            </Table>
          ): ''
        }
      </div>
    );
  }
}

const OverdDue = Form.create({
  mapPropsToFields(props) {
    const propSearch = JSON.stringify(props.settings.search !== '{}') ? props.settings.search : '';
    const sessionSearch = sessionStorage.getItem('search') ? JSON.parse(sessionStorage.getItem('search')) : {};
    const search = propSearch ? propSearch : sessionSearch;
    const formSearch = {};
    const sRepaymentTime = [];
    _.each(search, (value, index) => {
      if (_.indexOf(["startSRepaymentTime"], index) > -1) {
        sRepaymentTime[0] = moment(new Date(value));
        formSearch.sRepaymentTime = Form.createFormField({ value: sRepaymentTime });
      } else if (_.indexOf(["endSRepaymentTime"], index) > -1) {
        sRepaymentTime[1] = moment(new Date(value));
        formSearch.sRepaymentTime = Form.createFormField({ value: sRepaymentTime });
      } else if ( _.indexOf(["sRepaymentTime"], index) > -1) {
        formSearch[index] = Form.createFormField({ value: moment(new Date(value)) });
      } else {
        formSearch[index] = Form.createFormField({ value: value });
      }
    });
    return formSearch;
  },
})(Overddue);

export default OverdDue;

/** **** form example

 operation: [
   {
     id: 'usermobile',
     type: 'select',
     label: '用户查询',
     formType: 'textarea',
     placeholder: 'test',
     mode: "multiple",
     options: [
       {
         name: 1,
         value: 1
       },
       {
         name: "jhonyoung",
         value: "webdeveloper"
       },
     ]
   },
   {
     id: 'usermobile',
     type: 'text',
     label: '用户查询',
     formType: 'textarea',
     placeholder: 'test',
     mode: "multiple",
     options: [
       {
         name: 1,
         value: 1
       },
       {
         name: "jhonyoung",
         value: "webdeveloper"
       },
     ],

     fn: function (event) {
       return that.statusChange(event);
     }
   }
 ]

*/
