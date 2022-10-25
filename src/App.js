import './App.css';
import {Redirect, Route, Switch} from "react-router-dom";
import {Admin, Auth} from "./pages/export";


function App() {
  return (
    <div className="App">
      <Switch>
        <Route path="/auth"><Auth/></Route>
        <Route path="/admin"><Admin/></Route>
        <Redirect to="/auth"/>

      </Switch>

    </div>
  );
}

export default App;
