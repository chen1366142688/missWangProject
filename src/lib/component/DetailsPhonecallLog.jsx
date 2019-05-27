import React from 'react';
import moment from 'moment';
import { Table, Icon} from 'antd';
import { CL } from '../tools/index';
import CLComponent from './CLComponent.jsx';
import CLBlockList from './CLBlockList.jsx';


class PhonecallLog extends CLComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const that = this;
    const {userData, mark, firstCall, lastCall, contact1, contact2, optionalId, requiredId} = that.props.settings;
    let requiredContact = {};
    let optionalContact = {};
    if (mark.mandatoryContactCallMetrics && mark.mandatoryContactCallMetrics.length) {
      requiredContact = _.find(mark.mandatoryContactCallMetrics, {id: requiredId}) || {};
      optionalContact = _.find(mark.mandatoryContactCallMetrics, {id: optionalId}) || {};
    }

    const PhonecallLogInformation = {
      title: "Phonecall Log Information",
      data: [
        {
          title: "Call amount",
          content: userData.callCount,
          type: 'text',
          
        },
        {
          title: "Call amount within 7 days",
          content: userData.callCount7days,
          type: 'text',
          // check: CL.setMark(mark.phonecallSenvenDays)
        },
        {
          title: "Proportion of calls with contacts",
          content: `${mark.rateOfCalledNumbersInContact}%`,
          type: 'text',
          // check: CL.setMark(mark.personalCallRecordProp),
          render () {
            if (_.isUndefined(mark.rateOfCalledNumbersInContact)) {
              return (<div><Icon type="loading" /></div>)
            } else {
              return `${mark.rateOfCalledNumbersInContact}%`
            }
          }
         
        },
        {
          title: "First call time",
          content: firstCall.callDate ? moment(new Date(firstCall.callDate)).format('YYYY-MM-DD') : firstCall.callDate,
          type: 'text',
        },
        {
          title: "Latest call time",
          content: lastCall.callDate ? moment(new Date(lastCall.callDate)).format('YYYY-MM-DD') : lastCall.callDate,
          type: 'text',
          // check: CL.setMark(mark.lastCallTime)
        },
        {
          title: "Required contact-inbound calls",
          content: contact1.sumOfCallIn,
          type: 'text'
        },
        {
          title: "Required contact-outbound calls",
          content: contact1.sumOfCallOut,
          type: 'text'
        },
        {
          title: "Required contact-first call time",
          content: requiredContact.earliestCallDate,
          type: 'text'
        },
        {
          title: "Required contact-last call time",
          content: requiredContact.latestCallDate,
          type: 'text'
        },
        {
          title: "Alternate contact-inbound calls",
          content: contact2.sumOfCallIn,
          type: 'text'
        },
        {
          title: "Alternate contact-first call time",
          content: contact2.sumOfCallOut,
          type: 'text'
        },
        {
          title: "Alternate contact-last call time",
          content: optionalContact.earliestCallDate,
          type: 'text'
        },
        {
          title: "Alternate contact-last call time",
          content: optionalContact.latestCallDate,
          type: 'text'
        },
        {
          title: "Required contact-call amount",
          content: requiredContact.amount,
          type: 'text',
          // check: CL.setMark(requiredContact.isAmountQualified),
        },
        {
          title: "Required contact-call time lag",
          content: requiredContact.lag,
          type: 'text',
          // check: CL.setMark(requiredContact.isLagQualified),

        },
        {
          title: "Alternate contact-call amount",
          content: optionalContact.amount,
          type: 'text',
          // check: CL.setMark(optionalContact.isAmountQualified),

        },
        {
          title: "Alternate contact-call time lag",
          content: optionalContact.lag,
          type: 'text',
          // check: CL.setMark(optionalContact.isLagQualified),
        },
      ]
    }

    return (
      <CLBlockList  settings={PhonecallLogInformation}/>
    );
  }
}
export default PhonecallLog;