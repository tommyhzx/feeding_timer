"""
PCB盒子 - build123d
专门用于固定 115mm x 32mm 的PCB板
带底板的盒子设计，底板厚度 2mm，带4个台阶型固定柱，底板有开孔
Y方向深度10mm，PCB从Y方向插入
"""

from build123d import *
from ocp_vscode import show
from elements.mounting_holes import create_stepped_cylinder

# ========== PCB参数 ==========
PCB_LENGTH = 115.0   # mm，PCB长度（X方向）
PCB_WIDTH = 32.0     # mm，PCB宽度（Z方向）

# ========== 盒子参数 ==========
BOX_DEPTH = 10.0     # mm，盒子深度（Y方向）
WALL_THICKNESS = 2.0 # mm，壁厚
BOTTOM_THICKNESS = 2.0  # mm，底板厚度

# ========== 外部尺寸 ==========
OUTER_LENGTH = PCB_LENGTH + 2 * WALL_THICKNESS  # 119mm
OUTER_WIDTH = PCB_WIDTH + 2 * WALL_THICKNESS    # 36mm

# ========== 内腔尺寸（用于掏空） ==========
INNER_LENGTH = PCB_LENGTH  # 115mm
INNER_WIDTH = PCB_WIDTH    # 32mm
INNER_DEPTH = BOX_DEPTH - BOTTOM_THICKNESS  # 8mm

# ========== 台阶型固定柱参数 ==========
STEP1_DIAMETER = 4.0    # 底层直径
STEP1_HEIGHT = 2.0      # 底层高度
STEP2_DIAMETER = 2.8    # 上层直径
STEP2_HEIGHT = 2.0      # 上层高度
PCB_HOLE_OFFSET = 3.0   # mm，孔距槽边缘距离

# ========== 底板开孔参数 ==========
BOTTOM_HOLE_LENGTH = 15.0  # mm，Z方向长度
BOTTOM_HOLE_WIDTH = 5.0    # mm，X方向宽度
BOTTOM_HOLE_DEPTH = BOTTOM_THICKNESS + 0.5  # 2.5mm，穿透底板

# ========== 导角参数 ==========
FILLET_RADIUS = 2.0  # mm，外框圆角半径

print(f"PCB盒子设计")
print(f"PCB尺寸: {PCB_LENGTH} x {PCB_WIDTH} mm")
print(f"外部尺寸: {OUTER_LENGTH} x {OUTER_WIDTH} x {BOX_DEPTH} mm (X×Z×Y)")
print(f"内腔尺寸: {INNER_LENGTH} x {INNER_WIDTH} x {INNER_DEPTH} mm")
print(f"壁厚: {WALL_THICKNESS} mm")
print(f"底板厚度: {BOTTOM_THICKNESS} mm")

# ========== 1. 创建外框盒子 ==========
# build123d的Box参数是(length=X, height=Y, width=Z)
with BuildPart() as outer:
    Box(OUTER_LENGTH, BOX_DEPTH, OUTER_WIDTH)
outer_solid = outer.part.solid()
print(f"已创建外框: {OUTER_LENGTH} x {BOX_DEPTH} x {OUTER_WIDTH} mm (X×Y×Z)")

# ========== 2. 创建内腔（向Y方向偏移，保留底板） ==========
with BuildPart() as inner_builder:
    Box(INNER_LENGTH, INNER_DEPTH, INNER_WIDTH)
inner_box = inner_builder.part.solid()

# 计算内腔偏移量：底部应该在外壳底部以上 BOTTOM_THICKNESS 的位置
# 外壳底部在 Y=-BOX_DEPTH/2，内腔底部应该在 Y=-BOX_DEPTH/2 + BOTTOM_THICKNESS
# inner_box 默认中心在原点，底部在 Y=-INNER_DEPTH/2
inner_box_bottom = -INNER_DEPTH / 2
cavity_bottom = -BOX_DEPTH / 2 + BOTTOM_THICKNESS
offset_y = cavity_bottom - inner_box_bottom

inner_box = inner_box.translate(Vector(0, offset_y, 0))

# 外框减内腔，形成带底板的盒子
pcb_box = outer_solid - inner_box
print(f"已创建内腔并掏空")

# ========== 3. 添加台阶型固定柱 ==========
# 计算固定柱位置（相对于内腔中心，在XZ平面上）
hole_x = INNER_LENGTH / 2 - PCB_HOLE_OFFSET  # 55.5mm
hole_z = INNER_WIDTH / 2 - PCB_HOLE_OFFSET   # 13mm

# 固定柱的Y位置：在底板内表面
cavity_inner_y = -BOX_DEPTH / 2 + BOTTOM_THICKNESS

# 四个固定柱位置（在XZ平面上）
cylinder_positions = [
    (-hole_x, -hole_z),  # 左下（XZ平面）
    (hole_x, -hole_z),   # 右下
    (-hole_x, hole_z),   # 左上
    (hole_x, hole_z),    # 右上
]

for i, (x, z) in enumerate(cylinder_positions, 1):
    # 创建台阶圆柱（在XY平面）
    # x对应X方向，z对应Y方向（暂时），z_offset对应Y方向偏移
    stepped_cylinder = create_stepped_cylinder(
        x, z,  # 使用x和z作为位置
        z_offset=cavity_inner_y,
        step1_dia=STEP1_DIAMETER,
        step1_height=STEP1_HEIGHT,
        step2_dia=STEP2_DIAMETER,
        step2_height=STEP2_HEIGHT
    )

    # 需要将圆柱从XY平面旋转到XZ平面
    # 绕X轴旋转-90度
    stepped_cylinder = stepped_cylinder.rotate(Axis.X, -90)

    # 将固定柱合并到外壳上
    result = pcb_box.fuse(stepped_cylinder)
    if isinstance(result, list) and len(result) > 0:
        pcb_box = result[0]
        for obj in result[1:]:
            pcb_box = pcb_box.fuse(obj)
            if isinstance(pcb_box, list):
                pcb_box = pcb_box[0]
    elif isinstance(result, list):
        pcb_box = result[0]
    else:
        pcb_box = result

    print(f"已添加第 {i} 个台阶型固定柱: 位置({x}, {z})")

print(f"已添加4个PCB固定台阶圆柱")

# ========== 4. 底板开孔 ==========
# 创建孔切割体
# 孔尺寸：15mm (Z) x 5mm (X)
with BuildPart() as bottom_hole_builder:
    Box(BOTTOM_HOLE_WIDTH, BOTTOM_HOLE_DEPTH, BOTTOM_HOLE_LENGTH)
bottom_hole = bottom_hole_builder.part.solid()

# 计算孔的位置
# X方向：靠右侧，距离槽内表面一定距离
# PCB槽内表面在 X = INNER_LENGTH/2 = 57.5mm
hole_x_center = INNER_LENGTH / 2 - BOTTOM_HOLE_WIDTH / 2  # 55mm

# Y方向：从底板内表面向下穿透
# 底板内表面在 Y = -BOX_DEPTH/2 + BOTTOM_THICKNESS = -5 + 2 = -3mm
hole_y_start = -BOX_DEPTH / 2 + BOTTOM_THICKNESS  # -3mm
hole_y_offset = hole_y_start - BOTTOM_HOLE_DEPTH / 2

# Z方向：居中于PCB槽
hole_z_center = 0

bottom_hole = bottom_hole.translate(
    Vector(hole_x_center, hole_y_offset, hole_z_center))

# 在盒子上开孔
pcb_box = pcb_box - bottom_hole
print(f"已在底板开孔: {BOTTOM_HOLE_WIDTH} x {BOTTOM_HOLE_LENGTH} mm")
print(f"  孔位置: X中心={hole_x_center}mm, Y起点={hole_y_start}mm, Z居中")

# ========== 5. 外角边缘导角 ==========
all_edges = pcb_box.edges()

# 选择需要倒角的边缘：外角垂直边缘（平行于Y轴的边缘）
fillet_edges = [
    e for e in all_edges
    if (abs(e.position_at(0).X) > OUTER_LENGTH / 2 - 1 and
        abs(e.position_at(0).Z) > OUTER_WIDTH / 2 - 1 and
        abs(e.position_at(0).Y - e.position_at(1).Y) > 1)  # 平行于Y轴的垂直边缘
]

print(f"外角边缘数量: {len(fillet_edges)}")
if fillet_edges:
    try:
        pcb_box = pcb_box.fillet(FILLET_RADIUS, fillet_edges)
        print(f"外角边缘倒角完成: {len(fillet_edges)} 条")
    except Exception as e:
        print(f"外角边缘倒角失败: {e}")

print(f"\nPCB盒子完成！")
print(f"盒子模型: {pcb_box}")

# ========== 导出模型供其他模块使用 ==========
pcb_box_model = pcb_box


def get_pcb_box():
    """返回PCB盒子模型副本"""
    return pcb_box_model


if __name__ == "__main__":
    # 仅在直接运行时显示
    show(pcb_box)
