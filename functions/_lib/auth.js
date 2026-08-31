function base64urlEncode(bytes) {
  var bin = "";
  for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str) {
  var pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  var b64 = str.replace(/-/g, "+").replace(/_/g, "/") + pad;
  var bin = atob(b64);
  var bytes = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function utf8Encode(str) {
  return new TextEncoder().encode(str);
}

function utf8Decode(bytes) {
  return new TextDecoder().decode(bytes);
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    utf8Encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

var TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

async function issueToken(secret) {
  var payload = { exp: Date.now() + TOKEN_TTL_MS };
  var payloadB64 = base64urlEncode(utf8Encode(JSON.stringify(payload)));
  var key = await hmacKey(secret);
  var sig = await crypto.subtle.sign("HMAC", key, utf8Encode(payloadB64));
  var sigB64 = base64urlEncode(new Uint8Array(sig));
  return payloadB64 + "." + sigB64;
}

async function verifyToken(token, secret) {
  if (!token || token.indexOf(".") === -1) return false;
  var parts = token.split(".");
  if (parts.length !== 2) return false;
  var payloadB64 = parts[0];
  var sigB64 = parts[1];
  var key = await hmacKey(secret);
  var valid = false;
  try {
    valid = await crypto.subtle.verify("HMAC", key, base64urlDecode(sigB64), utf8Encode(payloadB64));
  } catch (e) {
    return false;
  }
  if (!valid) return false;
  var payload;
  try {
    payload = JSON.parse(utf8Decode(base64urlDecode(payloadB64)));
  } catch (e) {
    return false;
  }
  if (!payload || typeof payload.exp !== "number") return false;
  return Date.now() < payload.exp;
}

export { issueToken, verifyToken };
