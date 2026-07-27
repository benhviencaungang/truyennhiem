import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ECDS_BASE_URL = "https://gs.vadp.gov.vn/api/fast/v1";

// Cấu hình CORS để trình duyệt web của bạn không bị chặn
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Bỏ qua lỗi CORS khi trình duyệt "hỏi đường" (Preflight request)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Lấy dữ liệu từ file daycong.html gửi lên
    const body = await req.json();
    const { action, payload, token } = body; 

    let ecdsResponse;

    // Phân loại hành động (Đăng nhập hoặc Đẩy dữ liệu)
    if (action === 'login') {
      ecdsResponse = await fetch(`${ECDS_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else if (action === 'push_data') {
      ecdsResponse = await fetch(`${ECDS_BASE_URL}/ca-benh/cap-nhat-nhieu`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
    } else {
        throw new Error("Hành động không hợp lệ");
    }

    // Đọc kết quả từ ECDS và trả ngược về cho web của bạn
    const data = await ecdsResponse.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})