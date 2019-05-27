import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import { Table, Form, Row, Col, Input, Button, InputNumber, Select, DatePicker, } from 'antd';
import CLComponent from './CLComponent.jsx';
const InputGroup = Input.Group;
const FormItem = Form.Item;
const {ColumnGroup, Column} = Table;
const tableHeight = document.body.clientHeight - 320;

class CLlist extends CLComponent {
  state = {
    // pagination: {
    //   total: 85,
    //   pageSize: 15,
    //   showSizeChanger: true,
    //   showQuickJumper: true,
    //   size: 'default',
    //   pageSizeOptions: ['10', '20', '30', '40', '50', '100', '150', '200'],
    // },

  }

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
    console.log("点击了save直接把参数赋值给table")
    this.props.form.validateFields((err, values) => {
      that.props.settings.getFields(values);
      console.log(values)
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

    for (let i = 0; i < operation.length; i++) {
      switch (operation[i].type) {
        case 'text':
          formItem = (
            <FormItem {...formItemLayout} label={`${operation[i].label}`} key={`${operation[i].id}${i}`}>
              {getFieldDecorator(`${operation[i].id}`)(<Input placeholder={`${operation[i].placeholder}`} />)}
            </FormItem>
          );
          break;
        case 'number':
          formItem = (
            <FormItem {...formItemLayout} label={`${operation[i].label}`} key={`${operation[i].id}${i}`}>
              {getFieldDecorator(`${operation[i].id}`)(<InputNumber placeholder={`${operation[i].placeholder}`} />)}
            </FormItem>
          );
          break;

        case 'select':
          formItem = (
            <FormItem
              {...formItemLayout}
              label={`${operation[i].label}`}
              hasFeedback
              key={`${operation[i].id}${i}`}
            >
              {getFieldDecorator(`${operation[i].id}`)(
                <Select mode={operation[i].mode} onSelect={that.props.settings.onSelect} allowClear>
                  {
                    operation[i].options.map((doc) => {
                      return (<Select.Option key={`${doc.id}`} value={doc.value.toString()}>{doc.name || doc.label}</Select.Option>);
                    })
                  }
                </Select>,
              )}
            </FormItem>
          );
          break;

        case 'dateTime':
          formItem = (
            <FormItem {...formItemLayout} label={`${operation[i].label}`} key={`${operation[i].id}${i}`}>
              {getFieldDecorator(`${operation[i].id}`)(<DatePicker allowClear = {false} label={operation[i].placeholder} format={operation[i].format || "YYYY/MM/DD" }/>)}
            </FormItem>
          );
          break;

        case 'rangePicker':
          formItem = (
            <FormItem {...formItemLayout} label={`${operation[i].label}`} key={`${operation[i].id}${i}`}>
              {getFieldDecorator(`${operation[i].id}`)(<DatePicker.RangePicker
                showTime
                size={"small"}
                style={{maxWidth: "100%", fontSize: 10}}
                allowClear = {false}
                ranges={{ Today: [moment(moment().format("YYYY-MM-DD 00:00")), moment(moment().format("YYYY-MM-DD 23:59"))], 'This Month': [moment(moment().format("YYYY-MM-DD 00:00")), moment().endOf('month')] }}
                format="YYYY/MM/DD HH:mm"
              />)}
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
      columns, data, operation, 
       pageChange, tableLoading, 
      btn, rowClass, rowSelection, expandedRowRender, expandedRowKeys, scroll = {}, columnGroup
    } = this.props.settings;
    
    const that = this;
    let page;

    

    //标记行class
    function setTrClassName (record, index) {
      if (rowClass && rowClass.length) {
        return rowClass[index];
      } else {
        return "normal";
      }
    }
    // if (pagination) {
    //   pagination.defaultCurrent = pagination.currentPage;
    //   function showTotal() {
    //     let totalPage = (pagination.total || 0) / pagination.pageSize;
    //     if (pagination.total % pagination.pageSize !== 0) {
    //       totalPage = parseInt(totalPage) + 1;
    //     } 
    //     return `${pagination.total || 1} data, ${totalPage} pages in total, current on page ${pagination.currentPage}`;
    //   }
    //   pagination.showTotal = showTotal;
    //   pagination.current = pagination.currentPage;

    //   page = Object.assign(this.state.pagination, pagination);
    // } else {
    //   page = pagination;
    // }
  
    return (
      <div className="cllist" key="cllist">
        { operation && operation.length ? (
          <Form
            className="ant-advanced-search-form cl-form"
            onSubmit={this.handleSearch}
          >
            <Row gutter={2}>{this.getFields(that.state.empty || operation)}</Row>
            <Row>
              <Col span={24} style={{ textAlign: 'right' }}>
                <Button type="primary" htmlType="submit">Save</Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
                  Clear
                </Button>

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
              //pagination={page}
              columns={columns}
              dataSource={data}
              onChange={pageChange}
              loading={tableLoading}
             // showTotal={pagination.total}
              className="cl-table"
              rowKey={record => record.id}
              scroll={{ y: tableHeight, x: scroll.x || undefined}}
              // onRowClick = {that.setHeight}
              rowClassName={setTrClassName}
              // onRowDoubleClick = {that.toggleOption}
              // onRowMouseLeave = {that.showOption}
              expandedRowRender = {expandedRowRender}
              expandedRowKeys= {expandedRowKeys || []}
              expandIconAsCell={false}
              expandIconColumnIndex={-1}

              onRow={(record) => {
                return {
                  onClick: () => {that.setHeight},
                  // DoubleClick: () => {that.toggleOption}
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
             // pagination={page}
               columns={columns}
              dataSource={data}
              onChange={pageChange}
              loading={tableLoading}
              showTotal={pagination.total}
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
                  // DoubleClick: () => {that.toggleOption}
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

const ClList = Form.create({
  mapPropsToFields(props) {
    const propSearch = JSON.stringify(props.settings.search !== '{}') ? props.settings.search : '';
    const sessionSearch = sessionStorage.getItem('search') ? JSON.parse(sessionStorage.getItem('search')) : {};
    const search = propSearch ? propSearch : sessionSearch;
    const formSearch = {};
    const time = [];
    const appTime = [];
    const sRepaymentTime = [];
    const fRepaymentTime = [];
    const promiseTime = [];

    _.each(search, (value, index) => {
      if (['beginTime','startDate', 'beginCreateTime'].indexOf(index) > -1) {
        time[0] = moment(new Date(value));
        formSearch.time = Form.createFormField({ value: time });
      } else if (['endTime','endDate','endCreateTime'].indexOf(index) > -1) {
        time[1] = moment(new Date(value));
        formSearch.time = Form.createFormField({ value: time });
      } else if (index === 'appBeginTime') {
        appTime[0] = moment(new Date(value));
        formSearch.appTime = Form.createFormField({ value: appTime });
      } else if (index === 'appEndTime') {
        appTime[1] = moment(new Date(value));
        formSearch.appTime = Form.createFormField({ value: appTime });
      } else if (_.indexOf(["startSRepaymentTime"], index) > -1) {
        sRepaymentTime[0] = moment(new Date(value));
        formSearch.sRepaymentTime = Form.createFormField({ value: sRepaymentTime });
      } else if (_.indexOf(["endSRepaymentTime"], index) > -1) {
        sRepaymentTime[1] = moment(new Date(value));
        formSearch.sRepaymentTime = Form.createFormField({ value: sRepaymentTime });
      } else if (_.indexOf(["startFRepaymentTime"], index) > -1) {
        fRepaymentTime[0] = moment(new Date(value));
        formSearch.fRepaymentTime = Form.createFormField({ value: fRepaymentTime });
      } else if (_.indexOf(["endFRepaymentTime"], index) > -1) {
        fRepaymentTime[1] = moment(new Date(value));
        formSearch.fRepaymentTime = Form.createFormField({ value: fRepaymentTime });
      } else if (_.indexOf(["startPromiseTime"], index) > -1) {
        promiseTime[0] = moment(new Date(value));
        formSearch.promiseTime = Form.createFormField({ value: promiseTime });
      } else if (_.indexOf(["endPromiseTime"], index) > -1) {
        promiseTime[1] = moment(new Date(value));
        formSearch.promiseTime = Form.createFormField({ value: promiseTime });
      } else if ( _.indexOf(["sRepaymentTime", "fRepaymentTime", "collectDate", "createTime", "promiseTime"], index) > -1) {
        formSearch[index] = Form.createFormField({ value: moment(new Date(value)) });
      } else if (_.indexOf(["startTime", "endTime"], index) > -1) {
        formSearch[index] = Form.createFormField({ value: moment(new Date(value))});
      } else {
        formSearch[index] = Form.createFormField({ value: value });
      }
    });

    return formSearch;
  },
})(CLlist);

export default ClList;

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
