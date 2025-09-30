const { ScanCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const ddb = require("./dynamo");
const { ok } = require("./response");

module.exports.handler = async (event) => {
  const qs = event.queryStringParameters || {};
  const username = (qs.username || "").trim();
  const sort = (qs.sort || "desc").toLowerCase() === "asc" ? "asc" : "desc";

  let items = [];

  if (username) {
    
    const res = await ddb.send(
      new QueryCommand({
        TableName: process.env.TABLE_NAME,
        IndexName: "UsernameIndex",
        KeyConditionExpression: "#u = :u",
        ExpressionAttributeNames: { "#u": "username" },
        ExpressionAttributeValues: { ":u": username },
        ScanIndexForward: sort === "asc", 
      })
    );
    items = res.Items || [];
  } else {
    
    const res = await ddb.send(
      new ScanCommand({ TableName: process.env.TABLE_NAME })
    );
    items = res.Items || [];
    items.sort((a, b) =>
      sort === "asc" ? a.createdAt - b.createdAt : b.createdAt - a.createdAt
    );
  }

  return ok({ count: items.length, items });
};
