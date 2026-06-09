import React, { useState, useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { post } from 'aws-amplify/api';
import { JSONTree } from 'react-json-tree';
import AWSConfiguration from './aws-iotcore-configuration.js';

function AuthDisplay({ user, signOut }) {
  const [credentials, setCredentials] = useState({});
  const [identityId, setIdentityId] = useState('');

  useEffect(() => {
    async function loadCredentials() {
      const session = await fetchAuthSession();
      setCredentials(session.credentials);
      setIdentityId(session.identityId);

      // Call Lambda to attach IoT policy to the Cognito identity
      try {
        const restOperation = post({
          apiName: 'amplifyiotlambdaapi',
          path: '/amplifyiotlambdaapi',
          options: {
            body: {
              region: AWSConfiguration.region,
              apiVersion: AWSConfiguration.apiVersion,
              endpoint: AWSConfiguration.endpoint,
              policy: AWSConfiguration.policy
            }
          }
        });
        const response = await restOperation.response;
        console.log("Successfully created policy and attached with the identity", response);
      } catch (err) {
        console.log(err);
      }
    }

    loadCredentials();
  }, []);

  return (
    <div className="AuthDisplay">
      Auth identity ID: {identityId}
      <br/><br/>
      <button onClick={signOut}>Sign out</button>
      <br/><br/>

      Credentials:<br/>
      <div className="AuthData">
        <JSONTree data={credentials} theme="tomorrow" invertTheme={true} />
      </div>
    </div>
  );
}

export default AuthDisplay;
