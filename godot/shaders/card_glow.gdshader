shader_type canvas_item;

// ========================================
// こんにゃん堂 — カード光彩シェーダー
// カードの縁をパルスするラベンダーの光で縁取り
// シマーライン（斜めの光の筋）でキラキラ感を演出
// ========================================

uniform vec4 base_color : source_color     = vec4(0.420, 0.298, 0.604, 1.0); // カード背面: パープル
uniform vec4 glow_color : source_color     = vec4(0.784, 0.659, 1.0,  1.0); // ラベンダー
uniform vec4 shimmer_color : source_color  = vec4(0.941, 0.816, 0.376, 1.0); // ゴールド
uniform float border_width : hint_range(0.01, 0.25) = 0.06;
uniform float pulse_speed : hint_range(0.1, 5.0) = 1.8;
uniform float shimmer_speed : hint_range(0.1, 5.0) = 2.5;
uniform float shimmer_intensity : hint_range(0.0, 1.0) = 0.35;
uniform float corner_smooth : hint_range(0.0, 0.2) = 0.04;

void fragment() {
	vec2 uv = UV;

	// ---- 縁の距離計算 ----
	float edge_x = min(uv.x, 1.0 - uv.x);
	float edge_y = min(uv.y, 1.0 - uv.y);
	float edge   = min(edge_x, edge_y);

	// ---- パルスするボーダーグロー ----
	float pulse  = sin(TIME * pulse_speed) * 0.35 + 0.65;
	float border = 1.0 - smoothstep(0.0, border_width, edge);
	float glow   = border * pulse;

	// ---- シマーライン（斜めに流れる光の筋）----
	float t         = TIME * shimmer_speed;
	float diag      = uv.x + uv.y;                    // 斜め座標
	float shim_wave = sin(diag * 8.0 - t) * 0.5 + 0.5;
	shim_wave      *= sin(diag * 3.0 - t * 0.4) * 0.3 + 0.7;
	shim_wave       = pow(shim_wave, 4.0);             // シャープに絞る
	float shim_mask = smoothstep(border_width * 2.0, border_width * 0.5, edge); // 縁付近のみ
	float shimmer   = shim_wave * shim_mask * shimmer_intensity;

	// ---- 合成 ----
	vec3 col = base_color.rgb;
	col = mix(col, glow_color.rgb,    glow    * 0.75);
	col = mix(col, shimmer_color.rgb, shimmer * pulse);

	// 縁の外はフェードアウト（透明にしてカードの角丸を演出）
	float alpha = smoothstep(0.0, corner_smooth, edge);

	COLOR = vec4(col, base_color.a * alpha);
}
