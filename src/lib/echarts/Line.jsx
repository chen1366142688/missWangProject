import React from 'react';

import CLComponent from '../component/CLComponent.jsx';

import echarts  from  'echarts/lib/echarts';
import  'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/toolbox';
import 'echarts/lib/component/dataZoom';


//折线图组件
class Line extends CLComponent {
  componentDidMount() {
    const settingss = [];
    const {dom = "line-container", width = 600, height =400, title = '', subtext ='', xAxis, list = [], dataZoom = {}} = this.props;
    let legend = [];
    let series = [];

    list.map( function (doc, index) {
      if (doc.name) {
        legend.push(doc.name);
      }

      series.push({
        data: doc.data,
        type: 'line',
        smooth: doc.smooth || false,
        name: doc.name,
        areaStyle: doc.areaStyle || undefined
      })
    })


    const settings = {
      title: {
        text: title,
        x: 'center',
        subtext: subtext,
      },
      legend: {
        data:legend,
        x: 'left'
      },
      
      xAxis: [
        {
          type: 'category',
          data: xAxis,
          boundaryGap: false,
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: series,
      // grid: {
      //   left: '3%',
      //   right: '4%',
      //   bottom: '3%',
      //   containLabel: true
      // },
      toolbox: {//保存图片
        feature: {
          saveAsImage: {}
        }
      },
      tooltip : {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      }
    }


    //是否显示滚动条
    if (dataZoom && dataZoom.end) {
      settings.dataZoom = [
        {
          type: 'slider',
          show: true,
          start: dataZoom.start,
          end: dataZoom.end, //百分比
        }
      ]
    }

    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById(dom));
    myChart.setOption(settings);
  }

  render () {
    const {dom, width, height} = this.props;
    return (
      <div id={dom} style={{ width, height}}></div>
    )
  }
}
export default Line;

// const settings = {
//   dom: "main", 
//   width: 600, 
//   height:400, 
//   title: 'test', 
//   subtext:'hello, world', 
//   xAxis: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 
//   list: [
//     {
//       name: "jhon",
//       data: [100, 200, 300, 120, 150, 160, 250, 603, 450, 280, ],
//       areaStyle: {}
//     },
//     {
//       name: "kenzi",
//       data: [55, 32, 78, 52, 140, 160, 86, 83, 36, 18, ],
//       areaStyle: {}
//     }
//   ], 
//   dataZoom: {
//     start: 0,
//     end: 60
//   }
// }

// <Line {...settings}/>