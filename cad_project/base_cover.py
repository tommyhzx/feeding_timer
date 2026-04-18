"""
底座罩壳 - build123d
长120mm x 宽45mm x 高80mm 的五面盒子，壁厚2mm
底部开口（无底板），直接罩在底座上
正面开孔：75mm x 32mm，用于屏幕显示区域
"""

from build123d import *
from ocp_vscode import show

# ========== 罩壳参数 ==========
COVER_LENGTH = 120.0  # mm，长度（X方向），与底座一致
COVER_WIDTH = 45.0    # mm，宽度（Y方向），与底座一致
COVER_HEIGHT = 60.0   # mm，高度（Z方向）
WALL_THICKNESS = 2.0  # mm，壁厚
FILLET_RADIUS = 2.0   # mm，顶部边缘圆角半径
VERTICAL_FILLET_RADIUS = 5.0   # mm，竖直边缘圆角半径

# ========== 正面开口参数 ==========
FRONT_OPENING_LENGTH = 75.0   # mm，开口长度（X方向）
FRONT_OPENING_HEIGHT = 32.0   # mm，开口高度（Z方向）

# ========== 顶部按键开口参数（机械键盘1u尺寸） ==========
KEY_SIZE = 18.0               # mm，按键尺寸（X和Y方向），标准1u约18mm
KEY_X_OFFSET = -25.0          # mm，按键中心X偏移（负方向为右），中间靠右

print(f"底座罩壳设计")
print(f"外部尺寸: {COVER_LENGTH} x {COVER_WIDTH} x {COVER_HEIGHT} mm")
print(f"壁厚: {WALL_THICKNESS} mm")
print(f"正面开口: {FRONT_OPENING_LENGTH} x {FRONT_OPENING_HEIGHT} mm")
print(f"顶部按键: {KEY_SIZE} x {KEY_SIZE} mm, X偏移 {KEY_X_OFFSET}mm")

# ========== 1. 创建外框盒子 ==========
with BuildPart() as outer:
    Box(COVER_LENGTH, COVER_WIDTH, COVER_HEIGHT)
outer_solid = outer.part.solid()
print(f"已创建外框")

# ========== 2. 创建内腔（用于掏空，底部开口） ==========
inner_length = COVER_LENGTH - 2 * WALL_THICKNESS
inner_width = COVER_WIDTH - 2 * WALL_THICKNESS
# 内腔高度 = 外框高度 - 顶部壁厚，使顶部封口，底部开口
inner_height = COVER_HEIGHT - WALL_THICKNESS

with BuildPart() as inner_builder:
    Box(inner_length, inner_width, inner_height)
inner_box = inner_builder.part.solid()

# 内腔位置调整：使底部完全开口，顶部封口
# 外框：底部 Z = -COVER_HEIGHT/2 = -40mm，顶部 Z = 40mm
# 内腔（默认中心在原点）：底部 Z = -inner_height/2 = -39mm，顶部 Z = 39mm
# 需要将内腔向下偏移 1mm，使底部与外框底部对齐
inner_box = inner_box.translate(Vector(0, 0, -WALL_THICKNESS / 2))

# X和Y方向已经对齐，因为：
# - inner_length = COVER_LENGTH - 2*WALL_THICKNESS（X方向居中，壁厚自动正确）
# - inner_width = COVER_WIDTH - 2*WALL_THICKNESS（Y方向居中，壁厚自动正确）

# 外框减内腔，形成五面盒子（底部开口）
cover = outer_solid - inner_box
print(f"已创建内腔并掏空（底部开口）")

# ========== 3. 正面开口 ==========
# 创建正面开口切割体
# 开口深度：穿透正面壁厚
opening_depth = WALL_THICKNESS + 1  # 略大于壁厚，确保穿透

with BuildPart() as opening_builder:
    Box(FRONT_OPENING_LENGTH, opening_depth, FRONT_OPENING_HEIGHT)
opening_box = opening_builder.part.solid()

# 计算开口位置
# X方向：居中
opening_x = 0

# Y方向：从正面内表面开始，向外穿透
# 正面内表面在 Y = inner_width/2 = 20.5mm
# 开口Box默认Y范围是 [-depth/2, depth/2]
# 需要使开口的背面（-Y侧）与内腔正面平齐
opening_back_y = inner_width / 2  # 20.5mm
opening_y = opening_back_y + opening_depth / 2

# Z方向：居中于罩壳，略向上偏移以更好显示
opening_z = 0  # 向上偏移5mm，使开口中心位于 Z=5mm

opening_box = opening_box.translate(Vector(opening_x, opening_y, opening_z))

# 在罩壳上开孔
cover = cover - opening_box
print(f"已在正面开孔: {FRONT_OPENING_LENGTH} x {FRONT_OPENING_HEIGHT} mm")
print(f"  开口位置: X居中, Y={opening_y}mm, Z={opening_z}mm")

# ========== 3.5 顶部按键开口 ==========
# 创建顶部按键开口切割体（机械键盘1u尺寸）
key_depth = WALL_THICKNESS + 1  # 穿透顶面壁厚

with BuildPart() as key_builder:
    Box(KEY_SIZE, KEY_SIZE, key_depth)
key_box = key_builder.part.solid()

# 计算按键开口位置
# X方向：中间靠右（负方向）
key_x = KEY_X_OFFSET

# Y方向：居中
key_y = 0

# Z方向：从顶面内表面开始，向上穿透
# 顶面内表面在 Z = inner_height/2 - WALL_THICKNESS + WALL_THICKNESS/2 = 38mm
# 外框顶面在 Z = COVER_HEIGHT/2 = 40mm
# 按键Box默认Z范围是 [-depth/2, depth/2]
# 需要使按键的底面与顶面内表面对齐，向上穿透
key_bottom_z = (inner_height - WALL_THICKNESS) / 2  # 约38mm
key_z = key_bottom_z + key_depth / 2

key_box = key_box.translate(Vector(key_x, key_y, key_z))

# 在罩壳上开孔
cover = cover - key_box
print(f"已在顶面开按键孔: {KEY_SIZE} x {KEY_SIZE} mm")
print(f"  开口位置: X={key_x}mm, Y居中, Z={key_z:.1f}mm")

# ========== 4. 竖直边缘导角（沿着Z方向） ==========
# 对外角和内角的竖直边缘分别进行圆角处理
vertical_edges = []  # 外角竖直边缘
inner_vertical_edges = []  # 内角竖直边缘

for e in cover.edges():
    # 判断边缘是否是竖直的（沿着Z轴方向）
    edge_dir = (e.end_point() - e.start_point()).normalized()
    if abs(edge_dir.Z) > 0.9:  # Z分量接近1，说明是竖直边缘
        # 使用边缘中点来判断位置
        pos = e.position_at(0.5)
        # 外角竖直边缘的特征：X和Y坐标都应该非常接近外表面的极限值
        # 检查是否接近X方向的外表面
        is_at_x_edge = abs(pos.X) > (COVER_LENGTH - WALL_THICKNESS) / 2 - 1
        # 检查是否接近Y方向的外表面
        is_at_y_edge = abs(pos.Y) > (COVER_WIDTH - WALL_THICKNESS) / 2 - 1
        # 同时满足才是外角竖直边缘
        if is_at_x_edge and is_at_y_edge:
            vertical_edges.append(e)

        # 内角竖直边缘的特征：X和Y坐标接近内表面的极限值
        # 内表面位置 = 内腔尺寸的一半
        inner_x_limit = inner_length / 2 - 1
        inner_y_limit = inner_width / 2 - 1
        is_at_inner_x_edge = abs(pos.X) > inner_x_limit
        is_at_inner_y_edge = abs(pos.Y) > inner_y_limit
        # 同时满足才是内角竖直边缘
        if is_at_inner_x_edge and is_at_inner_y_edge:
            inner_vertical_edges.append(e)

print(f"外角竖直边缘数量: {len(vertical_edges)}")
print(f"内角竖直边缘数量: {len(inner_vertical_edges)}")

# 先处理外角竖直边缘
if vertical_edges:
    try:
        cover = cover.fillet(VERTICAL_FILLET_RADIUS, vertical_edges)
        print(f"外角竖直边缘倒角完成: {len(vertical_edges)} 条")
    except Exception as e:
        print(f"外角竖直边缘倒角失败: {e}")

# 再处理内角竖直边缘
if inner_vertical_edges:
    try:
        cover = cover.fillet(VERTICAL_FILLET_RADIUS, inner_vertical_edges)
        print(f"内角竖直边缘倒角完成: {len(inner_vertical_edges)} 条")
    except Exception as e:
        print(f"内角竖直边缘倒角失败: {e}")

# ========== 5. 顶部边缘导角 ==========
all_edges = cover.edges()

# 选择需要倒角的边缘：仅选择顶部的四个外角边缘
fillet_edges = []
for e in cover.edges():
    # 获取边缘上多个点来检查
    is_top_edge = True
    for t in [0, 0.5, 1.0]:
        pos = e.position_at(t)
        # 检查Z坐标是否在顶部
        if abs(pos.Z - COVER_HEIGHT / 2) > 1:
            is_top_edge = False
            break
    if is_top_edge:
        # 检查X和Y是否靠近外边缘（四个角）
        pos = e.position_at(0.5)
        if (abs(pos.X) > COVER_LENGTH / 2 - 5 and   # 靠近X方向边缘
            abs(pos.Y) > COVER_WIDTH / 2 - 5):      # 靠近Y方向边缘
            fillet_edges.append(e)

print(f"顶部外角边缘数量: {len(fillet_edges)}")
if fillet_edges:
    try:
        # 使用较小的倒角半径尝试
        cover = cover.fillet(FILLET_RADIUS, fillet_edges)
        print(f"顶部边缘倒角完成: {len(fillet_edges)} 条")
    except Exception as e:
        print(f"顶部边缘倒角失败（尝试较小半径）: {e}")
        # 尝试使用更小的倒角半径
        try:
            cover = cover.fillet(FILLET_RADIUS / 2, fillet_edges)
            print(f"顶部边缘倒角完成（半径={FILLET_RADIUS/2}mm）: {len(fillet_edges)} 条")
        except Exception as e2:
            print(f"顶部边缘倒角最终失败: {e2}")

# ========== 6. 正面开口边缘导角（可选） ==========
# 正面开口的边缘倒角比较复杂，暂时跳过
# 如果需要更平滑的边缘，可以后续手动处理

print(f"\n底座罩壳完成！")
print(f"罩壳模型: {cover}")

# ========== 导出模型供其他模块使用 ==========
base_cover_model = cover


def get_base_cover():
    """返回底座罩壳模型副本"""
    return base_cover_model


if __name__ == "__main__":
    # 仅在直接运行时显示
    show(cover)
