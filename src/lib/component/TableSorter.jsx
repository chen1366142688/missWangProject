import React from 'react';
import {Button, Tag, Checkbox, Icon} from 'antd';

let tagColorList = ["magenta", "red", "volcano", "orange", "gold", "lime", "green", "cyan", "blue", "geekblue", "purple"];

class TableSorter extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sorterList: this.dealColor(this.props.columns),
            tagList: [],
            showSorter: false
        }
    }

    componentDidMount() {
        this.dealColumns(this.props.columns);
    }

    componentWillReceiveProps(nextProps) {
        this.dealColumns(nextProps.columns)
    }

    dealColumns = (columns) => {
        let sorterList = this.dealColor(columns);
        let tagList = [];
        _.each(sorterList, itr => {
            if (itr.selected) {
                tagList.push(itr);
            }
        })
        this.setState({
            sorterList,
            tagList
        })
    };

    dealColor = (sorter) => {
        let index = 0;
        return _.map(sorter, itr => {
            itr.colorIdx = index;
            index++;
            if (index > 10) {
                index = 0;
            }
            return itr;
        })
    }

    onSorterChange = () => {
        let showSorter = this.state.showSorter;
        this.setState({
            showSorter: !showSorter
        })
    };

    onCheck = (sorterItem) => {
        let {sorterList, tagList} = this.state;
        sorterItem.selected = !sorterItem.selected;
        if (sorterItem.selected) {
            tagList.push(sorterItem);
        } else {
            let idx = _.findIndex(tagList, item => {
                return item.column == sorterItem.column;
            })
            if (idx > -1) {
                tagList.splice(idx, 1);
            }
        }
        this.setState({
            sorterList,
            tagList
        })
    };

    onChangeDir = (sorterItem) => {
        let sorterList = this.state.sorterList;
        sorterItem.type = (sorterItem.type == "asc" ? "desc" : "asc");
        this.setState({
            sorterList
        })
    };

    onSortData = () => {
        this.props.onSort && this.props.onSort(this.state.tagList.map(itr => {
            return {
                column: itr.column,
                dataIndex: itr.dataIndex,
                type: itr.type
            }
        }));
    };

    render() {
        return (<div className="table-sorter">
            <span>sorter：</span>
            <div className="sorter-tag-panel">
                {
                    _.map(this.state.tagList, (sorterItem) => {
                        return sorterItem.selected ? <Tag color={tagColorList[sorterItem.colorIdx]}>
                            {sorterItem.column}
                            <Icon type={sorterItem.type == "asc" ? "arrow-up" : "arrow-down"}/></Tag> : null;
                    })
                }
            </div>
            <div className="sorter-handler">
                <Button size="small" type="primary" style={{width: 50}} onClick={this.onSorterChange}>
                    <Icon type={this.state.showSorter ? "up" : "down"}/></Button>
                <div className={"sorter-panel " + (this.state.showSorter ? "" : "disabled")}>
                    <ul>
                        {
                            _.map(this.state.sorterList, (sorterItem) => {
                                return <li>
                                    <Checkbox onChange={() => this.onCheck(sorterItem)} checked={sorterItem.selected}/>
                                    <span>{sorterItem.column}</span>
                                    {
                                        sorterItem.selected && <Icon onClick={() => this.onChangeDir(sorterItem)}
                                                                     style={{cursor: "pointer", color: "#1890ff"}}
                                                                     type={sorterItem.type == "asc" ? "arrow-up" : "arrow-down"}/>
                                    }
                                </li>
                            })
                        }
                    </ul>
                    <div className="sorter-button">
                        <Button onClick={this.onSortData} size="small">Sort Data</Button>
                    </div>
                </div>
            </div>
        </div>)
    }

}

export default TableSorter;