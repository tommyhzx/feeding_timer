"""
导出屏幕结构件为 STL/STEP 格式
"""

import os

# 导入 build123d 导出函数
from build123d import export_stl, export_step

# 导入屏幕外壳模型
from screen_frame import get_screen_frame
from pcb_cover import get_pcb_cover
from hollow_box import get_hollow_box

# 获取当前目录
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
EXPORTS_DIR = os.path.join(SCRIPT_DIR, "exports")
os.makedirs(EXPORTS_DIR, exist_ok=True)

# ========== 导出屏幕外壳 ==========
screen_frame = get_screen_frame()

base_stl_path = os.path.join(EXPORTS_DIR, "screen_frame.stl")
base_step_path = os.path.join(EXPORTS_DIR, "screen_frame.step")
export_stl(screen_frame, base_stl_path)
export_step(screen_frame, base_step_path)
print(f"屏幕外壳已导出: {base_stl_path}")
print(f"屏幕外壳已导出: {base_step_path}")

# ========== 导出 PCB 外壳 ==========
pcb_cover = get_pcb_cover()

cover_stl_path = os.path.join(EXPORTS_DIR, "pcb_cover.stl")
cover_step_path = os.path.join(EXPORTS_DIR, "pcb_cover.step")
export_stl(pcb_cover, cover_stl_path)
export_step(pcb_cover, cover_step_path)
print(f"PCB 外壳已导出: {cover_stl_path}")
print(f"PCB 外壳已导出: {cover_step_path}")

# ========== 导出空心盒子 ==========
hollow_box = get_hollow_box()

box_stl_path = os.path.join(EXPORTS_DIR, "hollow_box.stl")
box_step_path = os.path.join(EXPORTS_DIR, "hollow_box.step")
export_stl(hollow_box, box_stl_path)
export_step(hollow_box, box_step_path)
print(f"空心盒子已导出: {box_stl_path}")
print(f"空心盒子已导出: {box_step_path}")

print("\n所有外壳导出完成！")
