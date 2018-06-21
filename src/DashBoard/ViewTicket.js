import React, { Component } from 'react';
import $ from 'jquery';
import { ApiUrl, remote } from '../Config.js';
import { EditorState, convertToRaw, ContentState, convertFromHTML } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { MyAjaxForAttachments, MyAjax } from '.././MyAjax.js';
import { toast } from 'react-toastify';
import { ValidateForm, showErrorsForInput, setUnTouched, showErrors } from '.././Validation.js';

var moment = require('moment');


class ViewTicket extends Component {
    constructor(props) {
        super(props);
        var froalaConfig = {
            heightMin: 80
        }
        this.state = {
            ViewTicketLog: [], ResponseHtml: "", Response: EditorState.createEmpty(), Subject: '',
            TicketId: '', Status: '', TaskOwner: '', Resolved: false,
            ShowSubmitButton: false

        }
    }

    componentWillMount() {

        if (this.props.location.state !== undefined) {
            this.setState({
                TicketId: this.props.location.state["TicketId"],
                Subject: this.props.location.state["Subject"]
            })

            var url = ApiUrl + "/api/ClientService/GetTicketLog?taskId=" + this.props.location.state["TicketId"]

            MyAjax(
                ApiUrl + "/api/ClientService/GetTicketLog?taskId=" + this.props.location.state["TicketId"],
                (data) => { this.setState({ ViewTicketLog: data["ticketLogList"], LastRespondedEmployee: data["lastRespondedEmp"] }) },
                (error) => toast(error.responseText, {
                    type: toast.TYPE.ERROR
                })
            )
        }

        else {
            this.props.history.push("/DashBoard");
        }
    }

    render() {
        return (
            <div className="ticketLogContainer" key={this.state.ViewTicketLog}>

                <div className="panel panel-default" key={this.props.location.state}>
                    <div className="client-panel-heading"> <label> Ticket # {this.state.TicketId} - ( {this.state.Subject} )   </label></div>
                    <div className="panel-body">
                        {
                            this.state.ViewTicketLog.map((ele, i) => {
                                return (
                                    <div key={i} >
                                        <div className="col-md-3 col-xs-12">
                                            <p>  <label>{ele["CreatedBy"]}</label>  <p>   {ele["Department"]} </p>   </p>
                                        </div>

                                        <div className="col-md-9 col-xs-12">
                                            <div className="panel panel-default">
                                                <div className={ele["CreatedBy"] == sessionStorage.getItem("displayName") ? "client-panel-heading" : "staff-panel-heading"} >Posted on   {moment(ele["TaskDate"]).format("DD-MMM-YYYY h:mm a")} </div>
                                                <div className={ele["CreatedBy"] == sessionStorage.getItem("displayName") ? "client-panel-body" : "staff-panel-body"} >
                                                    <Editor name="actionResponse" readonly={true} id="actionResponse"
                                                        editorState={this.gotoChangeContent(ele["Description"])} toolbarClassName="hide-toolbar"
                                                        wrapperClassName="response-editor-wrapper" editorClassName="draft-editor-inner"
                                                    />
                                                    <div style={{ paddingBottom: '10px' }} >
                                                        {
                                                            ele["Attachments"].map((el, j) => {
                                                                return (
                                                                    <a key={j} href={el["AttachmentUrl"]} target="blank" style={{ paddingLeft: '10px' }}> {el["FileName"]} </a>
                                                                )
                                                            })
                                                        }
                                                    </div>
                                                </div>
                                                {
                                                    this.state.LastRespondedEmployee != null && this.state.LastRespondedEmployee["ActivityLogId"] == ele["ActivityLogId"] ?

                                                        <div className="lastUpdatedFooter">
                                                            <p style={{ paddingTop: '3px' }}> Did this resolve the issue? <input type="radio" name="status" value="yes" checked={this.state.Resolved} onClick={this.IssueResolvedClick.bind(this)} /> Yes
                                                             <input type="radio" name="status" value="no" ref="notResolved" checked={this.state.NotResolved} onClick={this.IssueNotResolvedClick.bind(this)} />  No
                                                             {
                                                                    this.state.ShowSubmitButton ?
                                                                        <button type="button" onClick={this.handleFeedBack.bind(this)} > submit </button>
                                                                        :
                                                                        ""
                                                                }

                                                            </p>
                                                        </div>
                                                        :
                                                        ""
                                                }

                                            </div>
                                        </div>
                                    </div>
                                )

                            })
                        }

                    </div>
                </div>

                <form onSubmit={this.handleSubmit.bind(this)} onChange={this.validate.bind(this)}>

                    <div>
                        <div>
                            <div className="col-md-3 col-xs-12">  </div>
                        </div>

                        <div className="col-md-9 col-xs-12" >
                            <div className="panel panel-default">
                                <div className="client-panel-heading"> <label> Reply to the ticket </label></div>
                                <div className="panel-body">
                                    <div className="col-xs-12 form-group">
                                        <Editor name="actionResponse" id="actionResponse" key="actionResponse" ref="editor"
                                            editorState={this.state.Response} toolbarClassName="hide-toolbar"
                                            wrapperClassName="client-editor-wrapper" editorClassName="draft-editor-inner"
                                            onEditorStateChange={this.responseChanged.bind(this)} />
                                        <input hidden ref="description" name="forErrorShowing" />
                                    </div>

                                    <div className="col-xs-12">
                                        <div className="form-group viewTicketButton">
                                            <div className="loader"></div>
                                            <button className="btn btn-success" type="submit" name="postResponse"  > Post Response</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </form>

            </div>
        )
    }

    gotoChangeContent(content) {
        const contentBlock = convertFromHTML(content);
        if (contentBlock) {
            const contentState = ContentState.createFromBlockArray(contentBlock);
            const editorState = EditorState.createWithContent(contentState);
            return editorState;
        }

    }

    IssueNotResolvedClick(val) {
        this.setState({ NotResolved: true, Resolved: false, ShowSubmitButton: true })
    }

    IssueResolvedClick(val) {
        this.setState({ Resolved: true, NotResolved: false, ShowSubmitButton: true })
    }

    responseChanged(val) {

        if (val !== "") {
            this.setState({ Response: val, ResponseHtml: draftToHtml(convertToRaw(val.getCurrentContent())) })
            showErrorsForInput(this.refs.description, []);
        }
        else {
            showErrorsForInput(this.refs.description, ["Please enter some description"]);
        }

        console.log(val);
    }

    handleFeedBack(e) {
        // alert("Success !")
        var data = new FormData();
        data.append("Status", this.state.Resolved)
        data.append("TicketId", this.props.location.state["TicketId"])

        var url = ApiUrl + "/api/ClientService/FeedBackFromClient"

        try {
            MyAjaxForAttachments(
                url,
                (data) => {
                    toast("Response submitted successfully!", {
                        type: toast.TYPE.SUCCESS,
                        autoClose: true
                    })
                    this.props.history.push("/DashBoard");
                    return true;
                },
                (error) => {
                    toast(error.responseText, {
                        type: toast.TYPE.ERROR,
                        autoClose: false
                    });
                },
                "POST",
                data
            );

        }
        catch (e) {
            toast("An error occured, please try again later", {
                type: toast.TYPE.ERROR
            });
            return false;
        }
    }

    handleSubmit(e) {
        e.preventDefault();

        $(".loader").show();
        $("button[name='submit']").hide();

        if (!this.validate(e)) {

            $(".loader").hide();
            $("button[name='submit']").show();
            return;
        }

        var data = new FormData();
        data.append("assignedTo", this.props.location.state["TaskOwner"]);
        data.append("taskId", this.props.location.state["TicketId"]);
        data.append("description", this.state.ResponseHtml);

        var url = ApiUrl + "/api/ClientService/AddClientTicketResponse"

        try {
            MyAjaxForAttachments(
                url,
                (data) => {
                    toast("Your response is submitted", {
                        type: toast.TYPE.SUCCESS
                    });
                    $("button[name='submit']").show();
                    this.props.history.push("/DashBoard");
                    return true;
                },
                (error) => {
                    toast(error.responseText, {
                        type: toast.TYPE.ERROR,
                        autoClose: false
                    });
                    $(".loader").hide();
                    $("button[name='submit']").show();
                    $("button[name='reset']").show();
                    return false;
                },
                "POST",
                data
            );
        }
        catch (e) {
            toast("An error occured, please try again later", {
                type: toast.TYPE.ERROR
            });
            $(".loader").hide();
            $("button[name='submit']").show();
            return false;

        }

    }
    validate(e) {
        var success = true;
        var isSubmit = e.type === "submit";
        // var response = this.state.ResponseHtml.trim();
        var content = this.state.Response.getCurrentContent();

        if (!content.getPlainText('').trim().length > 0) {


            showErrorsForInput(this.refs.description, ["Please enter description"]);
            success = false;
            if (isSubmit) {
                this.refs.editor.focusEditor();
                isSubmit = false;
            }
        }
        else {
            showErrorsForInput(this.refs.description, []);
        }

        return success;

    }
}

export default ViewTicket;


{/* <div className="col-md-9 col-xs-12">
    <div className="col-xs-12" >
        <p > Posted on   {moment(ele["TaskDate"]).format("DD-MMM-YYYY h:mm a")} </p>
    </div>
    <div className="col-xs-12" >
        <Editor name="actionResponse" readonly={true} id="actionResponse"
            editorState={this.gotoChangeContent(ele["Description"])} toolbarClassName="hide-toolbar"
            wrapperClassName="response-editor-wrapper" editorClassName="draft-editor-inner"
        />
    </div>
    <div className="col-xs-12">
        {
            ele["Attachments"].map((el) => {
                return (
                    <a href={el} target="blank"> {el} </a>
                )
            })
        }
    </div>
</div> */}