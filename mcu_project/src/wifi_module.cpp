#include "wifi_module.h"
#include <WiFi.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

// ========== 私有变量 ==========

// NTP客户端
static WiFiUDP ntpUDP;
static NTPClient timeClient(ntpUDP, NTP_SERVER, NTP_TIMEZONE_OFFSET, NTP_UPDATE_INTERVAL_MS);

// Wi-Fi连接状态
static bool wifiConnected = false;
static uint32_t lastReconnectAttempt = 0;

// Wi-Fi配置（硬编码，开发阶段使用）
// TODO: 生产版本应使用SmartConfig或其他配网方式
static const char *wifi_ssid = "aidigong";     // 请替换为您的Wi-Fi名称
static const char *wifi_password = "aidigong"; // 请替换为您的Wi-Fi密码

// ========== 私有函数 ==========

/**
 * @brief 尝试连接Wi-Fi
 * @return true 连接成功
 * @return false 连接失败
 */
static bool wifi_connect()
{
    if (WiFi.status() == WL_CONNECTED)
    {
        return true;
    }

    Serial.println("连接Wi-Fi...");
    Serial.print("SSID: ");
    Serial.println(wifi_ssid);

    // 设置为STA模式（站点模式）
    WiFi.mode(WIFI_STA);

    // 开始连接
    WiFi.begin(wifi_ssid, wifi_password);

    // 等待连接，最多等待30秒
    uint32_t start_time = millis();
    while (WiFi.status() != WL_CONNECTED)
    {
        if (millis() - start_time >= WIFI_CONNECT_TIMEOUT_MS)
        {
            Serial.println("Wi-Fi连接超时!");
            return false;
        }
        delay(500);
        Serial.print(".");
    }

    wifiConnected = true;
    Serial.println("\nWi-Fi连接成功!");
    Serial.print("IP地址: ");
    Serial.println(WiFi.localIP());

    return true;
}

/**
 * @brief 尝试重新连接Wi-Fi
 */
static void wifi_try_reconnect()
{
    uint32_t now = millis();

    // 检查是否需要重连
    if (WiFi.status() != WL_CONNECTED && (now - lastReconnectAttempt >= WIFI_RECONNECT_INTERVAL_MS))
    {
        lastReconnectAttempt = now;
        wifiConnected = false;

        Serial.println("Wi-Fi连接断开，尝试重连...");
        if (wifi_connect())
        {
            // 重连成功后，重新初始化NTP
            timeClient.begin();
            if (timeClient.forceUpdate())
            {
                Serial.println("NTP时间同步成功");
            }
        }
    }
}

// ========== 公共接口实现 ==========

bool wifi_init()
{
    Serial.println("初始化Wi-Fi模块...");

    // 尝试连接Wi-Fi
    if (!wifi_connect())
    {
        Serial.println("Wi-Fi初始化失败，将在后台尝试重连");
        lastReconnectAttempt = millis();
        return false;
    }

    // 初始化NTP客户端
    timeClient.begin();
    timeClient.setUpdateInterval(NTP_UPDATE_INTERVAL_MS);

    // 首次强制更新NTP时间
    if (timeClient.forceUpdate())
    {
        Serial.println("NTP时间同步成功");
        Serial.print("当前时间: ");
        Serial.println(timeClient.getFormattedTime());
    }
    else
    {
        Serial.println("NTP时间同步失败，将在后台重试");
    }

    return true;
}

void wifi_update(uint32_t now)
{
    // 更新连接状态
    wifiConnected = (WiFi.status() == WL_CONNECTED);

    // 检查重连
    if (!wifiConnected)
    {
        wifi_try_reconnect();
        return; // 未连接时不更新NTP
    }

    // 更新NTP时间（由NTPClient内部控制更新间隔）
    if (timeClient.update())
    {
        Serial.print("NTP时间已更新: ");
        Serial.println(timeClient.getFormattedTime());
    }
}

bool wifi_get_ntp_time(int *hour, int *minute, int *second)
{
    if (!wifiConnected)
    {
        return false;
    }

    // 获取当前时间（秒数）
    unsigned long epochTime = timeClient.getEpochTime();

    // 转换为时分秒
    *second = epochTime % 60;
    epochTime /= 60;
    *minute = epochTime % 60;
    epochTime /= 60;
    *hour = epochTime % 24;

    return true;
}

bool wifi_is_connected()
{
    return wifiConnected && (WiFi.status() == WL_CONNECTED);
}

String wifi_get_ip()
{
    if (wifiConnected)
    {
        return WiFi.localIP().toString();
    }
    return "";
}

const char *wifi_get_status_str()
{
    if (!wifiConnected)
    {
        return "未连接";
    }

    switch (WiFi.status())
    {
    case WL_IDLE_STATUS:
        return "空闲";
    case WL_NO_SSID_AVAIL:
        return "无网络";
    case WL_SCAN_COMPLETED:
        return "扫描完成";
    case WL_CONNECTED:
        return "已连接";
    case WL_CONNECT_FAILED:
        return "连接失败";
    case WL_CONNECTION_LOST:
        return "连接丢失";
    case WL_DISCONNECTED:
        return "已断开";
    default:
        return "未知状态";
    }
}

bool wifi_force_ntp_update()
{
    if (!wifiConnected)
    {
        return false;
    }

    return timeClient.forceUpdate();
}
