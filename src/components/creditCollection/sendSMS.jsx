import React from 'react';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { CLComponent, CLBlockList } from '../../../src/lib/component/index';
import CLList from '../../../src/lib/component/CLlist.jsx';
import { CLAnimate, CL } from '../../../src/lib/tools/index';
import { Interface } from '../../../src/lib/config/index';
import _ from 'lodash';

import { Button, message, Table, Icon, Spin, Tabs, DatePicker, Row, Col, Modal, List, Input } from 'antd';

const { contentType, sendSMS } = Interface;
const { TextArea } = Input;
const confirm = Modal.confirm;
class SendSMS extends CLComponent {
  state = {
    showInputMessage: false,
    messageContent: '',
    disabled:false,
  }

  constructor(props) {
    super(props);
    this.bindCtx([
      'renderBody',
      'handleCancle',
      'handleOk',
      'handleMessage',
    ]);
  }

  componentDidMount() {
    console.log('sendSMS is load!');
  }

  handleOk() {
    const that = this;
    this.props.settings.disableShowMessage();
    confirm({
      title: this.props.settings.confirmTitle,
      content: `a total of ${this.props.settings.applyIdAndPhoneNumbers.length}  messages will be sent this time,Whether to send?`,
      onOk() {
        that.setState({disabled:true});
        const settings = {
          contentType,
          method: sendSMS.type,
          url: sendSMS.url,
          data: JSON.stringify({ applicationIdAndPhones: that.props.settings.applyIdAndPhoneNumbers, message: that.state.messageContent, messageType: that.props.settings.messageType }),
        };
        function fn(res) {
          if (res.code == 200) {
            message.info(res.result);
            that.setState({disabled:false});
          } else {
            message.error(res.result);
            that.setState({disabled:false});
          }
        }
        CL.clReqwest({ settings, fn });
        console.log('you click submit button');
      },
      onCancel() {
        console.log('you click cancle button');
      },
    });
  }

  handleCancle() {
    this.setState({ showInputMessage: false });
    this.props.settings.disableShowMessage();
  }

  handleMessage(e) {
    if (e.target.value.length >= 490) {
      message.error('It\'s too long. Please reduce the number of characters');
    }
    this.setState({ messageContent: e.target.value });
  }

  componentWillReceiveProps(props) {
    this.setState({ showInputMessage: props.settings.showInputMessage });
  }
  renderBody() {
    const that = this;
    return (<div>
      <Modal
        title="send message"
        visible={this.state.showInputMessage}
        onOk={that.handleOk}
        onCancel={that.handleCancle}
        mask
        footer={[
          <Button disabled={this.state.disabled} key="OK" type="primary" onClick={this.handleOk}>
              OK
          </Button>,
          ]}
        style={{ width: '2000px' }}
      >
        <Row style={{ marginTop: 20 }}>
          <Col>
            <h1>Input SMS Content Message</h1>
            <TextArea placeholder="The content  had better not be too long,or it will be split into two multiple messages" autosize={{ minRows: 5, maxRows: 10 }} onChange={that.handleMessage} />
          </Col>
        </Row>
      </Modal>
    </div>);
  }

  render(data) {
    return (
      <QueueAnim className="animate-content">
        {this.renderBody()}
      </QueueAnim>
    );
  }
}
export default SendSMS;
