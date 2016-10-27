"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var ReactDOM = require('react-dom');
var _1 = require('../');
var dataSet = [30, 50, 70];
var ExampleApp = (function (_super) {
    __extends(ExampleApp, _super);
    function ExampleApp() {
        _super.apply(this, arguments);
        this.state = {
            ds: [],
            smoothing: 0
        };
    }
    ExampleApp.prototype.componentWillMount = function () {
        this.reset();
    };
    ExampleApp.prototype.reset = function () {
        var length = 20;
        var max = 1000;
        var randomArray = function (length, max) {
            return Array.apply(null, Array(length)).map(function (_, i) {
                return Math.round(Math.random() * max);
            });
        };
        this.setState({ ds: randomArray(length, max) });
    };
    ExampleApp.prototype.changeSmoothing = function (s) {
        this.setState({ smoothing: s });
    };
    ExampleApp.prototype.render = function () {
        var _this = this;
        var easing = function (t) { return t; };
        return React.createElement("div", null, 
            React.createElement(_1.SimpleTrendGraph, {width: 300, height: 100, dataSet: this.state.ds, smoothing: this.state.smoothing, animate: { time: 2000, easing: easing }}), 
            React.createElement("button", {onClick: this.reset.bind(this)}), 
            React.createElement("input", {type: 'number', onChange: function (e) { return _this.changeSmoothing(parseInt(e.target.value, 10)); }}), 
            React.createElement("pre", null, 
                React.createElement("code", null, this.state.ds.join(', '))
            ));
    };
    return ExampleApp;
}(React.Component));
ReactDOM.render(React.createElement(ExampleApp, {}), document.getElementById('app'));
