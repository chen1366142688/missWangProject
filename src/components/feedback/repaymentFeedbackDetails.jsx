import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import md5 from 'js-md5';
import Viewer from 'viewerjs';
import { Interface } from '../../../src/lib/config/index';
import { CLComponent } from '../../../src/lib/component/index';
import CLBlockList from '../../../src/lib/component/CLBlockList.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Button, Row, Col, Card, Table, Input, message, Spin, InputNumber, DatePicker, Modal, Select, List } from 'antd';
// const confirm = Modal.confirm;
const { TextArea } = Input;
const {
  repaymentRecord, consultMessagesWindow, contentType, discountOrderUpload, getRepaymentFeedbackDetail, getActualOutstandingBalance, consultMessagesDiscountOrder, uploadImgModal,
} = Interface;


class RepaymentFeedbackDetails extends CLComponent {
  state = {
    data: null,
    data1: null,
    orderId: null,
    dateTime: moment(new Date()).format('YYYY-MM-DD'),
    Discount: false,
    // DiscountAmount: 1,
    pressDescription: null,
    rocessingResult: '',
    discountOrderApplicationId: null,
    // file: [],
    // info:false,
    arr: [],
    actualOutstandingBalance: '',
    pagination: {
      total: 0,
      pageSize: 10,
      currentPage: 1,
    },
    status: '',
    statuss: '',
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'loadData',
      'loadData1',
      'loadData2',
      'DiscountApproval',
      'DiscountApprovals',
      'Discount',
      'saveNote',
      'dateChange',
      // 'dateChanges',
      // 'inputMoney',
      'noteChange',
      'uploadContentImg',
      // "customRequest",
    ]);
  }

  componentDidMount() {
    const str = this.props.location.search.slice(1, 2);
    this.setState({ status: str });
    CLAnimate.inAndOut(this);
    const that = this;
    this.loadData(this.props.match.params);
    this.loadData1(this.props.match.params);
    setTimeout(() => {
      that.saveNote();
    }, 5000);
  }

  loadData(params) {
    const that = this;
    const applicationId = params.id;
    const params1 = {
      page: {
        currentPage: 1,
        pageSize: 100,
      },
      dpRepaymentRecord: {
        applicationId: applicationId,
      },
    };
    const settings = {
      contentType,
      method: repaymentRecord.type,
      url: repaymentRecord.url,
      data: JSON.stringify(params1),
    };

    function fn(res) {
      if (res.data) {
        that.setState({
          data: res.data.page.result,
        });
      }
    }
    CL.clReqwest({ settings, fn });
  }
  loadData1(params) {
    const that = this;
    const applicationId = params.id;
    const settings = {
      contentType,
      method: getRepaymentFeedbackDetail.type,
      url: getRepaymentFeedbackDetail.url + applicationId,
    };

    function fn(res) {
      if (res.data) {
        that.setState({
          data1: res.data,
          orderId: res.data[0].orderId,
          arr: res.data[res.data.length - 1].repaymentProof,
          statuss: res.data[res.data.length - 1].status,
        });
      }
    }
    CL.clReqwest({ settings, fn });
  }

  DiscountApproval(e) {
    this.saveNote1();
  }

  saveNote1 = () => {
    const that = this;
    const orderId = this.state.orderId;
    const settings = {
      contentType,
      method: getActualOutstandingBalance.type,
      url: getActualOutstandingBalance.url,
      data: JSON.stringify({
        orderId,
      }),
    };
    function fn(res) {
      if (res.data) {
        that.setState({ actualOutstandingBalances: res.data.actualOutstandingBalance, Discount: true  });
      }
    }
    CL.clReqwest({ settings, fn });
  }

  DiscountApprovals(e) {
    alert('This order has been processed, please close the session');
  }
  Discount = (e) => {
    const that = this;
    this.setState({
      Discount: false,
    });
    const settings = {
      contentType,
      method: consultMessagesDiscountOrder.type,
      url: consultMessagesDiscountOrder.url,
      data: JSON.stringify({
        orderId: that.state.orderId,
        reason: that.state.pressDescription,
        discountAmount: that.state.actualOutstandingBalance,
      }),
    };
    function fn(res) {
      if (res.code == '200') {
        that.setState({
          discountOrderApplicationId: res.data.discountOrderApplicationId,
        });
        if (res.data.status == '1') {
          alert('This order has been processed, please close the session');
        } else {
          const arr = that.state.arr;
          const strs = arr.split(',');
          const arr1 = [];
          for (let i = 0; i < strs.length; i++) {
            that.uploadContentImg(strs[i], that.state.discountOrderApplicationId);
          }
          location.hash = '/uplending/feedback';
        }
      } else {
        console.log('1');
      }
    }
    CL.clReqwest({ settings, fn });
  };

  showModal(e) {
    const viewer = new Viewer(e.target, {});
  }
  noteChange(e) {
    if (e.target.value.length > 2000) {
      message.error('The number of words exceeds 2000 characters');
      return;
    }
    this.setState({ pressDescription: e.target.value });
  }

  handleCancel = (e) => {
    this.setState({ Discount: false });
  }

  dateChange(e) {
    const that = this;
    that.setState({
      dateTime: e.format('YYYY-MM-DD') || moment(new Date()).format('YYYY-MM-DD'),
    });
  }
  // 点击Close的时候改变Processing Result状态
  loadData2() {
    const that = this;
    const orderId = this.state.orderId;
    const settings = {
      contentType,
      method: consultMessagesWindow.type,
      url: consultMessagesWindow.url + orderId,
    };
    function fn(res) {
      if (res.data) {
        if (res.code == '200') {
          that.setState({ rocessingResult: 'close' });
          location.hash = '/uplending/feedback';
        }
      }
    }
    CL.clReqwest({ settings, fn });
  }

  // dateChanges(e) {
  //   const that = this;
  //   that.setState({
  //     dateTimes: e.format('YYYY-MM-DD'),
  //   });
  // }

  saveNote(e) {
    const that = this;
    const orderId = this.state.orderId;
    const dateTime = this.state.dateTime;
    const settings = {
      contentType,
      method: getActualOutstandingBalance.type,
      url: getActualOutstandingBalance.url,
      data: JSON.stringify({
        orderId,
        dateTime,
      }),
    };
    function fn(res) {
      if (res.data) {
        // message.success("operate success");
        that.setState({ actualOutstandingBalance: res.data.actualOutstandingBalance });
      }
    }
    CL.clReqwest({ settings, fn });
  }
  uploadContentImg(files, insert) {
    const that = this;
    const uploadSettings = {
      method: 'post',
      contentType,
      url: discountOrderUpload.url,
      data: JSON.stringify({
        fileString: files,
        discountOrderApplicationId: insert,
      }),
    };
    function fn(res) {
      if (res.code == '200') {
        console.log('上传成功');
      } else {
        alert('上传失败，请重新上传！');
      }
    }
    CL.clReqwest({ settings: uploadSettings, fn });
  }

  renderBody() {
    const that = this;
    const data = this.state.data;
    const data1 = this.state.data1;
    const status = this.state.status;
    const statuss = this.state.statuss;
    const RepaymentRecord = {
      columns: [
        {
          title: 'Application No',
          dataIndex: 'applicationId',
          width: '6%',
        },
        {
          title: 'Repayment Channel',
          dataIndex: 'repaymentCode',
          width: '6%',
          render: function (text, record) {
            if (_.indexOf(['inputOrder', 'ld'], record.repaymentCode) > -1) {
              return 'Input Order';
            }
            return 'Dragonpay';
          },
        },
        {
          title: 'Repayment Time',
          dataIndex: 'repaymentTime',
          width: '10%',
          render: function (text, record) {
            return moment(record.repaymentTime).format('YYYY-MM-DD HH:mm');
          },
        },
        {
          title: 'Repayment Amount',
          dataIndex: 'repaymentAmount',
          width: '12%',
        },
        {
          title: 'Institution',
          dataIndex: 'procid',
          width: '10%',
          render(index, record) {
            if (!record.procid) {
              return '-';
            }
            return record.procid;
          },
        },
      ],

      data: _.map(data, (doc, index) => {
        const obj = _.pick(doc, ['applicationId', 'repaymentCode', 'repaymentTime', 'repaymentAmount', 'procid']);
        obj.index = index + 1;
        return obj;
      }),
    };

    const RepaymentFeedback = {
      columns: [
        {
          title: 'Feedback time',
          dataIndex: 'createTime',
          width: '25%',
        },
        {
          title: 'Proof of repayment',
          dataIndex: 'photos',
          render: function (index, record) {
            if (record.photos == '') {
              return '—';
            }
            return (
              <div>
                {record.photos.map((name, index) => {
                return (
                  (<img key={index} src={name} onClick={that.showModal} style={{ width: '50px', height: '50px', marginRight: '10px' }} />)
                  );
              })
            }
              </div>
            );
          },
        },
        {
          title: 'user message',
          dataIndex: 'note',
          width: '40%',
          render(index, record) {
            if (!record.note) {
              return '-';
            }
            return record.note;
          },
        },
      ],
      data: _.map(data1, (doc, index) => {
        const obj = _.pick(doc, ['createTime', 'photos', 'note']);
        obj.index = index + 1;
        return obj;
      }),
    };

    return (
      <div className="repaymentFeedback-details" key="repaymentFeedback-details">
        <Table
          bordered
          className="repaymentFeedback-details cl-table"
          key="repaymentFeedback-details cl-table"
          title={() => (<h4 className="table-title"> Repayment Record</h4>)}
          pagination={false}
          columns={RepaymentRecord.columns}
          rowKey={record => record.index}
          dataSource={RepaymentRecord.data}
        />
        <Table
          bordered
          className="repaymentFeedback-details1 cl-table"
          key="repaymentFeedback-details1 cl-table"
          title={() => (<h4 className="table-title"> Repayment Feedback</h4>)}
          pagination={false}
          columns={RepaymentFeedback.columns}
          rowKey={record => record.index}
          dataSource={RepaymentFeedback.data}
        /><br />
        <Row className="fill-content" gutter={16} style={{ marginLeft: '11px' }}>
          <p><b>According to users actual repayment time , query the user outstanding balance. :</b></p>
          <Col span={4} className="title">Actual repayment time:</Col>
          <Col span={6}>
            <DatePicker
              showTime
              format="YYYY-MM-DD"
              onChange={that.dateChange}
            />
            <Button type="primary" size="small" style={{ marginLeft: '5px' }} onClick={that.saveNote}>Save</Button>
          </Col>
          <Col span={6} className="title">Outstanding balance : {that.state.actualOutstandingBalance == 0 ? '0' : (that.state.actualOutstandingBalance || '--')}</Col>
        </Row>
        <br />
        <Row>
          <Col span={14} offset={18}>
            {
              statuss !== 0 ? '' : (
                <div>
                  <Button type="primary" style={{ marginRight: '20px' }} onClick={that.DiscountApproval}> Apply for discount </Button>
                  <Button type="primary" onClick={that.loadData2}>Close</Button>
                </div>
              )
            }
          </Col>
        </Row>
        <br />
        <br />
        <Row style={{ marginLeft: '15px' }}>
          <Col span={8}>
              Processing Result : {that.state.statuss == '2' ? 'close' : that.state.statuss == '1' ? 'Apply for discount' : '--'}
          </Col>
        </Row>
        <Modal
          title="Apply for discount"
          visible={that.state.Discount}
          onOk={() => { that.Discount(); }}
          onCancel={that.handleCancel}
          okText="Save"
          cancelText="Cancel"
          mask={false}
          style={{ width: '2000px', height: '2000px' }}
        >
          <p>will be submitted to the audit and will be discount if the audit is approved</p>
          <TextArea placeholder="Please input the reason..." autosize={{ minRows: 2, maxRows: 6 }} onChange={that.noteChange} />
          <br />
          <br />
          {/* <b style={{ width: '175px', display: 'inline-block' }}>Actual repayment time : </b> */}
          {/* <DatePicker */}
          {/* showTime */}
          {/* format="YYYY-MM-DD" */}
          {/* onChange={that.dateChanges} */}
          {/* /> */}
          {/* <br /> */}
          {/* <br /> */}
          <b style={{ width: '165px', display: 'inline-block' }}>Discount Amount : </b>{that.state.actualOutstandingBalances}
        </Modal>
      </div>
    );
  }

  render() {
    return (
      <QueueAnim className="animate-content" type={this.state.aniType}>
        {this.state.showBlock ? [this.renderBody()] : null}
      </QueueAnim>
    );
  }
}
export default RepaymentFeedbackDetails;




