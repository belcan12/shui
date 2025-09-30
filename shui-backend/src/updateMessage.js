const { UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const ddb = require("./dynamo");
const { ok, badRequest, notFound, serverError } = require("./response");

module.exports.handler = async (event) => {
  try {
    const id = event.pathParameters && event.pathParameters.id;
    if (!id) return badRequest({ message: "id (path param) krävs" });

    const body = JSON.parse(event.body || "{}");
    const { text } = body;

    if (typeof text !== "string") {
      return badRequest({ message: "text måste vara en sträng" });
    }
    const t = text.trim().slice(0, 500);
    if (!t) return badRequest({ message: "text får inte vara tom" });

    const res = await ddb.send(
      new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: { id },
        UpdateExpression: "SET #t = :t",
        ExpressionAttributeNames: { "#t": "text" },
        ExpressionAttributeValues: { ":t": t },
        ConditionExpression: "attribute_exists(id)", 
        ReturnValues: "ALL_NEW",
      })
    );

    return ok(res.Attributes);
  } catch (e) {
    if (e && e.name === "ConditionalCheckFailedException") {
      return notFound({ message: "Meddelandet finns inte" });
    }
    return serverError(e);
  }
};
