import React from 'react';
import moment from 'moment';
import { DatePicker, Button } from 'antd';
import { Bar, Pie, Line } from '../../lib/echarts/index';


(function () {
  const cx = '016442170165536087393:oex_duyxifa';
  const gcse = document.createElement('script');
  gcse.type = 'text/javascript';
  gcse.async = true;
  gcse.src = `https://cse.google.com/cse.js?cx=${cx}`;
  const s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(gcse, s);
}());


const { MonthPicker, RangePicker, WeekPicker } = DatePicker;

function onChange(e) {
  console.log(e);
}

function search() {
  window.open('https://www.google.com/');
}

class Test extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    datas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
    data1: [10, 21, 23, 43, 22, 65, 87, 99, 19, 50],
    data2: [5, 15, 19, 25, 35, 45, 55, 65, 76, 85, 95, 30, 40, 52, 60, 70, 80, 83, 23, 33, 65],
  }

  render() {
    const settings = {
      dom: 'main',
      width: '100%',
      height: 500,
      title: 'test',
      subtext: 'hello, world',
      xAxis: this.state.datas,
      list: [
        {
          name: 'jhon',
          data: this.state.data1,
          // areaStyle: {},
        },
        {
          name: 'kenzi',
          data: this.state.data2,
          // areaStyle: {},
        },
      ],
      dataZoom: {
        start: 0,
        end: 100,
      },
    };




    return (
      <div>
        <p>日期: <input type="text"/></p>
        <Line {...settings} />
        {/* <Button onClick={search}></Button> */}
      </div>
    );
  }
}

export default Test;

// <span dangerouslySetInnerHTML={{__html: " <gcse:search></gcse:search>"}} />
