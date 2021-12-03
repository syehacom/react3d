import logo from './logo.svg';
import Live from "./components/Live"

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Live />
      </header>
    </div>
  );
}

export default App;
