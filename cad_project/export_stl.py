"""
导出屏幕结构件为 STL/STEP 格式
"""

import os

# 导入 build123d 导出函数
from build123d import export_stl, export_step

# 导入屏幕外壳模型
from screen_box import get_screen_box
# 导入 PCB 盒子模型
from pcb_box import get_pcb_box


# 获取当前目录
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
EXPORTS_DIR = os.path.join(SCRIPT_DIR, "exports")
os.makedirs(EXPORTS_DIR, exist_ok=True)

# ========== 导出屏幕外壳 ==========
screen_box = get_screen_box()

base_stl_path = os.path.join(EXPORTS_DIR, "screen_box.stl")
base_step_path = os.path.join(EXPORTS_DIR, "screen_box.step")
export_stl(screen_box, base_stl_path)
export_step(screen_box, base_step_path)
print(f"屏幕盒子已导出: {base_stl_path}")
print(f"屏幕盒子已导出: {base_step_path}")

# ========== 导出 PCB 盒子 ==========
pcb_box = get_pcb_box()

box_stl_path = os.path.join(EXPORTS_DIR, "pcb_box.stl")
box_step_path = os.path.join(EXPORTS_DIR, "pcb_box.step")
export_stl(pcb_box, box_stl_path)
export_step(pcb_box, box_step_path)
print(f"PCB 盒子已导出: {box_stl_path}")
print(f"PCB 盒子已导出: {box_step_path}")

print("\n所有外壳导出完成！")
