import React from 'react';

import ImagesList from './ImagesList.jsx';
import {Observer, GLOBAL_EVENT} from '../Observer';

class OffsetEditor extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            states: [],
            selectedState: ""
        };

        this.updateStates = this.updateStates.bind(this);
        this.handleStateChange = this.handleStateChange.bind(this);

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

        this.setState({
            selectedState: e.target.value
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
                    className="border-color-gray"
                    defaultValue="0"
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
                    className="border-color-gray"
                    defaultValue="0"
                    style={{
                        width: "100%",
                        boxSizing: "border-box"
                    }}
                />

            </div>
        );
    }
}

export default OffsetEditor;
