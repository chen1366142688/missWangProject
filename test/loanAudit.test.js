import {shallow} from 'enzyme';
import {expect} from 'chai';
import React from 'react';
import LoanAudit from '../src/components/loanAudit/loanAudit.jsx';

describe('LoanAudit dom test', function () {
  it('LoanAudit ', ()  => {
    console.log("==============================================");
    const wrapper = shallow(<LoanAudit />);
    console.log('wrapper', wrapper.debug());
    console.log("===");
    console.log('wrapper.find("div").at(0)', wrapper.find("div"));
    
    console.log("==============================================");
    // expect(wrapper.find("div").at(0).props().key).to.equal('loan-audit');
  });
});
