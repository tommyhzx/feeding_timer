#ifndef WIFI_MODULE_H
#define WIFI_MODULE_H

#include <stdint.h>
#include <Arduino.h>

// ========== Wi-Fi模块配置 ==========

// Wi-Fi连接配置（开发阶段使用硬编码）
// 注意：实际部署时应使用更安全的配网方式
constexpr uint32_t WIFI_CONNECT_TIMEOUT_MS = 30000;  // Wi-Fi连接超时时间
constexpr uint32_t WIFI_RECONNECT_INTERVAL_MS = 60000; // 重连间隔
constexpr uint32_t NTP_UPDATE_INTERVAL_MS = 3600000;   // NTP更新间隔 (1小时)

// NTP服务器配置（使用国内阿里云NTP服务器）
constexpr const char* NTP_SERVER = "ntp.aliyun.com";
constexpr int NTP_TIMEZONE_OFFSET = 8 * 3600;  // 东八区 (UTC+8)

// ========== Wi-Fi模块接口 ==========

/**
 * @brief 初始化Wi-Fi模块
 * 配置Wi-Fi连接参数并开始连接
 * @return true 初始化成功
 * @return false 初始化失败
 */
bool wifi_init();

/**
 * @brief 更新Wi-Fi状态
 * @param now 当前时间戳 (millis())
 *
 * 处理Wi-Fi连接状态检查、自动重连、NTP时间同步
 */
void wifi_update(uint32_t now);

/**
 * @brief 获取NTP同步的时间
 * @param hour 小时 (0-23)
 * @param minute 分钟 (0-59)
 * @param second 秒 (0-59)
 * @return true 获取时间成功
 * @return false 获取时间失败（未同步或未连接）
 */
bool wifi_get_ntp_time(int* hour, int* minute, int* second);

/**
 * @brief 检查Wi-Fi是否已连接
 * @return true 已连接
 * @return false 未连接
 */
bool wifi_is_connected();

/**
 * @brief 获取设备IP地址
 * @return String IP地址字符串，未连接时返回空字符串
 */
String wifi_get_ip();

/**
 * @brief 获取Wi-Fi连接状态描述
 * @return const char* 状态描述字符串
 */
const char* wifi_get_status_str();

/**
 * @brief 强制更新NTP时间
 * @return true 更新成功
 * @return false 更新失败
 */
bool wifi_force_ntp_update();

#endif // WIFI_MODULE_H
