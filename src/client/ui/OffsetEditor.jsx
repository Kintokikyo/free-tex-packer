import React from 'react';

import ImagesList from './ImagesList.jsx';
import {Observer, GLOBAL_EVENT} from '../Observer';

class OffsetEditor extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            states: [],
            selectedState: "",
            offsetX: "0",
            offsetY: "0",
            offsets: {}
        };

        this.updateStates = this.updateStates.bind(this);
        this.handleStateChange = this.handleStateChange.bind(this);
        this.handleOffsetXChange = this.handleOffsetXChange.bind(this);
        this.handleOffsetYChange = this.handleOffsetYChange.bind(this);
        this.handleApplyOffset = this.handleApplyOffset.bind(this);

        Observer.on(
            GLOBAL_EVENT.IMAGES_LIST_CHANGED,
            this.updateStates,
            this
        );
    }

    componentDidMount() {
        this.updateStates();
    }

    componentWillUnmount() {
        Observer.off(
            GLOBAL_EVENT.IMAGES_LIST_CHANGED,
            this.updateStates,
            this
        );
    }

    getImageNames() {

        if(!ImagesList.i) {
            return [];
        }

        return Object.keys(ImagesList.i.state.images);
    }

    getStateName(fileName) {

        let name = fileName.split('/').pop();

        // Hilangkan ekstensi
        name = name.replace(/\.[^.]+$/, '');

        // Angka terakhir dianggap nomor frame
        let match = name.match(/^(.*?)[_-]\d+$/);

        if(!match) {
            return null;
        }

        return match[1];
    }

    updateStates() {

        let names = this.getImageNames();

        let groups = {};

        for(let name of names) {

            let stateName = this.getStateName(name);

            if(!stateName) {
                continue;
            }

            if(!groups[stateName]) {
                groups[stateName] = 0;
            }

            groups[stateName]++;
        }

        let states = Object.keys(groups).map(name => {
            return {
                name: name,
                count: groups[name]
            };
        });

        states.sort((a, b) => {
            return a.name.localeCompare(b.name);
        });

        let selectedState = this.state.selectedState;

        if(
            !selectedState ||
            !groups[selectedState]
        ) {
            selectedState = states.length ? states[0].name : "";
        }

        this.setState({
            states: states,
            selectedState: selectedState
        });
    }

    handleStateChange(e) {
        let selectedState = e.target.value;
        let offset = this.state.offsets[selectedState];
        this.setState({
            selectedState: selectedState,
            offsetX: offset ? String(offset.x) : "0",
            offsetY: offset ? String(offset.y) : "0"
        });
    }
    
    handleOffsetXChange(e) {
        this.setState({
            offsetX: e.target.value
        });
    }
    
    handleOffsetYChange(e) {
        this.setState({
            offsetY: e.target.value
        });
    }

    handleApplyOffset() {
    let stateName = this.state.selectedState;

    if(!stateName) {
        return;
    }

    let x = parseFloat(this.state.offsetX);
    let y = parseFloat(this.state.offsetY);

    if(Number.isNaN(x)) {
        x = 0;
    }

    if(Number.isNaN(y)) {
        y = 0;
    }

    let offsets = {
        ...this.state.offsets,

        [stateName]: {
            x: x,
            y: y
        }
    };

    this.setState({
        offsets: offsets,
        offsetX: String(x),
        offsetY: String(y)
    });
    }

    render() {

        return (
            <div
                className="offset-editor"
                style={{
                    marginTop: "10px",
                    paddingTop: "10px",
                    borderTop: "1px solid #ccc"
                }}
            >

                <div style={{
                    fontWeight: "bold",
                    marginBottom: "8px"
                }}>
                    Offset State
                </div>

                <div style={{marginBottom: "5px"}}>
                    State:
                </div>

                <select
                    className="border-color-gray"
                    style={{
                        width: "100%",
                        boxSizing: "border-box",
                        marginBottom: "8px"
                    }}
                    value={this.state.selectedState}
                    onChange={this.handleStateChange}
                >
                    {this.state.states.map(item => {
                        return (
                            <option
                                key={"offset-state-" + item.name}
                                value={item.name}
                            >
                                {item.name} ({item.count} frame)
                            </option>
                        );
                    })}
                </select>

                <div>
                    Offset X:
                </div>

                <input
                    type="number"
                    step="any"
                    className="border-color-gray"
                    value={this.state.offsetX}
                    onChange={this.handleOffsetXChange}
                    style={{
                        width: "100%",
                        boxSizing: "border-box",
                        marginBottom: "5px"
                    }}
                />

                <div>
                    Offset Y:
                </div>

                <input
                    type="number"
                    step="any"
                    className="border-color-gray"
                    value={this.state.offsetY}
                    onChange={this.handleOffsetYChange}
                    style={{
                        width: "100%",
                        boxSizing: "border-box"
                    }}
                />

                <button
                    type="button"
                    onClick={this.handleApplyOffset}
                    style={{
                        width: "100%",
                        marginTop: "8px"
                    }}>
                    Terapkan
                </button>

            </div>
        );
    }
}

export default OffsetEditor;
