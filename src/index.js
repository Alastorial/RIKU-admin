import React from 'react';
import ReactDOM from 'react-dom/client';
import {Provider} from 'react-redux'
import './index.css';
import App from './App';
import {BrowserRouter} from "react-router-dom";
import store from "./redux/store";
import {GoogleOAuthProvider} from "@react-oauth/google";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
      <BrowserRouter>
          <Provider store={store}>
            <GoogleOAuthProvider clientId="1090149309423-1jm22temu1t9t6quth4k2dps09cqku20.apps.googleusercontent.com">
                <App />
            </GoogleOAuthProvider>
          </Provider>
      </BrowserRouter>
);

