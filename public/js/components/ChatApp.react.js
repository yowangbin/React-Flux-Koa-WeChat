var React = require('react');
var Login = require('./Login/Login.react');
var Header = require('./Panel/Header.react');
var SearchBar = require('./Panel/SearchBar.react');
var Tab = require('./Panel/Tab.react');
var ChatList = require('./Panel/ChatList.react');
var BoxHeader = require('./ChatBox/Header.react');
var BoxBody = require('./ChatBox/Body.react');
var BoxFooter = require('./ChatBox/Footer.react');

var Logo = require("./Login/Logo.react");
var LoginBox = require("./Login/LoginBox.react");
var Copyright = require("./Login/Copyright.react");
var style = {
    "height": "100%"
};

var Main = React.createClass({
    render: function() {
        return (
            <div className="main_inner">
            <Login/>
                <div className="panel">
                    <Header/>
                    <SearchBar/>
                    <Tab/>
                    <div id="navView"></div>
                    <ChatList/>
                </div>
                <div style={style}>
                    <div id="chatArea" className="box chat">
                        <BoxHeader/>
                        <BoxBody/>
                        <BoxFooter/>
                    </div>
                </div>
            </div>
        );
    }
});


var Login = React.createClass({
    render: function() {
        return (
            <div>
                <Logo/>
                <LoginBox/>
                <Copyright/>
            </div>
        )
    }
})

module.exports = {
    Login: Login,
    Main: Main
};