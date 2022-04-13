var awsIotCoreConfiguration = {
    endpoint: '<AWS-IoT-endpoint>'',
    region: '<REGION>',
    apiVersion: '2015-05-28',
    policy: '{"Version": "2012-10-17", "Statement": [{"Effect": "Allow", "Action": [ "iot:Subscribe" ], "Resource": ["arn:aws:iot:<REGION>:<AWS ACCOUNT>:topicfilter/*"]},{"Effect": "Allow","Action": [ "iot:Connect" ],"Resource": ["arn:aws:iot:<REGION>:<AWS ACCOUNT>:client/iotcognito-lambda-sampleapp-*"] },{"Effect": "Allow","Action": [ "iot:Publish","iot:Receive" ],"Resource": ["arn:aws:iot:<REGION>:<AWS ACCOUNT>:topic/*"]}]}'
  };

 export default awsIotCoreConfiguration;