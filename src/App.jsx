import React from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import logo from './logo.svg';
import './App.css';

import AuthDisplay from './AuthDisplay';
import MQTTDisplay from './MQTTDisplay'

function App({ signOut, user }) {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <br/>
      <MQTTDisplay user={user} />
      <br/>
      <AuthDisplay user={user} signOut={signOut} />
    </div>
  );
}

export default withAuthenticator(App);
