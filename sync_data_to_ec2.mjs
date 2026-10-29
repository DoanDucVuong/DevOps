import { NodeSSH } from 'node-ssh';
import path from 'path';
import fs from 'fs';

const CONFIG = {
  HOST_IP: '54.79.14.7',
  USERNAME: 'ubuntu',
  PRIVATE_KEY_PATH: './sttn-key.pem',
  PORT: 22,
  REMOTE_DIR: '/home/ubuntu/DevOps',
};

async function syncData() {
  console.log('🚀 Bắt đầu quá trình đồng bộ Database và Hình ảnh sản phẩm lên AWS EC2...');

  const keyPath = path.resolve(CONFIG.PRIVATE_KEY_PATH);
  if (!fs.existsSync(keyPath)) {
    console.error(`❌ Không tìm thấy file khóa: ${keyPath}`);
    process.exit(1);
  }

  const ssh = new NodeSSH();

  try {
    console.log(`📡 Đang kết nối SSH tới ${CONFIG.USERNAME}@${CONFIG.HOST_IP}...`);
    await ssh.connect({
      host: CONFIG.HOST_IP,
      username: CONFIG.USERNAME,
      port: CONFIG.PORT,
      privateKeyPath: keyPath,
      readyTimeout: 30000,
    });
    console.log('✔ Kết nối SSH thành công!');

    // 1. Kiểm tra trạng thái Database hiện tại trên EC2
    console.log('\n[1/6] Kiểm tra cơ sở dữ liệu hiện tại trên EC2...');
    const checkRes = await ssh.execCommand(
      `cd ${CONFIG.REMOTE_DIR} && ls -la backend/src/db/ && sudo docker compose exec -T backend node -e "const db=require('./src/db'); db.query('SELECT count(*) as c FROM products').then(r=>console.log('EC2 Current Products:', r[0].c)).catch(e=>console.log('DB error:', e.message))"`
    );
    console.log(checkRes.stdout || checkRes.stderr);

    // 2. Dừng tạm thời container backend để đảm bảo an toàn file SQLite (tránh lock)
    console.log('\n[2/6] Dừng backend container để copy Database an toàn...');
    await ssh.execCommand(`cd ${CONFIG.REMOTE_DIR} && sudo docker compose stop backend`);

    // Cấp quyền ghi cho user ubuntu và dọn dẹp WAL/SHM cũ
    await ssh.execCommand(`sudo chown -R ubuntu:ubuntu ${CONFIG.REMOTE_DIR}/backend/src/db`);
    await ssh.execCommand(`sudo rm -f ${CONFIG.REMOTE_DIR}/backend/src/db/sttn.db-wal ${CONFIG.REMOTE_DIR}/backend/src/db/sttn.db-shm`);

    // 3. Upload file sttn.db và seed-products.json
    console.log('\n[3/6] Đang tải lên cơ sở dữ liệu sttn.db và seed-products.json...');
    const localDbPath = path.resolve('./backend/src/db/sttn.db');
    const tmpRemoteDb = '/tmp/sttn.db';
    await ssh.putFile(localDbPath, tmpRemoteDb);
    await ssh.execCommand(`sudo cp /tmp/sttn.db ${CONFIG.REMOTE_DIR}/backend/src/db/sttn.db && sudo chmod 666 ${CONFIG.REMOTE_DIR}/backend/src/db/sttn.db && sudo rm -f /tmp/sttn.db`);
    console.log(`✔ Đã copy sttn.db (${(fs.statSync(localDbPath).size / 1024).toFixed(1)} KB) lên EC2.`);

    const localSeedPath = path.resolve('./backend/src/db/seed-products.json');
    const remoteSeedPath = `${CONFIG.REMOTE_DIR}/backend/src/db/seed-products.json`;
    await ssh.putFile(localSeedPath, remoteSeedPath);
    console.log('✔ Đã copy seed-products.json lên EC2.');

    const localMlDataPath = path.resolve('./ml-service/data/products.json');
    const remoteMlDataPath = `${CONFIG.REMOTE_DIR}/ml-service/data/products.json`;
    await ssh.putFile(localMlDataPath, remoteMlDataPath);
    console.log('✔ Đã copy ml-service/data/products.json lên EC2.');

    // 4. Upload thư mục hình ảnh sản phẩm (frontend/public/products)
    console.log('\n[4/6] Đang tải lên thư mục hình ảnh sản phẩm (frontend/public/products)...');
    const localImagesDir = path.resolve('./frontend/public/products');
    const remoteImagesDir = `${CONFIG.REMOTE_DIR}/frontend/public/products`;

    // Đảm bảo thư mục đích tồn tại trên EC2
    await ssh.execCommand(`mkdir -p ${remoteImagesDir}`);

    const imageFiles = fs.readdirSync(localImagesDir);
    for (const file of imageFiles) {
      const localFile = path.join(localImagesDir, file);
      const remoteFile = `${remoteImagesDir}/${file}`;
      await ssh.putFile(localFile, remoteFile);
      console.log(`  + Đã tải ảnh: ${file} (${(fs.statSync(localFile).size / 1024).toFixed(1)} KB)`);
    }
    console.log(`✔ Đã đồng bộ ${imageFiles.length} hình ảnh sản phẩm lên EC2.`);

    // 5. Khởi động lại các container và copy ảnh trực tiếp vào frontend container
    console.log('\n[5/6] Khởi động lại dịch vụ backend và đồng bộ ảnh vào container frontend...');
    await ssh.execCommand(`cd ${CONFIG.REMOTE_DIR} && sudo docker compose start backend`);
    await ssh.execCommand(`cd ${CONFIG.REMOTE_DIR} && sudo docker compose restart ml-service`);

    // Copy ảnh vào Nginx html directory của container sttn-frontend đang chạy
    await ssh.execCommand(
      `sudo docker exec sttn-frontend mkdir -p /usr/share/nginx/html/products && ` +
      `sudo docker cp ${remoteImagesDir}/. sttn-frontend:/usr/share/nginx/html/products/`
    );
    console.log('✔ Đã nạp ảnh vào container sttn-frontend và khởi động lại backend.');

    // 6. Kiểm tra xác nhận dữ liệu trên EC2 (Smoke Test)
    console.log('\n[6/6] Đang kiểm tra xác nhận dữ liệu trên AWS EC2...');
    // Chờ 3s cho backend khởi động hoàn toàn
    await new Promise((r) => setTimeout(r, 3000));

    const verifyDb = await ssh.execCommand(
      `cd ${CONFIG.REMOTE_DIR} && sudo docker compose exec -T backend node -e "const db=require('./src/db'); db.query('SELECT count(*) as c FROM products').then(r=>console.log('XÁC NHẬN SỐ SẢN PHẨM TRÊN EC2:', r[0].c)); db.query('SELECT count(*) as c FROM products WHERE category = \\'phu-kien\\'').then(r=>console.log('XÁC NHẬN SỐ SẢN PHẨM PHỤ KIỆN:', r[0].c)); db.query('SELECT count(*) as c FROM orders').then(r=>console.log('XÁC NHẬN SỐ ĐƠN HÀNG:', r[0].c));"`
    );
    console.log(verifyDb.stdout || verifyDb.stderr);

    const testImg = await ssh.execCommand(
      `curl -I -s http://localhost/products/p01.jpg | head -n 1`
    );
    console.log(`Kiểm tra truy cập ảnh /products/p01.jpg qua Cổng 80: ${testImg.stdout.trim()}`);

    const testApi = await ssh.execCommand(
      `curl -s "http://localhost/api/products?category=phu-kien" | head -c 120`
    );
    console.log(`Kiểm tra API phụ kiện qua Cổng 80: ${testApi.stdout}...`);

    console.log('\n🎉 ĐỒNG BỘ TOÀN DIỆN DATABASE VÀ ASSETS LÊN AWS EC2 THÀNH CÔNG RỰC RỠ!');
  } catch (err) {
    console.error('❌ LỖI TRONG QUÁ TRÌNH ĐỒNG BỘ:', err.message);
  } finally {
    ssh.dispose();
  }
}

syncData();
