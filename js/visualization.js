// 3D可视化引擎（使用Three.js）
const VisualizationEngine = {
    // Three.js对象
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    electronCloud: null,
    nucleus: null,
    axesHelper: null,
    
    // 状态变量
    isInitialized: false,
    isAnimating: true,
    animationFrameId: null,
    currentData: null,
    currentState: null,
    pointsCount: 3000,
    
    // 初始化Three.js场景
    init(canvasId) {
        try {
            // 检查Three.js是否已加载
            if (typeof THREE === 'undefined') {
                console.error('Three.js is not loaded');
                return false;
            }
            
            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.error(`Canvas element with id "${canvasId}" not found.`);
                return false;
            }
            
            console.log('Initializing Three.js...');
            
            // 创建Three.js场景
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x0f172a);
            
            // 创建相机
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
            this.camera.position.set(8, 8, 8);
            this.camera.lookAt(0, 0, 0);
            
            // 创建渲染器
            this.renderer = new THREE.WebGLRenderer({ 
                canvas: canvas,
                antialias: true,
                alpha: true
            });
            this.renderer.setSize(width, height, false);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            
            // 检查OrbitControls是否可用
            if (typeof THREE.OrbitControls === 'function') {
                this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                this.controls.enableDamping = true;
                this.controls.dampingFactor = 0.05;
                this.controls.rotateSpeed = 0.5;
            } else {
                console.warn('OrbitControls not available, using basic controls');
                // 创建简单的鼠标控制
                this.setupBasicControls();
            }
            
            // 添加光源
            this.addLights();
            
            // 添加坐标轴
            this.addAxes();
            
            // 添加原子核
            this.addNucleus();
            
            // 创建初始电子云
            this.createElectronCloud(this.pointsCount);
            
            // 处理窗口大小变化
            window.addEventListener('resize', () => this.onWindowResize());
            
            // 开始动画循环
            this.animate();
            
            this.isInitialized = true;
            console.log('Three.js visualization engine initialized successfully.');
            
            return true;
        } catch (error) {
            console.error('Failed to initialize Three.js:', error);
            
            // 提供降级方案
            const canvas = document.getElementById(canvasId);
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = '#1e293b';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = '#3b82f6';
                    ctx.font = '20px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('Three.js初始化失败', canvas.width/2, canvas.height/2);
                    ctx.font = '16px Arial';
                    ctx.fillText('请确保Three.js库已正确加载', canvas.width/2, canvas.height/2 + 30);
                }
            }
            
            return false;
        }
    },
    
    // 设置基本控制（如果OrbitControls不可用）
    setupBasicControls() {
        const canvas = this.renderer.domElement;
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            
            // 旋转相机
            this.camera.position.x -= deltaX * 0.01;
            this.camera.position.y += deltaY * 0.01;
            this.camera.lookAt(0, 0, 0);
            
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
            this.camera.position.multiplyScalar(zoomFactor);
        });
    },
    
    // 添加光源
    addLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        
        // 平行光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);
        
        // 点光源（模拟原子核发光）
        const pointLight = new THREE.PointLight(0xff4444, 1, 50);
        pointLight.position.set(0, 0, 0);
        this.scene.add(pointLight);
    },
    
    // 添加坐标轴
    addAxes() {
        // 创建坐标轴辅助器
        this.axesHelper = new THREE.AxesHelper(5);
        this.scene.add(this.axesHelper);
        
        // 添加坐标轴标签
        this.addAxisLabels();
    },
    
    // 添加坐标轴标签
    addAxisLabels() {
        const canvas = this.renderer.domElement;
        
        // X轴标签
        const xLabel = document.createElement('div');
        xLabel.className = 'coordinate-label coordinate-x';
        xLabel.textContent = 'X';
        xLabel.style.position = 'absolute';
        xLabel.style.left = 'calc(50% + 60px)';
        xLabel.style.top = '50%';
        canvas.parentElement.appendChild(xLabel);
        
        // Y轴标签
        const yLabel = document.createElement('div');
        yLabel.className = 'coordinate-label coordinate-y';
        yLabel.textContent = 'Y';
        yLabel.style.position = 'absolute';
        yLabel.style.left = '50%';
        yLabel.style.top = 'calc(50% - 60px)';
        canvas.parentElement.appendChild(yLabel);
        
        // Z轴标签
        const zLabel = document.createElement('div');
        zLabel.className = 'coordinate-label coordinate-z';
        zLabel.textContent = 'Z';
        zLabel.style.position = 'absolute';
        zLabel.style.left = '50%';
        yLabel.style.top = 'calc(50% + 60px)';
        canvas.parentElement.appendChild(zLabel);
    },
    
    // 添加原子核
    addNucleus() {
        // 原子核几何体
        const geometry = new THREE.SphereGeometry(0.2, 32, 32);
        
        // 原子核材质（发光效果）
        const material = new THREE.MeshPhongMaterial({
            color: 0xff4444,
            emissive: 0xff0000,
            emissiveIntensity: 0.5,
            shininess: 100
        });
        
        this.nucleus = new THREE.Mesh(geometry, material);
        this.scene.add(this.nucleus);
        
        // 添加原子核发光光晕
        const glowGeometry = new THREE.SphereGeometry(0.4, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4444,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.nucleus.add(glow);
    },
    
    // 创建电子云
    createElectronCloud(pointCount) {
        // 移除现有的电子云
        if (this.electronCloud) {
            this.scene.remove(this.electronCloud);
        }
        
        // 创建点云几何体
        const geometry = new THREE.BufferGeometry();
        
        // 创建位置数组
        const positions = new Float32Array(pointCount * 3);
        
        // 创建颜色数组
        const colors = new Float32Array(pointCount * 3);
        
        // 初始填充随机位置和颜色
        for (let i = 0; i < pointCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 10;
            positions[i3 + 1] = (Math.random() - 0.5) * 10;
            positions[i3 + 2] = (Math.random() - 0.5) * 10;
            
            // 初始颜色（蓝色）
            colors[i3] = 0.4;
            colors[i3 + 1] = 0.6;
            colors[i3 + 2] = 1.0;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        // 创建点云材质
        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        // 创建点云对象
        this.electronCloud = new THREE.Points(geometry, material);
        this.scene.add(this.electronCloud);
    },
    
    // 更新电子云数据
    updateElectronCloud(data) {
        if (!this.electronCloud || !data || data.length === 0) return;
        
        const positions = this.electronCloud.geometry.attributes.position.array;
        const colors = this.electronCloud.geometry.attributes.color.array;
        
        const pointCount = Math.min(data.length, positions.length / 3);
        
        for (let i = 0; i < pointCount; i++) {
            const point = data[i];
            const i3 = i * 3;
            
            // 更新位置（归一化到合理范围）
            const scale = 5; // 缩放因子
            positions[i3] = point.x / 10 * scale;
            positions[i3 + 1] = point.y / 10 * scale;
            positions[i3 + 2] = point.z / 10 * scale;
            
            // 基于概率更新颜色
            const probability = point.probability || 0;
            const intensity = Math.min(1, probability * 10); // 增强颜色强度
            
            // 根据量子态设置不同颜色
            if (this.currentState) {
                const l = this.currentState.l || 0;
                
                switch(l) {
                    case 0: // s轨道 - 蓝色
                        colors[i3] = 0.4 * intensity;
                        colors[i3 + 1] = 0.6 * intensity;
                        colors[i3 + 2] = 1.0 * intensity;
                        break;
                    case 1: // p轨道 - 绿色
                        colors[i3] = 0.4 * intensity;
                        colors[i3 + 1] = 1.0 * intensity;
                        colors[i3 + 2] = 0.6 * intensity;
                        break;
                    case 2: // d轨道 - 紫色
                        colors[i3] = 0.8 * intensity;
                        colors[i3 + 1] = 0.4 * intensity;
                        colors[i3 + 2] = 1.0 * intensity;
                        break;
                    default: // 其他 - 青色
                        colors[i3] = 0.4 * intensity;
                        colors[i3 + 1] = 1.0 * intensity;
                        colors[i3 + 2] = 1.0 * intensity;
                }
            } else {
                // 默认颜色（蓝色）
                colors[i3] = 0.4 * intensity;
                colors[i3 + 1] = 0.6 * intensity;
                colors[i3 + 2] = 1.0 * intensity;
            }
        }
        
        // 标记几何体需要更新
        this.electronCloud.geometry.attributes.position.needsUpdate = true;
        this.electronCloud.geometry.attributes.color.needsUpdate = true;
        
        // 更新点数量
        this.electronCloud.geometry.setDrawRange(0, pointCount);
    },
    
    // 设置量子态数据
    setData(data, state) {
        this.currentData = data;
        this.currentState = state;
        
        if (data && data.length > 0) {
            this.updateElectronCloud(data);
            
            // 根据量子态调整视图
            this.adjustViewForState(state);
            
            // 显示电子云
            if (this.electronCloud) {
                this.electronCloud.visible = true;
            }
        }
    },
    
    // 根据量子态调整视图
    adjustViewForState(state) {
        if (!state) return;
        
        const n = state.n || 1;
        const l = state.l || 0;
        
        // 根据主量子数调整相机距离
        const baseDistance = 5;
        const distance = baseDistance + (n - 1) * 2;
        this.camera.position.set(distance, distance, distance);
        this.camera.lookAt(0, 0, 0);
        
        // 根据轨道类型调整点大小
        if (this.electronCloud && this.electronCloud.material) {
            let pointSize = 0.1;
            if (l === 0) pointSize = 0.15; // s轨道稍大
            else if (l === 1) pointSize = 0.12; // p轨道
            else if (l === 2) pointSize = 0.08; // d轨道较小
            
            this.electronCloud.material.size = pointSize;
            this.electronCloud.material.needsUpdate = true;
        }
    },
    
    // 动画循环
    animate() {
        if (!this.isInitialized) return;
        
        // 请求下一帧
        this.animationFrameId = requestAnimationFrame(() => this.animate());
        
        // 更新控制器
        if (this.controls) {
            this.controls.update();
        }
        
        // 旋转电子云（如果动画开启）
        if (this.isAnimating && this.electronCloud) {
            this.electronCloud.rotation.y += 0.002;
            this.electronCloud.rotation.x += 0.001;
        }
        
        // 原子核脉动效果
        if (this.nucleus) {
            const scale = 1 + 0.1 * Math.sin(Date.now() * 0.002);
            this.nucleus.scale.set(scale, scale, scale);
        }
        
        // 渲染场景
        this.renderer.render(this.scene, this.camera);
    },
    
    // 窗口大小变化处理
    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        const canvas = this.renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        
        // 更新相机
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        // 更新渲染器
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    },
    
    // 开始/停止动画
    toggleAnimation() {
        this.isAnimating = !this.isAnimating;
        return this.isAnimating;
    },
    
    // 重置视图
    resetView() {
        if (this.controls) {
            this.controls.reset();
        }
        
        // 重置相机位置
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);
    },
    
    // 切换可视化模式
    setVisualizationMode(mode) {
        if (!this.electronCloud || !this.electronCloud.material) return;
        
        switch(mode) {
            case 'points':
                // 点状模式
                this.electronCloud.material.size = 0.1;
                this.electronCloud.material.opacity = 0.8;
                this.electronCloud.material.transparent = true;
                break;
                
            case 'density':
                // 密度模式（稍大的点）
                this.electronCloud.material.size = 0.2;
                this.electronCloud.material.opacity = 0.6;
                break;
                
            case 'surface':
                // 表面模式（更小的点，更高的密度感）
                this.electronCloud.material.size = 0.05;
                this.electronCloud.material.opacity = 0.9;
                break;
        }
        
        this.electronCloud.material.needsUpdate = true;
    },
    
    // 更新点密度
    updatePointDensity(count) {
        this.pointsCount = count;
        this.createElectronCloud(count);
        
        // 如果已经有数据，重新应用
        if (this.currentData) {
            this.updateElectronCloud(this.currentData);
        }
    },
    
    // 更新概率阈值（筛选点）
    updateProbabilityCutoff(cutoff) {
        if (!this.currentData || !this.electronCloud) return;
        
        const filteredData = this.currentData.filter(point => 
            point.probability >= cutoff
        );
        
        this.updateElectronCloud(filteredData);
    },
    
    // 截图功能
    captureScreenshot() {
        if (!this.renderer) return null;
        
        // 渲染当前帧
        this.renderer.render(this.scene, this.camera);
        
        // 获取数据URL
        const dataURL = this.renderer.domElement.toDataURL('image/png');
        
        return dataURL;
    },
    
    // 显示/隐藏坐标轴
    toggleAxes(visible) {
        if (this.axesHelper) {
            this.axesHelper.visible = visible;
        }
    },
    
    // 清理资源
    dispose() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        if (this.controls) {
            this.controls.dispose();
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
};

// 导出到全局作用域
window.VisualizationEngine = VisualizationEngine;
