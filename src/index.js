import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import { Router, Route, IndexRoute } from 'react-router';
import { HashRouter } from 'react-router-dom';
import Login from './Login/Login.js';
import ChangePassword from './ChangePassword/ChangePassword';
import ForgotPassword from './ForgotPassword/ForgotPassword';
import ResetPassword from './ResetPassword/ResetPassword';
import DashBoard from './DashBoard/DashBoard';
import Ticket from './Ticket/Ticket';
import ViewTicket from './DashBoard/ViewTicket';

import 'bootstrap/dist/css/bootstrap.css';
import 'react-select/dist/react-select.css';

import 'bootstrap-fileinput/js/plugins/piexif.min.js';
import 'bootstrap-fileinput/js/plugins/purify.min.js';
import 'bootstrap-fileinput/js/fileinput.js';

window.jQuery = window.$ = require("jquery");
var bootstrap = require('bootstrap');

window.isLoggedIn = sessionStorage.getItem("access_token") !== null;

ReactDOM.render((
    <HashRouter>
        <div>
            <ToastContainer autoClose={3000} position="top-center" />
            <App>
                <Route exact path="/" component={Login} />
                <Route exact path='/Login' component={Login} />

                {/* <Route exact path="/Dashboard" component={DashBoard} /> */}
                <Route exact path="/Dashboard" render={(nextState) => requireAuth(nextState, <DashBoard location={nextState.location} history={nextState.history} match={nextState.match} />)} />

                {/* <Route exact path="/ChangePassword" component={ChangePassword} /> */}
                <Route exact path="/ChangePassword" render={(nextState) => requireAuth(nextState, <ChangePassword location={nextState.location} history={nextState.history} match={nextState.match} />)} />

                {/* <Route exact path="/Ticket" component={Ticket} /> */}
                <Route exact path="/Ticket" render={(nextState) => requireAuth(nextState, <Ticket location={nextState.location} history={nextState.history} match={nextState.match} />)} />

                <Route exact path="/ViewTicket" component={ViewTicket} />

            </App>
        </div>
    </HashRouter>
),
    document.getElementById('root')
);


function requireAuth(nextState, component) {
    if (sessionStorage.getItem("roles").indexOf("Client") != -1) {
        var isLoggedIn = sessionStorage.getItem("access_token") != null;
        if (!isLoggedIn) {
            nextState.history.push("/Login");
            return null;
        }
        else {
            return component;
        }
    }
    else {
       // var isLoggedIn = sessionStorage.getItem("access_token") = null;
        nextState.history.push("/Login");
        return component;
    }

}