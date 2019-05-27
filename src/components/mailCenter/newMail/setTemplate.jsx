import React from 'react';
import {Select, Input} from 'antd';
import Editor from "wangeditor";

export default class SetTemplate extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            type: null,
            remotePath: this.props.detail.remoteTemplate
        }
    }

    componentDidMount(state) {
        this.initEdit();
    }

    onTemplateTypeChange = (e) => {
        this.setState({
            type: e,
            definedTemplate: "",
            remotePath: ""
        });
        this.props.setTemplateType(e);
    };

    initEdit(editorContent) {
        const elem = this.refs.editor;
        const editor = new Editor(elem);
        editor.customConfig = {
            uploadImgShowBase64: true,
            onchange: text => {
                this.setState({
                    definedTemplate: text
                });
                this.props.setTemplate(text);
            }
        };
        editor.create();
        editor.txt.html(this.props.detail.richTextTemplate);
    }

    onRemotePathChange = (e) => {
        this.setState({
            remotePath: e.target.value
        });
        this.props.setTemplate(e.target.value);
    };

    render(data) {
        let useRichTextTemplate = this.props.detail.useRichTextTemplate;
        let templateType = useRichTextTemplate ? "defined" : (useRichTextTemplate === null ? "" : "remote");

        let type = this.state.type || templateType;

        return (
            <div className="SET-TEMPLATE">
                <p>select template type: </p>
                <Select style={{width: 300}} value={type}
                        onChange={this.onTemplateTypeChange}>
                    <Select.Option key="defined" value="defined">自定义模板</Select.Option>
                    <Select.Option key="remote" value="remote">远程模板</Select.Option>
                </Select>
                <div className={type === "defined" ? "" : "hidden"}>
                    <p>set template</p>
                    <div ref="editor"></div>
                </div>
                <div className={type === "remote" ? "" : "hidden"}>
                    <p>set remote path</p>
                    <Input style={{width: 500}} value={this.state.remotePath} onChange={this.onRemotePathChange}/>
                </div>
            </div>
        );
    }
}