"""
PCB 外壳 - build123d
用于罩住 113.9mm x 43.9mm 的 PCB，PCB 在 XZ 平面竖直放置
Y- 方向开口，套在 PCB 上，用螺丝固定到 screen_frame 的定位柱
"""

from build123d import *
from ocp_vscode import show

# ========== PCB 参数 ==========
PCB_LENGTH = 113.9      # mm，PCB 长度 (X方向)
PCB_HEIGHT = 43.9       # mm，PCB 高度 (Z方向)
PCB_THICKNESS = 1.6     # mm，PCB 厚度 (Y方向)
PCB_HOLE_OFFSET = 5.0   # mm，孔距边缘距离
PCB_HOLE_DIA = 4.0      # mm，PCB 安装孔直径

# ========== 外壳参数 ==========
CLEARANCE = 2.0         # mm，容腔间隙（各方向）
WALL_THICKNESS = 2.0    # mm，壁厚
SCREW_HOLE_DIA = 3.0    # mm，螺丝孔直径（M2.5 螺丝）

# ========== 容腔尺寸计算 ==========
# 容腔 = PCB + 间隙
INNER_LENGTH = PCB_LENGTH + 2 * CLEARANCE       # 117.9mm
INNER_HEIGHT = PCB_HEIGHT + 2 * CLEARANCE       # 47.9mm
INNER_DEPTH = PCB_THICKNESS + CLEARANCE         # 3.6mm

# 外框尺寸
OUTER_LENGTH = INNER_LENGTH + 2 * WALL_THICKNESS    # 121.9mm
OUTER_HEIGHT = INNER_HEIGHT + 2 * WALL_THICKNESS    # 51.9mm
OUTER_DEPTH = INNER_DEPTH + WALL_THICKNESS          # 5.6mm

# ========== 定位柱参数（与 screen_frame 对应）==========
# screen_frame 的定位柱位置
FRAME_WIDTH = 36.0      # screen_frame 的宽度
y_plus_inner = FRAME_WIDTH / 2  # 18mm

# 定位柱位置（使用 PCB 实际安装孔位置）
PCB_HOLE_OFFSET = 5.0  # mm，孔距边缘距离
mount_hole_x = PCB_LENGTH / 2 - PCB_HOLE_OFFSET   # 51.95mm
mount_hole_z = PCB_HEIGHT / 2 - PCB_HOLE_OFFSET   # 16.95mm

# 定位柱位置（与 screen_frame 相同）
mount_positions = [
    (-mount_hole_x, mount_hole_z),   # 左下
    (mount_hole_x, mount_hole_z),    # 右下
    (-mount_hole_x, -mount_hole_z),  # 左上
    (mount_hole_x, -mount_hole_z),   # 右上
]

print(f"PCB 外壳设计")
print(f"PCB 尺寸: {PCB_LENGTH} x {PCB_HEIGHT} x {PCB_THICKNESS} mm")
print(f"容腔尺寸: {INNER_LENGTH} x {INNER_HEIGHT} x {INNER_DEPTH} mm")
print(f"外框尺寸: {OUTER_LENGTH} x {OUTER_HEIGHT} x {OUTER_DEPTH} mm")

# ========== 1. 创建外框盒子 ==========
with BuildPart() as outer:
    Box(OUTER_LENGTH, OUTER_DEPTH, OUTER_HEIGHT)
outer_solid = outer.part.solid()
print(f"已创建外框")

# ========== 2. 创建内腔（Y- 方向开口） ==========
# 内腔从 Y- 方向去除，保留 Y+ 方向的封闭端
# 内腔起点在 Y = -OUTER_DEPTH/2，向 +Y 方向延伸
with BuildPart() as inner_builder:
    Box(INNER_LENGTH, INNER_DEPTH, INNER_HEIGHT)
inner_box = inner_builder.part.solid()

# 内腔在 XZ 平面居中，Y 方向从 -OUTER_DEPTH/2 开始
inner_box = inner_box.translate(Vector(0, -OUTER_DEPTH/2 + INNER_DEPTH/2, 0))

# 外框减内腔，形成带一端开口的盒子
cover = outer_solid - inner_box
print(f"已创建内腔（Y- 方向开口）")

# ========== 3. 创建螺丝孔（穿透外壳） ==========
# 螺丝孔位置与 screen_frame 定位柱对应
# 螺丝从外壳外侧（Y+ 方向）穿入，连接到定位柱
# 定位柱长度 6mm，从 y_plus_inner=18mm 伸出
# 螺丝需要穿透外壳壁厚并进入定位柱

# 外壳 Y+ 方向的外表面位置
cover_y_outer = OUTER_DEPTH / 2  # 2.8mm
# 定位柱从 screen_frame 的 Y+ 侧壁内表面（Y=18mm）伸出
# 外壳套在 PCB 上后，螺丝孔需要让螺丝穿过

# 螺丝孔沿 Y 轴方向，穿透外壳
screw_hole_length = WALL_THICKNESS + 2  # 穿透壁厚，额外留余量

for i, (x, z) in enumerate(mount_positions, 1):
    with BuildPart() as screw_hole:
        Cylinder(radius=SCREW_HOLE_DIA/2, height=screw_hole_length,
                 align=(Align.CENTER, Align.MIN, Align.CENTER))

    # 螺丝孔从外壳 Y+ 外表面向 -Y 方向穿透
    hole = screw_hole.part.solid()
    hole = hole.rotate(Axis.X, -90)  # 使轴向沿 -Y
    hole = hole.translate(Vector(x, cover_y_outer, z))

    cover = cover - hole
    print(f"已创建第 {i} 个螺丝孔: 位置(X={x}, Z={z})")

# ========== 4. 可选：USB 开孔（如需要） ==========
# 如果 PCB 侧边有 USB 接口，需要在外壳侧面开孔
# 这里先注释掉，根据需要启用
# USB_HOLE_WIDTH = 24.0
# USB_HOLE_HEIGHT = 6.0
# usb_x = 0  # 根据实际 PCB 调整
# usb_z = 0
#
# with BuildSketch(Plane.XZ) as usb_profile:
#     # 体育场形状
#     with BuildLine():
#         half_w = USB_HOLE_WIDTH / 2
#         half_h = USB_HOLE_HEIGHT / 2
#         CenterArc(center=(-half_w, 0), radius=half_h, start_angle=90, arc_size=180)
#         Line((-half_w, half_h), (half_w, half_h))
#         CenterArc(center=(half_w, 0), radius=half_h, start_angle=90, arc_size=-180)
#         Line((half_w, -half_h), (-half_w, -half_h))
#     make_face()
#
# usb_cutout = extrude(usb_profile, amount=WALL_THICKNESS + 1)
# usb_cutout = usb_cutout.translate(Vector(usb_x, -OUTER_DEPTH/2, usb_z))
# cover = cover - usb_cutout
# print(f"已创建 USB 开孔")

# ========== 5. 边缘倒角 ==========
FILLET_RADIUS = 1.0

# Y+ 方向外边缘（封闭端）
outer_edges_y = [
    e for e in cover.edges()
    if (abs(e.position_at(0).Y) > OUTER_DEPTH/2 - 0.5
        and abs(e.position_at(1).Y) > OUTER_DEPTH/2 - 0.5)
]

if outer_edges_y:
    try:
        cover = cover.fillet(FILLET_RADIUS, outer_edges_y)
        print(f"Y 方向边缘倒角完成: {len(outer_edges_y)} 条")
    except Exception as e:
        print(f"Y 方向边缘倒角失败: {e}")

# Y- 方向开口边缘（套口）
inner_edges_y = [
    e for e in cover.edges()
    if (abs(e.position_at(0).Y - (-OUTER_DEPTH/2)) < 0.5
        and abs(e.position_at(1).Y - (-OUTER_DEPTH/2)) < 0.5)
]

if inner_edges_y:
    try:
        cover = cover.fillet(0.5, inner_edges_y)
        print(f"开口边缘倒角完成: {len(inner_edges_y)} 条")
    except Exception as e:
        print(f"开口边缘倒角失败: {e}")

print(f"\nPCB 外壳完成！")
print(f"外壳模型: {cover}")

# ========== 导出模型供其他模块使用 ==========
pcb_cover_model = cover


def get_pcb_cover():
    """返回 PCB 外壳模型副本"""
    return pcb_cover_model


if __name__ == "__main__":
    # 仅在直接运行时显示
    show(cover)
