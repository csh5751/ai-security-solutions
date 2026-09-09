import { issueToken } from "../_lib/auth.js";
import { json } from "../_lib/store.js";

/* 관리자 전용 로그인. 편집 비밀번호(EDIT_PASSWORD)와는 별개의
   ADMIN_PASSWORD를 사용하고, 발급 토큰에 role:"admin"을 심는다. */
export async function onRequestPost(context) {
  var request = context.request;
  var env = context.env;

  var body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "invalid request body" }, 400);
  }

  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
    return json({ error: "server not configured: ADMIN_PASSWORD 또는 SESSION_SECRET 미설정" }, 500);
  }

  if (!body || typeof body.password !== "string" || body.password !== env.ADMIN_PASSWORD) {
    return json({ error: "invalid admin password" }, 401);
  }

  var token = await issueToken(env.SESSION_SECRET, "admin");
  return json({ token: token, role: "admin" });
}
