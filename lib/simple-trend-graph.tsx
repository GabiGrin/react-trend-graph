import * as React from 'react';


export interface SimpleTrendGraphAnimationData {
	time: number;
	easing?: (t: number) => number;
}

export interface SimpleTrendGraphProps {
	dataSet: number[];
	smoothing: number;
	animate?: SimpleTrendGraphAnimationData;
}

const normalizeDataSet = (ds: number[]): number[] => {
	const first = ds[0];
	const {lowest, highest} = ds.reduce((prev, curr) => {
		return {lowest: Math.min(prev.lowest, curr), highest: Math.max(prev.highest, curr)};
	}, {lowest: first, highest: first});
	const delta = highest - lowest;
	return delta ? ds.map(point => ((point - lowest) / delta) ) : [0.5, 0.5];
};

const movingAverage = (ds: number[], size: number) => {
	const length = ds.length;

	const avgNeighbours = (ds, idx, size) => {
		let total = 0;
		let count = 0;
		for (let i = idx - size; i < idx + size; i++) {
			if (i >= 0 && i < length) {
				total += ds[i];
				count++;
			}
		}

		return total / count || ds[idx];
	};

	return ds.map((point, idx) => avgNeighbours(ds, idx, size));
};

export class SimpleTrendGraph extends React.Component<SimpleTrendGraphProps, any> {

	state = {
		normalizedDataSet: [],
		visibleDataSet: []
	};

	animationStart = 0;
	animationFrameId = null;

	constructor(props: SimpleTrendGraphProps) {
		super(props);
		const ds = props.dataSet;
		const normalized = movingAverage(normalizeDataSet(ds), props.smoothing);
		this.state.normalizedDataSet = normalized;
		this.state.visibleDataSet = normalized;
	}

	startAnimation(current, newDataSet, time, easingFunction) {

		const animateFrom = current;
		const animateTo = newDataSet;

		this.animationStart = Date.now();

		window.cancelAnimationFrame(this.animationFrameId);

		this.doAnimation(current, newDataSet, time, easingFunction);
	}

	private doAnimation(source, target, time, easing) {
		const elapsed = Date.now() - this.animationStart;
		const dt = Math.min(elapsed / time, 1);
		const modifier = easing(dt);

		const interpolatedDataSet = source.map((sourcePoint, idx) => {
			const targetPoint = target[idx];
			const delta = targetPoint - sourcePoint;
			if (! (sourcePoint + delta * modifier)) {
				console.warn('bad point', sourcePoint, targetPoint, delta, modifier, (sourcePoint + delta * modifier));
			}
			return sourcePoint + delta * modifier;
		});

		this.setState({visibleDataSet: interpolatedDataSet});

		if (dt < 1) {
			this.animationFrameId = requestAnimationFrame(() => {
				this.doAnimation(source, target, time, easing);
			});
		}
	};

	componentWillReceiveProps(nextProps: SimpleTrendGraphProps) {
		const ds = nextProps.dataSet;
		const normalized = movingAverage(normalizeDataSet(ds), nextProps.smoothing);
		console.log(normalized, this.state.normalizedDataSet);
		const animationOptions = nextProps.animate;
		this.setState({normalizedDataSet: normalized});
		console.log(nextProps.animate);
		if (nextProps.animate && ds.length === this.props.dataSet.length) {
			this.startAnimation(this.state.visibleDataSet, normalized, animationOptions.time, animationOptions.easing || (t => t));
		} else {
			this.setState({visibleDataSet: normalized});
		}


	}

	render() {
		const modifier = 100;
		const ds2 = this.state.visibleDataSet.map(point => modifier - Math.floor(point * modifier));
		const [first, ...rest] = ds2;
		const initial = `M0 ${first}`;
		const length = ds2.length;
		const idxToX = idx => Math.floor((idx / (length - 1)) * 100);
		const ending = `L100 100 L0 100 Z`;
		const bob = [initial, ...(rest.map((point, idx) => `L${idxToX(idx + 1)} ${point}`)), ending].join(' ');


		return (<svg width='100' height='100' viewBox='0 0 100 100'>
			<path className='graph' d={bob} fill='blue' stroke='red'/>
		</svg>);
	}
}
