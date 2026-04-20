"""
安装孔参数共享模块
"""

from build123d import *
import build123d as b123d

# 安装孔参数
HOLE_DIAMETER = 4.0  # 安装孔直径
HOLE_OFFSET = 5.0  # 距边缘距离

# 台阶型圆柱参数
STEP1_DIAMETER = 6.0  # 底层直径6mm
STEP1_HEIGHT = 1.0    # 底层高度1mm
STEP2_DIAMETER = 4.0  # 上层直径4mm
STEP2_HEIGHT = 3.0    # 上层高度3mm


def create_stepped_cylinder(x, y, z_offset=0, step1_dia=None, step1_height=None, step2_dia=None, step2_height=None):
    """创建台阶型圆柱（中心对称）

    Args:
        x, y: 圆柱中心位置
        z_offset: Z方向偏移量（可选）
        step1_dia: 底层直径（可选，默认使用 STEP1_DIAMETER）
        step1_height: 底层高度（可选，默认使用 STEP1_HEIGHT）
        step2_dia: 上层直径（可选，默认使用 STEP2_DIAMETER）
        step2_height: 上层高度（可选，默认使用 STEP2_HEIGHT）

    Returns:
        台阶型圆柱实体
    """
    # 使用传入参数或默认常量
    d1 = step1_dia if step1_dia is not None else STEP1_DIAMETER
    h1 = step1_height if step1_height is not None else STEP1_HEIGHT
    d2 = step2_dia if step2_dia is not None else STEP2_DIAMETER
    h2 = step2_height if step2_height is not None else STEP2_HEIGHT

    # 计算台阶圆柱的总高度和半高（用于居中）
    total_height = h1 + h2
    half_height = total_height / 2

    with BuildPart(Location(Vector(x, y, 0))) as stepped_cyl:
        # 底层圆柱：从Z=-half_height开始，向上生长h1
        with Locations(Location(Vector(0, 0, -half_height))):
            Cylinder(radius=d1/2, height=h1,
                     align=(Align.CENTER, Align.CENTER, Align.MIN))
        # 上层圆柱：从底层圆柱顶部开始，向上生长h2
        step1_top_z = -half_height + h1  # 底层圆柱的顶部Z坐标
        with Locations(Location(Vector(0, 0, step1_top_z))):
            Cylinder(radius=d2/2, height=h2,
                     align=(Align.CENTER, Align.CENTER, Align.MIN))

    # 将整个台阶圆柱向上平移z_offset
    result = stepped_cyl.part.solid()
    if z_offset != 0:
        result = result.translate(Vector(0, 0, z_offset))
    return result


def get_hole_positions(length, width):
    """
    计算安装孔位置（4个角）

    Args:
        length: 板子长度
        width: 板子宽度

    Returns:
        4个孔的 (x, y) 坐标列表
    """
    half_l = length / 2
    half_w = width / 2
    return [
        (-half_l + HOLE_OFFSET, -half_w + HOLE_OFFSET),  # 左下角
        (half_l - HOLE_OFFSET, -half_w + HOLE_OFFSET),   # 右下角
        (-half_l + HOLE_OFFSET, half_w - HOLE_OFFSET),    # 左上角
        (half_l - HOLE_OFFSET, half_w - HOLE_OFFSET),     # 右上角
    ]


def create_usb_hole_cutout(width, height, thickness, x=0):
    """创建USB开孔切割体（体育场形状：矩形+两边半圆）

    以原点为中心对称分布。

    Args:
        width: 开孔宽度（两圆弧圆心之间的距离）
        height: 开孔高度（圆弧直径）
        thickness: 厚度（拉伸深度，沿X轴负方向）
        x: 开孔起始X坐标，默认0

    Returns:
        USB开孔切割体
    """
    half_width = width / 2
    half_height = height / 2

    with BuildSketch(Plane.YZ) as usb_profile:
        with BuildLine():
            # 左半圆：圆心在 (-half_width, 0)，从顶部(-Z侧)经过左端点(-Y侧)到顶部(+Z侧)，逆时针
            left_arc = CenterArc(
                center=(-half_width, 0),
                radius=half_height,
                start_angle=90,
                arc_size=180
            )
            # 顶部直线
            top_line = Line(
                (-half_width, half_height),
                (half_width, half_height)
            )
            # 右半圆：圆心在 (half_width, 0)，从顶部经过右端点到顶部，顺时针
            right_arc = CenterArc(
                center=(half_width, 0),
                radius=half_height,
                start_angle=90,
                arc_size=-180
            )
            # 底部直线
            bottom_line = Line(
                (half_width, -half_height),
                (-half_width, -half_height)
            )
        make_face()

    # 向-X方向拉伸，然后偏移到指定X位置
    usb_cutout = extrude(usb_profile, amount=-thickness)
    return usb_cutout.translate(Vector(x, 0, 0))


if __name__ == "__main__":
    from ocp_vscode import show

    # 测试台阶圆柱
    print("测试台阶圆柱...")
    stepped_cyl = create_stepped_cylinder(
        x=0,
        y=0,
        z_offset=0,
        step1_dia=4.0,
        step1_height=2.0,
        step2_dia=2.8,
        step2_height=3.0
    )
    show(stepped_cyl)

    # # 测试USB开孔：width=24, height=12, thickness=5
    # print("测试USB开孔...")
    # usb_hole = create_usb_hole_cutout(width=24.0, height=12.0, thickness=5.0)
    # show(usb_hole)
