import React, { useState, useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import mqtt from 'mqtt';
import AWSConfiguration from './aws-iot-configuration.js';

function MQTTDisplay() {
  const [desiredSubscriptionTopic, setDesiredSubscriptionTopic] = useState("#");
  const [desiredPublishTopic, setDesiredPublishTopic] = useState("test");
  const [desiredPublishMessage, setDesiredPublishMessage] = useState(`{ "message": "Hello, world!" }`);
  const [subscribedTopics, setSubscribedTopics] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [mqttClient, setMqttClient] = useState();

  useEffect(() => {
    connectToAwsIot();
  }, []);

  async function connectToAwsIot() {
    const session = await fetchAuthSession();
    const { accessKeyId, secretAccessKey, sessionToken } = session.credentials;

    const client = mqtt.connect(`wss://${AWSConfiguration.host}/mqtt`, {
      transformWsUrl: (url) => {
        // Sign the URL with SigV4 credentials for IoT Core WebSocket
        return url;
      },
      username: `?X-Amz-Security-Token=${encodeURIComponent(sessionToken)}`,
      clientId: 'mqtt-explorer-' + Math.floor(Math.random() * 100000 + 1),
      protocolVersion: 4,
      reconnectPeriod: 8000,
    });

    client.on('connect', () => {
      setIsConnected(true);
      console.log('Publisher connected to AWS IoT.');
    });

    client.on('error', (err) => {
      console.error('MQTT error:', err);
    });

    setMqttClient(client);
  }

  function removeSubscription(topic) {
    setSubscribedTopics(subscribedTopics.filter(t => t !== topic));
  }

  function handleSubscriptionRequest(e) {
    e.preventDefault();
    if (subscribedTopics.includes(desiredSubscriptionTopic)) {
      console.log(`Already subscribed to '${desiredSubscriptionTopic}'`);
    } else {
      setSubscribedTopics(prev => [...prev, desiredSubscriptionTopic]);
    }
  }

  function handlePublishRequest(e) {
    e.preventDefault();
    mqttClient.publish(desiredPublishTopic, desiredPublishMessage);
  }

  return (
    <div className="MQTTDisplay">
      <div className="thin-border">
        <b>Publisher status:</b> {isConnected ? "connected" : "Not connected"}
        <br/><br/>
        <form onSubmit={handlePublishRequest}>
          <b>Publish to Topic:</b><br/>
          <input value={desiredPublishTopic} onChange={e => setDesiredPublishTopic(e.target.value)} type="text" required />
          <br/><br/>
          <b>Publish Message:</b><br/>
          <input value={desiredPublishMessage} onChange={e => setDesiredPublishMessage(e.target.value)} type="text" required />
          <br/><br/>
          <button type="submit">Publish</button>
        </form>
      </div>
      <br/>
      <div className="thin-border">
        <form onSubmit={handleSubscriptionRequest}>
          <b>Subscribe to Topic:</b><br/>
          <input value={desiredSubscriptionTopic} onChange={e => setDesiredSubscriptionTopic(e.target.value)} type="text" required />
          <button type="submit">Subscribe</button>
        </form>
        <br/>
        <b>Subscriptions:</b><br/>
        {subscribedTopics.map(topic => (
          <MQTTSubscription key={topic} topic={topic} removeSubscription={removeSubscription} />
        ))}
      </div>
    </div>
  );
}

function MQTTSubscription({ topic, removeSubscription }) {
  const [isConnected, setIsConnected] = useState(false);
  const [mqttClient, setMqttClient] = useState();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    connectAndSubscribe();
    return () => { mqttClient?.end(false); };
  }, []);

  async function connectAndSubscribe() {
    const session = await fetchAuthSession();
    const { sessionToken } = session.credentials;

    const client = mqtt.connect(`wss://${AWSConfiguration.host}/mqtt`, {
      username: `?X-Amz-Security-Token=${encodeURIComponent(sessionToken)}`,
      clientId: 'sub-' + Math.floor(Math.random() * 100000 + 1),
      protocolVersion: 4,
      reconnectPeriod: 8000,
    });

    client.on('connect', () => {
      setIsConnected(true);
      client.subscribe(topic);
      console.log(`Subscribed to ${topic}`);
    });

    client.on('message', (msgTopic, payload) => {
      const timestamp = new Date().toLocaleString();
      const newMessage = `${timestamp} - topic '${msgTopic}' - ${payload.toString()}`;
      setMessages(prev => [...prev, newMessage]);
    });

    setMqttClient(client);
  }

  function handleUnsubscribe(e) {
    e.preventDefault();
    mqttClient?.end(false);
    setIsConnected(false);
    removeSubscription(topic);
  }

  return (
    <div className="MQTTSubscription">
      Topic Filter: "{topic}" ({isConnected ? "connected" : "not connected"})
      <form onSubmit={handleUnsubscribe}>
        <button type="submit">Unsubscribe</button>
      </form>
      <br/>
      {messages.map((message, index) => (
        <li key={index} className="markdown">{message}</li>
      ))}
    </div>
  );
}

export default MQTTDisplay;
