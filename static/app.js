'use strict';

const e = React.createElement;

const SERVER_URI = "ws://localhost:3000"

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = { clients: [], websocket: null };

    const socket = new WebSocket(`${SERVER_URI}/debug`);

    socket.onopen = () => {
        this.setState({ websocket: socket });

        socket.onmessage = e => {
            const data = JSON.parse(e.data);

            // TODO kinda weird
            if (data.data.clients) {
                this.setState({ clients: data.data.clients })
            }
        }

        socket.send("debuginit")
    }
  }

  sendStart() {
    this.state.websocket.send("start");
  }

  render() {
    // TODO fix key prop

    return (
        <div>
            there are currently {this.state.clients.length} clients connected.
            { this.state.clients.map((client, i) => (
                <div>client {i}: connected from {client.remoteAddress}</div>
            ))}
            <div>
                <button onClick={this.sendStart}>start!</button>
            </div>
        </div>
    );
  }
}

const domContainer = document.querySelector('#app-container');
ReactDOM.render(e(App), domContainer);
