shader_type canvas_item;

// ========================================
// こんにゃん堂 — オーロラ背景シェーダー
// Deep Indigo を基調に、紫〜ラベンダーの
// 幻想的なオーロラとちりばめられた星を表現
// ========================================

uniform float speed : hint_range(0.05, 1.0) = 0.2;
uniform float aurora_intensity : hint_range(0.0, 1.0) = 0.45;
uniform vec4 col_base : source_color    = vec4(0.039, 0.024, 0.125, 1.0); // #0a0620
uniform vec4 col_purple : source_color  = vec4(0.420, 0.298, 0.604, 1.0); // #6B4C9A
uniform vec4 col_lavender : source_color = vec4(0.784, 0.659, 1.0,  1.0); // #c8a8ff
uniform vec4 col_pink : source_color    = vec4(0.910, 0.722, 0.784, 1.0); // #e8b8c8

// ---- ユーティリティ ----
float hash11(float p) {
	return fract(sin(p * 127.1) * 43758.5453);
}

float hash21(vec2 p) {
	return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float smoothnoise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	f = f * f * (3.0 - 2.0 * f);
	float a = hash21(i);
	float b = hash21(i + vec2(1.0, 0.0));
	float c = hash21(i + vec2(0.0, 1.0));
	float d = hash21(i + vec2(1.0, 1.0));
	return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// ---- 星のまたたき ----
float stars(vec2 uv, float t) {
	vec2 grid = floor(uv * 28.0);
	vec2 cell = fract(uv * 28.0) - 0.5;
	float rnd = hash21(grid);
	float twinkle = sin(rnd * 100.0 + t * (2.0 + rnd * 3.0)) * 0.4 + 0.6;
	float size = 0.04 + rnd * 0.04;
	float star = smoothstep(size, 0.0, length(cell)) * twinkle;
	// 十字のきらめき
	float cross_h = smoothstep(size * 3.0, 0.0, abs(cell.y)) * smoothstep(size * 0.5, 0.0, abs(cell.x) - size) * twinkle;
	float cross_v = smoothstep(size * 3.0, 0.0, abs(cell.x)) * smoothstep(size * 0.5, 0.0, abs(cell.y) - size) * twinkle;
	return clamp(star + (cross_h + cross_v) * 0.3, 0.0, 1.0) * step(0.7, rnd);
}

// ---- オーロラ帯 ----
float aurora(vec2 uv, float t) {
	float n1 = smoothnoise(uv * vec2(4.0, 2.0) + vec2(t * 0.4, t * 0.1));
	float n2 = smoothnoise(uv * vec2(7.0, 3.0) - vec2(t * 0.2, t * 0.3));
	float wave = sin(uv.x * 5.0 + t * 0.8 + n1 * 3.0) * 0.5 + 0.5;
	wave += sin(uv.x * 9.0 - t * 0.5 + n2 * 2.0) * 0.25;
	wave = clamp(wave, 0.0, 1.0);
	// 画面上〜中部にだけ帯を出す
	float mask = smoothstep(0.85, 0.5, uv.y) * smoothstep(0.1, 0.35, uv.y);
	return wave * mask * (0.6 + n1 * 0.4);
}

void fragment() {
	vec2 uv = UV;
	float t = TIME * speed;

	// ベースカラー（縦グラデーション: より暗い下 → 少し明るい上）
	vec3 base = mix(col_base.rgb, col_base.rgb * 1.4, uv.y * 0.5);

	// オーロラ
	float au = aurora(uv, t);
	vec3 aurora_col = mix(col_purple.rgb, col_lavender.rgb, smoothnoise(uv * 3.0 + t * 0.15));
	base = mix(base, aurora_col, au * aurora_intensity);

	// ピンクのゆらぎ（下部・ほんのり）
	float pink_glow = smoothnoise(uv * vec2(2.0, 4.0) + vec2(t * 0.1, 0.0));
	base = mix(base, col_pink.rgb, pink_glow * 0.08 * smoothstep(0.6, 1.0, 1.0 - uv.y));

	// 星
	float s = stars(uv, TIME);
	base += vec3(s * 0.9, s * 0.85, s);

	COLOR = vec4(base, 1.0);
}
