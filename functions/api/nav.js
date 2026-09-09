import { loadDoc, json, NAV_PAGES } from "../_lib/store.js";

/* 상단 메뉴 렌더링 전용 경량 응답.
   nav.js가 페이지 로드마다 호출하므로 전체 문서(45KB+)를 내려보내지 않는다. */
export async function onRequestGet(context) {
  var doc = await loadDoc(context.env.POC_KV);
  return new Response(JSON.stringify({ navConfig: doc.navConfig, pages: NAV_PAGES }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=30"
    }
  });
}
