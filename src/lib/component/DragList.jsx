import React from 'react';
import moment from 'moment';
import { CL } from '../tools/index';
import CLComponent from './CLComponent.jsx';
import { Row, Col,} from 'antd';



class DragList extends CLComponent {
  constructor(props) {
    super(props);

    this.bindCtx([
      // "toggleApplied",
    ]);
  }

  state = {
    // data
  }

  dragStart(e) {
    this.dragged = e.currentTarget;
  }
  dragEnd(e) {
    this.dragged.classList.remove("hide");
    e.target.classList.remove("drag-up");
    this.over.classList.remove("drag-up");

    e.target.classList.remove("drag-down");
    this.over.classList.remove("drag-down");
    

    let data = this.props.data;
    let from = Number(this.dragged.dataset.id);
    let to = Number(this.over.dataset.id);

    data.splice(to, 0, data.splice(from, 1)[0]);

    //set newIndex to judge direction of drag and drop
    data = data.map((doc, index)=> {
      doc.newIndex = index;
      return doc;
    })
    this.props.dragData(data);
    // this.setState({data: data});
  }

  dragOver(e) {
    e.preventDefault();

    this.dragged.classList.add("hide");
    let target;

    if (e.target.tagName === "LI") {
      target = e.target;
    } else if (e.target.parentElement.tagName === "LI") {
      target = e.target.parentElement;
    } else {
      return;
    }

    //判断当前拖拽target 和 经过的target 的 newIndex
    const dgIndex = JSON.parse(this.dragged.dataset.item).newIndex;
    const taIndex = JSON.parse(target.dataset.item).newIndex;
    const animateName = dgIndex > taIndex ? "drag-up" : "drag-down";

    if (this.over && target.dataset.item !== this.over.dataset.item) {
      this.over.classList.remove("drag-up", "drag-down");
    }

    if(!target.classList.contains(animateName)) {
      target.classList.add(animateName);
      this.over = target;
    }
  }
  


  render() {
    const that = this;
    const {data = [], columns = []} = that.props;

    return (
      <div className="drag-list">
        <Row>
          <Col span={24}>
            <div className="head">
              {
                columns.map((doc, index)=>{
                  return (
                    <div key={index} style={{flex: doc.width}} className="head-box">
                      {doc.title}
                    </div>
                  )
                })
              }
            </div>
          </Col>
        </Row>

        <Row >
          <Col span={24}>
            <ul onDragOver={this.dragOver.bind(this)}>
              {
                data.map((doc, index)=> {
                  //更具colums的顺序对内容进行排序
                  let newObj = {};
                  _.each(columns, (item) => {
                    newObj[item.dataSource] = doc[item.dataSource];
                  })

                  return(
                    <li 
                      key={index}
                      data-id={index}
                      draggable='true'
                      onDragEnd={this.dragEnd.bind(this)}
                      onDragStart={this.dragStart.bind(this)}
                      data-item={JSON.stringify(doc)}
                      style={doc.style}
                    >
                      {_.map(newObj, (subItem, subIndex) => {
                       
                        let widthObj = _.find(columns, {dataSource: subIndex});
                        if (!widthObj) {
                          return '';
                        }
                        return (
                          <div key={subIndex} style={{flex: widthObj.width}}>
                            {widthObj.render ? widthObj.render(index, doc) : subItem}
                          </div>
                        )
                      })}
                    </li>
                  )
                })
              }
            </ul>
          </Col>
        </Row>
      </div>
     
    );
  }
}
export default DragList;