// Deno 脚本（超级调试版）
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

console.log(`[DEBUG] Script starting up at ${new Date().toISOString()}`);

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const MODEL_NAME = "gemini-2.5-flash-lite-preview-latest";

serve(async (req) => {
  console.log(`[LOG] Received a request. Method: ${req.method}, URL: ${req.url}`);

  if (req.method !== "POST") {
    console.log("[LOG] Request is not POST. Replying with 405 Method Not Allowed.");
    return new Response("Method Not Allowed", { status: 405 });
  }

  console.log("[LOG] Request is POST. Proceeding to handle...");

  if (!GEMINI_API_KEY) {
    console.error("[FATAL ERROR] GEMINI_API_KEY environment variable is NOT SET!");
    return new Response(JSON.stringify({ error: "API Key not configured on server." }), { status: 500 });
  }
  console.log("[LOG] Gemini API Key has been found.");

  const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;
  
  try {
    const requestBody = await req.text();
    console.log("[LOG] Successfully read request body from client.");

    console.log("[LOG] Forwarding request to Google API...");
    const googleRes = await fetch(googleApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody,
    });
    console.log(`[LOG] Received response from Google. Status: ${googleRes.status}`);
    
    const result = await googleRes.text();
    console.log("[LOG] Successfully read Google's response body. Sending back to client.");
    
    return new Response(result, {
      status: googleRes.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[FATAL ERROR] An error occurred during POST processing:", err);
    return new Response(JSON.stringify({ error: "An internal error occurred on the server.", details: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

console.log("[DEBUG] Server is configured and listening for requests.");
