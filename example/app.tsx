import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {SimpleTrendGraph} from '../';

const dataSet = [30, 50, 70];
declare var require: any;

class ExampleApp extends React.Component<any, any> {

	state = {
		ds: [],
		smoothing: 0
	};

	componentWillMount() {
		this.reset();
	}

	reset() {
		const length = 20; //Math.floor(Math.random() * 50 + 5);
		const max = 1000;

		const randomArray = (length, max) => {
			return Array.apply(null, Array(length)).map(function(_, i) {
				return Math.round(Math.random() * max);
			});
		};

		this.setState({ds: randomArray(length, max)});
	}

	changeSmoothing(s) {
		this.setState({smoothing: s});
	}

	render() {
		const easing = t => t;
		return <div><SimpleTrendGraph dataSet={this.state.ds} smoothing={this.state.smoothing} animate={{time: 2000, easing}}/><button onClick={this.reset.bind(this)}></button><input type='number' onChange={e => this.changeSmoothing(parseInt(e.target.value, 10))}/><pre><code>{this.state.ds.join(', ')}</code></pre></div>;
	}
}


ReactDOM.render(React.createElement(ExampleApp, {}), document.getElementById('app'));
