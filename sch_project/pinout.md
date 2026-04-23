# 引脚使用说明

## ESP32-S3-WROOM-1-N16R8 引脚分配

### 电源引脚

| 引脚 | 信号 | 连接 |
|------|------|------|
| pin1 | 3V3 | 内部3.3V电源网络 |
| pin2 | 3V3 | 内部3.3V电源网络 |
| pin21 | 5V_IN | ETA6093 5V输出 (net.PWR_5V) |
| pin22 | GND | 地网络 |
| pin23 | GND | 地网络 |
| pin43 | GND | 地网络 |
| pin44 | GND | 地网络 |

### 按键输入

| 引脚 | GPIO | 功能 | 连接 |
|------|------|------|------|
| pin6 | GPIO6 | Mode按键 | KEY_MODE.pin1 (按键另一端接GND) |
| pin17 | GPIO11 | Enter按键 | KEY_ENTER.pin1 (按键另一端接GND) |

### MAX7219 显示模块接口

| 引脚 | GPIO | 信号 | 连接 |
|------|------|------|------|
| pin1 | 3V3 | VCC | DISP_J1.pin1 |
| pin7 | GPIO7 | DIN | DISP_J1.pin3 |
| pin12 | GPIO8 | CS | DISP_J1.pin4 |
| pin16 | GPIO10 | CLK | DISP_J1.pin5 |

### 未连接的重要引脚

| 引脚 | 信号 | 说明 |
|------|------|------|
| pin3 | RST | 复位引脚，需添加复位电路（10kΩ上拉 + 0.1µF电容） |

---

## USB-C 连接器 (USB-TYPEC, JLCS C2927039)

### 已使用引脚

| 引脚 | 信号 | 连接 |
|------|------|------|
| pin2 | VBUS | 5V电源 → net.USB_5V |
| pin5 | DP | USB D+ → R_DP(22Ω) → USBLC6 ESD |
| pin6 | DM | USB D- → R_DM(22Ω) → USBLC6 ESD |
| pin11 | VBUS2 | 5V电源 → net.USB_5V |
| pin1, pin12 | GND, GND2 | 地网络 |
| pin13-16 | SHIELD | 屏蔽地（4个安装孔） |

### 未使用引脚

| 引脚 | 信号 | 说明 |
|------|------|------|
| pin3 | CC2 | 未连接 |
| pin4 | SBU1 | 未连接 |
| pin7 | DP_A | 未连接 |
| pin8 | SBU2 | 未连接 |
| pin9 | CC1 | 未连接 |
| pin10 | NC | 空脚 |

---

## ESD保护芯片 (USBLC6-2, SOT-23-6L)

### 已使用引脚

| 引脚 | 信号 | 连接 |
|------|------|------|
| pin1 | DP | R_DP → 输出 → net.PWR_USB_DP |
| pin2 | GND | 地网络 |
| pin3 | DM | R_DM → 输入 |
| pin4 | DM | R_DM → 输出 → net.PWR_USB_DM |
| pin5 | VBUS | net.USB_5V |
| pin6 | DP | R_DP → 输入 |

---

## 电源管理芯片 (ETA6093, SOT-23-5)

### 已使用引脚

| 引脚 | 信号 | 连接 |
|------|------|------|
| pin1 | OUT | 5V输出 → net.PWR_5V (ESP32) |
| pin2 | GND | 地网络 |
| pin3 | LED | LED指示 → R_LED_RED(2kΩ) → LED_RED |
| pin4 | BAT | 电池正极 → net.BAT_PLUS |
| pin5 | SW | 开关节点 → 电感(4.7µH) |


---

## 电池连接器 (PH2.0-2P)

### 已使用引脚

| 引脚 | 信号 | 连接 |
|------|------|------|
| pin1 | VBAT+ | 电池正极 → net.BAT_PLUS (ETA6093 BAT) |
| pin2 | GND | 电池负极 → 地网络 |

---

## MAX7219 显示模块接口 (JST 5P)

| 端子 | 信号 | 连接 |
|------|------|------|
| pin1 | VCC | MCU.3V3 |
| pin2 | GND | 地网络 |
| pin3 | DIN | MCU.GPIO7 |
| pin4 | CS | MCU.GPIO8 |
| pin5 | CLK | MCU.GPIO10 |
