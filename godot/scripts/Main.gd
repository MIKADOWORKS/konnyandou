extends Node2D

## こんにゃん堂 — カード演出デモ
##
## ノアがツキ（白猫）を呼び出し、カードをめくる一連の演出。
## パーティクルとシェーダーで女子ウケするキラキラ感を表現。
##
## 再生手順:
##   1. Godot 4.3+ でこのプロジェクトを開く
##   2. scenes/main.tscn を実行 (F5)
##   3. 「カードを引く」ボタンをタップ

# ===== ブランドカラー =================================================
const C_BG_DARK  := Color(0.039, 0.024, 0.125) # #0a0620
const C_BG       := Color(0.102, 0.102, 0.243) # #1A1A3E
const C_PURPLE   := Color(0.420, 0.298, 0.604) # #6B4C9A
const C_LAVENDER := Color(0.784, 0.659, 1.000) # #c8a8ff
const C_GOLD     := Color(0.941, 0.816, 0.376) # #f0d060
const C_PINK     := Color(0.910, 0.722, 0.784) # #e8b8c8
const C_WHITE    := Color(1.000, 1.000, 1.000)

# ===== 演出フェーズ ===================================================
enum Phase { IDLE, SUMMONING, CARD_APPEAR, FLIPPING, REVEALED }
var phase := Phase.IDLE

# ===== レイアウト定数 ================================================
var VP   : Vector2   # ビューポートサイズ（_ready で取得）
const CARD_SIZE := Vector2(220.0, 360.0)

# ===== ノード参照 =====================================================
var card_node      : Node2D
var card_back      : ColorRect
var card_front     : ColorRect
var tsuki_label    : Label
var noa_msg        : Label
var reveal_msg     : Label
var draw_btn       : Button
var burst_emitter  : GPUParticles2D
var heart_emitter  : GPUParticles2D
var ambient_emit   : GPUParticles2D
var shimmer_emit   : GPUParticles2D  # カード周りを漂うキラキラ

# ===== ライフサイクル ================================================

func _ready() -> void:
	VP = get_viewport().get_visible_rect().size
	_build_scene()

func _process(_delta: float) -> void:
	# 表示中のカードをゆっくり浮遊させる
	if phase == Phase.REVEALED and card_node:
		var t := Time.get_ticks_msec() * 0.001
		card_node.position.y = VP.y * 0.40 + sin(t * 1.8) * 7.0

	# ツキを小さくブリージングさせる
	if tsuki_label and tsuki_label.position.y < VP.y:
		var t := Time.get_ticks_msec() * 0.001
		tsuki_label.scale = Vector2.ONE * (1.0 + sin(t * 2.2) * 0.04)

# ===== シーン構築 =====================================================

func _build_scene() -> void:
	_add_aurora_background()
	_add_ambient_particles()
	_add_card()
	_add_tsuki()
	_add_shimmer_around_card()
	_add_burst_particles()
	_add_ui()

# ---- オーロラ背景 ----

func _add_aurora_background() -> void:
	var rect := ColorRect.new()
	rect.size    = VP
	rect.position = Vector2.ZERO
	rect.color   = C_BG_DARK

	var shader_path := "res://shaders/aurora_bg.gdshader"
	if ResourceLoader.exists(shader_path):
		var mat := ShaderMaterial.new()
		mat.shader = load(shader_path) as Shader
		rect.material = mat

	add_child(rect)

# ---- 常時アンビエントパーティクル（画面全体をキラキラ）----

func _add_ambient_particles() -> void:
	ambient_emit = GPUParticles2D.new()
	ambient_emit.position    = VP / 2.0
	ambient_emit.emitting    = true
	ambient_emit.amount      = 90
	ambient_emit.lifetime    = 5.0
	ambient_emit.explosiveness = 0.0
	ambient_emit.randomness  = 0.6
	ambient_emit.texture     = _glow_texture(10, C_LAVENDER)

	var mat := ParticleProcessMaterial.new()
	mat.emission_shape       = ParticleProcessMaterial.EMISSION_SHAPE_BOX
	mat.emission_box_extents = Vector3(VP.x * 0.5, VP.y * 0.5, 0.0)
	mat.direction            = Vector3(0.0, -1.0, 0.0)
	mat.spread               = 180.0
	mat.gravity              = Vector3(0.0, -12.0, 0.0)
	mat.initial_velocity_min = 8.0
	mat.initial_velocity_max = 35.0
	mat.angular_velocity_min = -60.0
	mat.angular_velocity_max = 60.0
	mat.scale_min            = 0.25
	mat.scale_max            = 1.1
	mat.color_ramp           = _color_ramp([C_LAVENDER, C_GOLD, C_PINK, Color(C_LAVENDER.r, C_LAVENDER.g, C_LAVENDER.b, 0.0)])
	ambient_emit.process_material = mat

	add_child(ambient_emit)

# ---- カード ----

func _add_card() -> void:
	card_node          = Node2D.new()
	card_node.position = Vector2(VP.x * 0.5, VP.y * 0.40)
	card_node.scale    = Vector2.ZERO  # 最初は非表示
	add_child(card_node)

	# 裏面
	card_back          = ColorRect.new()
	card_back.size     = CARD_SIZE
	card_back.position = -CARD_SIZE * 0.5
	card_back.color    = C_PURPLE
	_apply_card_shader(card_back,
		glow_color   = C_LAVENDER,
		shimmer_color = C_GOLD * 0.8,
		border_width  = 0.06)
	card_node.add_child(card_back)

	# 裏面デコ（✦ マーク）
	var back_deco := Label.new()
	back_deco.text = "✦"
	back_deco.add_theme_font_size_override("font_size", 72)
	back_deco.add_theme_color_override("font_color", Color(C_LAVENDER.r, C_LAVENDER.g, C_LAVENDER.b, 0.7))
	back_deco.position = Vector2(-30.0, -45.0)
	card_back.add_child(back_deco)

	# 表面（最初は非表示）
	card_front         = ColorRect.new()
	card_front.size    = CARD_SIZE
	card_front.position = -CARD_SIZE * 0.5
	card_front.color   = C_BG
	card_front.visible = false
	_apply_card_shader(card_front,
		glow_color    = C_GOLD,
		shimmer_color = C_LAVENDER,
		border_width  = 0.06)
	card_node.add_child(card_front)

	# 表面のカード内容
	var front_label := Label.new()
	front_label.text = "🌙\n\n愚 者"
	front_label.add_theme_font_size_override("font_size", 46)
	front_label.add_theme_color_override("font_color", C_GOLD)
	front_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	front_label.vertical_alignment   = VERTICAL_ALIGNMENT_CENTER
	front_label.size     = CARD_SIZE * 0.9
	front_label.position = -CARD_SIZE * 0.45
	card_front.add_child(front_label)

# ---- ツキ（白猫の使い魔）----

func _add_tsuki() -> void:
	tsuki_label = Label.new()
	tsuki_label.text = "🐱"
	tsuki_label.add_theme_font_size_override("font_size", 80)
	# 画面下の外に配置 → アニメーションで飛び出す
	tsuki_label.position = Vector2(VP.x * 0.5 - 44.0, VP.y + 120.0)
	add_child(tsuki_label)

# ---- カード周りのシマーエミッター ----

func _add_shimmer_around_card() -> void:
	shimmer_emit          = GPUParticles2D.new()
	shimmer_emit.position = Vector2(VP.x * 0.5, VP.y * 0.40)
	shimmer_emit.emitting = false
	shimmer_emit.amount   = 50
	shimmer_emit.lifetime = 2.5
	shimmer_emit.explosiveness = 0.0
	shimmer_emit.texture  = _star_texture(14)

	var mat := ParticleProcessMaterial.new()
	mat.emission_shape       = ParticleProcessMaterial.EMISSION_SHAPE_BOX
	mat.emission_box_extents = Vector3(CARD_SIZE.x * 0.55, CARD_SIZE.y * 0.55, 0.0)
	mat.direction            = Vector3(0.0, -1.0, 0.0)
	mat.spread               = 45.0
	mat.gravity              = Vector3(0.0, -8.0, 0.0)
	mat.initial_velocity_min = 5.0
	mat.initial_velocity_max = 25.0
	mat.angular_velocity_min = -90.0
	mat.angular_velocity_max = 90.0
	mat.scale_min            = 0.4
	mat.scale_max            = 1.5
	mat.color_ramp = _color_ramp([C_GOLD, C_LAVENDER, Color(C_GOLD.r, C_GOLD.g, C_GOLD.b, 0.0)])
	shimmer_emit.process_material = mat

	add_child(shimmer_emit)

# ---- バーストパーティクル（カード開示時）----

func _add_burst_particles() -> void:
	# 星バースト
	burst_emitter             = GPUParticles2D.new()
	burst_emitter.position    = Vector2(VP.x * 0.5, VP.y * 0.40)
	burst_emitter.emitting    = false
	burst_emitter.one_shot    = true
	burst_emitter.explosiveness = 1.0
	burst_emitter.amount      = 130
	burst_emitter.lifetime    = 2.8
	burst_emitter.texture     = _star_texture(16)

	var bm := ParticleProcessMaterial.new()
	bm.emission_shape       = ParticleProcessMaterial.EMISSION_SHAPE_SPHERE
	bm.emission_sphere_radius = 8.0
	bm.direction            = Vector3(0.0, -1.0, 0.0)
	bm.spread               = 180.0
	bm.gravity              = Vector3(0.0, 80.0, 0.0)
	bm.initial_velocity_min = 90.0
	bm.initial_velocity_max = 380.0
	bm.angular_velocity_min = -240.0
	bm.angular_velocity_max = 240.0
	bm.scale_min            = 0.4
	bm.scale_max            = 2.2
	bm.color_ramp = _color_ramp([C_GOLD, C_LAVENDER, C_PINK, Color(1.0, 1.0, 1.0, 0.0)])
	burst_emitter.process_material = bm
	add_child(burst_emitter)

	# ハート系ふわふわ粒子（上に舞い上がる）
	heart_emitter             = GPUParticles2D.new()
	heart_emitter.position    = Vector2(VP.x * 0.5, VP.y * 0.40)
	heart_emitter.emitting    = false
	heart_emitter.one_shot    = true
	heart_emitter.explosiveness = 0.85
	heart_emitter.amount      = 55
	heart_emitter.lifetime    = 3.5
	heart_emitter.texture     = _glow_texture(14, C_PINK)

	var hm := ParticleProcessMaterial.new()
	hm.emission_shape       = ParticleProcessMaterial.EMISSION_SHAPE_SPHERE
	hm.emission_sphere_radius = 70.0
	hm.direction            = Vector3(0.0, -1.0, 0.0)
	hm.spread               = 55.0
	hm.gravity              = Vector3(0.0, -18.0, 0.0)
	hm.initial_velocity_min = 60.0
	hm.initial_velocity_max = 190.0
	hm.angular_velocity_min = -120.0
	hm.angular_velocity_max = 120.0
	hm.scale_min            = 0.7
	hm.scale_max            = 2.8
	hm.color_ramp = _color_ramp([C_PINK, C_LAVENDER, Color(C_PINK.r, C_PINK.g, C_PINK.b, 0.0)])
	heart_emitter.process_material = hm
	add_child(heart_emitter)

# ---- UI ----

func _add_ui() -> void:
	var canvas := CanvasLayer.new()
	add_child(canvas)

	# ノアのセリフ（上部）
	noa_msg = Label.new()
	noa_msg.text = "じゃあ聞いてみるね…\nおいで、ツキ 🐾"
	noa_msg.size = Vector2(VP.x - 40.0, 90.0)
	noa_msg.position = Vector2(20.0, VP.y * 0.10)
	noa_msg.add_theme_font_size_override("font_size", 22)
	noa_msg.add_theme_color_override("font_color", C_WHITE)
	noa_msg.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	noa_msg.modulate.a = 0.0
	canvas.add_child(noa_msg)

	# 結果テキスト（下部）
	reveal_msg = Label.new()
	reveal_msg.text = "こんにゃん出ましたけど〜！ ✨"
	reveal_msg.size = Vector2(VP.x - 40.0, 70.0)
	reveal_msg.position = Vector2(20.0, VP.y * 0.76)
	reveal_msg.add_theme_font_size_override("font_size", 24)
	reveal_msg.add_theme_color_override("font_color", C_GOLD)
	reveal_msg.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	reveal_msg.modulate.a = 0.0
	canvas.add_child(reveal_msg)

	# ドローボタン
	draw_btn = Button.new()
	draw_btn.text = "✦  カードを引く  ✦"
	draw_btn.size = Vector2(260.0, 58.0)
	draw_btn.position = Vector2(VP.x * 0.5 - 130.0, VP.y * 0.84)
	draw_btn.add_theme_font_size_override("font_size", 19)
	draw_btn.add_theme_color_override("font_color", C_LAVENDER)
	draw_btn.pressed.connect(_on_draw_pressed)
	canvas.add_child(draw_btn)

# ===== 演出フロー =====================================================

func _on_draw_pressed() -> void:
	if phase != Phase.IDLE:
		return
	phase = Phase.SUMMONING
	draw_btn.visible = false
	_animate_summon()

func _animate_summon() -> void:
	var tw := create_tween().set_parallel(false)

	# 1. ノアのセリフをフェードイン
	tw.tween_property(noa_msg, "modulate:a", 1.0, 0.55)
	tw.tween_interval(0.75)

	# 2. ツキが画面下から飛び出す（バウンス）
	tw.tween_property(tsuki_label, "position:y",
		VP.y * 0.62, 0.55).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tw.tween_interval(0.25)

	# 3. ツキのぴょん動作
	tw.tween_property(tsuki_label, "scale", Vector2(1.15, 0.85), 0.08)
	tw.tween_property(tsuki_label, "scale", Vector2(0.85, 1.15), 0.08)
	tw.tween_property(tsuki_label, "scale", Vector2(1.00, 1.00), 0.12)
	tw.tween_interval(0.55)

	# 4. カードが現れる（弾性スケールイン）
	tw.tween_callback(func(): phase = Phase.CARD_APPEAR)
	tw.tween_property(card_node, "scale", Vector2(1.0, 1.0), 0.55) \
		.set_trans(Tween.TRANS_ELASTIC).set_ease(Tween.EASE_OUT)

	# 5. カード周りシマー開始
	tw.tween_callback(func(): shimmer_emit.emitting = true)
	tw.tween_interval(0.70)

	# 6. カードフリップ
	tw.tween_callback(_flip_card)

func _flip_card() -> void:
	phase = Phase.FLIPPING

	var tw := create_tween()
	tw.set_ease(Tween.EASE_IN_OUT)
	tw.set_trans(Tween.TRANS_CUBIC)

	# 前半: X方向に縮む（カードが薄くなる）
	tw.tween_property(card_node, "scale:x", 0.0, 0.28)
	# 表裏を切り替え
	tw.tween_callback(_switch_to_front)
	# 後半: X方向に広がる（表面が現れる）
	tw.tween_property(card_node, "scale:x", 1.0, 0.28)
	# 開示演出をトリガー
	tw.tween_callback(_trigger_reveal)

func _switch_to_front() -> void:
	card_back.visible  = false
	card_front.visible = true

func _trigger_reveal() -> void:
	phase = Phase.REVEALED

	# バースト発射
	burst_emitter.restart()
	burst_emitter.emitting = true
	heart_emitter.restart()
	heart_emitter.emitting = true

	# カードをぷるぷる揺らす
	var shake := create_tween()
	for _i in 4:
		shake.tween_property(card_node, "rotation_degrees",  3.5, 0.07)
		shake.tween_property(card_node, "rotation_degrees", -3.5, 0.07)
	shake.tween_property(card_node, "rotation_degrees", 0.0, 0.10)

	# 結果メッセージをフェードイン
	var msg_tw := create_tween()
	msg_tw.tween_interval(0.35)
	msg_tw.tween_property(reveal_msg, "modulate:a", 1.0, 0.65)

	# リセットボタンを表示
	msg_tw.tween_interval(1.8)
	msg_tw.tween_callback(_show_reset_button)

func _show_reset_button() -> void:
	draw_btn.text = "✦  もう一度引く  ✦"
	draw_btn.visible = true
	draw_btn.pressed.disconnect(_on_draw_pressed)
	draw_btn.pressed.connect(_reset)

func _reset() -> void:
	phase = Phase.IDLE

	# 各ノードを初期状態に戻す
	card_node.scale              = Vector2.ZERO
	card_node.rotation_degrees   = 0.0
	card_node.position           = Vector2(VP.x * 0.5, VP.y * 0.40)
	card_back.visible            = true
	card_front.visible           = false
	noa_msg.modulate.a           = 0.0
	reveal_msg.modulate.a        = 0.0
	tsuki_label.position         = Vector2(VP.x * 0.5 - 44.0, VP.y + 120.0)
	tsuki_label.scale            = Vector2.ONE
	shimmer_emit.emitting        = false

	draw_btn.text = "✦  カードを引く  ✦"
	draw_btn.pressed.disconnect(_reset)
	draw_btn.pressed.connect(_on_draw_pressed)

# ===== シェーダーユーティリティ =======================================

func _apply_card_shader(
	rect: ColorRect,
	glow_color: Color,
	shimmer_color: Color,
	border_width: float
) -> void:
	var shader_path := "res://shaders/card_glow.gdshader"
	if not ResourceLoader.exists(shader_path):
		return
	var mat := ShaderMaterial.new()
	mat.shader = load(shader_path) as Shader
	mat.set_shader_parameter("base_color",     rect.color)
	mat.set_shader_parameter("glow_color",     glow_color)
	mat.set_shader_parameter("shimmer_color",  shimmer_color)
	mat.set_shader_parameter("border_width",   border_width)
	rect.material = mat

# ===== テクスチャ生成ユーティリティ ===================================

## 円形グローテクスチャ（アンビエント粒子・ハート粒子に使用）
func _glow_texture(size: int, color: Color) -> ImageTexture:
	var img    := Image.create(size, size, false, Image.FORMAT_RGBA8)
	var center := Vector2(size * 0.5, size * 0.5)
	for x in size:
		for y in size:
			var d     := Vector2(x, y).distance_to(center)
			var alpha := clampf(1.0 - d / (size * 0.5), 0.0, 1.0)
			alpha      = pow(alpha, 1.6)  # 中心ほど明るく
			img.set_pixel(x, y, Color(color.r, color.g, color.b, alpha))
	return ImageTexture.create_from_image(img)

## 4角星テクスチャ（バースト・シマー粒子に使用）
func _star_texture(size: int) -> ImageTexture:
	var img := Image.create(size, size, false, Image.FORMAT_RGBA8)
	var cx  := size * 0.5
	var cy  := size * 0.5
	for x in size:
		for y in size:
			var dx  := float(x) - cx
			var dy  := float(y) - cy
			# 4角星 = 2つの菱形の合成
			var r1  := 1.0 - (absf(dx) + absf(dy)) / (size * 0.52)
			var r2  := 1.0 - (absf(dx + dy) + absf(dx - dy)) / (size * 0.72)
			var v   := clampf(maxf(r1, r2 * 0.5) * 2.2, 0.0, 1.0)
			img.set_pixel(x, y, Color(1.0, 1.0, 1.0, v))
	return ImageTexture.create_from_image(img)

## グラデーションランプテクスチャ（パーティクルの色変化に使用）
func _color_ramp(colors: Array) -> GradientTexture1D:
	var n       := colors.size()
	var offsets := PackedFloat32Array()
	for i in n:
		offsets.append(float(i) / float(n - 1))

	var grad         := Gradient.new()
	grad.colors      = PackedColorArray(colors)
	grad.offsets     = offsets

	var tex          := GradientTexture1D.new()
	tex.gradient     = grad
	tex.width        = 128
	return tex
