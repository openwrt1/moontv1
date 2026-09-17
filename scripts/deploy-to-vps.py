import subprocess
import os
import sys
import io

# 强制使用 UTF-8 打印，避免 Windows 下输出 emoji 报错
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# ================= 配置 =================
VPS_IP = "103.11.77.126"  # ⚠️ 请将此处替换为你的 VPS IP 地址
VPS_PORT = "9922"
VPS_USER = "root"
SSH_KEY_PATH = r"C:\Users\17872\.ssh\id_ed25519"
REMOTE_DIR = "/root/moontv1"
SCRIPT_NAME = "daily-source-sync.js"

# Vercel 配置 (可选)
VERCEL_TOKEN = "vcp_8oOtxpHBNGarIuda5DEj6QYzsu5ct3G1SZn3eJMPcszCx4IXJJ33n3G0" # 如果需要自动部署，请在这里填入你的 Vercel API Token

# 获取当前脚本所在目录，拼接出要上传的 JS 脚本路径
LOCAL_SCRIPT_PATH = os.path.join(os.path.dirname(__file__), SCRIPT_NAME)
# ========================================

def run_cmd(cmd):
    print(f"正在执行: {' '.join(cmd)}")
    result = subprocess.run(cmd, text=True, capture_output=True, encoding="utf-8", errors="replace")
    if result.returncode != 0:
        print(f"❌ 执行失败:\n{result.stderr}")
        sys.exit(1)
    print(f"{result.stdout}")
    return result.stdout

def main():
    if VPS_IP == "YOUR_VPS_IP":
        print("❌ 错误: 请先在 deploy-to-vps.py 中填入真实的 VPS_IP")
        sys.exit(1)

    if not os.path.exists(LOCAL_SCRIPT_PATH):
        print(f"❌ 找不到需要部署的文件: {LOCAL_SCRIPT_PATH}")
        sys.exit(1)

    # 基础的 ssh 命令参数
    ssh_base_cmd = [
        "ssh", 
        "-i", SSH_KEY_PATH, 
        "-p", VPS_PORT, 
        "-o", "StrictHostKeyChecking=no",  # 避免首次连接时的 yes/no 提示
        f"{VPS_USER}@{VPS_IP}"
    ]

    print("\n--- 步骤 1: 确保远程目录存在 ---")
    mkdir_cmd = ssh_base_cmd + [f"mkdir -p {REMOTE_DIR}/scripts"]
    run_cmd(mkdir_cmd)

    print("\n--- 步骤 2: 使用 SCP 上传代码 ---")
    scp_cmd = [
        "scp",
        "-i", SSH_KEY_PATH,
        "-P", VPS_PORT, # 注意 scp 的端口参数是大写 P
        "-o", "StrictHostKeyChecking=no",
        LOCAL_SCRIPT_PATH,
        f"{VPS_USER}@{VPS_IP}:{REMOTE_DIR}/scripts/{SCRIPT_NAME}"
    ]
    run_cmd(scp_cmd)

    print("\n--- 步骤 3: 通过 PM2 重启/启动服务 ---")
    # 这段命令会在远程 VPS 上执行
    pm2_script = f"""
    cd {REMOTE_DIR}
    export VERCEL_TOKEN="{VERCEL_TOKEN}"
    
    if pm2 describe moontv-source-sync > /dev/null 2>&1; then
        pm2 restart moontv-source-sync --update-env
        echo "[OK] PM2 服务已重启"
    else
        pm2 start scripts/{SCRIPT_NAME} --cron "0 6 * * *" --no-autorestart --name moontv-source-sync
        pm2 save
        echo "[OK] PM2 服务已新建并启动（每天 06:00 执行）"
    fi
    echo "--- 等待 3 秒让脚本执行完毕 ---"
    sleep 3
    echo "--- 打印最新日志 ---"
    pm2 logs moontv-source-sync --lines 20 --nostream
    """
    pm2_cmd = ssh_base_cmd + [pm2_script]
    run_cmd(pm2_cmd)
    
    print("\n🎉 部署成功完成！")

if __name__ == "__main__":
    main()
