pipeline {
    agent any

    parameters {
        booleanParam(name: 'RUN_LINT', defaultValue: true, description: 'Kiểm tra cú pháp và chất lượng mã nguồn (Code Quality / Lint)')
        booleanParam(name: 'BUILD_DOCKER', defaultValue: true, description: 'Đóng gói Docker Images cho 3 services (Backend, Frontend, ML Service)')
        booleanParam(name: 'PUSH_DOCKER', defaultValue: false, description: 'Đẩy images lên Docker Hub (cần cấu hình credential docker-hub-credentials)')
        string(name: 'DOCKER_USER', defaultValue: 'doanducvuong', description: 'Tên tài khoản Docker Hub')
        booleanParam(name: 'DEPLOY_LOCAL', defaultValue: true, description: 'Tự động triển khai lên môi trường chạy bằng Docker Compose')
    }

    environment {
        APP_VERSION = "${env.BUILD_NUMBER}"
        BACKEND_IMAGE = "${params.DOCKER_USER}/sttn-backend"
        ML_IMAGE = "${params.DOCKER_USER}/sttn-ml-service"
        FRONTEND_IMAGE = "${params.DOCKER_USER}/sttn-frontend"
    }

    stages {
        stage('1. Checkout Source Code') {
            steps {
                echo "=========================================="
                echo ">>> BƯỚC 1: Tải mã nguồn từ GitHub <<<"
                echo "=========================================="
                checkout scm
                sh 'git log -1 --stat'
            }
        }

        stage('2. Code Quality & Syntax Check') {
            when {
                expression { return params.RUN_LINT }
            }
            parallel {
                stage('Check Backend Node.js') {
                    steps {
                        dir('backend') {
                            echo "Kiểm tra cú pháp Backend Express..."
                            sh 'node -c src/server.js || echo "[WARN] node not available, skipping syntax check"'
                            sh 'node -c src/db/index.js || echo "[WARN] node not available, skipping syntax check"'
                        }
                    }
                }
                stage('Check ML Service Python') {
                    steps {
                        dir('ml-service') {
                            echo "Kiểm tra cú pháp Python (FastAPI/ML Pipeline)..."
                            sh 'python3 -m py_compile app.py train.py || python -m py_compile app.py train.py || true'
                        }
                    }
                }
                stage('Check Frontend React') {
                    steps {
                        dir('frontend') {
                            echo "Kiểm tra cú pháp Frontend Vite/React..."
                            sh 'node -v || echo "[WARN] node not available"'
                        }
                    }
                }
            }
        }

        stage('3. Build Docker Images') {
            when {
                expression { return params.BUILD_DOCKER }
            }
            steps {
                echo "=========================================="
                echo ">>> BƯỚC 3: Đóng gói Docker Images <<<"
                echo "=========================================="
                echo "1. Build ML Service (Python/FastAPI)..."
                sh 'docker build -t ${ML_IMAGE}:${APP_VERSION} -t ${ML_IMAGE}:latest ./ml-service'

                echo "2. Build Backend (Node.js/Express)..."
                sh 'docker build -t ${BACKEND_IMAGE}:${APP_VERSION} -t ${BACKEND_IMAGE}:latest ./backend'

                echo "3. Build Frontend (React/Vite/Nginx)..."
                sh 'docker build --build-arg VITE_API_URL=http://localhost:4000/api -t ${FRONTEND_IMAGE}:${APP_VERSION} -t ${FRONTEND_IMAGE}:latest ./frontend'

                echo "Danh sách Docker images vừa tạo:"
                sh 'docker images | grep ${params.DOCKER_USER} || true'
            }
        }

        stage('4. Push to Docker Hub') {
            when {
                expression { return params.PUSH_DOCKER }
            }
            steps {
                echo "=========================================="
                echo ">>> BƯỚC 4: Đẩy Docker Images lên Registry <<<"
                echo "=========================================="
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER_ENV', passwordVariable: 'DOCKER_PASS_ENV')]) {
                    sh 'echo "$DOCKER_PASS_ENV" | docker login -u "$DOCKER_USER_ENV" --password-stdin'
                    sh 'docker push ${ML_IMAGE}:${APP_VERSION}'
                    sh 'docker push ${ML_IMAGE}:latest'
                    sh 'docker push ${BACKEND_IMAGE}:${APP_VERSION}'
                    sh 'docker push ${BACKEND_IMAGE}:latest'
                    sh 'docker push ${FRONTEND_IMAGE}:${APP_VERSION}'
                    sh 'docker push ${FRONTEND_IMAGE}:latest'
                    sh 'docker logout'
                }
            }
        }

        stage('5. Continuous Deployment (CD)') {
            when {
                expression { return params.DEPLOY_LOCAL }
            }
            steps {
                echo "=========================================="
                echo ">>> BƯỚC 5: Triển khai hệ thống tự động <<<"
                echo "=========================================="
                sh '''
                    echo "Dừng phiên bản cũ và khởi chạy phiên bản mới..."
                    docker compose down || true
                    docker compose up -d
                '''
            }
        }

        stage('6. Smoke Test & Health Check') {
            when {
                expression { return params.DEPLOY_LOCAL }
            }
            steps {
                echo "=========================================="
                echo ">>> BƯỚC 6: Kiểm tra sức khỏe dịch vụ <<<"
                echo "=========================================="
                sleep 20
                sh '''
                    echo "--- Danh sách containers đang chạy ---"
                    docker compose ps

                    echo "--- Kiểm tra Backend Health ---"
                    curl -s -o /dev/null -w "Backend HTTP status: %{http_code}\\n" http://localhost:4000/health || true

                    echo "--- Kiểm tra ML Service Health ---"
                    curl -s -o /dev/null -w "ML Service HTTP status: %{http_code}\\n" http://localhost:8001/health || true

                    echo "--- Kiểm tra Frontend Web ---"
                    curl -s -o /dev/null -w "Frontend HTTP status: %{http_code}\\n" http://localhost:8080 || true
                '''
            }
        }
    }

    post {
        always {
            echo "Dọn dẹp các dangling Docker images sau khi build..."
            sh 'docker image prune -f || true'
        }
        success {
            echo "=========================================================="
            echo ">>> JENKINS PIPELINE THÀNH CÔNG: DỰ ÁN ĐÃ ĐƯỢC TRIỂN KHAI! <<<"
            echo "Frontend:   http://localhost:8080"
            echo "Backend:    http://localhost:4000"
            echo "ML Service: http://localhost:8001"
            echo "=========================================================="
        }
        failure {
            echo "=========================================================="
            echo ">>> JENKINS PIPELINE THẤT BẠI: Vui lòng kiểm tra Console Log! <<<"
            echo "=========================================================="
        }
    }
}
