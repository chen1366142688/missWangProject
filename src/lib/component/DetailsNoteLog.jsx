import React from 'react';
import moment from 'moment';
import { Table} from 'antd';
import { CL } from '../tools/index';
import CLComponent from './CLComponent.jsx';
import {Interface} from "../config/index.js";
const { Details, contentType } = Interface;

class NoteLog extends CLComponent {
  state = {}

  constructor(props) {
    super(props);
  }

  render() {
    const that = this;
    const { noteLog } = that.props.settings;
    const NotesLog = {
      columns: [
        {
          title: 'Application No',
          dataIndex: 'applicationId',
        },
        {
          title: 'Application status',
          dataIndex: 'appStatusName',
        },
        {
          title: 'Note operator',
          dataIndex: 'operatorName',
        },
        {
          title: 'Note date',
          dataIndex: 'noteDate',
          render: function (text, record) {
            return moment(new Date(record.noteDate)).format("YYYY-MM-DD HH:mm");
          }
        },
        {
          title: 'Note',
          dataIndex: 'note',
          width: "50%"
        },
      ],
      data: (noteLog || []).map( (doc, index) => {
        doc.index = index + 1;
        return  _.pick(doc, [
          "index",
          "applicationId", 
          "operatorName",
          "noteDate",
          "note",
          "appStatusName"
        ]);

      })
    }

    return (
      <Table  bordered  className="notes-log cl-table"  key="notes-log cl-table"
        title = {() => (<h4 className="table-title"> Notes Log</h4>)}
        loading = {!noteLog}
        pagination = {false}
        columns={NotesLog.columns} 
        rowKey={record =>  record.index}
        scroll={{ y: 320 }}
        dataSource={NotesLog.data} />
    );
  }
}
export default NoteLog;