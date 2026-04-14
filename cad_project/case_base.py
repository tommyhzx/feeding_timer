"""
键盘底壳 - build123d
简单的长方体外壳，3mm壁厚，10mm深度
"""

import ezdxf
from build123d import *
import build123d as b123d
from ocp_vscode import show
import json
import os

# 导入 PCB 3D 结构件
from pcb_3d import pcb_part

# 导入安装孔参数
from mounting_holes import get_hole_positions, create_stepped_cylinder, create_usb_hole_cutout

# 导入上壳模型
from case_top import top_case_model

# 常量
SHELL_THICKNESS = 3.0  # mm，外壳壁厚
CASE_LENGTH = 120.0  # mm，长度
CASE_WIDTH = 85.0  # mm，宽度
CASE_DEPTH = 10.0  # mm，深度

# 创建外壳（底部和侧壁一体的中空盒子）
with BuildPart() as outer:
    # 创建外壳外框
    Box(CASE_LENGTH, CASE_WIDTH, CASE_DEPTH)

# 获取外壳实体
outer_solid = outer.part.solid()

# 创建内腔（比外壳小一圈，形成壁厚）
inner_length = CASE_LENGTH - 2 * SHELL_THICKNESS
inner_width = CASE_WIDTH - 2 * SHELL_THICKNESS
inner_depth = CASE_DEPTH - SHELL_THICKNESS  # 底部保留壁厚

# 创建内芯并向上偏移
inner_box = Box(inner_length, inner_width, inner_depth)
inner_box = inner_box.translate(Vector(0, 0, SHELL_THICKNESS))

# 内腔底部四角导角（半径2mm）- Z方向的4条垂直边缘
CAVITY_FILLET_RADIUS = 2.0  # mm
inner_box_solid = inner_box.solid()
cavity_z_edges = [e for e in inner_box_solid.edges() if abs(e.position_at(0).Z - e.position_at(
    1).Z) > 1 and (abs(e.position_at(0).Z - (-0.5)) < 0.1 or abs(e.position_at(1).Z - (-0.5)) < 0.1)]
if cavity_z_edges:
    inner_box = inner_box_solid.fillet(CAVITY_FILLET_RADIUS, cavity_z_edges)

# 外壳减去内芯，得到中空外壳
final_case = outer_solid - inner_box

# 圆柱参数
HOLE_OFFSET = SHELL_THICKNESS + 4.0  # 内壁厚度 + 2mm偏移

# 圆柱位置（4个角，使用内腔尺寸计算，与PCB孔位对齐）
hole_positions = get_hole_positions(inner_length, inner_width)

# 创建台阶型圆柱（底层直径6mm高1mm + 上层直径4mm高3mm）
for i, (x, y) in enumerate(hole_positions, 1):
    cylinder = create_stepped_cylinder(x, y)
    final_case = final_case + cylinder
    print(f"已创建第 {i} 个台阶型圆柱: 位置({x}, {y})")

# ========== USB开孔切割 ==========
# USB开孔参数（体育场形状：矩形+两边半圆）
USB_HOLE_WIDTH = 24.0    # 宽度24mm
USB_HOLE_HEIGHT = 2.5  # 高度8mm（小于外壳深度10mm）
USB_HOLE_X = -CASE_LENGTH / 2 + SHELL_THICKNESS  # X位置：左侧壁内侧

# 创建USB开孔（以原点为中心对称，只穿透壁厚）
usb_cutout = create_usb_hole_cutout(
    width=USB_HOLE_WIDTH,
    height=USB_HOLE_HEIGHT,
    thickness=SHELL_THICKNESS+1,  # 3mm（壁厚）
    x=0                # X=-57（左侧壁内侧）
)
# 绕Z轴旋转90度，再绕Y轴旋转90度，再沿X轴平移-60
usb_cutout = usb_cutout.rotate(axis=Axis.Z, angle=90)
usb_cutout = usb_cutout.rotate(axis=Axis.Y, angle=90)
usb_cutout = usb_cutout.translate(Vector(-56, 0, 0))
usb_cutout = usb_cutout.translate(Vector(0, 0, 2))
final_case = final_case - usb_cutout
print(
    f"已创建USB开孔: 宽{USB_HOLE_WIDTH}mm, 高{USB_HOLE_HEIGHT}mm, 厚{SHELL_THICKNESS}mm, X={USB_HOLE_X}")
# ========== USB开孔完成 ==========

# 底部四边导角（半径2mm）- 对外壳底部4个角落的垂直边缘导角
FILLET_RADIUS_BOTTOM = 2.0  # 底部导角半径
# 筛选底部角落的4条垂直边缘（只选竖直的角落边缘）
all_edges = final_case.edges()
corner_edges = [
    e for e in all_edges
    if abs(e.position_at(0).X) > CASE_LENGTH / 2 - 1
    and abs(e.position_at(0).Y) > CASE_WIDTH / 2 - 1
    and e.position_at(0).Z < 0
    and abs(e.position_at(0).Z - e.position_at(1).Z) > 1  # 垂直边缘
]
print(f"角落垂直边缘数量: {len(corner_edges)}")
# 对角落垂直边缘进行导角
final_case = final_case.fillet(FILLET_RADIUS_BOTTOM, corner_edges)

# 底部外围4条水平边缘的导角
# 获取z=-5处的所有水平边缘
all_edges = final_case.edges()
bottom_edges = [
    e for e in all_edges
    if abs(e.position_at(0).Z - (-5.0)) < 0.1
    and abs(e.position_at(1).Z - (-5.0)) < 0.1
    and abs(e.position_at(0).X) > CASE_LENGTH / 2 - 1
]
print(f"底部外围水平边缘数量: {len(bottom_edges)}")
# 对底部外围水平边缘进行导角
final_case = final_case.fillet(FILLET_RADIUS_BOTTOM, bottom_edges)

print(f"外壳尺寸: {CASE_LENGTH} x {CASE_WIDTH} x {CASE_DEPTH} mm")
print(f"壁厚: {SHELL_THICKNESS} mm")
print(f"圆柱位置: {hole_positions}")
print(f"最终外壳: {final_case}")

# 显示结果 - 同时显示外壳、PCB和上壳
# 将 PCB 放置在内腔底部 (z=0 是内腔底部平面)
pcb_placed = pcb_part.translate(Vector(0, 0, 15))
# 将上壳放置在 z=30 的位置
top_case_placed = top_case_model.translate(Vector(0, 0, 25))
show((final_case, pcb_placed, top_case_placed), names=[
     "Keyboard_Case_Base", "PCB_Board", "Case_Top"], colors=["#EB8B50", "#2C3E50", "#27AE60"])


# # ========== 导出内框DXF ==========

# SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# doc = ezdxf.new()
# doc.layers.add("inner_cavity", color=7)
# msp = doc.modelspace()

# # 内框4个角点（以原点为中心）
# half_l = inner_length / 2
# half_w = inner_width / 2
# inner_points = [
#     (-half_l, -half_w),
#     (half_l, -half_w),
#     (half_l, half_w),
#     (-half_l, half_w),
# ]

# # 画4条线
# for i in range(4):
#     start = inner_points[i]
#     end = inner_points[(i + 1) % 4]
#     msp.add_line(start, end, dxfattribs={"layer": "inner_cavity", "color": 7})

# dxf_output_path = os.path.join(SCRIPT_DIR, "inner_cavity_outline.dxf")
# doc.saveas(dxf_output_path)
# print(f"已导出内框DXF到: {dxf_output_path}")
# # ========== 导出DXF完成 ==========
