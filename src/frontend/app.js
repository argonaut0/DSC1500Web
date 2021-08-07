'use strict';

const e = React.createElement;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        R: false,
        A: false,
        F: false,
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false
    };
  }

  componentDidMount() {
    this.ws = new WebSocket("ws://192.168.1.1:8080/websocket");
    this.ws.onmessage = (event) => {
        const data = event.data.slice(0,12);
        const ns = {
            R: data.includes("R"),
            A: data.includes("A"),
            F: data.includes("F"),
            1: data.includes("1"),
            2: data.includes("2"),
            3: data.includes("3"),
            4: data.includes("4"),
            5: data.includes("5"),
            6: data.includes("6"),
        };
        
        this.setState(ns);
        console.debug("State changed:", Object.entries(this.state));
    }
  }

  componentWillUnmount() {
    this.ws.close();
  }

  render() {
    return Object.entries(this.state).map(function (kv) {
        if (kv[1]) {
            return e(
                'h1',
                null,
                `${kv[0]}`
            );
        } else {
            return e(
                'h3',
                null,
                `${kv[0]}`
            )
        }
    });
    /*
    e(
        'h1',
        null,
        `${this.state[6]}`
        
      //'button',
      //{ onClick: () => this.setState({ liked: true }) },
      //'Like'
    );
    */
  }
}
const domContainer = document.querySelector('#react_content');
ReactDOM.render(e(App), domContainer);