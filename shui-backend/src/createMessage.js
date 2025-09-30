const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const ddb = require("./dynamo");
const { randomUUID } = require("crypto"); 
const { created, badRequest, serverError } = require("./response");

module.exports.handler = async (event) => {
  try {
    let bodyObj = {};
    try {
      bodyObj = JSON.parse(event.body || "{}");
    } catch {
      return badRequest({ message: "Body måste vara giltig JSON" });
    }

    const { username, text } = bodyObj;

    if (typeof username !== "string" || typeof text !== "string") {
      return badRequest({ message: "username och text måste vara strängar" });
    }

    const u = username.trim().slice(0, 40);
    const t = text.trim().slice(0, 500);
    if (!u || !t) {
      return badRequest({ message: "username/text får inte vara tomma" });
    }

    const now = Date.now();
    const item = {
      id: randomUUID(),   
      username: u,
      text: t,
      createdAt: now,
    };

    await ddb.send(new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: item,
    }));

    return created(item);
  } catch (e) {
    return serverError(e);
  }
};
