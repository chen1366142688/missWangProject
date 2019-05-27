import React from 'react';
import moment from 'moment';
import { Table, Icon} from 'antd';
import { CL } from '../tools/index';
import CLComponent from './CLComponent.jsx';
import CLBlockList from './CLBlockList.jsx';


class MessageInfo extends CLComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const that = this;
    const {userData, mark, firstMessage, lastMessage, message2, message1, optionalId, requiredId, showMark} = that.props.settings;
    let requiredContact = {};
    let optionalContact = {};
    if (mark.mandatoryContactNoteMetrics && mark.mandatoryContactNoteMetrics.length) {
      requiredContact = _.find(mark.mandatoryContactNoteMetrics, {id: requiredId}) || {};
      optionalContact = _.find(mark.mandatoryContactNoteMetrics, {id: optionalId}) || {};
    }

    const MessageInformation = {
      title: "Message Information",
      data: [
        {
          title: "Message amount",
          content: userData.noteCount,
          type: 'text'
        },
        {
          title: "Message amount within 7 days",
          content: userData.noteCount7days,
          type: 'text'
        },
        {
          title: "First message time",
          content: firstMessage.messageDate ? moment(new Date(firstMessage.messageDate)).format('YYYY-MM-DD') : firstMessage.messageDate,

          type: 'text'
        },
        {
          title: "Latest message time",
          content: lastMessage.messageDate ? moment(new Date(lastMessage.messageDate)).format('YYYY-MM-DD') : lastMessage.messageDate,
          type: 'text'
        },

        // {
        //   title: "Required Contact-Message amount",
        //   content: message1.sumOfMessage,
        //   type: 'text'
        // },

        {
          title: "Required contact-first message time",
          content: message1.firstNote ?  moment(new Date(message1.firstNote.messageDate)).format("YYYY-MM-DD HH:mm") : message1.firstNote,
          type: 'text'
        },
        {
          title: "Required contact-last message time",
          content: message1.lastNote ?  moment(new Date(message1.lastNote.messageDate)).format("YYYY-MM-DD HH:mm") : message1.firstNote,
          type: 'text'
        },
        // {
        //   title: "Alternate Contact-Message amount",
        //   content: message2.sumOfMessage,
        //   type: 'text'
        // },
        {
          title: "Alternate contact-first message time",
          content: message2.firstNote ?  moment(new Date(message2.firstNote.messageDate)).format("YYYY-MM-DD HH:mm") : message2.firstNote,
          type: 'text'
        },
        {
          title: "Alternate contact-last message time",
          content: message2.lastNote ?  moment(new Date(message2.lastNote.messageDate)).format("YYYY-MM-DD HH:mm") : message2.lastNote,
          type: 'text'
        },
      ]
    }

    if (showMark) {
      let first = [
        {
          title: "SMS authorization",
          content: mark.hasNote ? "Y" : "N",
          type: 'text',
          // check: CL.setMark(mark.hasNote)
        },
        {
          title: "Overdue messages",
          content: mark.overdueNoteAmount,
          type: 'text',
          // check: CL.setMark(mark.lessThan10OverdueNotes)
        },
        {
          title: "Last overdue message",
          content: mark.latestOverdueDate,
          type: 'text',
          // check: CL.setMark(mark.isLatestOverdueDateQualified)
        }
      ]
      let last = [
        {
          title: "Required contact-message amount",
          content: requiredContact.amount,
          type: 'text',
          // check: CL.setMark(requiredContact.isAmountQualified),
        },
        {
          title: "Required contact-message time lag",
          content: requiredContact.lag,
          type: 'text',
          // check: CL.setMark(requiredContact.isLagQualified),
        },
        {
          title: "Alternate contact-message amount",
          content: optionalContact.amount,
          type: 'text',
          // check: CL.setMark(optionalContact.isAmountQualified),

        },
        {
          title: "Alternate contact-message time lag",
          content: optionalContact.lag,
          type: 'text',
          // check: CL.setMark(optionalContact.isLagQualified),
          
        },
      ]

      MessageInformation.data = first.concat(MessageInformation.data).concat(last)
    }



    return (
      <CLBlockList  settings={MessageInformation}/>
    );
  }
}
export default MessageInfo;