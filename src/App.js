import './App.css';
import {Redirect, Route, Switch} from "react-router-dom";
import {Admin, Auth} from "./pages/export";
import {useDispatch} from "react-redux";
import {useEffect} from "react";
import {fetchAuthMe} from "./redux/slices/auth";


function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchAuthMe())
    }, [])

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
