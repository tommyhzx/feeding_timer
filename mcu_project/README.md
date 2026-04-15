# ESP32-S3 命令
## 新建项目
pio init --board esp32-s3-devkitm-1 -d my_project
选项	说明
--board <board>	指定开发板型号
--project-option <key>=<value>	设置项目选项
-d, --dir <dir>	在指定目录创建项目

## 编译
```bash
cd mcu_kernel/esp32s3wroom
pio run
```

## 上传
```bash
pio run -t upload
```

## 串口监视器
```bash
pio device monitor -b 115200
```

## 完整上传+串口监视器
```bash
pio run -t upload && pio device monitor
```