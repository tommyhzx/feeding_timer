"""
安装孔参数共享模块
"""

from build123d import Cylinder, Vector, CenterArc, Line, BuildSketch, BuildLine, Plane, extrude, make_face

# 安装孔参数
HOLE_DIAMETER = 4.0  # 安装孔直径
HOLE_OFFSET = 5.0  # 距边缘距离

# 台阶型圆柱参数
STEP1_DIAMETER = 6.0  # 底层直径6mm
STEP1_HEIGHT = 1.0    # 底层高度1mm
STEP2_DIAMETER = 4.0  # 上层直径4mm
STEP2_HEIGHT = 3.0    # 上层高度3mm


def create_stepped_cylinder(x, y):
    """创建台阶型圆柱

    Args:
        x, y: 圆柱中心位置

    Returns:
        台阶型圆柱实体
    """
    step1 = Cylinder(radius=STEP1_DIAMETER/2, height=STEP1_HEIGHT)
    step1 = step1.translate(Vector(x, y, 0))

    step2 = Cylinder(radius=STEP2_DIAMETER/2, height=STEP2_HEIGHT)
    step2 = step2.translate(Vector(x, y, STEP1_HEIGHT))

    return step1 + step2


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

    # 测试USB开孔：width=24, height=12, thickness=5
    print("测试USB开孔...")
    usb_hole = create_usb_hole_cutout(width=24.0, height=12.0, thickness=5.0)
    show(usb_hole)
