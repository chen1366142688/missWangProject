import React from 'react';

import CLComponent from '../component/CLComponent.jsx';

import echarts  from  'echarts/lib/echarts';
import  'echarts/lib/chart/pie';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/toolbox';
import 'echarts/lib/component/dataZoom';


//折线图组件
class Pie extends CLComponent {
  componentDidMount() {
    const settingss = [];
    const {dom = "line-container", annular, name = '', width = 600, height =400, title = '', subtext ='', xAxis, list = [], dataZoom = {}} = this.props;
    let legend = [];
    const radius = annular ? ["40%", "70%"] : "70%";

    let series = [
      {
        name,
        type: "pie",
        radius,
        selectedMode: 'single',
        center: ['50%', '50%'],
        data: list,
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          normal: {
            formatter: '{b|{b}：}{c}  {per|{d}%}  ',
            // formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ',
            backgroundColor: '#eee',
            borderColor: '#aaa',
            borderWidth: 1,
            borderRadius: 4,
            // shadowBlur:3,
            // shadowOffsetX: 2,
            // shadowOffsetY: 2,
            // shadowColor: '#999',
            // padding: [0, 7],
            rich: {
              // a: {
              //   color: '#999',
              //   lineHeight: 22,
              //   align: 'center'
              // },
              // abg: {
              //     backgroundColor: '#333',
              //     width: '100%',
              //     align: 'right',
              //     height: 22,
              //     borderRadius: [4, 4, 0, 0]
              // },
              hr: {
                borderColor: '#aaa',
                width: '100%',
                borderWidth: 0.5,
                height: 0
              },
              b: {
                fontSize: 16,
                lineHeight: 33,
                align: 'center'
              },
              per: {
                color: '#eee',
                backgroundColor: '#334455',
                padding: [4, 4],
                borderRadius: 2
              }
            }
          }
        }
      }
    ];


    list.map( function (doc, index) {
      if (doc.name) {
        legend.push(doc.name);
      }
    })


    const settings = {
      title: {
        text: title,
        x: 'center',
        subtext: subtext,
      },
      tooltip : {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      toolbox: {//保存图片
        feature: {
          saveAsImage: {}
        }
      },
      legend: {
        data:legend,
        x: 'left',
        orient: 'vertical',
      },
      series: series,
      
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
export default Pie;

// const settings = {
//   dom: "main", 
//   width: "100%", 
//   height:600, 
//   title: 'test',
//   name: "test-name", 
//   subtext:'hello, world', 
//   list: [
//     {value:335, name:'直达'},
//     {value:310, name:'邮件营销'},
//     {value:234, name:'联盟广告'},
//     {value:135, name:'视频广告'},
//     {value:1048, name:'百度'},
//     {value:251, name:'谷歌'},
//     {value:147, name:'必应'},
//     {value:102, name:'其他'}
//   ],
//   annular: true, //是否环形图
// }

// <Pie {...settings}/>