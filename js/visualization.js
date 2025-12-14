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
    directionalLight: null,
    pointLight: null,
    
    // 状态变量
    isInitialized: false,
    isAnimating: true,
    animationFrameId: null,
    currentData: null,
    currentState: null,
    pointsCount: 3000,
    orbitControlsAvailable: false,
    
    // 初始化Three.js场景
    init(canvasId) {
        try {
            console.log('开始初始化Three.js可视化引擎...');
            
            // 检查Three.js是否已加载
            if (typeof THREE === 'undefined') {
                console.error('Three.js is not loaded');
                this.showFallbackMessage(canvasId, 'Three.js库未加载');
                return false;
            }
            
            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.error(`Canvas element with id "${canvasId}" not found.`);
                return false;
            }
            
            console.log('Canvas found, creating Three.js scene...');
            
            // 创建Three.js场景
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x0f172a);
            
            // 创建相机
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            console.log(`Canvas尺寸: ${width}x${height}`);
            
            this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
            this.camera.position.set(15, 15, 15);
            this.camera.lookAt(0, 0, 0);
            
            // 创建渲染器
            this.renderer = new THREE.WebGLRenderer({ 
                canvas: canvas,
                antialias: true,
                alpha: false,
                powerPreference: "high-performance"
            });
            this.renderer.setSize(width, height, false);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.shadowMap.enabled = false;
            
            console.log('Renderer created');
            
            // 检查OrbitControls是否可用
            if (typeof THREE.OrbitControls !== 'undefined') {
                try {
                    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                    this.controls.enableDamping = true;
                    this.controls.dampingFactor = 0.05;
                    this.controls.rotateSpeed = 0.5;
                    this.controls.minDistance = 5;
                    this.controls.maxDistance = 100;
                    this.orbitControlsAvailable = true;
                    console.log('OrbitControls initialized');
                } catch (controlsError) {
                    console.warn('OrbitControls failed to initialize:', controlsError);
                }
            } else {
                console.warn('OrbitControls not available');
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
            console.log('Three.js可视化引擎初始化成功');
            
            return true;
        } catch (error) {
            console.error('初始化Three.js失败:', error);
            
            // 提供降级方案
            this.showFallbackMessage(canvasId, '3D引擎初始化失败: ' + error.message);
            
            return false;
        }
    },
    
    // 显示降级消息
    showFallbackMessage(canvasId, message) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // 设置画布大小
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        
        // 绘制错误消息
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('3D可视化不可用', canvas.width/2, canvas.height/2 - 30);
        
        ctx.fillStyle = '#3b82f6';
        ctx.font = '16px Arial';
        ctx.fillText(message, canvas.width/2, canvas.height/2);
    },
    
    // 添加光源
    addLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // 平行光
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.directionalLight.position.set(10, 10, 10);
        this.scene.add(this.directionalLight);
        
        // 点光源（模拟原子核发光）
        this.pointLight = new THREE.PointLight(0xff4444, 1, 50);
        this.pointLight.position.set(0, 0, 0);
        this.scene.add(this.pointLight);
    },
    
    // 添加坐标轴
    addAxes() {
        // 创建坐标轴辅助器
        const axesSize = 10;
        this.axesHelper = new THREE.AxesHelper(axesSize);
        this.scene.add(this.axesHelper);
        
        // 添加网格
        const gridHelper = new THREE.GridHelper(20, 20);
        gridHelper.position.y = -0.01;
        this.scene.add(gridHelper);
    },
    
    // 添加原子核
    addNucleus() {
        // 原子核几何体
        const geometry = new THREE.SphereGeometry(0.3, 32, 32);
        
        // 原子核材质
        const material = new THREE.MeshPhongMaterial({
            color: 0xff4444,
            emissive: 0xff0000,
            emissiveIntensity: 0.3,
            shininess: 100
        });
        
        this.nucleus = new THREE.Mesh(geometry, material);
        this.scene.add(this.nucleus);
        
        // 添加原子核发光光晕
        const glowGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4444,
            transparent: true,
            opacity: 0.2
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.nucleus.add(glow);
    },
    
    // 创建电子云
    createElectronCloud(pointCount) {
        console.log(`创建电子云，点数: ${pointCount}`);
        
        // 移除现有的电子云
        if (this.electronCloud) {
            this.scene.remove(this.electronCloud);
            if (this.electronCloud.geometry) {
                this.electronCloud.geometry.dispose();
            }
            if (this.electronCloud.material) {
                this.electronCloud.material.dispose();
            }
            console.log('已移除旧电子云');
        }
        
        this.pointsCount = pointCount;
        
        // 创建点云几何体
        const geometry = new THREE.BufferGeometry();
        
        // 创建位置数组
        const positions = new Float32Array(pointCount * 3);
        
        // 创建颜色数组
        const colors = new Float32Array(pointCount * 3);
        
        // 初始填充随机位置和颜色
        for (let i = 0; i < pointCount; i++) {
            const i3 = i * 3;
            // 初始位置在原点附近
            positions[i3] = (Math.random() - 0.5) * 2;
            positions[i3 + 1] = (Math.random() - 0.5) * 2;
            positions[i3 + 2] = (Math.random() - 0.5) * 2;
            
            // 初始颜色（蓝色）
            colors[i3] = 0.4;
            colors[i3 + 1] = 0.6;
            colors[i3 + 2] = 1.0;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        // 创建点云材质
        const material = new THREE.PointsMaterial({
            size: 0.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        // 创建点云对象
        this.electronCloud = new THREE.Points(geometry, material);
        this.scene.add(this.electronCloud);
        
        console.log('电子云创建完成');
    },
    
    // 更新电子云数据 - 修复版
    updateElectronCloud(data, state) {
        if (!this.electronCloud || !data || data.length === 0) {
            console.warn('无法更新电子云：无数据或电子云未创建');
            if (data) {
                console.log(`传入数据长度: ${data.length}`);
            }
            return;
        }
        
        console.log(`更新电子云数据，点数: ${data.length}`);
        console.log('第一个点:', data[0]);
        
        const geometry = this.electronCloud.geometry;
        const positions = geometry.attributes.position.array;
        const colors = geometry.attributes.color.array;
        
        const pointCount = Math.min(data.length, positions.length / 3);
        
        // 找出数据的最大范围
        let maxX = 0, maxY = 0, maxZ = 0;
        for (let i = 0; i < pointCount; i++) {
            const point = data[i];
            maxX = Math.max(maxX, Math.abs(point.x));
            maxY = Math.max(maxY, Math.abs(point.y));
            maxZ = Math.max(maxZ, Math.abs(point.z));
        }
        
        const maxRange = Math.max(maxX, maxY, maxZ);
        const scale = maxRange > 0 ? 10 / maxRange : 1;
        
        console.log(`数据范围: x:${maxX.toFixed(2)}, y:${maxY.toFixed(2)}, z:${maxZ.toFixed(2)}, 缩放因子: ${scale.toFixed(2)}`);
        
        for (let i = 0; i < pointCount; i++) {
            const point = data[i];
            const i3 = i * 3;
            
            // 更新位置并应用缩放
            positions[i3] = point.x * scale;
            positions[i3 + 1] = point.y * scale;
            positions[i3 + 2] = point.z * scale;
            
            // 基于概率更新颜色
            const probability = point.probability || 0;
            const intensity = Math.min(1, probability * 2);
            
            // 使用数据中的颜色或根据量子态设置颜色
            if (point.color) {
                colors[i3] = point.color[0] / 255;
                colors[i3 + 1] = point.color[1] / 255;
                colors[i3 + 2] = point.color[2] / 255;
            } else if (state) {
                const l = state.l || 0;
                
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
            }
        }
        
        // 标记几何体需要更新
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;
        
        // 更新点数量
        geometry.setDrawRange(0, pointCount);
        
        // 重新计算边界框
        geometry.computeBoundingSphere();
        
        console.log(`电子云更新完成，显示${pointCount}个点`);
    },
    
    // 设置量子态数据
    setData(data, state) {
        this.currentData = data;
        this.currentState = state;
        
        if (data && data.length > 0) {
            console.log(`设置数据，状态: ${state ? state.label : '无状态'}, 数据点: ${data.length}`);
            this.updateElectronCloud(data, state);
            
            // 根据量子态调整视图
            this.adjustViewForState(state);
            
            // 显示电子云
            if (this.electronCloud) {
                this.electronCloud.visible = true;
                console.log('电子云已显示');
            }
        } else {
            console.warn('setData: 无数据或数据为空');
        }
    },
    
    // 根据量子态调整视图
    adjustViewForState(state) {
        if (!state) return;
        
        const n = state.n || 1;
        
        // 根据主量子数调整相机距离
        const baseDistance = 15;
        const distance = baseDistance + (n - 1) * 5;
        
        if (this.orbitControlsAvailable && this.controls) {
            this.controls.target.set(0, 0, 0);
            this.camera.position.set(distance, distance, distance);
            this.controls.update();
        } else {
            this.camera.position.set(distance, distance, distance);
            this.camera.lookAt(0, 0, 0);
        }
        
        console.log(`调整视图: n=${n}, 相机距离=${distance.toFixed(1)}`);
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
        if (this.isAnimating && this.electronCloud && this.electronCloud.visible) {
            this.electronCloud.rotation.y += 0.002;
            this.electronCloud.rotation.x += 0.001;
        }
        
        // 原子核脉动效果
        if (this.nucleus) {
            const time = Date.now() * 0.001;
            const scale = 1 + 0.1 * Math.sin(time * 2);
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
        this.renderer.setSize(width, height, false);
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
        this.camera.position.set(15, 15, 15);
        this.camera.lookAt(0, 0, 0);
        
        if (this.controls) {
            this.controls.update();
        }
        
        console.log('视图已重置');
    },
    
    // 切换可视化模式
    setVisualizationMode(mode) {
        if (!this.electronCloud || !this.electronCloud.material) return;
        
        switch(mode) {
            case 'points':
                this.electronCloud.material.size = 0.2;
                this.electronCloud.material.opacity = 0.8;
                break;
            case 'density':
                this.electronCloud.material.size = 0.3;
                this.electronCloud.material.opacity = 0.6;
                break;
            case 'surface':
                this.electronCloud.material.size = 0.1;
                this.electronCloud.material.opacity = 0.9;
                break;
        }
        
        this.electronCloud.material.needsUpdate = true;
    },
    
    // 截图功能
    captureScreenshot() {
        if (!this.renderer) return null;
        
        try {
            // 渲染当前帧
            this.renderer.render(this.scene, this.camera);
            
            // 获取数据URL
            const dataURL = this.renderer.domElement.toDataURL('image/png');
            return dataURL;
        } catch (error) {
            console.error('Error capturing screenshot:', error);
            return null;
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
        
        this.isInitialized = false;
        console.log('Visualization engine disposed');
    }
};

// 导出到全局作用域
window.VisualizationEngine = VisualizationEngine;
