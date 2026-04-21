"""
内部结构装配 - build123d
底座 + 屏幕盒 + 支撑板的装配设计
屏幕盒面朝Y方向，放置在底座上方10mm处
"""

from pcb_box import BOTTOM_THICKNESS, BOX_HEIGHT, OUTER_LENGTH, OUTER_WIDTH
from screen_box import get_screen_box, SCREEN_BOX_LENGTH, SCREEN_BOX_WIDTH, SCREEN_BOX_DEPTH
from base_strut import get_base_strut, BASE_LENGTH, BASE_WIDTH, BASE_THICKNESS, STRUT_SIZE
from pcb_box import get_pcb_box
from base_cover import get_base_cover
from build123d import *
from ocp_vscode import show
import sys
import os

# 添加cad_project目录到路径，以便导入screen_box
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# ========== 装配参数 ==========
GAP_HEIGHT = 20.0  # mm，底座顶面到屏幕盒底面的间隙

# ========== 外壳参数 ==========
COVER_LENGTH = 120.0  # mm，X方向
COVER_WIDTH = 45.0    # mm，Y方向
COVER_HEIGHT = 60.0   # mm，Z方向

print(f"内部结构装配设计")
print(f"底座尺寸: {BASE_LENGTH} x {BASE_WIDTH} x {BASE_THICKNESS} mm")
print(f"屏幕盒尺寸: {SCREEN_BOX_LENGTH} x {SCREEN_BOX_WIDTH} x {SCREEN_BOX_DEPTH} mm")
print(f"间隙高度: {GAP_HEIGHT} mm")

# ========== 1. 从新模块获取底座和立柱 ==========
base_strut_model = get_base_strut()
base_solid = base_strut_model['base']
support_solid = base_strut_model['strut']
STRUT_HEIGHT = base_strut_model['strut_height']
print(f"已从 base_strut 模块导入底座和立柱")

# ========== 2. 导入并定位屏幕盒 ==========
# 导入屏幕盒模型
screen_box_original = get_screen_box()

# 旋转屏幕盒：绕X轴旋转-90度，使开口面朝+Y方向
# 原始方向：开口朝+Z方向
# 旋转后：长(79mm)沿X方向，宽(36mm)沿Y方向，深(15mm)沿Z方向
screen_box = screen_box_original.rotate(Axis.X, -90)

# 计算屏幕盒Z方向位置
# 屏幕盒旋转后，Z方向尺寸为原宽度(WIDTH=36mm)
# 底座顶面在Z=BASE_THICKNESS/2 = 1mm
# 屏幕盒底面在Z=1+GAP_HEIGHT = 21mm
# 屏幕盒Z中心在Z=1+GAP_HEIGHT+SCREEN_BOX_WIDTH/2 = 1+20+18 = 39mm
# 向下移动10mm，与立柱缩短10mm保持一致
screen_box_z_center = BASE_THICKNESS/2 + GAP_HEIGHT + SCREEN_BOX_WIDTH/2 - 10.0

# Y方向：屏幕盒位置计算
# 屏幕盒绕X轴旋转-90度后：
#   - 原Z方向→Y方向，原Y方向→Z方向
#   - Y方向尺寸变为DEPTH(15mm)，Z方向尺寸变为WIDTH(36mm)
#   - 开口朝+Y方向，底板在-Y方向
# 屏幕盒底板贴着立柱+Y面（立柱在Y=0，尺寸8mm，+Y面在Y=4mm）
screen_box_y_center = STRUT_SIZE / 2 + SCREEN_BOX_DEPTH / 2
screen_box = screen_box.translate(
    Vector(0, screen_box_y_center, screen_box_z_center))

print(f"已导入并定位屏幕盒")
print(f"  旋转: 绕X轴-90度，开口面朝+Y方向")
print(f"  位置: Y中心={screen_box_y_center} mm（靠底座+Y侧对齐）")
print(f"  位置: Z中心={screen_box_z_center} mm")
print(
    f"  屏幕盒Y范围: [{screen_box_y_center - SCREEN_BOX_WIDTH/2}, {screen_box_y_center + SCREEN_BOX_WIDTH/2}]")
print(
    f"  屏幕盒Z范围: [{screen_box_z_center - SCREEN_BOX_DEPTH/2}, {screen_box_z_center + SCREEN_BOX_DEPTH/2}]")

# ========== 3. 导入并定位PCB盒子 ==========
# 导入PCB盒子模型
pcb_box_original = get_pcb_box()

# 旋转PCB盒子：绕Z轴旋转180度，在XY平面上翻转180度
# 新坐标系：长(59mm)沿X方向，宽(32mm)沿Y方向，高(20mm)沿Z方向
# 开口面朝+Z方向（PCB插入方向）
pcb_box = pcb_box_original.rotate(Axis.Z, 180)

# 计算PCB盒子Z方向位置
# 立柱顶面在Z = BASE_THICKNESS/2 + STRUT_HEIGHT = 1 + 56 = 57mm
# PCB盒子高度20mm（Z方向），底板厚度2mm
# PCB盒子Z中心 = 57 + 2 + 10 = 69mm，内腔底面与立柱顶面对齐
strut_top_z = BASE_THICKNESS/2 + STRUT_HEIGHT
pcb_box_z_center = strut_top_z + BOX_HEIGHT/2

# X方向：与立柱中轴线对齐（X=0）
pcb_box_x_center = 0

# Y方向：与底座中心对齐（Y=0）
pcb_box_y_center = 0

pcb_box = pcb_box.translate(
    Vector(pcb_box_x_center, pcb_box_y_center, pcb_box_z_center))

print(f"已导入并定位PCB盒子")
print(f"  旋转: 绕Z轴180度，开口面朝+Z方向")
print(f"  位置: X中心={pcb_box_x_center} mm（与立柱中轴线对齐）")
print(f"  位置: Y中心={pcb_box_y_center} mm（与底座中心对齐）")
print(
    f"  位置: Z中心={pcb_box_z_center} mm（立柱顶面+{BOTTOM_THICKNESS+BOX_HEIGHT/2}mm）")
print(
    f"  PCB盒子Z范围: [{pcb_box_z_center - BOX_HEIGHT/2}, {pcb_box_z_center + BOX_HEIGHT/2}]")

# ========== 4. 导入并定位外壳 ==========
# 导入外壳模型
base_cover_original = get_base_cover()

# 外壳不需要旋转，保持原方向
# 外壳：X=120mm, Y=45mm, Z=80mm
# 正面开口朝+Y方向，底部开口
base_cover = base_cover_original

# 计算外壳Z方向位置
# 底座底面在 Z = -BASE_THICKNESS/2 = -1mm
# 外壳底部应与底座底面对齐（因为底座厚度2mm，外壳直接罩在底座上）
# 外壳高度80mm，Z中心 = -1 + 80/2 = 39mm
# 向上偏移10mm
base_cover_z_center = -BASE_THICKNESS/2 + COVER_HEIGHT / 2 + 10.0

# X方向：与底座中心对齐（X=0）
base_cover_x_center = 0

# Y方向：与底座中心对齐（Y=0）
base_cover_y_center = 0

base_cover = base_cover.translate(
    Vector(base_cover_x_center, base_cover_y_center, base_cover_z_center))

print(f"已导入并定位外壳")
print(f"  位置: X中心={base_cover_x_center} mm（与底座中心对齐）")
print(f"  位置: Y中心={base_cover_y_center} mm（与底座中心对齐）")
print(f"  位置: Z中心={base_cover_z_center} mm（底座底面对齐）")
print(
    f"  外壳Z范围: [{base_cover_z_center - COVER_HEIGHT/2}, {base_cover_z_center + COVER_HEIGHT/2}]")

# ========== 5. 创建装配体 ==========
# 将所有部件组合成一个装配体（保持为独立部件，便于分别打印）
# 使用compound对象包含所有部件
assembly_parts = [base_solid, support_solid, screen_box, pcb_box, base_cover]

print(f"\n装配完成！")
print(f"包含 {len(assembly_parts)} 个部件:")
print(f"  1. 底座: {BASE_LENGTH} x {BASE_WIDTH} x {BASE_THICKNESS} mm")
print(f"  2. 支撑板: 2个方形立柱（X方向）")
print(
    f"  3. 屏幕盒: {SCREEN_BOX_LENGTH} x {SCREEN_BOX_WIDTH} x {SCREEN_BOX_DEPTH} mm")
print(
    f"  4. PCB盒子: {OUTER_LENGTH} x {OUTER_WIDTH} x {BOX_HEIGHT} mm")
print(f"  5. 外壳: {COVER_LENGTH} x {COVER_WIDTH} x {COVER_HEIGHT} mm")

# ========== 导出模型供其他模块使用 ==========
assembly_model = {
    'base': base_solid,
    'support': support_solid,
    'screen_box': screen_box,
    'pcb_box': pcb_box,
    'base_cover': base_cover,
    'all': assembly_parts
}


def get_assembly():
    """返回装配体所有部件"""
    return assembly_model


def get_base():
    """返回底座模型"""
    return base_solid


def get_support():
    """返回支撑板模型"""
    return support_solid


def get_screen_box():
    """返回定位后的屏幕盒模型"""
    return screen_box


def get_pcb_box():
    """返回定位后的PCB盒子模型"""
    return pcb_box


def get_base_cover():
    """返回定位后的外壳模型"""
    return base_cover


if __name__ == "__main__":
    # 显示所有部件
    print("\n显示装配体...")
    show(*assembly_parts)
