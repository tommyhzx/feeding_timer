"""
内部结构装配 - build123d
底座 + 屏幕盒 + 支撑板的装配设计
屏幕盒面朝Y方向，放置在底座上方10mm处
"""

from screen_box import get_screen_box
from base_strut import get_base_strut, BASE_LENGTH, BASE_WIDTH, BASE_THICKNESS
from build123d import *
from ocp_vscode import show
import sys
import os

# 添加cad_project目录到路径，以便导入screen_box
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# ========== 屏幕盒参数（从screen_box.py） ==========
SCREEN_BOX_LENGTH = 79.0  # mm
SCREEN_BOX_WIDTH = 36.0   # mm
SCREEN_BOX_DEPTH = 15.0   # mm

# ========== 装配参数 ==========
GAP_HEIGHT = 20.0  # mm，底座顶面到屏幕盒底面的间隙

print(f"内部结构装配设计")
print(f"底座尺寸: {BASE_LENGTH} x {BASE_WIDTH} x {BASE_THICKNESS} mm")
print(f"屏幕盒尺寸: {SCREEN_BOX_LENGTH} x {SCREEN_BOX_WIDTH} x {SCREEN_BOX_DEPTH} mm")
print(f"间隙高度: {GAP_HEIGHT} mm")

# ========== 1. 从新模块获取底座和立柱 ==========
base_strut_model = get_base_strut()
base_solid = base_strut_model['base']
support_solid = base_strut_model['strut']
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
screen_box_z_center = BASE_THICKNESS/2 + GAP_HEIGHT + SCREEN_BOX_WIDTH/2

# Y方向：屏幕盒位置计算
# 屏幕盒绕X轴旋转-90度后：
#   - 原Z方向→Y方向，原Y方向→Z方向
#   - Y方向尺寸变为DEPTH(15mm)，Z方向尺寸变为WIDTH(36mm)
#   - 开口朝+Y方向，底板在-Y方向
# 底座+Y边缘在Y=BASE_WIDTH/2 = 22.5mm
# 屏幕盒Y中心计算公式
screen_box_y_center = BASE_WIDTH / 2 - SCREEN_BOX_DEPTH / 2
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

# ========== 3. 创建装配体 ==========
# 将所有部件组合成一个装配体（保持为独立部件，便于分别打印）
# 使用compound对象包含所有部件
assembly_parts = [base_solid, support_solid, screen_box]

print(f"\n装配完成！")
print(f"包含 {len(assembly_parts)} 个部件:")
print(f"  1. 底座: {BASE_LENGTH} x {BASE_WIDTH} x {BASE_THICKNESS} mm")
print(f"  2. 支撑板: 2个方形立柱（X方向）")
print(
    f"  3. 屏幕盒: {SCREEN_BOX_LENGTH} x {SCREEN_BOX_WIDTH} x {SCREEN_BOX_DEPTH} mm")

# ========== 导出模型供其他模块使用 ==========
assembly_model = {
    'base': base_solid,
    'support': support_solid,
    'screen_box': screen_box,
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


if __name__ == "__main__":
    # 显示所有部件
    print("\n显示装配体...")
    show(*assembly_parts)
