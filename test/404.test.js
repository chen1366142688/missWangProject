import {shallow} from 'enzyme';
import {expect} from 'chai';
import React from 'react';
import NotFound from '../src/components/404/404.jsx';

describe('NotFound, Shallow test', function () {
  it('NotFound ', function () {
    const wrapper = shallow(<NotFound />);
    expect(wrapper.find(".text").first().text()).to.equal("404")
    expect(wrapper.find(".text").last().text()).to.equal("not found this page")
  });
});
