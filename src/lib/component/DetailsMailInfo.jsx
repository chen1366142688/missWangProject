import React from 'react';
import moment from 'moment';
import { Table, Icon} from 'antd';
import { CL } from '../tools/index';
import CLComponent from './CLComponent.jsx';
import CLBlockList from './CLBlockList.jsx';


class MailInfo extends CLComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const that = this;
    const {userData} = that.props.settings;
    const MailInformation = {
      title: "Mail Information",
      data: [
        {
          title: "Number of mailbox friends",
          content: userData.emailFriends,
          type: 'text',
        },
        {
          title: "Inbox number",
          content: userData.emailInboxCount,
          type: 'text',
          
        },
        {
          title: "Sendbox number",
          content: userData.emailOutboxCount,
          type: 'text',
          
        },
        {
          title: "Draftbox number",
          content: userData.emailDraftCount,
          type: 'text',
          
        },
        {
          title: "Delbox number",
          content: userData.emailTrashCount,
          type: 'text',
          
        },
        {
          title: "Number of recipient",
          content: userData.emailFriends,
          type: 'text',
          
        },
        {
          title: "Earliest time of sending",
          content: userData.emailFirstSendTime ? moment(new Date(userData.emailFirstSendTime)).format('YYYY-MM-DD') : userData.emailFirstSendTime,
          type: 'text',
          
        }
      ]
    }

    return (
      <CLBlockList  settings={MailInformation}/>
    );
  }
}
export default MailInfo;