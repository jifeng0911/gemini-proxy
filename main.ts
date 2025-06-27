// 文件名：main.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// 从环境变量中安全地读取API Key
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
// 定义要使用的模型
const MODEL_NAME = "gemini-2.5-flash";

serve(async (req) => {
  // 1. 只接受POST请求
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // 2. 构建发往Google的请求
  const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;
  
  try {
    // 3. 直接转发客户端发来的请求体
    const requestBody = await req.text();

    const googleRes = await fetch(googleApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: requestBody, // 将原始请求体转发给Google
    });

    // 4. 将Google的回复直接返回给客户端
    const result = await googleRes.text();
    
    return new Response(result, {
      status: googleRes.status,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // 允许跨域
      },
    });

  } catch (err) {
    // 5. 如果发生错误，返回错误信息
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
