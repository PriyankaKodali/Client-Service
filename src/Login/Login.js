import React, { Component } from 'react';
import './Login.css';
import $ from 'jquery';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { showErrorsForInput, setUnTouched, ValidateForm } from '.././Validation';
import { ApiUrl } from '../Config';

class Login extends Component {

    constructor(props) {
        super(props);
        this.state = { error: "" }
    }


    render() {
        return (
            <div className="container">
                <div className="wrapper">
                    <form action="" method="post" name="Login_Form" className="form-signin">
                        <div className="row text-center bol">
                        </div>

                        <div className="form-group" style={{ marginTop: '20%' }}>
                            <div className="input-group">
                                <span className="input-group-addon">
                                    <span className="glyphicon glyphicon-user"></span>
                                </span>
                                <input className="form-control usrName" type="text" placeholder="Username" name="email" autoComplete="off" ref="username" />
                            </div>
                        </div>

                        <div className="form-group" style={{ paddingTop: '20px' }}>
                            <div className="input-group">
                                <span className="input-group-addon">
                                    <span className="glyphicon glyphicon-lock"></span>
                                </span>
                                <input type="password" className="form-control usrName" name="Password" placeholder="Password" required="" ref="password" />
                            </div>
                        </div>

                        <button className="btn btn-md btn-primary btn-block" name="submit" value="Login" type="submit" onClick={this.handleSubmit.bind(this)}>Login</button>
                        <div className="loader loaderActivity btnSave" ></div>
                        <div style={{ marginTop: '18px' }} >
                            <a>  <Link to="/ForgotPassword"> Forgot Password? </Link> </a>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    handleSubmit(e) {
        e.preventDefault();
        toast.dismiss();
        $(".loader").show();
        $("button[name='submit']").hide();

        if (!ValidateForm(e)) {
            $(".loader").hide();
            $("button[name='submit']").show();
            return false;
        }

        var data = {
            username: this.refs.username.value,
            password: this.refs.password.value,
            grant_type: "password"
        };

        let url = ApiUrl + "/Token";
        try {
            $.post(url, data).done(
                (data) => {
                    window.isLoggedIn = true;
                    sessionStorage.setItem("access_token", data["access_token"]);
                    sessionStorage.setItem("roles", data["roles"]);
                    sessionStorage.setItem("displayName", data["displayName"]);
                    sessionStorage.setItem("userName", data["userName"]);
                    sessionStorage.setItem("orgId", data["orgId"]);
                    sessionStorage.setItem("orgName", data["orgName"]);
                    sessionStorage.setItem("clientId", data["empId"]);

                    if (data["roles"].indexOf("Client") != -1) {
                        this.props.history.push("/DashBoard");
                    }

                    else {
                        window.isLoggedIn = false;
                        sessionStorage.setItem("access_token", null);
                        toast("Username or Password is incorrect ", {
                            type: toast.TYPE.ERROR
                        });
                        $(".loader").hide();
                        $("button[name='submit']").show();
                        this.props.history.push("/Login");
                    }

                }
            ).fail(
                (error) => {
                    $(".loader").hide();
                    $("button[name='submit']").show();
                    if (error.responseJSON) {
                        toast(error.responseJSON.error_description, {
                            type: toast.TYPE.ERROR,
                            autoClose: false
                        });
                    }
                    else {
                        toast("An error occoured, please try again", {
                            type: toast.TYPE.ERROR,
                            autoClose: false
                        });
                    }
                    return false;
                }
            )

            //   console.log(sessionStorage.getItem("roles"));
        }
        catch (e) {
            toast("An error occoured, please try again!", {
                type: toast.TYPE.ERROR,
                autoClose: false
            });
            $(".loader").hide();
            $("button[name='submit']").show();
            return false;
        }
    }
}
export default Login;