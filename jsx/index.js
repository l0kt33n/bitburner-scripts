export class Drag extends React.Component {
  constructor(props) {
    super(props);
    this.referance = React.createRef();
    this.state = {
      lastX: 0,
      lastY: 0,
      style: {
        transform: `translate(0px, 0px)`
      }
    };
    this.header = props.header;
    this.mouseDown = this.mouseDown.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.mouseMove = this.mouseMove.bind(this);
    globalThis['pigalotGameState'] = globalThis['pigalotGameState'] ?? {};
    globalThis['pigalotGameState'].drag = globalThis['pigalotGameState'].drag ?? {};
    globalThis['pigalotGameState'].drag.mouseDown = this.mouseDown;
  }

  onReadyForEvent() {
    this.header.current.addEventListener("onmousedown", this.mouseDown, false);
  }

  mouseDown(e) {
    e.preventDefault();
    this.setState((state, props) => {
      state.lastX = e.clientX;
      state.lastY = e.clientY;
    });
    console.log("Hello?");
    globalThis["document"].addEventListener("onmouseup", this.mouseUp, false);
    globalThis["document"].onmousemove = this.mouseMove;
  }

  mouseUp(e) {
    e.preventDefault();
    console.log("I can see it in your eyes");
    globalThis["document"].removeEventListener("onmouseup", this.mouseUp, false);
    globalThis["document"].removeEventListener("onmousemove", this.mouseMove, false);
  }

  mouseMove(e) {
    e.preventDefault();
    console.log("is it me your looking for?");
    const difX = this.state.lastX - e.clientX;
    const difY = this.state.lastY - e.clientY;
    const x = this.referance.current.offsetTop - difX;
    const y = this.referance.current.offsetLeft - difY;
    this.setState((state, props) => {
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      state.style = {
        transform: `translate(${x}px, ${y}px)`
      };
    });
  }

  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: "drag",
      ref: this.referance,
      style: this.state.style
    }, this.props.children);
  }

}
export class Watcher extends React.Component {
  constructor(props) {
    super(props);
    globalThis['pigalotGameState'] = globalThis['pigalotGameState'] ?? {};
    globalThis['pigalotGameState'].target = globalThis['pigalotGameState'].target ?? {};
    this.state = {
      targetName: globalThis['pigalotGameState'].target?.name ?? "N/A"
    };
    globalThis['pigalotGameState'].target.update = this.update.bind(this);
    this.header = React.createRef();
    this.mouseDown = this.mouseDown.bind(this);
  }

  update() {
    this.setState((state, props) => ({
      targetName: globalThis['pigalotGameState'].target.name
    }));
  }

  mouseDown(e) {
    console.log("ola?");
    globalThis['pigalotGameState'].drag.mouseDown(e);
  }

  render() {
    return /*#__PURE__*/React.createElement(Drag, {
      header: this.header
    }, /*#__PURE__*/React.createElement("div", {
      id: "dashboard"
    }, /*#__PURE__*/React.createElement("header", {
      onMouseDown: this.mouseDown,
      className: "dashboard-header"
    }, /*#__PURE__*/React.createElement("h1", null, "Dashboard")), /*#__PURE__*/React.createElement("section", {
      className: "card"
    }, /*#__PURE__*/React.createElement("header", {
      ref: this.header
    }, /*#__PURE__*/React.createElement("h1", null, "Targets")), /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "SERVER NAME"), /*#__PURE__*/React.createElement("th", null, "$/ms"), /*#__PURE__*/React.createElement("th", null, "$/ms/GB"), /*#__PURE__*/React.createElement("th", null, "cost"), /*#__PURE__*/React.createElement("th", null, "hN"), /*#__PURE__*/React.createElement("th", null, "hAmt"), /*#__PURE__*/React.createElement("th", null, "cL(ms)"), /*#__PURE__*/React.createElement("th", null, "totProcs"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, this.state.targetName), /*#__PURE__*/React.createElement("td", null, "1"), /*#__PURE__*/React.createElement("td", null, "1"), /*#__PURE__*/React.createElement("td", null, "1"), /*#__PURE__*/React.createElement("td", null, "1"), /*#__PURE__*/React.createElement("td", null, "1"), /*#__PURE__*/React.createElement("td", null, "1"), /*#__PURE__*/React.createElement("td", null, "1")))))));
  }

}
