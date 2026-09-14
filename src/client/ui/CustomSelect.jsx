import React from 'react';

class CustomSelect extends React.Component {

    constructor(props) {
        super(props);

        let initialValue = props.value !== undefined
            ? props.value
            : props.defaultValue;

        this.state = {
            value: initialValue,
            open: false
        };

        this.rootRef = React.createRef();
        this.menuRef = React.createRef();

        this.toggle = this.toggle.bind(this);
        this.close = this.close.bind(this);
        this.handleDocumentClick = this.handleDocumentClick.bind(this);
    }

    componentDidMount() {
        document.addEventListener("mousedown", this.handleDocumentClick);
        document.addEventListener("touchstart", this.handleDocumentClick);
    }

    componentDidUpdate(prevProps) {

        if(
            this.props.value !== undefined &&
            this.props.value !== this.state.value
        ) {
            this.setState({
                value: this.props.value
            });
        }

        if(
            this.props.value === undefined &&
            prevProps.defaultValue !== this.props.defaultValue &&
            this.props.defaultValue !== this.state.value
        ) {
            this.setState({
                value: this.props.defaultValue
            });
        }
    }

    componentWillUnmount() {
        document.removeEventListener("mousedown", this.handleDocumentClick);
        document.removeEventListener("touchstart", this.handleDocumentClick);
    }

    handleDocumentClick(e) {
        if(
            this.rootRef.current &&
            !this.rootRef.current.contains(e.target)
        ) {
            this.close();
        }
    }

    toggle(e) {
        e.preventDefault();
        e.stopPropagation();

        if(this.props.disabled) {
            return;
        }

        let willOpen = !this.state.open;
        
        this.setState({
            open: willOpen
        }, () => {
            
            if(willOpen) {
                this.updateMenuPosition();
            }
        });
    }

    close() {
        if(this.state.open) {
            this.setState({
                open: false
            });
        }
    }

    selectValue(value) {

        if(this.props.disabled) {
            return;
        }

        this.setState({
            value: value,
            open: false
        }, () => {

            if(this.props.onChange) {
                this.props.onChange({
                    target: {
                        value: value
                    }
                });
            }

        });
    }

    get value() {
        return this.state.value;
    }

    set value(value) {
        this.setState({
            value: value
        });
    }

    getOptions() {

        return React.Children.toArray(this.props.children)
            .filter(child => child && child.props)
            .map(child => {
                return {
                    value:
                        child.props.value !== undefined
                            ? child.props.value
                            : child.props.children,

                    label: child.props.children
                };
            });
    }

    updateMenuPosition() {

    if(!this.rootRef.current) {
        return;
    }

    let control = this.rootRef.current.querySelector(
        ".custom-select-control"
    );

    if(!control) {
        return;
    }

    let rect = control.getBoundingClientRect();

    let menuHeight = 0;

    if(this.menuRef && this.menuRef.current) {
        menuHeight = this.menuRef.current.scrollHeight;
    }

    let viewportHeight = window.innerHeight;

    let spaceBelow = viewportHeight - rect.bottom;
    let spaceAbove = rect.top;

    let openUp =
        spaceBelow < 180 &&
        spaceAbove > spaceBelow;

    let top;

    if(openUp) {
        top = rect.top - Math.min(
            menuHeight,
            spaceAbove - 4
        );
    }
    else {
        top = rect.bottom + 4;
    }

    let left = rect.left;

    let width = rect.width;
        
    let screenWidth = window.innerWidth;
    
    if(left + width > screenWidth - 4) {
        left = screenWidth - width - 4;
    }
    if(left < 4) {
        left = 4;}

    this.menuStyle = {
        position: "fixed",
        left: left + "px",
        top: top + "px",
        width: width + "px",
        maxHeight: "260px",
        zIndex: 999999
    };

    this.forceUpdate();
    }

    render() {

        let options = this.getOptions();

        let selected = null;

        for(let option of options) {
            if(String(option.value) === String(this.state.value)) {
                selected = option;
                break;
            }
        }

        let selectedLabel = selected
            ? selected.label
            : this.state.value;

        return (
            <div
                ref={this.rootRef}
                className={
                    "custom-select" +
                    (this.props.disabled ? " custom-select-disabled" : "") + 
                    (this.state.open ? " custom-select-open" : "")
                }
            >

                <div
                    className="custom-select-control"
                    onClick={this.toggle}
                >

                    <div className="custom-select-value">
                        {selectedLabel}
                    </div>

                    <div className="custom-select-arrow">
                        {this.state.open ? "▲" : "▼"}
                    </div>

                </div>

                {this.state.open && !this.props.disabled && (

                    <div 
                        ref={this.menuRef} 
                        className="custom-select-menu" 
                        style={this.menuStyle}
                        >

                        {options.map((option, index) => {

                            let isSelected =
                                String(option.value) ===
                                String(this.state.value);

                            return (
                                <div
                                    key={"custom-option-" + index}
                                    className={
                                        "custom-select-option" +
                                        (isSelected
                                            ? " custom-select-option-selected"
                                            : "")
                                    }
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        this.selectValue(option.value);
                                    }}
                                >

                                    <span className="custom-select-option-text">
                                        {option.label}
                                    </span>

                                    <span className="custom-select-check">
                                        {isSelected ? "●" : ""}
                                    </span>

                                </div>
                            );

                        })}

                    </div>

                )}

            </div>
        );
    }
}

export default CustomSelect;
