"""
内部结构装配 - build123d
底座 + 屏幕盒 + 支撑板的装配设计
屏幕盒面朝Y方向，放置在底座上方10mm处
"""

from screen_box import get_screen_box
from build123d import *
from ocp_vscode import show
import sys
import os

# 添加cad_project目录到路径，以便导入screen_box
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# ========== 底座参数 ==========
BASE_LENGTH = 120.0  # mm，X方向
BASE_WIDTH = 45.0    # mm，Y方向
BASE_THICKNESS = 2.0  # mm，Z方向

# ========== 屏幕盒参数（从screen_box.py） ==========
SCREEN_BOX_LENGTH = 79.0  # mm
SCREEN_BOX_WIDTH = 36.0   # mm
SCREEN_BOX_DEPTH = 15.0   # mm

# ========== 装配参数 ==========
GAP_HEIGHT = 20.0  # mm，底座顶面到屏幕盒底面的间隙

# ========== 支撑板参数 ==========
# 注意：屏幕盒旋转-90度后，底板在XY平面的投影尺寸变化：
#   X方向不变（长度79mm）
#   Y方向变为原深度（15mm）
SUPPORT_LENGTH = SCREEN_BOX_LENGTH  # 79mm，X方向
SUPPORT_WIDTH = SCREEN_BOX_DEPTH    # 15mm，Y方向（旋转后的底板投影）
SUPPORT_HEIGHT = GAP_HEIGHT         # 20mm，支柱高度
SUPPORT_THICKNESS = 2.0  # mm，支撑板壁厚

print(f"内部结构装配设计")
print(f"底座尺寸: {BASE_LENGTH} x {BASE_WIDTH} x {BASE_THICKNESS} mm")
print(f"屏幕盒尺寸: {SCREEN_BOX_LENGTH} x {SCREEN_BOX_WIDTH} x {SCREEN_BOX_DEPTH} mm")
print(f"间隙高度: {GAP_HEIGHT} mm")

# ========== 1. 创建底座 ==========
with BuildPart() as base_builder:
    Box(BASE_LENGTH, BASE_WIDTH, BASE_THICKNESS)
base_solid = base_builder.part.solid()
print(f"已创建底座: {BASE_LENGTH} x {BASE_WIDTH} x {BASE_THICKNESS} mm")
print(f"  底座Z范围: [{-BASE_THICKNESS/2}, {BASE_THICKNESS/2}] = [-1, 1] mm")

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

# ========== 3. 创建支撑板 ==========
# 支撑板：四角支柱设计，节省材料
# 支柱位于屏幕盒底板的四个角下方

# 计算支柱位置（相对于屏幕盒底板中心）
# 屏幕盒底板尺寸：79mm x 36mm
# 支柱位于四角，距离边缘一定距离
STRUT_OFFSET = 20.0  # mm，支柱距离边缘的距离
STRUT_SIZE = 8.0    # mm，支柱截面尺寸

# 计算两个支柱的位置（在X方向上）
strut_x = SUPPORT_LENGTH / 2 - STRUT_OFFSET  # 34.5mm

strut_positions = [
    (-strut_x, 0),  # 左侧
    (strut_x, 0),   # 右侧
]

# 计算立柱Y方向偏移：贴着屏幕盒背面（-Y方向的面）
# 屏幕盒背面位置：screen_box_y_center - SCREEN_BOX_DEPTH/2
# 立柱要贴着背面，立柱Y中心应该在背面减去立柱半宽
STRUT_Y_OFFSET = -(SCREEN_BOX_DEPTH / 2 + STRUT_SIZE / 2)

# 计算立柱高度：与屏幕盒Z方向顶面保持一致
# 屏幕盒Z顶面 = screen_box_z_center + SCREEN_BOX_WIDTH/2
# 立柱底面 = BASE_THICKNESS/2
# 立柱高度 = 屏幕盒Z顶面 - 立柱底面
STRUT_HEIGHT = (screen_box_z_center + SCREEN_BOX_WIDTH / 2) - BASE_THICKNESS / 2

# 创建支撑板部件列表
support_parts = []

for i, (x, y) in enumerate(strut_positions, 1):
    # 创建支柱（从底座顶面到屏幕盒顶面）- 方形立柱
    with BuildPart() as strut_builder:
        Box(STRUT_SIZE, STRUT_SIZE, STRUT_HEIGHT,
            align=(Align.CENTER, Align.CENTER, Align.MIN))
    strut = strut_builder.part.solid()

    # 移动支柱到正确位置
    # align=(CENTER, CENTER, MIN)后，支柱Z范围是[0, SUPPORT_HEIGHT]
    # 需要移动到：XY平面对应位置，Z从底座顶面(BASE_THICKNESS/2=1)开始
    final_pos = Vector(x, y + screen_box_y_center +
                       STRUT_Y_OFFSET, BASE_THICKNESS/2)
    print(
        f"  支柱{i} 位置: x={x}, y={y + screen_box_y_center + STRUT_Y_OFFSET}, z={BASE_THICKNESS/2}")
    strut = strut.translate(final_pos)
    support_parts.append(strut)

# 合并所有支柱 - 使用 Compound 保持独立
support_solid = Compound(support_parts)

print(f"已创建支撑板: 2个方形立柱，边长{STRUT_SIZE}mm，高度{STRUT_HEIGHT} mm")

# ========== 4. 创建装配体 ==========
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
