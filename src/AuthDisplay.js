import React, { useState, useEffect } from 'react';
import {Auth} from 'aws-amplify';
import JSONTree from 'react-json-tree';
import AWS from 'aws-sdk';
import { API } from 'aws-amplify'
import AWSConfiguration from './aws-iotcore-configuration.js';

function AuthDisplay(props) {

    const [essentialCredentials, setEssentialCredentials] = useState({});
        useEffect(() => {
          console.log('useEffect for essentialCredentials triggered.');
          Auth.currentCredentials()
            .then(credentials => {
              setEssentialCredentials(Auth.essentialCredentials(credentials));
              });
        },[]);

    // Initialize the Amazon Cognito credentials provider
    AWS.config.region = AWSConfiguration.region;
    AWS.config.credentials =  essentialCredentials;

    function callApi(id) {
            //Send config params to the lambda function
            const params = {
                body: {
                region: AWSConfiguration.region,
                apiVersion: AWSConfiguration.apiVersion,
                endpoint: AWSConfiguration.endpoint,
                policy: AWSConfiguration.policy
                }
            };

            API.post('amplifyiotlambdaapi', '/amplifyiotlambdaapi', params)
            .then(resp => {
            console.log("Successfully created policy and attached with the identity", resp);
            })
            .catch(err => {
            console.log(err);
        });
    }

    const [cognitoIdentityId, setCognitoIdentityId] = useState({});

    useEffect(() => {
      console.log('useEffect for cognitoIdentityId triggered.');
      Auth.currentCredentials().then((info) => {
        setCognitoIdentityId(info._identityId);

        console.log("Cognito identity id: " + info._identityId);

        callApi(info._identityId);
      });
    },[]);

    return (
      <div className="AuthDisplay">
        Auth state: {props.authState}
        <br/><br/>
      
        Auth identity ID: {cognitoIdentityId.toString()} 
        <br/><br/>
  
        Auth data:<br/>
        <div className="AuthData">
          <JSONTree data={props.authData} theme={"tomorrow"} invertTheme={true} />
        </div>
        <br/><br/>

        Essential Credentials:<br/>
        <div className="AuthData">
          <JSONTree data={essentialCredentials} theme={"tomorrow"} invertTheme={true} />
        </div>
        <br/><br/>

      </div>
    );
  }

export default AuthDisplay; 