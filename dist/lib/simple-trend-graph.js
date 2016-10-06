"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var normalizeDataSet = function (ds) {
    var first = ds[0];
    var _a = ds.reduce(function (prev, curr) {
        return { lowest: Math.min(prev.lowest, curr), highest: Math.max(prev.highest, curr) };
    }, { lowest: first, highest: first }), lowest = _a.lowest, highest = _a.highest;
    var delta = highest - lowest;
    return delta ? ds.map(function (point) { return ((point - lowest) / delta); }) : [0.5, 0.5];
};
var movingAverage = function (ds, size) {
    var length = ds.length;
    var avgNeighbours = function (ds, idx, size) {
        var total = 0;
        var count = 0;
        for (var i = idx - size; i < idx + size; i++) {
            if (i >= 0 && i < length) {
                total += ds[i];
                count++;
            }
        }
        return total / count || ds[idx];
    };
    return ds.map(function (point, idx) { return avgNeighbours(ds, idx, size); });
};
var SimpleTrendGraph = (function (_super) {
    __extends(SimpleTrendGraph, _super);
    function SimpleTrendGraph(props) {
        _super.call(this, props);
        this.state = {
            normalizedDataSet: [],
            visibleDataSet: []
        };
        this.animationStart = 0;
        this.animationFrameId = null;
        var ds = props.dataSet;
        var normalized = movingAverage(normalizeDataSet(ds), props.smoothing);
        this.state.normalizedDataSet = normalized;
        this.state.visibleDataSet = normalized;
    }
    SimpleTrendGraph.prototype.startAnimation = function (current, newDataSet, time, easingFunction) {
        var animateFrom = current;
        var animateTo = newDataSet;
        this.animationStart = Date.now();
        window.cancelAnimationFrame(this.animationFrameId);
        this.doAnimation(current, newDataSet, time, easingFunction);
    };
    SimpleTrendGraph.prototype.doAnimation = function (source, target, time, easing) {
        var _this = this;
        var elapsed = Date.now() - this.animationStart;
        var dt = Math.min(elapsed / time, 1);
        var modifier = easing(dt);
        var interpolatedDataSet = source.map(function (sourcePoint, idx) {
            var targetPoint = target[idx];
            var delta = targetPoint - sourcePoint;
            if (!(sourcePoint + delta * modifier)) {
                console.warn('bad point', sourcePoint, targetPoint, delta, modifier, (sourcePoint + delta * modifier));
            }
            return sourcePoint + delta * modifier;
        });
        this.setState({ visibleDataSet: interpolatedDataSet });
        if (dt < 1) {
            this.animationFrameId = requestAnimationFrame(function () {
                _this.doAnimation(source, target, time, easing);
            });
        }
    };
    ;
    SimpleTrendGraph.prototype.componentWillReceiveProps = function (nextProps) {
        var ds = nextProps.dataSet;
        var normalized = movingAverage(normalizeDataSet(ds), nextProps.smoothing);
        console.log(normalized, this.state.normalizedDataSet);
        var animationOptions = nextProps.animate;
        this.setState({ normalizedDataSet: normalized });
        console.log(nextProps.animate);
        if (nextProps.animate && ds.length === this.props.dataSet.length) {
            this.startAnimation(this.state.visibleDataSet, normalized, animationOptions.time, animationOptions.easing || (function (t) { return t; }));
        }
        else {
            this.setState({ visibleDataSet: normalized });
        }
    };
    SimpleTrendGraph.prototype.render = function () {
        var modifier = 100;
        var ds2 = this.state.visibleDataSet.map(function (point) { return modifier - Math.floor(point * modifier); });
        var first = ds2[0], rest = ds2.slice(1);
        var initial = "M0 " + first;
        var length = ds2.length;
        var idxToX = function (idx) { return Math.floor((idx / (length - 1)) * 100); };
        var ending = "L100 100 L0 100 Z";
        var bob = [initial].concat((rest.map(function (point, idx) { return ("L" + idxToX(idx + 1) + " " + point); })), [ending]).join(' ');
        return (React.createElement("svg", {width: '100', height: '100', viewBox: '0 0 100 100'}, 
            React.createElement("path", {className: 'graph', d: bob, fill: 'blue', stroke: 'red'})
        ));
    };
    return SimpleTrendGraph;
}(React.Component));
exports.SimpleTrendGraph = SimpleTrendGraph;
