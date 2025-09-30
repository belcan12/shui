const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");


const client = new DynamoDBClient({});

const ddb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true, 
  },
  unmarshallOptions: {
    wrapNumbers: false, 
  },
});

module.exports = ddb;
