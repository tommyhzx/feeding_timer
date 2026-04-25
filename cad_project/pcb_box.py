"""
PCB盒子 - build123d
专门用于固定 115mm x 32mm 的PCB板
带底板的盒子设计，底板厚度 2mm，带4个台阶型固定柱，底板有开孔
Y方向深度10mm，PCB从Y方向插入
"""

from build123d import *
from ocp_vscode import show
from elements.mounting_holes import create_stepped_cylinder, create_usb_hole_cutout
from elements.holes import create_m2_countersunk_hole_at

# ========== PCB参数 ==========
PCB_LENGTH = 107.0    # mm，PCB长度（X方向）
PCB_WIDTH = 33.0     # mm，PCB宽度（Y方向）

# ========== 盒子参数 ==========
BOX_HEIGHT = 20.0    # mm，盒子高度（Z方向）
WALL_THICKNESS = 2.0  # mm，壁厚
BOTTOM_THICKNESS = 2.0  # mm，底板厚度

# ========== 外部尺寸 ==========
OUTER_LENGTH = PCB_LENGTH + 2 * WALL_THICKNESS  # 119mm
OUTER_WIDTH = PCB_WIDTH + 2 * WALL_THICKNESS    # 36mm

# ========== 内腔尺寸（用于掏空） ==========
INNER_LENGTH = PCB_LENGTH  # 59mm
INNER_WIDTH = PCB_WIDTH    # 32mm
INNER_HEIGHT = BOX_HEIGHT - BOTTOM_THICKNESS  # 18mm

# ========== 台阶型固定柱参数 ==========
STEP1_DIAMETER = 5.0    # 底层直径
STEP1_HEIGHT = 0      # 底层高度
STEP2_DIAMETER = 2.8    # 上层直径
STEP2_HEIGHT = 2.0      # 上层高度
PCB_HOLE_OFFSET = 3.0   # mm，孔距槽边缘距离

# ========== 底板开孔参数 ==========
BOTTOM_HOLE_LENGTH = 15.0  # mm，Y方向长度
BOTTOM_HOLE_WIDTH = 5.0    # mm，Z方向高度
BOTTOM_HOLE_DEPTH = BOTTOM_THICKNESS + 0.5  # 2.5mm，穿透底板

# ========== 导角参数 ==========
FILLET_RADIUS = 2.0  # mm，外框圆角半径

# ========== 底板螺丝孔参数（与立柱对齐）==========
STRUT_MOUNT_HOLE_DIA = 2.5  # mm，M2螺丝通孔
STRUT_HOLE_X_OFFSET = 19.5  # mm，立柱X轴偏移量（与base_strut.py一致）

print(f"PCB盒子设计")
print(f"PCB尺寸: {PCB_LENGTH} x {PCB_WIDTH} mm")
print(f"外部尺寸: {OUTER_LENGTH} x {OUTER_WIDTH} x {BOX_HEIGHT} mm (X×Y×Z)")
print(f"内腔尺寸: {INNER_LENGTH} x {INNER_WIDTH} x {INNER_HEIGHT} mm")
print(f"壁厚: {WALL_THICKNESS} mm")
print(f"底板厚度: {BOTTOM_THICKNESS} mm")

# ========== 1. 创建外框盒子 ==========
# build123d的Box参数是(length=X, width=Y, height=Z)
with BuildPart() as outer:
    Box(OUTER_LENGTH, OUTER_WIDTH, BOX_HEIGHT)
outer_solid = outer.part.solid()
print(f"已创建外框: {OUTER_LENGTH} x {OUTER_WIDTH} x {BOX_HEIGHT} mm (X×Y×Z)")

# ========== 2. 创建内腔（向Z方向偏移，保留底板） ==========
with BuildPart() as inner_builder:
    Box(INNER_LENGTH, INNER_WIDTH, INNER_HEIGHT)
inner_box = inner_builder.part.solid()

# 计算内腔偏移量：底部应该在外壳底部以上 BOTTOM_THICKNESS 的位置
# 外壳底部在 Z=-BOX_HEIGHT/2，内腔底部应该在 Z=-BOX_HEIGHT/2 + BOTTOM_THICKNESS
# inner_box 默认中心在原点，底部在 Z=-INNER_HEIGHT/2
inner_box_bottom = -INNER_HEIGHT / 2
cavity_bottom = -BOX_HEIGHT / 2 + BOTTOM_THICKNESS
offset_z = cavity_bottom - inner_box_bottom

inner_box = inner_box.translate(Vector(0, 0, offset_z))

# 外框减内腔，形成带底板的盒子
pcb_box = outer_solid - inner_box
print(f"已创建内腔并掏空")

# ========== 3. 添加台阶型固定柱 ==========
# 固定柱的Z位置：在底板内表面
# cavity_inner_z = -BOX_HEIGHT / 2 + BOTTOM_THICKNESS

# 3个固定柱位置（在XY平面上，与PCB孔位对应）
cylinder_positions = [
    (-25, 0),   # MH1
    (23, -8),   # MH2
    (23, 8),    # MH3
]

for i, (x, y) in enumerate(cylinder_positions, 1):
    # 创建台阶圆柱（在XY平面，从Z=0开始向上生长）
    stepped_cylinder = create_stepped_cylinder(
        x, y,  # 使用x和y作为位置
        z_offset=BOTTOM_THICKNESS,  # 不偏移，从Z=0开始
        step1_dia=STEP1_DIAMETER,
        step1_height=STEP1_HEIGHT,
        step2_dia=STEP2_DIAMETER,
        step2_height=STEP2_HEIGHT
    )

    # 圆柱已经在Z轴方向生长，不需要旋转
    # 圆柱总高度
    cylinder_height = STEP1_HEIGHT + STEP2_HEIGHT
    # 计算平移量：圆柱中心(0) -> 圆柱底部与盒子底部对齐
    # 圆柱默认居中，范围是[-cylinder_height/2, cylinder_height/2]
    # 要让底部与盒子底部(-BOX_HEIGHT/2)对齐，需要平移：
    box_bottom_z = -BOX_HEIGHT / 2 + cylinder_height / 2
    # 平移
    stepped_cylinder = stepped_cylinder.translate(Vector(0, 0, box_bottom_z))
    print(
        f"    圆柱高度={cylinder_height}mm, Z范围=[{-BOX_HEIGHT/2}, {-BOX_HEIGHT/2 + cylinder_height}]mm")

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

    print(f"已添加第 {i} 个台阶型固定柱: 位置({x}, {y})")

print(f"已添加3个PCB固定台阶圆柱")

# ========== 4. 右侧壁开孔（+X方向）==========
# 创建孔切割体
# 孔尺寸：15mm (Y) x 5mm (Z)，穿透右侧壁
with BuildPart() as side_hole_builder:
    Box(WALL_THICKNESS + 0.5, BOTTOM_HOLE_LENGTH, BOTTOM_HOLE_WIDTH)
side_hole = side_hole_builder.part.solid()

# 计算孔的位置
# X方向：从右侧外表面向内穿透
# 右侧外表面在 X = OUTER_LENGTH/2 = 31.5mm
side_x_start = OUTER_LENGTH / 2  # 31.5mm

# Y方向：居中于盒子宽度
side_y_center = 0

# Z方向：居中于盒子高度
side_z_center = 0

# Box默认中心在原点，X方向范围是[-(WALL_THICKNESS+0.5)/2, (WALL_THICKNESS+0.5)/2]
# 需要平移，使孔从X=OUTER_LENGTH/2开始向内穿透
side_hole = side_hole.translate(
    Vector(side_x_start - (WALL_THICKNESS + 0.5) / 2, side_y_center, side_z_center))

# 在盒子上开孔
pcb_box = pcb_box - side_hole
print(f"已在右侧壁开孔: {BOTTOM_HOLE_LENGTH} x {BOTTOM_HOLE_WIDTH} mm (Y×Z)")
print(f"  孔位置: X起点={side_x_start}mm, Y居中, Z居中")

# ========== 4.1 左侧壁USB槽（-X方向）==========
# USB-C开孔尺寸
USB_HOLE_WIDTH = 20     # mm，开孔宽度（Y方向）
USB_HOLE_HEIGHT = 5     # mm，开孔高度（Z方向）
USB_HOLE_THICKNESS = WALL_THICKNESS + 0.5  # mm，穿透壁厚

# 创建USB开孔切割体
usb_cutout = create_usb_hole_cutout(
    width=USB_HOLE_WIDTH,
    height=USB_HOLE_HEIGHT,
    thickness=USB_HOLE_THICKNESS,
    x=0
)

# 绕Z轴旋转90度，在XY平面内旋转形状，同时保持-X拉伸方向
# 再绕Y轴旋转90度，调整开孔方向
usb_cutout = usb_cutout.rotate(Axis.Z, 90).rotate(Axis.Y, 270)

# 定位到左侧壁（-X方向）
# 左侧外表面在 X = -OUTER_LENGTH/2
# create_usb_hole_cutout创建的开孔从X=0向-X方向拉伸，需要平移到左侧壁
# Y方向居中（以X轴对称）
usb_cutout = usb_cutout.translate(
    Vector(-OUTER_LENGTH / 2, 0, 0))

# 在盒子上开孔
cut_result = pcb_box - usb_cutout
# 处理可能的Compound结果
if isinstance(cut_result, list):
    pcb_box = cut_result[0] if len(cut_result) > 0 else pcb_box
elif hasattr(cut_result, 'wrapped'):
    pcb_box = cut_result
else:
    pcb_box = cut_result
print(f"已在左侧壁开USB槽: {USB_HOLE_WIDTH} x {USB_HOLE_HEIGHT} mm")
print(f"  孔位置: X起点={-OUTER_LENGTH / 2}mm, Y居中, Z居中")

# ========== 4.2 底板螺丝孔（与立柱对齐）==========
# 在底面（XY平面）上开2个M2沉头螺丝孔，孔沿Z轴方向穿透底板
# 底板位置：Z = -BOX_HEIGHT/2 到 -BOX_HEIGHT/2 + BOTTOM_THICKNESS，即 Z = -10mm 到 -8mm
# 沉头面与底板底面齐平，通孔穿透底板
# 位置：X = ±19.5mm，Y = 0（居中）

strut_hole_depth = BOTTOM_THICKNESS + 0.5  # 2.5mm，穿透底板

for i, hole_x in enumerate([-STRUT_HOLE_X_OFFSET, STRUT_HOLE_X_OFFSET], 1):
    # 沉头面与底板底面齐平（Z = -BOX_HEIGHT/2 = -10mm）
    hole_z_pos = -BOX_HEIGHT / 2 + BOTTOM_THICKNESS

    # 创建M2沉头螺丝孔
    strut_hole = create_m2_countersunk_hole_at(
        x=hole_x,
        y=0,
        z=hole_z_pos,
        thru_hole_depth=strut_hole_depth
    )

    # 在盒子上开孔
    pcb_box = pcb_box - strut_hole
    print(
        f"已在底板开M2沉头螺丝孔{i}: X={hole_x}mm, Y=0mm, Z={hole_z_pos}mm, 头部φ3.7mm, 通孔φ2.2mm")

# ========== 5. 外角边缘导角 ==========
all_edges = pcb_box.edges()

# 选择需要倒角的边缘：外角垂直边缘（平行于Z轴的边缘）
fillet_edges = [
    e for e in all_edges
    if (abs(e.position_at(0).X) > OUTER_LENGTH / 2 - 1 and
        abs(e.position_at(0).Y) > OUTER_WIDTH / 2 - 1 and
        abs(e.position_at(0).Z - e.position_at(1).Z) > 1)  # 平行于Z轴的垂直边缘
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
