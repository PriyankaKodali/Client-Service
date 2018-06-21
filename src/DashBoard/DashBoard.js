import React, { Component } from 'react';
import $ from 'jquery';
import { ApiUrl, remote } from '../Config';
import Select from 'react-select';
import { MyAjax } from '../MyAjax';
import { toast } from 'react-toastify';
import 'react-bootstrap-table/dist/react-bootstrap-table.min.css';
import './DashBoard.css';

var moment = require('moment');
var ReactBSTable = require('react-bootstrap-table');
var BootstrapTable = ReactBSTable.BootstrapTable;
var TableHeaderColumn = ReactBSTable.TableHeaderColumn;


class DashBoard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currentPage: 1, sizePerPage: 10, dataTotalSize: 0, GetClientTickets: []
        }
    }

    componentWillMount() {
        this.GetClientTickets(this.state.currentPage, this.state.sizePerPage);

    }

    GetClientTickets(page, count) {
        var url = ApiUrl + "/api/ClientService/GetClientTickets?clientId=" + sessionStorage.getItem("clientId") +
            "&page=" + page + "&count=" + count

        MyAjax(
            url,
            (data) => {
                this.setState({
                    GetClientTickets: data["clientTicketsList"], dataTotalSize: data["TotalCount"],
                    PriorityHigh: data["PriorityHigh"], TotalCount: data["TotalCount"],
                    PriorityMedium: data["PriorityMedium"], PriorityLow: data["PriorityLow"]
                })
            },

            (error) => toast(error.responseText, {
                type: toast.TYPE.ERROR
            }), "GET", null
        )
    }


    render() {
        return (
            <div className="container" key={this.state.GetClientTickets}>
                <div className="col-xs-12 menu">
                    <div className="col-md-10">
                        <h4 >
                            <p>
                                Total Tickets : <label className="ticketsSummary"> {this.state.TotalCount}</label>
                                High :  <label className="priorityHigh"> {this.state.PriorityHigh} </label>
                                Medium : <label className="priorityMedium"> {this.state.PriorityMedium} </label>
                                Low :{this.state.PriorityLow}
                            </p>
                        </h4>
                    </div>
                    <div className="col-md-2 pull-right menubuttonStyle" >
                        <button type="submit" name="submit" className="btn btn-primary" onClick={() => { this.props.history.push("./Ticket") }} >Add New Ticket</button>
                    </div>
                </div>

                <div className="col-xs-12" style={{ marginTop: '1%' }} >

                    <BootstrapTable striped hover remote={remote} pagination={true} key={this.state.GetClientTickets}
                        data={this.state.GetClientTickets} trClassName="pointer" tdStyle={{ whiteSpace: 'normal' }}
                        fetchInfo={{ dataTotalSize: this.state.dataTotalSize }}
                        options={{
                            sizePerPage: this.state.sizePerPage,
                            onPageChange: this.onPageChange.bind(this),
                            sizePerPageList: [{ text: '10', value: 10 },
                            { text: '25', value: 25 },
                            { text: 'ALL', value: this.state.dataTotalSize }],
                            page: this.state.currentPage,
                            onSizePerPageList: this.onSizePerPageList.bind(this),
                            paginationPosition: 'bottom',
                            onRowClick: this.rowClicked.bind(this)
                        }}
                    >
                        <TableHeaderColumn dataField="TicketId" isKey={true} dataAlign="left" width="8" dataSort={true} > TicketId </TableHeaderColumn>
                        <TableHeaderColumn dataField="CreatedDate" dataAlign="left" width="15" dataSort={true} dataFormat={this.CreatedDateFormatter.bind(this)}> Created Date</TableHeaderColumn>
                        <TableHeaderColumn dataField="Subject" dataAlign="left" width="53" dataSort={true}> Subject</TableHeaderColumn>
                        <TableHeaderColumn dataField="Status" dataAlign="left" width="8" dataSort={true}> Status</TableHeaderColumn>
                        <TableHeaderColumn dataField="LastUpdated" dataAlign="left" width="15" dataFormat={this.LastUpdatedDateFormat.bind(this)} dataSort={true}> Last Updated Date</TableHeaderColumn>

                    </BootstrapTable>
                </div>

            </div>
        )
    }

    CreatedDateFormatter(cell, row) {
        return (
            <p> {moment(row["CreatedDate"]).format("DD-MMM-YYYY h:mm a")} </p>
        );
    }

    LastUpdatedDateFormat(cell, row) {
        return (
            <p> {moment(row["LastUpdated"]).format("DD-MMM-YYYY h:mm a")} </p>
        )
    }

    onPageChange(page, sizePerPage) {
        this.GetClientTickets(page, sizePerPage);
    }

    onSizePerPageList(sizePerPage) {
        this.GetClientTickets(this.state.currentPage, sizePerPage)
    }

    rowClicked(row) {

        this.gotoViewTicket(row["TicketId"], row["TaskOwner"], row["Status"], row["Subject"]);
        //  this.props.history.push("/ViewTicket");
    }

    gotoViewTicket(TicketId, TaskOwner, Status, Subject) {

        this.props.history.push({
            state: {
                TicketId: TicketId,
                TaskOwner: TaskOwner,
                Status: Status,
                Subject: Subject
            },
            pathname: "/ViewTicket"
        })
    }

}

export default DashBoard;