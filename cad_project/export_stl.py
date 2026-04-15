"""
导出键盘结构件为 STL/STEP 格式
"""

import os

# 导入 build123d 导出函数
from build123d import export_stl, export_step

# 导入各结构件模型
from case_base import final_case
from case_top import top_case_model
from pcb_3d import pcb_part

# 获取当前目录
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
EXPORTS_DIR = os.path.join(SCRIPT_DIR, "exports")
os.makedirs(EXPORTS_DIR, exist_ok=True)

# ========== 导出底壳 ==========
base_stl_path = os.path.join(EXPORTS_DIR, "case_base.stl")
base_step_path = os.path.join(EXPORTS_DIR, "case_base.step")
export_stl(final_case, base_stl_path)
export_step(final_case, base_step_path)
print(f"底壳已导出: {base_stl_path}")
print(f"底壳已导出: {base_step_path}")

# ========== 导出上壳 ==========
top_stl_path = os.path.join(EXPORTS_DIR, "case_top.stl")
top_step_path = os.path.join(EXPORTS_DIR, "case_top.step")
export_stl(top_case_model, top_stl_path)
export_step(top_case_model, top_step_path)
print(f"上壳已导出: {top_stl_path}")
print(f"上壳已导出: {top_step_path}")

# ========== 导出 PCB ==========
pcb_stl_path = os.path.join(EXPORTS_DIR, "pcb_board.stl")
pcb_step_path = os.path.join(EXPORTS_DIR, "pcb_board.step")
export_stl(pcb_part, pcb_stl_path)
export_step(pcb_part, pcb_step_path)
print(f"PCB 已导出: {pcb_stl_path}")
print(f"PCB 已导出: {pcb_step_path}")

print("\n所有结构件导出完成！")