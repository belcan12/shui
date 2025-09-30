const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

const respond = (statusCode, body) => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});

module.exports = {
  ok: (b) => respond(200, b),
  created: (b) => respond(201, b),
  badRequest: (b) => respond(400, b),
  notFound: (b) => respond(404, b),
  serverError: (e) => {
    console.error(e);
    return respond(500, { message: "Internal Server Error" });
  },
};
