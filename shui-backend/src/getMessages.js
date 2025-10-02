const { ScanCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const ddb = require("./dynamo");
const { ok } = require("./response");

module.exports.handler = async (event) => {
  const qs = event.queryStringParameters || {};
  const username = (qs.username || "").trim();
  const sort = (qs.sort || "desc").toLowerCase() === "asc" ? "asc" : "desc";

  let items = [];

  if (username) {
    const uLower = username.toLowerCase();

    
    const resLower = await ddb.send(
      new QueryCommand({
        TableName: process.env.TABLE_NAME,
        IndexName: "UsernameLowerIndex",
        KeyConditionExpression: "#ul = :ul",
        ExpressionAttributeNames: { "#ul": "usernameLower" },
        ExpressionAttributeValues: { ":ul": uLower },
        ScanIndexForward: sort === "asc",
      })
    );
    items = resLower.Items || [];

    
    if (items.length === 0) {
      const resOld = await ddb.send(
        new QueryCommand({
          TableName: process.env.TABLE_NAME,
          IndexName: "UsernameIndex",
          KeyConditionExpression: "#u = :u",
          ExpressionAttributeNames: { "#u": "username" },
          ExpressionAttributeValues: { ":u": username },
          ScanIndexForward: sort === "asc",
        })
      );
      items = resOld.Items || [];
    }

    
    if (items.length === 0) {
      const resScan = await ddb.send(new ScanCommand({ TableName: process.env.TABLE_NAME }));
      items = (resScan.Items || []).filter(
        (it) => typeof it.username === "string" && it.username.toLowerCase() === uLower
      );
      items.sort((a, b) =>
        sort === "asc" ? a.createdAt - b.createdAt : b.createdAt - a.createdAt
      );
    }
  } else {
    const res = await ddb.send(new ScanCommand({ TableName: process.env.TABLE_NAME }));
    items = res.Items || [];
    items.sort((a, b) =>
      sort === "asc" ? a.createdAt - b.createdAt : b.createdAt - a.createdAt
    );
  }

  return ok({ count: items.length, items });
};
