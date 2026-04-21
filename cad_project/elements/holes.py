"""
孔洞模块 - 包含各种孔洞的创建函数
"""

from build123d import *
import build123d as b123d


# ========== M2沉头螺丝参数（标准） ==========
M2_HEAD_DIA = 3.7        # 螺丝头直径
M2_HEAD_THICKNESS = 1.2  # 螺丝头厚度
M2_THREAD_DIA = 2.0      # 螺纹直径
M2_THRU_HOLE_DIA = 2.4   # 通孔直径（稍大于螺纹）


def create_m2_countersunk_hole(head_dia=M2_HEAD_DIA,
                               head_thickness=M2_HEAD_THICKNESS,
                               thru_hole_dia=M2_THRU_HOLE_DIA,
                               thru_hole_depth=3.0):
    """创建M2沉头螺丝孔（用于切割）

    由锥形（沉头部分）+ 圆柱（通孔部分）组成。
    孔的沉头面在 Z=0 平面，通孔向 -Z 方向延伸。

    Args:
        head_dia: 螺丝头直径（沉头大径）
        head_thickness: 螺丝头厚度（沉头深度）
        thru_hole_dia: 通孔直径
        thru_hole_depth: 通孔深度

    Returns:
        沉头孔实体（用于布尔减法）
    """
    with BuildPart() as hole_builder:
        # 锥形沉头部分（90°锥角）
        # 沉头面在 Z=0，锥形向 -Z 方向延伸
        # 底部半径=通孔半径（小端），顶部半径=头部半径（大端）
        Cone(bottom_radius=thru_hole_dia / 2,
             top_radius=head_dia / 2,
             height=head_thickness,
             align=(Align.CENTER, Align.CENTER, Align.MAX))
        # 通孔部分（圆柱），从锥形底部继续向 -Z 方向
        with Locations(Location(Vector(0, 0, -head_thickness))):
            Cylinder(thru_hole_dia / 2, thru_hole_depth,
                     align=(Align.CENTER, Align.CENTER, Align.MAX))
    return hole_builder.part.solid()


def create_m2_countersunk_hole_at(x, y, z=0,
                                  head_dia=M2_HEAD_DIA,
                                  head_thickness=M2_HEAD_THICKNESS,
                                  thru_hole_dia=M2_THRU_HOLE_DIA,
                                  thru_hole_depth=3.0):
    """创建指定位置的M2沉头螺丝孔

    Args:
        x, y, z: 孔的沉头面中心位置
        head_dia: 螺丝头直径
        head_thickness: 螺丝头厚度
        thru_hole_dia: 通孔直径
        thru_hole_depth: 通孔深度

    Returns:
        沉头孔实体（用于布尔减法）
    """
    hole = create_m2_countersunk_hole(head_dia, head_thickness,
                                      thru_hole_dia, thru_hole_depth)
    return hole.translate(Vector(x, y, z))


if __name__ == "__main__":
    from ocp_vscode import show

    # 测试沉头孔
    print("测试M2M2沉头螺丝孔...")
    # hole = create_m2_countersunk_hole(
    #     head_dia=3.7,
    #     head_thickness=1.2,
    #     thru_hole_dia=2.2,
    #     thru_hole_depth=3.0
    # )
    # show(hole)

    # 测试带位置的沉头孔
    print("\n测试带位置的M2M2沉头螺丝孔...")
    hole_at = create_m2_countersunk_hole_at(x=0, y=0, z=0)
    show(hole_at)
