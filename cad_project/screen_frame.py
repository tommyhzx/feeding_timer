"""
屏幕外壳 - build123d
用于固定 75mm x 32mm 的屏幕，四个角有 3mm 固定孔
带底板的盒子设计，底板厚度 2mm，带台阶型固定柱
"""

from build123d import *
from ocp_vscode import show
from elements.mounting_holes import create_stepped_cylinder

# ========== 屏幕参数 ==========
SCREEN_LENGTH = 75.0    # mm，屏幕长度
SCREEN_WIDTH = 32.0     # mm，屏幕宽度
SCREEN_HOLE_DIA = 3.0   # mm，固定孔直径
SCREEN_HOLE_OFFSET = 3.0  # mm，孔距边缘距离

# ========== 外壳参数 ==========
BOTTOM_THICKNESS = 2.0  # mm，底板厚度
TOTAL_HEIGHT = 13.0     # mm，总高度
WALL_THICKNESS = 2.0    # mm，壁厚
FILLET_RADIUS = 2.0     # mm，外框圆角半径
INNER_FILLET = 2.0      # mm，内腔圆角半径

# ========== 台阶型固定柱参数 ==========
STEP1_DIAMETER = 4.0    # 底层直径
STEP1_HEIGHT = 1.0      # 底层高度
STEP2_DIAMETER = 2.8    # 上层直径
STEP2_HEIGHT = 3.0      # 上层高度

# ========== 计算尺寸 ==========
FRAME_LENGTH = SCREEN_LENGTH + 2 * WALL_THICKNESS   # 79mm
FRAME_WIDTH = SCREEN_WIDTH + 2 * WALL_THICKNESS     # 36mm

# 计算固定柱位置（相对于中心）
hole_x = SCREEN_LENGTH / 2 - SCREEN_HOLE_OFFSET   # 34.5mm
hole_y = SCREEN_WIDTH / 2 - SCREEN_HOLE_OFFSET    # 13mm

print(f"屏幕外壳设计")
print(f"屏幕尺寸: {SCREEN_LENGTH} x {SCREEN_WIDTH} mm")
print(f"外框尺寸: {FRAME_LENGTH} x {FRAME_WIDTH} mm")
print(f"总高度: {TOTAL_HEIGHT} mm")
print(f"底板厚度: {BOTTOM_THICKNESS} mm")
print(f"壁厚: {WALL_THICKNESS} mm")
print(f"固定柱位置: (±{hole_x}, ±{hole_y}) mm")

# ========== 1. 创建外框盒子 ==========
with BuildPart() as outer:
    Box(FRAME_LENGTH, FRAME_WIDTH, TOTAL_HEIGHT)
outer_solid = outer.part.solid()
print(f"已创建外框: {FRAME_LENGTH} x {FRAME_WIDTH} x {TOTAL_HEIGHT} mm")

# ========== 2. 创建内腔（向上偏移，保留底板） ==========
inner_length = SCREEN_LENGTH
inner_width = SCREEN_WIDTH
inner_height = TOTAL_HEIGHT - BOTTOM_THICKNESS

with BuildPart() as inner_builder:
    Box(inner_length, inner_width, inner_height)
inner_box = inner_builder.part.solid()

# 计算内腔偏移量：底部应该在外壳底部以上 BOTTOM_THICKNESS 的位置
# 外壳底部在 Z=-TOTAL_HEIGHT/2，内腔底部应该在 Z=-TOTAL_HEIGHT/2 + BOTTOM_THICKNESS
# inner_box 默认中心在原点，底部在 Z=-inner_height/2
inner_box_bottom = -inner_height / 2
cavity_bottom = -TOTAL_HEIGHT / 2 + BOTTOM_THICKNESS
offset_z = cavity_bottom - inner_box_bottom

inner_box = inner_box.translate(Vector(0, 0, offset_z))

# 外框减内腔，形成带底板的盒子
frame = outer_solid - inner_box
print(f"已创建内腔: {inner_length} x {inner_width} x {inner_height} mm")

# ========== 3. 添加台阶型固定柱 ==========
# 固定柱底座在底板上表面（Z = -TOTAL_HEIGHT/2 + BOTTOM_THICKNESS）
cavity_top_z = -TOTAL_HEIGHT / 2 + BOTTOM_THICKNESS
cylinder_z_offset = cavity_top_z

hole_positions = [
    (-hole_x, -hole_y),  # 左下
    (hole_x, -hole_y),   # 右下
    (-hole_x, hole_y),   # 左上
    (hole_x, hole_y),    # 右上
]

for i, (x, y) in enumerate(hole_positions, 1):
    cylinder = create_stepped_cylinder(
        x, y,
        z_offset=cylinder_z_offset,
        step1_dia=STEP1_DIAMETER,
        step1_height=STEP1_HEIGHT,
        step2_dia=STEP2_DIAMETER,
        step2_height=STEP2_HEIGHT
    )
    result = frame.fuse(cylinder)
    # 处理 fuse 返回结果
    if isinstance(result, list) and len(result) > 1:
        frame = result[0]
        for obj in result[1:]:
            frame = frame.fuse(obj)
            if isinstance(frame, list):
                frame = frame[0]
    elif isinstance(result, list):
        frame = result[0]
    else:
        frame = result
    print(f"已添加第 {i} 个台阶型固定柱: 位置({x}, {y})")

# ========== 4. 外角垂直边缘导角 ==========
FILLET_RADIUS_CORNER = 2.0
all_edges = frame.edges()
corner_edges = [
    e for e in all_edges
    if abs(e.position_at(0).X) > FRAME_LENGTH / 2 - 1
    and abs(e.position_at(0).Y) > FRAME_WIDTH / 2 - 1
    and abs(e.position_at(0).Z - e.position_at(1).Z) > 1  # 垂直边缘
]
print(f"外角垂直边缘数量: {len(corner_edges)}")
if corner_edges:
    try:
        frame = frame.fillet(FILLET_RADIUS_CORNER, corner_edges)
        print(f"外角垂直边缘倒角完成: {len(corner_edges)} 条")
    except Exception as e:
        print(f"外角垂直边缘倒角失败: {e}")

# ========== 5. 内腔底部边缘导角 ==========
# 内腔底部四角（Z = cavity_top_z）
inner_cavity_z = cavity_top_z
inner_corner_edges = [
    e for e in frame.edges()
    if abs(e.position_at(0).Z - inner_cavity_z) < 0.1
    and abs(e.position_at(1).Z - inner_cavity_z) < 0.1
    and abs(e.position_at(0).X) < SCREEN_LENGTH / 2
    and abs(e.position_at(0).Y) < SCREEN_WIDTH / 2
]
print(f"内腔底部边缘数量: {len(inner_corner_edges)}")
if inner_corner_edges:
    try:
        frame = frame.fillet(INNER_FILLET, inner_corner_edges)
        print(f"内腔底部边缘倒角完成: {len(inner_corner_edges)} 条")
    except Exception as e:
        print(f"内腔底部边缘倒角失败: {e}")

# ========== 6. 顶部外边缘倒角 ==========
top_z = TOTAL_HEIGHT / 2
top_edges = [
    e for e in frame.edges()
    if abs(e.position_at(0).Z - top_z) < 0.1
    and abs(e.position_at(1).Z - top_z) < 0.1
    and abs(e.position_at(0).X) > FRAME_LENGTH / 2 - 2
    and abs(e.position_at(0).Y) > FRAME_WIDTH / 2 - 2
]
if top_edges:
    try:
        frame = frame.fillet(0.5, top_edges)
        print(f"顶部外边缘倒角完成: {len(top_edges)} 条")
    except Exception as e:
        print(f"顶部外边缘倒角失败: {e}")

# ========== 7. 底部外边缘倒角 ==========
bottom_z = -TOTAL_HEIGHT / 2
bottom_edges = [
    e for e in frame.edges()
    if abs(e.position_at(0).Z - bottom_z) < 0.1
    and abs(e.position_at(1).Z - bottom_z) < 0.1
    and abs(e.position_at(0).X) > FRAME_LENGTH / 2 - 2
]
if bottom_edges:
    try:
        frame = frame.fillet(0.5, bottom_edges)
        print(f"底部外边缘倒角完成: {len(bottom_edges)} 条")
    except Exception as e:
        print(f"底部外边缘倒角失败: {e}")

print(f"\n屏幕外壳完成！")
print(f"外壳模型: {frame}")

# ========== 8. X方向右侧侧面开走线槽 ==========
# 槽尺寸
SLOT_LENGTH = 15.0   # mm，槽长度（Y方向，沿侧面）
SLOT_WIDTH = 3.0     # mm，槽宽度（X方向，穿透侧壁）
SLOT_HEIGHT = 5.0    # mm，槽高度（Z方向）

# 槽位置：
# X: 从内表面(37.5mm)穿透到外侧（37.5+3=40.5mm）
# Y: 居中（沿侧面）
# Z: 在底部，距离底面2mm，与底板厚度一致（Z从-4.5到0.5）
with BuildPart() as slot_builder:
    Box(SLOT_WIDTH, SLOT_LENGTH, SLOT_HEIGHT,
        align=(Align.MIN, Align.CENTER, Align.MIN))
slot_box = slot_builder.part.solid()

# 移动槽到正确位置
# align=(MIN, CENTER, MIN)后，box范围是：
# X: [0, 3], Y: [-7.5, 7.5], Z: [0, 5]
# 需要移动到：X从内表面37.5开始，Y居中，Z在底板内表面
slot_box = slot_box.translate(
    Vector(SCREEN_LENGTH / 2, 0, -TOTAL_HEIGHT / 2 + BOTTOM_THICKNESS))

frame = frame - slot_box
print(f"已开走线槽: {SLOT_LENGTH} x {SLOT_WIDTH} x {SLOT_HEIGHT} mm，位置在X方向右侧侧面")


# ========== 导出模型供其他模块使用 ==========
screen_frame_model = frame


def get_screen_frame():
    """返回屏幕外壳模型副本"""
    return screen_frame_model


if __name__ == "__main__":
    # 仅在直接运行时显示
    show(frame)
