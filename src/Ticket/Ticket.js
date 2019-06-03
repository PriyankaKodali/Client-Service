import React, { Component } from 'react';
import Select from 'react-select';
import $ from 'jquery';
import './Ticket.css';
import { ValidateForm, showErrorsForInput, setUnTouched, showErrors } from '.././Validation.js';
import { validate } from 'validate.js';
import { ApiUrl } from '.././Config.js';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { MyAjaxForAttachments } from '.././MyAjax.js';
import { toast } from 'react-toastify';

class Ticket extends Component {

    constructor(props) {
        super(props);
        var froalaConfig = {
            heightMin: 210
        }
        this.state = {
            Priority: null, Category: null, Categories: [], SubCategory: null, SubCategories: [], Project: null,
            Projects: [], subject: '', DescriptionHtml: "", Description: EditorState.createEmpty()
        }
    }

    componentWillMount() {
        $.ajax({
            url: ApiUrl + "/api/MasterData/GetCategories?deptId=" + null,
            type: "get",
            success: (data) => { this.setState({ Categories: data["categories"] }) }
        })

        $.ajax({
            url: ApiUrl + "/api/Client/GetClientProjects?clientId=" + sessionStorage.getItem("clientId"),
            type: "get",
            success: (data) => {
                this.setState({ Projects: data["clientProjects"] })
            }
        })
    }


    componentDidMount() {

        setUnTouched(document);

        $("#input-id").fileinput({
            theme: "explorer",
            hideThumbnailContent: true,
            uploadUrl: ApiUrl + "/api/Task/UploadFiles",
            uploadAsync: true,
            overwriteInitial: false,
            initialPreviewAsData: true,
            showCancel: false,
            showRemove: false,
            showUpload: false,
            minFileCount: 1,
            fileActionSettings: {
                showUpload: false,
                showRemove: true
            }
        }).on("filebatchpreupload", function (event, data) {
            var form = data.form, files = data.files
            this.uploadFile(files)

        }.bind(this))
    }


    render() {
        return (
            <div className="container">

                <form onSubmit={this.handleSubmit.bind(this)} onChange={this.validate.bind(this)} >
                    <div className="ticketContainer" style={{ marginBottom: '1%' }}>

                        <div className="col-xs-12" >
                            <div className="col-md-2 mTop10">
                                <label> Priority </label>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <div className="input-group">
                                        <span className="input-group-addon">
                                            <span className="glyphicon glyphicon-user"></span>
                                        </span>
                                        <Select className="form-control" ref="priority" value={this.state.Priority} placeholder="Select Priority"
                                            options={[{ value: '0', label: 'High' }, { value: '1', label: 'Medium' }, { value: '2', label: 'Low' }]}
                                            onChange={this.PriorityChanged.bind(this)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xs-12" >
                            <div className="col-md-2 mTop10">
                                <label> Category </label>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <div className="input-group">
                                        <span className="input-group-addon">
                                            <span className="glyphicon glyphicon-user"></span>
                                        </span>
                                        <Select className="form-control" ref="category" value={this.state.Category} options={this.state.Categories} placeholder="Select Category"
                                            onChange={this.CategoryChanged.bind(this)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xs-12" >
                            <div className="col-md-2 mTop10">
                                <label>SubCategory </label>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <div className="input-group">
                                        <span className="input-group-addon">
                                            <span className="glyphicon glyphicon-user"></span>
                                        </span>
                                        <Select className="form-control" ref="subCategory" value={this.state.SubCategory} options={this.state.SubCategories} placeholder="Select sub Category"
                                            onChange={this.SubCategoryChanged.bind(this)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xs-12">
                            <div className="col-md-2 mTop10">
                                <label> Project </label>
                            </div>
                            <div className="col-md-8">
                                <div className="form-group">
                                    <div className="input-group">
                                        <span className="input-group-addon">
                                            <span className="glyphicon glyphicon-user"></span>
                                        </span>
                                        <Select className="form-control" ref="project" placeholder="Select Project" value={this.state.Project}
                                            options={this.state.Projects} onChange={this.ProjectChanged.bind(this)} />
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="col-xs-12" >
                            <div className="col-md-2 mTop10">
                                <label> Subject </label>
                            </div>
                            <div className="col-md-10">
                                <div className="form-group">
                                    <div className="input-group">
                                        <span className="input-group-addon">
                                            <span className="glyphicon glyphicon-user" ></span>
                                        </span>
                                        <input className="form-control" name="Subject" type="text" placeholder="Subject" autoComplete="off" ref="subject" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xs-12" style={{ paddingTop: '12px' }}>
                            <div className="col-xs-12 form-group" style={{ height: "auto" }}>
                                <label> Description</label>
                                <Editor name="actionResponse" id="actionResponse" key="actionResponse" ref="editor"
                                    toolbar={{ image: { uploadCallback: this.uploadCallback.bind(this) } }}
                                    editorState={this.state.Description} toolbarClassName="toolbarClassName"
                                    wrapperClassName="draft-editor-wrapper" editorClassName="draft-editor-inner"
                                    onEditorStateChange={this.descriptionChanged.bind(this)} />

                                <input hidden ref="description" name="forErrorShowing" />
                            </div>
                        </div>
                        <div className="col-xs-12">
                            <div className="col-xs-12 form-group">
                                <input className="file" name="file[]" id="input-id" type="file" ref="Upldfiles" data-preview-file-type="any" showUpload="false" multiple />
                            </div>
                            {/* </div> */}
                        </div>

                        <div className="col-xs-12 text-center form-group pull-right" >
                            <div className="loader" style={{ marginLeft: '50%', marginBottom: '1%' }}></div>
                            <button type="submit" name="submit" className="btn btn-primary" >Submit</button>
                        </div>

                    </div>

                </form>
            </div>
        )
    }


    PriorityChanged(val) {
        if (val) {
            this.setState({ Priority: val });
            showErrorsForInput(this.refs.priority.wrapper, null);
        }
        else {
            this.setState({ Priority: '' });
            showErrorsForInput(this.refs.priority.wrapper, ["Please select Priority"]);
        }
    }

    CategoryChanged(val) {
        if (val) {
            this.setState({ Category: val }, () => {
                $.ajax({
                    url: ApiUrl + "/api/MasterData/GetSubCategories?catId=" + this.state.Category.value,
                    type: "get",
                    success: (data) => { this.setState({ SubCategories: data["subCategories"] }) }
                })
            })
            showErrorsForInput(this.refs.category.wrapper, null);
        }
        else {
            this.setState({ Category: '' });
            showErrorsForInput(this.refs.category.wrapper, ["Please select Category"]);
        }
    }

    SubCategoryChanged(val) {
        if (val) {
            this.setState({ SubCategory: val });
            showErrorsForInput(this.refs.subCategory.wrapper, null)
        }
        else {
            this.setState({ SubCategory: '' });
            showErrorsForInput(this.refs.subCategory.wrapper, ["Please select SubCategory"])
        }
    }

    ProjectChanged(val) {
        if (val) {
            this.setState({ Project: val });
            showErrorsForInput(this.refs.project.wrapper, null);
        }
        else {
            this.setState({ Project: '' });
            showErrorsForInput(this.refs.project.wrapper, ["Please select Project"]);
        }
    }

    uploadCallback(file) {

    }

    descriptionChanged(val) {
        //if (val.getPlainText('').trim().length > 0) {
        if (val !== "") {
            this.setState({ Description: val, DescriptionHtml: draftToHtml(convertToRaw(val.getCurrentContent())) })
            showErrorsForInput(this.refs.description, []);
        }
        else {
            showErrorsForInput(this.refs.description, ["Please enter some description"]);
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
        data.append("clientId", sessionStorage.getItem("clientId"));
        data.append("categoryId", this.state.Category.value);
        data.append("subCategoryId", this.state.SubCategory.value);
        data.append("projectId", this.state.Project.value);
        data.append("task", this.refs.subject.value);
        data.append("Description", this.state.DescriptionHtml);
        data.append("priority", this.state.Priority.value);

        var files = $("#input-id").fileinput("getFileStack");

        for (var i = 0; i < files.length; i++) {
            if (files[i] != undefined) {
                data.append(files[i].filename, files[i]);
            }
        }

        let url = ApiUrl + "/api/ClientSupport/AddClientRequest"

        try {
            MyAjaxForAttachments(
                url,
                (data) => {
                    toast("Ticket submitted successfully", {
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
        let errors = {};
        var success = true;
        var isSubmit = e.type === "submit";

        var subject = this.refs.subject.value.trim();
        var desc = this.state.DescriptionHtml.trim();


        if (isSubmit) {
            $(e.currentTarget.getElementsByClassName('form-control')).map((i, el) => {
                el.classList.remove("un-touched");
            });
        }

        if (!this.state.Priority || !this.state.Priority.value) {
            success = false;
            showErrorsForInput(this.refs.priority.wrapper, ["Please select Priority"]);

            if (isSubmit) {
                this.refs.priority.focus();
                isSubmit = false;
            }
        }

        if (!this.state.Category || !this.state.Category.value) {
            success = false;
            showErrorsForInput(this.refs.category.wrapper, ["Please select Category"]);
            if (isSubmit) {
                this.refs.category.focus();
                isSubmit = false;
            }
        }

        if (!this.state.SubCategory || !this.state.SubCategory.value) {
            success = false;
            showErrorsForInput(this.refs.subCategory.wrapper, ["Please select SubCategory"]);
            if (isSubmit) {
                this.refs.subCategory.focus();
                isSubmit = false;
            }
        }


        if (!this.state.Project || !this.state.Project.value) {
            success = false;
            showErrorsForInput(this.refs.project.wrapper, ["Please select Project"]);
            if (isSubmit) {
                this.refs.project.wrapper.focus();
                isSubmit = false;
            }
        }

        if (subject === "") {
            if (isSubmit) {
                this.refs.subject.focus();
                isSubmit = false;
            }
            success = false;
            showErrorsForInput(this.refs.subject, ["Please enter subject"]);
        }
        else {
            showErrorsForInput(this.refs.subject, []);
        }


        var content = this.state.Description.getCurrentContent();

        if (!content.getPlainText('').trim().length > 0) {
            showErrorsForInput(this.refs.description, ["Please enter description"]);
            success = false;
            if (isSubmit) {
                //  this.refs.editor.focusEditor();
                isSubmit = false;
            }
        }
        else {
            showErrorsForInput(this.refs.description, []);
        }



        return success;

    }

}

export default Ticket;