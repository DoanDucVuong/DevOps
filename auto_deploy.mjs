import { NodeSSH } from 'node-ssh';
import fs from 'fs';
import path from 'path';

// ==============================================================================
// 🛠️ THIẾT LẬP CẤU HÌNH KẾT NỐI AWS EC2 (USER TỰ ĐIỀN THÔNG TIN TẠI ĐÂY)
// ==============================================================================
const CONFIG = {
  // Điền địa chỉ IPv4 Public của máy ảo EC2
  HOST_IP: '54.79.14.7',

  // Tên tài khoản đăng nhập (mặc định cho Ubuntu trên AWS là 'ubuntu')
  USERNAME: 'ubuntu',

  // Đường dẫn tới tệp Private Key (.pem)
  PRIVATE_KEY_PATH: './sttn-key.pem',

  // Cổng kết nối SSH (mặc định là 22)
  PORT: 22,

  // Đường dẫn thư mục dự án trên máy ảo EC2
  REPO_URL: 'https://github.com/DoanDucVuong/DevOps.git',
  PROJECT_DIR: 'DevOps',
};

// ==============================================================================
// 🎨 BẢNG MÃ MÀU TERMINAL (ANSI COLORS)
// ==============================================================================
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
};

const log = {
  header: (msg) => console.log(`\n${colors.bold}${colors.bgBlue}${colors.white} 🚀 ${msg} ${colors.reset}`),
  step: (stepNum, title) => console.log(`\n${colors.bold}${colors.cyan}[BƯỚC ${stepNum}] ➜ ${title}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✔ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✖ ${msg}${colors.reset}`),
  command: (cmd) => console.log(`${colors.dim}  $ ${cmd}${colors.reset}`),
};

// ==============================================================================
// 📋 DANH SÁCH CÁC BƯỚC THI CÔNG TUẦN TỰ TRÊN MÁY ẢO EC2 (UBUNTU)
// ==============================================================================
const DEPLOY_STEPS = [
  {
    title: 'Cập nhật hệ thống Ubuntu & cài đặt các gói tiền đề',
    command: `sudo apt-get update -y && sudo apt-get install -y ca-certificates curl gnupg lsb-release git`,
  },
  {
    title: 'Thiết lập Docker GPG Key & Official Repository',
    command: `sudo install -m 0755 -d /etc/apt/keyrings && \
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor --yes -o /etc/apt/keyrings/docker.gpg && \
sudo chmod a+r /etc/apt/keyrings/docker.gpg && \
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null`,
  },
  {
    title: 'Cài đặt Docker Engine & Docker Compose Plugin',
    command: `sudo apt-get update -y && sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin`,
  },
  {
    title: 'Cấp quyền thực thi Docker cho user ubuntu & khởi động Docker service',
    command: `sudo usermod -aG docker ${CONFIG.USERNAME} || true && sudo systemctl enable docker && sudo systemctl start docker`,
  },
  {
    title: 'Tải mã nguồn (Git Clone hoặc Git Pull nhánh main mới nhất)',
    command: `if [ ! -d "DevOps" ]; then \
  git clone ${CONFIG.REPO_URL}; \
else \
  echo "Thư mục DevOps đã tồn tại. Đang cập nhật git pull..."; \
  cd DevOps && git fetch origin && git checkout main && git pull origin main && cd ..; \
fi`,
  },
  {
    title: 'Giải phóng dung lượng đĩa & Dọn dẹp Docker cache trên EC2',
    command: `echo "=== Dung lượng trước khi dọn dẹp ===" && df -h / && \
sudo docker system prune -af || true && \
sudo docker builder prune -af || true && \
sudo apt-get clean || true && \
echo "=== Dung lượng sau khi dọn dẹp ===" && df -h /`,
  },
  {
    title: 'Cấu hình Public IP cho Frontend & Khởi chạy Docker Compose Microservices',
    command: `cd ${CONFIG.PROJECT_DIR} && \
export VITE_API_URL="/api" && \
sudo docker compose down || true && \
sudo -E docker compose up -d --build`,
  },
  {
    title: 'Kiểm tra trạng thái (Smoke Test & Health Check)',
    command: `cd ${CONFIG.PROJECT_DIR} && \
echo "--- Danh sách container ---" && \
sudo docker compose ps && \
echo "--- Đợi 5 giây kiểm tra phản hồi ---" && \
sleep 5 && \
curl -I -s http://localhost:80 | head -n 1 || echo "Frontend HTTP check failed" && \
curl -I -s http://localhost:80/health | head -n 1 || echo "Backend (via Nginx Port 80) check failed" && \
curl -I -s http://localhost:4000/health | head -n 1 || echo "Backend direct HTTP check failed"`,
  },
];

// ==============================================================================
// 🚀 HÀM ĐIỀU PHỐI CHÍNH (MAIN DEPLOYMENT RUNNER)
// ==============================================================================
async function runAutoDeploy() {
  log.header('CHƯƠNG TRÌNH TỰ ĐỘNG DEPLOY AWS EC2 1-CLICK (NODE-SSH)');

  // 1. Kiểm tra tính hợp lệ của cấu hình
  if (!CONFIG.HOST_IP || CONFIG.HOST_IP.trim() === '') {
    log.error('LỖI CẤU HÌNH: Bạn chưa điền HOST_IP trong file auto_deploy.mjs!');
    log.info('Vui lòng mở file auto_deploy.mjs, gán giá trị cho HOST_IP (IPv4 Public của EC2) và chạy lại.');
    process.exit(1);
  }

  if (!CONFIG.PRIVATE_KEY_PATH || CONFIG.PRIVATE_KEY_PATH.trim() === '') {
    log.error('LỖI CẤU HÌNH: Bạn chưa điền PRIVATE_KEY_PATH trong file auto_deploy.mjs!');
    log.info('Vui lòng mở file auto_deploy.mjs, điền đường dẫn tới tệp .pem và chạy lại.');
    process.exit(1);
  }

  const resolvedKeyPath = path.resolve(CONFIG.PRIVATE_KEY_PATH);
  if (!fs.existsSync(resolvedKeyPath)) {
    log.error(`Không tìm thấy file Private Key tại: ${resolvedKeyPath}`);
    process.exit(1);
  }

  const ssh = new NodeSSH();

  try {
    log.info(`Đang kết nối SSH tới ${CONFIG.USERNAME}@${CONFIG.HOST_IP}:${CONFIG.PORT}...`);
    log.info(`Sử dụng khóa cá nhân: ${resolvedKeyPath}`);

    // 2. Thiết lập kết nối SSH
    await ssh.connect({
      host: CONFIG.HOST_IP,
      username: CONFIG.USERNAME,
      port: CONFIG.PORT,
      privateKeyPath: resolvedKeyPath,
      readyTimeout: 30000,
    });

    log.success(`Kết nối SSH thành công tới máy ảo AWS EC2 [${CONFIG.HOST_IP}]!`);

    // 3. Thực thi tuần tự các bước
    const totalSteps = DEPLOY_STEPS.length;
    for (let i = 0; i < totalSteps; i++) {
      const step = DEPLOY_STEPS[i];
      const stepIndex = i + 1;

      log.step(`${stepIndex}/${totalSteps}`, step.title);
      log.command(step.command.split('\n')[0] + '...');

      const result = await ssh.execCommand(step.command, {
        onStdout(chunk) {
          process.stdout.write(`${colors.dim}${chunk.toString()}${colors.reset}`);
        },
        onStderr(chunk) {
          process.stderr.write(`${colors.yellow}${chunk.toString()}${colors.reset}`);
        },
      });

      if (result.code !== 0 && result.code !== null) {
        log.warn(`Lệnh ở bước ${stepIndex} kết thúc với exit code: ${result.code}`);
      } else {
        log.success(`Bước ${stepIndex} hoàn thành thành công.`);
      }
    }

    // 4. Kết thúc và hiển thị liên kết truy cập
    console.log(`\n${colors.bold}${colors.bgGreen}${colors.white} 🎉 TRIỂN KHAI TOÀN BỘ MICROSERVICES LÊN AWS EC2 THÀNH CÔNG! ${colors.reset}\n`);
    console.log(`${colors.bold}${colors.green}Địa chỉ truy cập dịch vụ:${colors.reset}`);
    console.log(`  🌐 Website Bán hàng:       http://${CONFIG.HOST_IP}`);
    console.log(`  ⚙️  Trang Quản trị Admin:   http://${CONFIG.HOST_IP}/admin (admin@sttn.vn / admin123)`);
    console.log(`  🔌 Backend API Health:     http://${CONFIG.HOST_IP}/health`);
    console.log(`  🧠 AI ML Health:           http://${CONFIG.HOST_IP}/ml/health`);
    console.log(`  ℹ️  (Tất cả dịch vụ đã được Nginx định tuyến qua Cổng 80, không lo bị chặn bởi AWS Security Group)`);
    console.log('\n==============================================================================');

  } catch (error) {
    console.log('\n');
    log.error(`QUÁ TRÌNH DEPLOY GẶP LỖI: ${error.message}`);
    if (error.level === 'client-authentication') {
      log.error('Nguyên nhân: Xác thực SSH thất bại. Vui lòng kiểm tra lại username (ubuntu) và tệp .pem.');
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      log.error('Nguyên nhân: Không thể kết nối tới IP EC2. Vui lòng kiểm tra lại Inbound Rule cổng 22 trên Security Group.');
    }
    process.exit(1);
  } finally {
    ssh.dispose();
  }
}

// Khởi chạy
runAutoDeploy();
