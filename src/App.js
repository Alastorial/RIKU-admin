import './App.css';
import {Redirect, Route, Switch} from "react-router-dom";
import {EditProject, Auth, Callbacks} from "./pages/export";
import {useDispatch} from "react-redux";
import {useEffect} from "react";
import {fetchAuthMe} from "./redux/slices/auth";
import {OurProjects} from "./pages/OurProjects";
import {CreateProject} from "./pages/CreateProject/CreateProject";


function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchAuthMe())
    }, [dispatch])

  return (
    <div className="App">
      <Switch>
        <Route path="/auth"><Auth/></Route>
        <Route path="/admin/all"><OurProjects/></Route>
        <Route path="/admin/callbacks"><Callbacks/></Route>
        <Route path="/admin/create"><CreateProject/></Route>
        <Route path="/admin/:id"><EditProject/></Route>
        <Redirect to="/auth"/>
      </Switch>

    </div>
  );
}

export default App;
