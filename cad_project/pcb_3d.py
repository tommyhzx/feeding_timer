"""
PCB 3D 结构件 - 用于验证 PCB 能否放入外壳
"""

from build123d import *
from ocp_vscode import show

# 导入安装孔参数
from mounting_holes import HOLE_DIAMETER, get_hole_positions

# PCB 板框尺寸 (与 boardOutline.ts 一致: 114mm x 44mm)
pcb_length = 114.0-0.1
pcb_width = 44.0-0.1
pcb_thickness = 1.6  # 标准 PCB 厚度

# 安装孔位置
hole_positions = get_hole_positions(pcb_length, pcb_width)

# 创建 PCB 板框实体
pcb_box = Box(pcb_length, pcb_width, pcb_thickness)

# PCB底部四角导角（半径2mm）- Z方向的4条垂直边缘
pcb_fillet_radius = 2.0  # mm
pcb_solid = pcb_box.solid()
pcb_z_edges = [e for e in pcb_solid.edges() if abs(
    e.position_at(0).Z - e.position_at(1).Z) > 1]
if pcb_z_edges:
    pcb_box = pcb_solid.fillet(pcb_fillet_radius, pcb_z_edges)

# 从 PCB 底部挖4个安装孔（穿透整个板子）
for x, y in hole_positions:
    hole = Cylinder(radius=HOLE_DIAMETER / 2+0.1, height=pcb_thickness * 2)
    hole = hole.translate(Vector(x, y, 0))
    pcb_box = pcb_box - hole

pcb_part = pcb_box
show(pcb_part, names=["PCB_Board"], colors=["#27AE60"])
