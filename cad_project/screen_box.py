"""
屏幕盒子 - build123d
专门用于固定 75mm x 32mm 的屏幕盒子
带底板的盒子设计，底板厚度 2mm，带4个台阶型固定柱，侧面有走线孔
"""

from build123d import *
from ocp_vscode import show
from elements.mounting_holes import create_stepped_cylinder

# ========== 屏幕参数 ==========
SCREEN_LENGTH = 66.0    # mm，屏幕长度
SCREEN_WIDTH = 33.0     # mm，屏幕宽度

# ========== 盒子参数 ==========
BOX_DEPTH = 15.0        # mm，盒子深度（Z方向）
WALL_THICKNESS = 2.0    # mm，壁厚
BOTTOM_THICKNESS = 2.0  # mm，底板厚度

# ========== 外部尺寸 ==========
OUTER_LENGTH = SCREEN_LENGTH + 2 * WALL_THICKNESS  # 79mm
OUTER_WIDTH = SCREEN_WIDTH + 2 * WALL_THICKNESS    # 36mm

# ========== 内腔尺寸（用于掏空） ==========
INNER_LENGTH = SCREEN_LENGTH  # 75mm
INNER_WIDTH = SCREEN_WIDTH    # 32mm
INNER_DEPTH = BOX_DEPTH - BOTTOM_THICKNESS  # 13mm

# ========== 台阶型固定柱参数 ==========
STEP1_DIAMETER = 4.0    # 底层直径
STEP1_HEIGHT = 1.0      # 底层高度
STEP2_DIAMETER = 2.8    # 上层直径
STEP2_HEIGHT = 3.0      # 上层高度
SCREEN_HOLE_OFFSET = 3.0  # mm，孔距槽边缘距离

# ========== 走线孔参数 ==========
CABLE_HOLE_LENGTH = 15.0   # mm，Y方向长度
CABLE_HOLE_WIDTH = 5.0     # mm，Z方向宽度
CABLE_HOLE_DEPTH = WALL_THICKNESS + 0.5  # 2.5mm，穿透槽壁

# ========== 导角参数 ==========
FILLET_RADIUS = 2.0  # mm，外框圆角半径

# ========== 立柱固定螺丝孔参数 ==========
STRUT_MOUNT_HOLE_DIA = 2.5  # mm，M2螺丝通孔
STRUT_MOUNT_HOLE_DEPTH = WALL_THICKNESS + 1  # 3mm，穿透壁厚并稍深
STRUT_MOUNT_HOLE_X = 19.5  # mm，X方向位置（与立柱对齐）

print(f"屏幕盒子设计")
print(f"屏幕尺寸: {SCREEN_LENGTH} x {SCREEN_WIDTH} mm")
print(f"外部尺寸: {OUTER_LENGTH} x {OUTER_WIDTH} x {BOX_DEPTH} mm")
print(f"内腔尺寸: {INNER_LENGTH} x {INNER_WIDTH} x {INNER_DEPTH} mm")
print(f"壁厚: {WALL_THICKNESS} mm")
print(f"底板厚度: {BOTTOM_THICKNESS} mm")

# ========== 1. 创建外框盒子 ==========
with BuildPart() as outer:
    Box(OUTER_LENGTH, OUTER_WIDTH, BOX_DEPTH)
outer_solid = outer.part.solid()
print(f"已创建外框: {OUTER_LENGTH} x {OUTER_WIDTH} x {BOX_DEPTH} mm")

# ========== 2. 创建内腔（向上偏移，保留底板） ==========
with BuildPart() as inner_builder:
    Box(INNER_LENGTH, INNER_WIDTH, INNER_DEPTH)
inner_box = inner_builder.part.solid()

# 计算内腔偏移量：底部应该在外壳底部以上 BOTTOM_THICKNESS 的位置
# 外壳底部在 Z=-BOX_DEPTH/2，内腔底部应该在 Z=-BOX_DEPTH/2 + BOTTOM_THICKNESS
# inner_box 默认中心在原点，底部在 Z=-INNER_DEPTH/2
inner_box_bottom = -INNER_DEPTH / 2
cavity_bottom = -BOX_DEPTH / 2 + BOTTOM_THICKNESS
offset_z = cavity_bottom - inner_box_bottom

inner_box = inner_box.translate(Vector(0, 0, offset_z))

# 外框减内腔，形成带底板的盒子
screen_box = outer_solid - inner_box
print(f"已创建内腔并掏空")

# ========== 3. 添加台阶型固定柱 ==========
# 计算固定柱位置（相对于内腔中心）
hole_x = INNER_LENGTH / 2 - SCREEN_HOLE_OFFSET  # 34.5mm
hole_y = INNER_WIDTH / 2 - SCREEN_HOLE_OFFSET   # 13mm

# 固定柱的Z位置：在底板上表面
cavity_top_z = -BOX_DEPTH / 2 + BOTTOM_THICKNESS + \
    (STEP1_HEIGHT + STEP2_HEIGHT)/2

# 四个固定柱位置
cylinder_positions = [
    (-hole_x, -hole_y),  # 左下
    (hole_x, -hole_y),   # 右下
    (-hole_x, hole_y),   # 左上
    (hole_x, hole_y),    # 右上
]

for i, (x, y) in enumerate(cylinder_positions, 1):
    # 创建台阶圆柱
    stepped_cylinder = create_stepped_cylinder(
        x, y,
        z_offset=cavity_top_z,
        step1_dia=STEP1_DIAMETER,
        step1_height=STEP1_HEIGHT,
        step2_dia=STEP2_DIAMETER,
        step2_height=STEP2_HEIGHT
    )

    # 将固定柱合并到外壳上
    result = screen_box.fuse(stepped_cylinder)
    if isinstance(result, list) and len(result) > 0:
        screen_box = result[0]
        for obj in result[1:]:
            screen_box = screen_box.fuse(obj)
            if isinstance(screen_box, list):
                screen_box = screen_box[0]
    elif isinstance(result, list):
        screen_box = result[0]
    else:
        screen_box = result

    print(f"已添加第 {i} 个台阶型固定柱: 位置({x}, {y})")

print(f"已添加4个屏幕固定台阶圆柱")

# ========== 4. 左侧壁开走线孔 ==========
# 创建孔切割体
with BuildPart() as cable_hole_builder:
    Box(CABLE_HOLE_DEPTH, CABLE_HOLE_LENGTH, CABLE_HOLE_WIDTH)
cable_hole = cable_hole_builder.part.solid()

# 计算孔的位置
# 相对于盒子中心：
# X方向：从内表面开始，向外穿透槽壁（-X方向）
cable_hole_x_start = -INNER_LENGTH / 2  # -37.5mm
cable_hole_x_offset = cable_hole_x_start - CABLE_HOLE_DEPTH / 2

# Y方向：居中于侧壁
cable_hole_y_center = 0

# Z方向：在底板上方5mm的位置
cable_hole_z_offset = -BOX_DEPTH / 2 + CABLE_HOLE_WIDTH / 2 + 5

cable_hole = cable_hole.translate(
    Vector(cable_hole_x_offset, cable_hole_y_center, cable_hole_z_offset))

# 在盒子上开孔
screen_box = screen_box - cable_hole
print(f"已在左侧壁开走线孔: {CABLE_HOLE_LENGTH} x {CABLE_HOLE_WIDTH} mm")

# ========== 5. 背面开立柱固定螺丝孔 ==========
# 在屏幕盒背面（-Z方向）开两个螺丝孔，用于固定立柱
for hole_x in [-STRUT_MOUNT_HOLE_X, STRUT_MOUNT_HOLE_X]:
    with BuildPart() as hole_builder:
        Cylinder(STRUT_MOUNT_HOLE_DIA / 2, STRUT_MOUNT_HOLE_DEPTH,
                 align=(Align.CENTER, Align.CENTER, Align.MIN))
    hole = hole_builder.part.solid()

    # 定位孔：在背面（-Z方向），XY平面指定位置
    # 盒子背面在 Z = -BOX_DEPTH/2 = -7.5mm
    # 孔从背面向内开，中心应该在背面稍内位置
    hole_z_pos = -BOX_DEPTH / 2 - STRUT_MOUNT_HOLE_DEPTH / 2 + 0.5
    hole_pos = Vector(hole_x, 0, hole_z_pos)
    hole = hole.translate(hole_pos)

    # 开孔
    screen_box = screen_box - hole
    print(f"  已在背面开立柱固定孔: X={hole_x}mm, Z={hole_z_pos}mm")

print(f"已背面开2个立柱固定螺丝孔（M2）")

# ========== 6. 外角边缘导角 ==========
all_edges = screen_box.edges()

# 选择需要倒角的边缘：外角垂直边缘
fillet_edges = [
    e for e in all_edges
    if (abs(e.position_at(0).X) > OUTER_LENGTH / 2 - 1 and
        abs(e.position_at(0).Y) > OUTER_WIDTH / 2 - 1 and
        abs(e.position_at(0).Z - e.position_at(1).Z) > 1)  # 垂直边缘
]

print(f"外角边缘数量: {len(fillet_edges)}")
if fillet_edges:
    try:
        screen_box = screen_box.fillet(FILLET_RADIUS, fillet_edges)
        print(f"外角边缘倒角完成: {len(fillet_edges)} 条")
    except Exception as e:
        print(f"外角边缘倒角失败: {e}")

print(f"\n屏幕盒子完成！")
print(f"盒子模型: {screen_box}")

# ========== 导出模型供其他模块使用 ==========
screen_box_model = screen_box

# 导出参数别名供其他模块使用
SCREEN_BOX_LENGTH = OUTER_LENGTH  # 79.0 mm
SCREEN_BOX_WIDTH = OUTER_WIDTH    # 36.0 mm
SCREEN_BOX_DEPTH = BOX_DEPTH      # 15.0 mm


def get_screen_box():
    """返回屏幕盒子模型副本"""
    return screen_box_model


if __name__ == "__main__":
    # 仅在直接运行时显示
    show(screen_box)
