import { issueToken } from "../_lib/auth.js";

export async function onRequestPost(context) {
  var request = context.request;
  var env = context.env;

  var body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (!env.EDIT_PASSWORD || !env.SESSION_SECRET) {
    return new Response(JSON.stringify({ error: "server not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (!body || body.password !== env.EDIT_PASSWORD) {
    return new Response(JSON.stringify({ error: "invalid password" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  var token = await issueToken(env.SESSION_SECRET);
  return new Response(JSON.stringify({ token: token }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
