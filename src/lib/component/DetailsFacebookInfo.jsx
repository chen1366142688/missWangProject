import React from 'react';
import moment from 'moment';
import { Table, Icon} from 'antd';
import { CL } from '../tools/index';
import CLComponent from './CLComponent.jsx';
import CLBlockList from './CLBlockList.jsx';


class FacebookInfo extends CLComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const that = this;
    const {userData, loanBasisInfo, } = that.props.settings;
    const FacebookInformation = {
      title: "Facebook Information",
      data: [
        {
          title: "Number of Facebook friends",
          content: userData.fbFriends,
          type: 'text',
        },
        {
          title: "Where to login",
          content: loanBasisInfo.facebookInstalledName,
          type: 'text',
        },
        {
          title: "Facebook page",
          content: loanBasisInfo.facebookHomePage,
          type: 'text',
          render: function () {
            return loanBasisInfo.facebookHomePage ? 
            (<a href={loanBasisInfo.facebookHomePage} target="_blank">{loanBasisInfo.facebookHomePage}</a>) :
            (<Icon type="minus" />);
          }
        },
        {
          title: "FaceBookID",
          content: loanBasisInfo.facebookId,
          type: 'text',
          
        }
      ]
    }

    return (
      <CLBlockList  settings={FacebookInformation}/>
    );
  }
}
export default FacebookInfo;