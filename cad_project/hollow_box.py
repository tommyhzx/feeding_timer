"""
空心盒子 - build123d
长120mm x 宽40mm x 深40mm 的立方体，壁厚2mm
顶部开槽：75mm x 32mm x 15mm，槽壁厚2mm
"""

from build123d import *
from ocp_vscode import show
from elements.mounting_holes import create_stepped_cylinder

# ========== 外壳参数 ==========
BOX_LENGTH = 120.0  # mm，长度（X方向）
BOX_WIDTH = 45.0    # mm，宽度（Y方向）
BOX_DEPTH = 40.0    # mm，深度（Z方向）
WALL_THICKNESS = 2.0  # mm，壁厚
FILLET_RADIUS = 2.0  # mm，外框圆角半径

# ========== 顶部槽参数 ==========
SLOT_LENGTH = 75.0   # mm，槽长度（X方向）
SLOT_WIDTH = 32.0    # mm，槽宽度（Y方向）
SLOT_DEPTH = 15.0    # mm，槽深度（Z方向，从顶面向下）
SLOT_WALL_THICKNESS = 2.0  # mm，槽壁厚

# ========== PCB槽参数 ==========
PCB_SLOT_LENGTH = 115.0  # mm，PCB槽长度（X方向）
PCB_SLOT_WIDTH = 36.0    # mm，PCB槽宽度（Z方向）
PCB_SLOT_DEPTH = 10.0     # mm，PCB槽深度（-Y方向，从Y顶面向内）
PCB_SLOT_WALL_THICKNESS = 2.0  # mm，PCB槽壁厚

# ========== 屏幕槽台阶圆柱参数 ==========
SCREEN_HOLE_OFFSET = 3.0  # mm，孔距槽边缘距离
STEP1_DIAMETER = 4.0      # 底层直径
STEP1_HEIGHT = 2.0        # 底层高度
STEP2_DIAMETER = 2.8      # 上层直径
STEP2_HEIGHT = 2.0        # 上层高度

# ========== PCB槽台阶圆柱参数 ==========
PCB_HOLE_OFFSET = 3.0     # mm，孔距槽边缘距离

print(f"空心盒子设计")
print(f"外部尺寸: {BOX_LENGTH} x {BOX_WIDTH} x {BOX_DEPTH} mm")
print(f"壁厚: {WALL_THICKNESS} mm")

# ========== 1. 创建外框盒子 ==========
with BuildPart() as outer:
    Box(BOX_LENGTH, BOX_WIDTH, BOX_DEPTH)
outer_solid = outer.part.solid()
print(f"已创建外框")

# ========== 2. 创建内腔（用于掏空） ==========
inner_length = BOX_LENGTH - 2 * WALL_THICKNESS
inner_width = BOX_WIDTH - 2 * WALL_THICKNESS
inner_depth = BOX_DEPTH - 2 * WALL_THICKNESS

with BuildPart() as inner_builder:
    Box(inner_length, inner_width, inner_depth)
inner_box = inner_builder.part.solid()

# 内腔无需偏移，因为Box默认居中于原点
# 外框减内腔，形成空心盒子
hollow_box = outer_solid - inner_box
print(f"已创建内腔并掏空")

# ========== 3. 外角边缘导角 ==========
all_edges = hollow_box.edges()

# 选择需要倒角的边缘：外角垂直边缘和顶部/底部边缘
fillet_edges = [
    e for e in all_edges
    if (abs(e.position_at(0).X) > BOX_LENGTH / 2 - 1 and
        abs(e.position_at(0).Y) > BOX_WIDTH / 2 - 1 and
        abs(e.position_at(0).Z - e.position_at(1).Z) > 1)  # 垂直边缘
    or (abs(e.position_at(0).Z) > BOX_DEPTH / 2 - 1 and  # 顶部和底部边缘
        abs(e.position_at(0).X) > BOX_LENGTH / 2 - 1)
]

print(f"外角边缘数量: {len(fillet_edges)}")
if fillet_edges:
    try:
        hollow_box = hollow_box.fillet(FILLET_RADIUS, fillet_edges)
        print(f"外角边缘倒角完成: {len(fillet_edges)} 条")
    except Exception as e:
        print(f"外角边缘倒角失败: {e}")

# ========== 4. 创建顶部槽结构（独立盒子，无顶面） ==========
# 槽的外部尺寸
slot_outer_length = SLOT_LENGTH   # 75mm
slot_outer_width = SLOT_WIDTH     # 32mm
slot_outer_depth = SLOT_DEPTH     # 15mm

# 槽的内腔尺寸（用于掏空，形成壁厚）
slot_inner_length = SLOT_LENGTH - 2 * SLOT_WALL_THICKNESS  # 71mm
slot_inner_width = SLOT_WIDTH - 2 * SLOT_WALL_THICKNESS   # 28mm
slot_inner_depth = SLOT_DEPTH - SLOT_WALL_THICKNESS       # 13mm（底板厚度2mm）

# 先在外壳顶部开孔（与槽外轮廓相同，挖穿外壳顶壁）
with BuildPart() as hole_cutter:
    Box(slot_outer_length, slot_outer_width, WALL_THICKNESS + 1)
hole_box = hole_cutter.part.solid()

# 孔的位置：从外壳顶部向下挖穿顶壁
box_top_z = BOX_DEPTH / 2
# hole_box 默认中心在原点，高度为 WALL_THICKNESS + 1
# 我们需要它的顶部与外壳顶部对齐，向下延伸挖穿
hole_height = WALL_THICKNESS + 1
hole_top_z = hole_height / 2
hole_offset_z = box_top_z - hole_top_z

# Y方向：槽底距离外壳底部2mm
box_bottom_y = -BOX_WIDTH / 2
hole_bottom_target_y = box_bottom_y + 2.0
hole_bottom_current_y = -slot_outer_width / 2
hole_offset_y = hole_bottom_target_y - hole_bottom_current_y

hole_box = hole_box.translate(Vector(0, hole_offset_y, hole_offset_z))

# 在外壳上开孔
hollow_box = hollow_box - hole_box
print(f"已在外壳顶部开孔: {slot_outer_length} x {slot_outer_width} mm")

# 创建槽的外框
with BuildPart() as slot_outer:
    Box(slot_outer_length, slot_outer_width, slot_outer_depth)
slot_outer_solid = slot_outer.part.solid()

# 创建槽的内腔（用于掏空，但只从顶部开口）
with BuildPart() as slot_inner_builder:
    Box(slot_inner_length, slot_inner_width, slot_inner_depth)
slot_inner_box = slot_inner_builder.part.solid()

# 内腔向上偏移，保留底板
# slot_inner_box 默认中心在原点，底部在 Z = -slot_inner_depth/2
# 我们需要底部与外框底部对齐，顶部开口
# 外框底部在 Z = -slot_outer_depth/2
# 内腔底部也应该在 Z = -slot_outer_depth/2 + SLOT_WALL_THICKNESS
slot_outer_bottom = -slot_outer_depth / 2
slot_inner_bottom_target = slot_outer_bottom + SLOT_WALL_THICKNESS
slot_inner_current_bottom = -slot_inner_depth / 2
offset_z = slot_inner_bottom_target - slot_inner_current_bottom

slot_inner_box = slot_inner_box.translate(Vector(0, 0, offset_z))

# 外框减内腔，形成槽结构（四壁+底板，顶部开口）
slot_structure = slot_outer_solid - slot_inner_box
print(f"已创建槽结构: {SLOT_LENGTH} x {SLOT_WIDTH} x {SLOT_DEPTH} mm")
print(
    f"  槽内腔尺寸: {slot_inner_length} x {slot_inner_width} x {slot_inner_depth} mm")
print(f"  槽壁厚: {SLOT_WALL_THICKNESS} mm")

# 计算槽在外壳上的位置
# Z方向：盒子顶部在 Z = BOX_DEPTH / 2 = 20mm
# 槽的外部深度为 SLOT_DEPTH = 15mm，中心在原点时顶部在 Z = 7.5mm
# 要使槽的顶部与盒子顶部平齐，需要向上移动
box_top_z = BOX_DEPTH / 2
slot_top_z = slot_outer_depth / 2
slot_offset_z = box_top_z - slot_top_z  # 20 - 7.5 = 12.5mm

# Y方向：槽底距离外壳底部2mm
box_bottom_y = -BOX_WIDTH / 2
slot_bottom_target_y = box_bottom_y + 2.0
slot_bottom_current_y = -slot_outer_width / 2
slot_offset_y = slot_bottom_target_y - slot_bottom_current_y

slot_structure = slot_structure.translate(
    Vector(0, slot_offset_y, slot_offset_z))

# 将槽结构合并到外壳上
result = hollow_box.fuse(slot_structure)
if isinstance(result, list) and len(result) > 0:
    hollow_box = result[0]
    for obj in result[1:]:
        hollow_box = hollow_box.fuse(obj)
        if isinstance(hollow_box, list):
            hollow_box = hollow_box[0]
elif isinstance(result, list):
    hollow_box = result[0]
else:
    hollow_box = result
print(f"已将槽结构合并到外壳顶部")

# ========== 4.5 屏幕槽台阶圆柱 ==========
# 计算台阶圆柱位置（相对于槽结构中心）
# 槽底板位置（需要知道槽结构平移后的位置）
# 槽结构在Z方向平移了 slot_offset_z，Y方向平移了 slot_offset_y
# 槽底板顶部在 Z = box_top_z（盒子顶部），即槽结构的底板位置

# 槽内腔尺寸
slot_cavity_length = slot_inner_length  # 71mm
slot_cavity_width = slot_inner_width    # 28mm

# 计算固定柱位置（相对于槽结构中心）
hole_x = slot_cavity_length / 2 - SCREEN_HOLE_OFFSET  # 32.5mm
hole_y = slot_cavity_width / 2 - SCREEN_HOLE_OFFSET   # 11mm

# 固定柱的Z位置：在槽内腔的底板上（不是外框底部）
# 外框底部相对于槽结构中心：-slot_outer_depth/2 = -7.5mm
# 内腔底板（有底板的位置）：-slot_outer_depth/2 + SLOT_WALL_THICKNESS = -7.5 + 2 = -5.5mm
# 圆柱底面应该在内腔底板上
cylinder_z_offset_slot = -slot_outer_depth / 2 + SLOT_WALL_THICKNESS

# 四个固定柱位置（相对于槽结构中心）
cylinder_positions = [
    (-hole_x, -hole_y),  # 左下（相对于槽结构中心的XY坐标）
    (hole_x, -hole_y),   # 右下
    (-hole_x, hole_y),   # 左上
    (hole_x, hole_y),    # 右上
]

for i, (x, y) in enumerate(cylinder_positions, 1):
    # 计算圆柱的Z偏移：使底层圆柱底面在槽底板位置
    # create_stepped_cylinder 创建的圆柱底层底面在 Z = 0
    # 需要移动到 cylinder_z_offset_slot
    z_offset = cylinder_z_offset_slot

    # 创建台阶圆柱
    stepped_cylinder = create_stepped_cylinder(
        x, y,
        z_offset=z_offset,
        step1_dia=STEP1_DIAMETER,
        step1_height=STEP1_HEIGHT,
        step2_dia=STEP2_DIAMETER,
        step2_height=STEP2_HEIGHT
    )

    # 应用槽结构的平移（与槽结构对齐）
    stepped_cylinder = stepped_cylinder.translate(
        Vector(0, slot_offset_y, slot_offset_z))

    # 调试信息
    total_height = STEP1_HEIGHT + STEP2_HEIGHT
    print(f"  圆柱 {i}: 总高度={total_height}mm, 位置=({x}, {y}), z_offset={z_offset}")
    print(f"    槽偏移: y={slot_offset_y}, z={slot_offset_z}")

    # 将固定柱合并到外壳上
    result = hollow_box.fuse(stepped_cylinder)
    if isinstance(result, list) and len(result) > 0:
        hollow_box = result[0]
        for obj in result[1:]:
            hollow_box = hollow_box.fuse(obj)
            if isinstance(hollow_box, list):
                hollow_box = hollow_box[0]
    elif isinstance(result, list):
        hollow_box = result[0]
    else:
        hollow_box = result

    print(f"已添加第 {i} 个台阶型固定柱: 相对位置({x}, {y})")

print(f"已添加4个屏幕槽台阶圆柱")

# ========== 4.6 显示屏槽右壁开孔 ==========
# 孔的尺寸
CABLE_HOLE_LENGTH = 15.0   # mm，Y方向长度
CABLE_HOLE_WIDTH = 5.0    # mm，Z方向宽度
# 只穿透槽壁，不穿透外壳
# 槽壁厚度 = SLOT_WALL_THICKNESS = 2mm
# 孔深度略大于槽壁厚度，确保穿透
cable_hole_depth = SLOT_WALL_THICKNESS + 0.5  # 2.5mm

# 创建孔切割体
with BuildPart() as cable_hole_builder:
    Box(cable_hole_depth, CABLE_HOLE_LENGTH, CABLE_HOLE_WIDTH)
cable_hole = cable_hole_builder.part.solid()

# 计算孔的位置
# 相对于槽结构中心：
# X方向：从槽内表面开始，向外穿透槽壁
cable_hole_x_start = slot_inner_length / 2  # 35.5mm

# Y方向：居中于槽壁
cable_hole_y_center = 0

# Z方向：在槽底板上方5mm的位置
cable_hole_z_offset = -slot_outer_depth / \
    2 + CABLE_HOLE_WIDTH / 2 + 5  # 距离底板5mm

# 移动孔到正确位置
# Box默认中心在原点，X范围是 [-depth/2, depth/2]
# 我们需要Box的左侧面在槽内表面位置
cable_hole_x_offset = cable_hole_x_start + cable_hole_depth / 2

cable_hole = cable_hole.translate(
    Vector(cable_hole_x_offset, cable_hole_y_center, cable_hole_z_offset))

# 应用槽结构的平移
cable_hole = cable_hole.translate(Vector(0, slot_offset_y, slot_offset_z))

# 在外壳上开孔
hollow_box = hollow_box - cable_hole
print(f"已在显示屏槽右壁开孔: {CABLE_HOLE_LENGTH} x {CABLE_HOLE_WIDTH} mm")
print(
    f"  孔位置: X起点={cable_hole_x_start}mm, 深度={cable_hole_depth}mm, Z偏移={cable_hole_z_offset}mm")

# ========== 5. 创建PCB槽结构（Y方向顶部，向内挖） ==========
# PCB槽的外部尺寸
pcb_slot_outer_length = PCB_SLOT_LENGTH   # 115mm（X方向）
pcb_slot_outer_width = PCB_SLOT_WIDTH     # 36mm（Z方向）
pcb_slot_outer_depth = PCB_SLOT_DEPTH     # 4mm（Y方向深度）

# PCB槽的内腔尺寸（用于掏空，形成壁厚）
pcb_slot_inner_length = PCB_SLOT_LENGTH - 2 * PCB_SLOT_WALL_THICKNESS  # 111mm
pcb_slot_inner_width = PCB_SLOT_WIDTH - 2 * PCB_SLOT_WALL_THICKNESS    # 32mm
pcb_slot_inner_depth = PCB_SLOT_DEPTH - \
    PCB_SLOT_WALL_THICKNESS        # 2mm（底板厚度2mm）

# 先在外壳Y方向顶部开孔（与PCB槽外轮廓相同，挖穿外壳侧壁）
with BuildPart() as pcb_hole_cutter:
    Box(pcb_slot_outer_length, WALL_THICKNESS + 1, pcb_slot_outer_width)
pcb_hole_box = pcb_hole_cutter.part.solid()

# 孔的位置：从外壳Y方向顶部向内挖穿侧壁
box_top_y = BOX_WIDTH / 2
# pcb_hole_box 默认中心在原点，Y方向高度为 WALL_THICKNESS + 1
# 我们需要它的外表面与外壳Y顶部对齐，向内延伸挖穿
pcb_hole_height = WALL_THICKNESS + 1
pcb_hole_outer_y = pcb_hole_height / 2
pcb_hole_offset_y = box_top_y - pcb_hole_outer_y

# Z方向：PCB槽居中
pcb_hole_offset_z = 0

pcb_hole_box = pcb_hole_box.translate(
    Vector(0, pcb_hole_offset_y, pcb_hole_offset_z))

# 在外壳上开孔
hollow_box = hollow_box - pcb_hole_box
print(f"已在外壳Y方向顶部开PCB孔: {pcb_slot_outer_length} x {pcb_slot_outer_width} mm")

# 创建PCB槽的外框
with BuildPart() as pcb_slot_outer:
    Box(pcb_slot_outer_length, pcb_slot_outer_depth, pcb_slot_outer_width)
pcb_slot_outer_solid = pcb_slot_outer.part.solid()

# 创建PCB槽的内腔（用于掏空，从Y方向顶部开口）
with BuildPart() as pcb_slot_inner_builder:
    Box(pcb_slot_inner_length, pcb_slot_inner_depth, pcb_slot_inner_width)
pcb_slot_inner_box = pcb_slot_inner_builder.part.solid()

# 内腔向内偏移，保留底板
# pcb_slot_inner_box 默认中心在原点，Y方向范围是 [-pcb_slot_inner_depth/2, pcb_slot_inner_depth/2]
# 我们需要内表面与外框内表面对齐，Y方向顶部开口
# 外框内表面在 Y = -pcb_slot_outer_depth/2 + PCB_SLOT_WALL_THICKNESS
# 内腔应该在更靠内的位置
pcb_slot_outer_inner_y = -pcb_slot_outer_depth / 2 + PCB_SLOT_WALL_THICKNESS
pcb_slot_inner_current_y = -pcb_slot_inner_depth / 2
pcb_slot_offset_inner_y = pcb_slot_outer_inner_y - pcb_slot_inner_current_y

pcb_slot_inner_box = pcb_slot_inner_box.translate(
    Vector(0, pcb_slot_offset_inner_y, 0))

# 外框减内腔，形成PCB槽结构（四壁+底板，Y方向顶部开口）
pcb_slot_structure = pcb_slot_outer_solid - pcb_slot_inner_box
print(f"已创建PCB槽结构: {PCB_SLOT_LENGTH} x {PCB_SLOT_WIDTH} x {PCB_SLOT_DEPTH} mm")
print(
    f"  PCB槽内腔尺寸: {pcb_slot_inner_length} x {pcb_slot_inner_width} x {pcb_slot_inner_depth} mm")
print(f"  PCB槽壁厚: {PCB_SLOT_WALL_THICKNESS} mm")

# 计算PCB槽在外壳上的位置
# Y方向：盒子顶部在 Y = BOX_WIDTH / 2 = 20mm
# PCB槽的外部深度为 PCB_SLOT_DEPTH = 4mm，中心在原点时外表面在 Y = 2mm
# 要使PCB槽的外表面与盒子顶部平齐，需要向上移动
box_top_y = BOX_WIDTH / 2
pcb_slot_outer_y = pcb_slot_outer_depth / 2
pcb_slot_offset_y = box_top_y - pcb_slot_outer_y  # 20 - 2 = 18mm

# X和Z方向居中
pcb_slot_offset_x = 0
pcb_slot_offset_z = 0

pcb_slot_structure = pcb_slot_structure.translate(
    Vector(pcb_slot_offset_x, pcb_slot_offset_y, pcb_slot_offset_z))

# 将PCB槽结构合并到外壳上
result = hollow_box.fuse(pcb_slot_structure)
if isinstance(result, list) and len(result) > 0:
    hollow_box = result[0]
    for obj in result[1:]:
        hollow_box = hollow_box.fuse(obj)
        if isinstance(hollow_box, list):
            hollow_box = hollow_box[0]
elif isinstance(result, list):
    hollow_box = result[0]
else:
    hollow_box = result
print(f"已将PCB槽结构合并到外壳Y方向顶部")

# ========== 5.5 PCB槽台阶圆柱 ==========
# 计算PCB槽内腔的四个角位置
# PCB槽在XZ平面上，Y方向深度
pcb_cavity_length = pcb_slot_inner_length  # 111mm
pcb_cavity_width = pcb_slot_inner_width    # 32mm

# 计算固定柱位置（相对于PCB槽结构中心）
pcb_hole_x = pcb_cavity_length / 2 - PCB_HOLE_OFFSET  # 52.5mm
pcb_hole_z = pcb_cavity_width / 2 - PCB_HOLE_OFFSET    # 13mm

# 固定柱的Y位置：在PCB槽内腔的底板上
# PCB槽外框底部相对于槽结构中心：-pcb_slot_outer_depth/2 = -5mm
# 内腔底板（有底板的位置）：-pcb_slot_outer_depth/2 + PCB_SLOT_WALL_THICKNESS = -5 + 2 = -3mm
pcb_cylinder_y_offset_slot = -pcb_slot_outer_depth / 2 + PCB_SLOT_WALL_THICKNESS

# 四个固定柱位置（相对于PCB槽结构中心的XZ坐标）
pcb_cylinder_positions = [
    (-pcb_hole_x, -pcb_hole_z),  # 左下（XZ平面）
    (pcb_hole_x, -pcb_hole_z),   # 右下
    (-pcb_hole_x, pcb_hole_z),   # 左上
    (pcb_hole_x, pcb_hole_z),    # 右上
]

for i, (x, z) in enumerate(pcb_cylinder_positions, 1):
    # 计算圆柱的Y偏移：使底层圆柱底面在PCB槽底板位置
    # create_stepped_cylinder 创建的圆柱底层底面在 Y = 0（默认在XY平面）
    # 我们需要在XZ平面上创建圆柱，然后旋转90度
    # 或者直接创建圆柱，然后交换Y和Z坐标

    # 创建台阶圆柱（在XY平面）
    # x对应X方向，z对应Y方向（暂时），z_offset对应Y方向偏移
    pcb_stepped_cylinder = create_stepped_cylinder(
        x, z,  # 使用x和z作为位置
        z_offset=pcb_cylinder_y_offset_slot,
        step1_dia=STEP1_DIAMETER,
        step1_height=STEP1_HEIGHT,
        step2_dia=STEP2_DIAMETER,
        step2_height=STEP2_HEIGHT
    )

    # 需要将圆柱从XY平面旋转到XZ平面
    # 绕X轴旋转-90度
    pcb_stepped_cylinder = pcb_stepped_cylinder.rotate(Axis.X, -90)

    # 应用PCB槽结构的平移
    pcb_stepped_cylinder = pcb_stepped_cylinder.translate(
        Vector(pcb_slot_offset_x, pcb_slot_offset_y, pcb_slot_offset_z))

    # 调试信息
    pcb_total_height = STEP1_HEIGHT + STEP2_HEIGHT
    print(
        f"  PCB圆柱 {i}: 总高度={pcb_total_height}mm, 位置=({x}, {z}), y_offset={pcb_cylinder_y_offset_slot}")

    # 将固定柱合并到外壳上
    result = hollow_box.fuse(pcb_stepped_cylinder)
    if isinstance(result, list) and len(result) > 0:
        hollow_box = result[0]
        for obj in result[1:]:
            hollow_box = hollow_box.fuse(obj)
            if isinstance(hollow_box, list):
                hollow_box = hollow_box[0]
    elif isinstance(result, list):
        hollow_box = result[0]
    else:
        hollow_box = result

    print(f"已添加第 {i} 个PCB槽台阶型固定柱: 相对位置({x}, {z})")

print(f"已添加4个PCB槽台阶圆柱")

# ========== 5.6 PCB槽底面开孔 ==========
# 孔的尺寸
PCB_BOTTOM_HOLE_LENGTH = 15.0  # mm，Z方向长度
PCB_BOTTOM_HOLE_WIDTH = 5.0    # mm，X方向宽度
# 穿透PCB槽底板
# PCB槽底板厚度 = PCB_SLOT_WALL_THICKNESS = 2mm
pcb_bottom_hole_depth = PCB_SLOT_WALL_THICKNESS + 0.5  # 2.5mm

# 创建孔切割体
with BuildPart() as pcb_bottom_hole_builder:
    Box(PCB_BOTTOM_HOLE_WIDTH, pcb_bottom_hole_depth, PCB_BOTTOM_HOLE_LENGTH)
pcb_bottom_hole = pcb_bottom_hole_builder.part.solid()

# 计算孔的位置
# 相对于PCB槽结构中心：
# X方向：靠右侧，距离槽内表面一定距离
# PCB槽内表面在 X = pcb_slot_inner_length/2 = 55.5mm
# 孔的右边缘应该在槽内表面附近，孔宽3mm，所以孔中心在 55.5 - 1.5 = 54mm
pcb_hole_x_center = pcb_slot_inner_length / \
    2 - PCB_BOTTOM_HOLE_WIDTH / 2  # 54mm

# Y方向：从PCB槽底板内表面向下穿透
# PCB槽底板内表面在 Y = -pcb_slot_outer_depth/2 + PCB_SLOT_WALL_THICKNESS = -5 + 2 = -3mm
# 我们需要孔的顶面在底板内表面，向下穿透
pcb_hole_y_start = -pcb_slot_outer_depth / 2 + PCB_SLOT_WALL_THICKNESS  # -3mm

# Z方向：居中于PCB槽
pcb_hole_z_center = 0

# 移动孔到正确位置
# Box默认中心在原点，Y范围是 [-depth/2, depth/2]
# 我们需要Box的顶面在底板内表面位置
pcb_hole_y_offset = pcb_hole_y_start - pcb_bottom_hole_depth / 2

pcb_bottom_hole = pcb_bottom_hole.translate(
    Vector(pcb_hole_x_center, pcb_hole_y_offset, pcb_hole_z_center))

# 应用PCB槽结构的平移
pcb_bottom_hole = pcb_bottom_hole.translate(
    Vector(pcb_slot_offset_x, pcb_slot_offset_y, pcb_slot_offset_z))

# 在外壳上开孔
hollow_box = hollow_box - pcb_bottom_hole
print(f"已在PCB槽底面开孔: {PCB_BOTTOM_HOLE_WIDTH} x {PCB_BOTTOM_HOLE_LENGTH} mm")
print(f"  孔位置: X中心={pcb_hole_x_center}mm, Y起点={pcb_hole_y_start}mm, Z居中")

print(f"\n空心盒子完成！")
print(f"盒子模型: {hollow_box}")

# ========== 导出模型供其他模块使用 ==========
hollow_box_model = hollow_box


def get_hollow_box():
    """返回空心盒子模型副本"""
    return hollow_box_model


if __name__ == "__main__":
    # 仅在直接运行时显示
    show(hollow_box)
