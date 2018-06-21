import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Link } from 'react-router-dom';

class App extends Component {
  constructor(props) {
    super(props);
    var isLoggedIn = sessionStorage.getItem("access_token") != null;
    window.isLoggedIn = isLoggedIn;
  }

  logoutClick(e) {
    e.preventDefault();
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("roles");
    window.isLoggedIn = false;
    window.open("/#/Login", "_self")
  }

  render() {
    var roles = sessionStorage.getItem("roles");
    return (
      <div >
        {
          window.isLoggedIn ?
            <nav className="navbar navbar-default">
              <div className="container-fluid">
                <div className="navbar-header header headerimage">
                  <img className="headerimage" src="Images/logo.png" alt="" />
                </div>
                <div className="navbar-header">
                  <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                  </button>
                </div>


                <div className="collapse navbar-collapse" id="myNavbar">

                  <ul className="nav navbar-nav navbar-right navbar-menu" >

                    <li className="dropdown">
                      <Link className="dropdown-toggle" to="../DashBoard"> Dashboard  </Link>
                    </li>

                    <li className="dropdown">
                      <Link className="dropdown-toggle" to="../Ticket"> Ticket  </Link>
                    </li>

                    <li className="dropdown">
                      <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">{"Hi " + sessionStorage.getItem("displayName")}  <span className="caret"></span></a>
                      <ul className="dropdown-menu">
                        <li> <Link to="/ChangePassword" > Change Password </Link> </li>
                        <li><a onClick={this.logoutClick.bind(this)}>Logout</a></li>
                      </ul>
                    </li>


                  </ul>

                </div>
              </div>
            </nav>

            :

            <div />
        }
        {this.props.children}
      </div>
    );
  }
}

export default App;
