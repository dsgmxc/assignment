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
            
            console.log('Initializing Three.js...');
            
            // 创建Three.js场景
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x0f172a);
            this.scene.fog = new THREE.Fog(0x0f172a, 5, 20);
            
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
                alpha: true,
                powerPreference: "high-performance"
            });
            this.renderer.setSize(width, height, false);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            
            // 检查OrbitControls是否可用
            if (typeof THREE.OrbitControls === 'function') {
                try {
                    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                    this.controls.enableDamping = true;
                    this.controls.dampingFactor = 0.05;
                    this.controls.rotateSpeed = 0.5;
                    this.controls.minDistance = 2;
                    this.controls.maxDistance = 50;
                    this.orbitControlsAvailable = true;
                    console.log('OrbitControls initialized');
                } catch (controlsError) {
                    console.warn('OrbitControls failed to initialize:', controlsError);
                    this.setupBasicControls();
                }
            } else {
                console.warn('OrbitControls not available, using basic controls');
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
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px Arial';
        ctx.fillText('正在切换到2D可视化模式...', canvas.width/2, canvas.height/2 + 30);
        
        // 初始化2D降级可视化
        setTimeout(() => {
            if (typeof FallbackVisualization !== 'undefined') {
                FallbackVisualization.init(canvasId);
            }
        }, 1000);
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
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);
        
        // 平行光
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.directionalLight.position.set(5, 5, 5);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(this.directionalLight);
        
        // 点光源（模拟原子核发光）
        this.pointLight = new THREE.PointLight(0xff4444, 1, 50);
        this.pointLight.position.set(0, 0, 0);
        this.scene.add(this.pointLight);
        
        // 辅助光源
        const fillLight = new THREE.DirectionalLight(0x88ccff, 0.3);
        fillLight.position.set(-5, -3, -5);
        this.scene.add(fillLight);
    },
    
    // 添加坐标轴
    addAxes() {
        // 创建坐标轴辅助器
        this.axesHelper = new THREE.AxesHelper(5);
        
        // 自定义坐标轴材质
        const axesMaterialX = new THREE.LineBasicMaterial({ color: 0xff3333 });
        const axesMaterialY = new THREE.LineBasicMaterial({ color: 0x33ff33 });
        const axesMaterialZ = new THREE.LineBasicMaterial({ color: 0x3377ff });
        
        // 创建自定义坐标轴
        const axesGeometry = new THREE.BufferGeometry();
        const axesVertices = new Float32Array([
            0, 0, 0, 5, 0, 0,  // X轴
            0, 0, 0, 0, 5, 0,  // Y轴
            0, 0, 0, 0, 0, 5   // Z轴
        ]);
        axesGeometry.setAttribute('position', new THREE.BufferAttribute(axesVertices, 3));
        
        // 创建线条对象
        const axesLine = new THREE.LineSegments(
            axesGeometry,
            [axesMaterialX, axesMaterialY, axesMaterialZ]
        );
        
        this.scene.add(axesLine);
        
        // 添加坐标轴标签（使用CSS3D）
        this.addAxisLabels();
    },
    
    // 添加坐标轴标签
    addAxisLabels() {
        const canvas = this.renderer.domElement;
        const container = canvas.parentElement;
        
        // 创建标签容器
        const labelsContainer = document.createElement('div');
        labelsContainer.className = 'axis-labels';
        labelsContainer.style.position = 'absolute';
        labelsContainer.style.top = '0';
        labelsContainer.style.left = '0';
        labelsContainer.style.width = '100%';
        labelsContainer.style.height = '100%';
        labelsContainer.style.pointerEvents = 'none';
        
        // 创建标签
        const createLabel = (text, color, x, y) => {
            const label = document.createElement('div');
            label.textContent = text;
            label.style.position = 'absolute';
            label.style.color = color;
            label.style.fontWeight = 'bold';
            label.style.fontSize = '16px';
            label.style.transform = 'translate(-50%, -50%)';
            label.style.left = x + '%';
            label.style.top = y + '%';
            label.style.textShadow = '0 0 3px rgba(0,0,0,0.8)';
            return label;
        };
        
        // 添加坐标轴标签
        labelsContainer.appendChild(createLabel('X', '#ff3333', '55', '50'));
        labelsContainer.appendChild(createLabel('Y', '#33ff33', '50', '45'));
        labelsContainer.appendChild(createLabel('Z', '#3377ff', '50', '55'));
        
        container.appendChild(labelsContainer);
    },
    
    // 添加原子核
    addNucleus() {
        // 原子核几何体
        const geometry = new THREE.SphereGeometry(0.2, 32, 32);
        
        // 原子核材质（发光效果）
        const material = new THREE.MeshPhongMaterial({
            color: 0xff4444,
            emissive: 0xff0000,
            emissiveIntensity: 0.8,
            shininess: 100,
            specular: 0xff5555
        });
        
        this.nucleus = new THREE.Mesh(geometry, material);
        this.nucleus.castShadow = true;
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
        
        // 添加脉动动画
        this.nucleus.userData.pulse = {
            phase: 0,
            speed: 0.01,
            amplitude: 0.1
        };
    },
    
    // 创建电子云
    createElectronCloud(pointCount) {
        // 移除现有的电子云
        if (this.electronCloud) {
            this.scene.remove(this.electronCloud);
            if (this.electronCloud.geometry) {
                this.electronCloud.geometry.dispose();
            }
            if (this.electronCloud.material) {
                this.electronCloud.material.dispose();
            }
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
            sizeAttenuation: true,
            alphaTest: 0.5
        });
        
        // 创建点云对象
        this.electronCloud = new THREE.Points(geometry, material);
        this.electronCloud.frustumCulled = false;
        this.scene.add(this.electronCloud);
    },
    
    // 更新电子云数据
    updateElectronCloud(data) {
        if (!this.electronCloud || !data || data.length === 0) {
            console.warn('No electron cloud data to update');
            return;
        }
        
        const geometry = this.electronCloud.geometry;
        const positions = geometry.attributes.position.array;
        const colors = geometry.attributes.color.array;
        
        const pointCount = Math.min(data.length, positions.length / 3);
        
        // 计算数据边界用于缩放
        let maxDistance = 0;
        for (let i = 0; i < pointCount; i++) {
            const point = data[i];
            const distance = Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z);
            if (distance > maxDistance) maxDistance = distance;
        }
        
        const scale = maxDistance > 0 ? 5 / maxDistance : 1;
        
        for (let i = 0; i < pointCount; i++) {
            const point = data[i];
            const i3 = i * 3;
            
            // 更新位置并归一化到合理范围
            positions[i3] = point.x * scale;
            positions[i3 + 1] = point.y * scale;
            positions[i3 + 2] = point.z * scale;
            
            // 基于概率更新颜色
            const probability = point.probability || 0;
            const intensity = Math.min(1, probability * 3);
            
            // 使用数据中的颜色或根据量子态设置颜色
            if (point.color) {
                colors[i3] = point.color[0] / 255;
                colors[i3 + 1] = point.color[1] / 255;
                colors[i3 + 2] = point.color[2] / 255;
            } else if (this.currentState) {
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
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;
        
        // 更新点数量
        geometry.setDrawRange(0, pointCount);
        
        // 如果需要，重新计算边界框
        geometry.computeBoundingSphere();
        
        console.log(`Electron cloud updated with ${pointCount} points`);
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
            
            // 根据轨道类型调整光源
            this.adjustLightingForState(state);
        } else {
            console.warn('No data provided to setData');
        }
    },
    
    // 根据量子态调整视图
    adjustViewForState(state) {
        if (!state) return;
        
        const n = state.n || 1;
        const l = state.l || 0;
        
        // 根据主量子数调整相机距离
        const baseDistance = 5;
        const distance = baseDistance + (n - 1) * 1.5;
        
        if (this.orbitControlsAvailable && this.controls) {
            this.controls.target.set(0, 0, 0);
            this.camera.position.set(distance, distance, distance);
            this.controls.update();
        } else {
            this.camera.position.set(distance, distance, distance);
            this.camera.lookAt(0, 0, 0);
        }
        
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
    
    // 根据量子态调整光照
    adjustLightingForState(state) {
        if (!state || !this.directionalLight) return;
        
        const l = state.l || 0;
        const m = state.m || 0;
        
        // 根据轨道类型调整主光源位置以突出形状
        switch(l) {
            case 0: // s轨道 - 均匀光照
                this.directionalLight.position.set(5, 5, 5);
                break;
            case 1: // p轨道
                if (m === 0) this.directionalLight.position.set(0, 0, 5);  // pz
                else if (m === 1) this.directionalLight.position.set(5, 0, 0);  // px
                else if (m === -1) this.directionalLight.position.set(0, 5, 0); // py
                break;
            case 2: // d轨道
                this.directionalLight.position.set(3, 3, 3);
                break;
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
        if (this.nucleus && this.nucleus.userData.pulse) {
            const pulse = this.nucleus.userData.pulse;
            pulse.phase += pulse.speed;
            
            const scale = 1 + Math.sin(pulse.phase) * pulse.amplitude;
            this.nucleus.scale.set(scale, scale, scale);
            
            // 调整发光强度
            if (this.pointLight) {
                this.pointLight.intensity = 1 + 0.5 * Math.sin(pulse.phase);
            }
        }
        
        // 更新电子云颜色脉动效果
        if (this.electronCloud && this.electronCloud.visible) {
            const time = Date.now() * 0.001;
            const colors = this.electronCloud.geometry.attributes.color.array;
            
            // 轻微颜色脉动效果
            for (let i = 0; i < colors.length; i += 3) {
                const pulse = 0.1 * Math.sin(time + i * 0.01);
                colors[i] = Math.min(1, colors[i] + pulse);
                colors[i + 1] = Math.min(1, colors[i + 1] + pulse);
                colors[i + 2] = Math.min(1, colors[i + 2] + pulse);
            }
            
            this.electronCloud.geometry.attributes.color.needsUpdate = true;
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
        
        // 更新像素比
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
        
        if (this.controls) {
            this.controls.update();
        }
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
                this.electronCloud.material.blending = THREE.AdditiveBlending;
                break;
                
            case 'density':
                // 密度模式（稍大的点）
                this.electronCloud.material.size = 0.2;
                this.electronCloud.material.opacity = 0.6;
                this.electronCloud.material.blending = THREE.NormalBlending;
                break;
                
            case 'surface':
                // 表面模式（更小的点，更高的密度感）
                this.electronCloud.material.size = 0.05;
                this.electronCloud.material.opacity = 0.9;
                this.electronCloud.material.blending = THREE.AdditiveBlending;
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
        
        try {
            // 临时禁用控制器
            const controlsEnabled = this.controls ? this.controls.enabled : false;
            if (this.controls) this.controls.enabled = false;
            
            // 渲染当前帧
            this.renderer.render(this.scene, this.camera);
            
            // 获取数据URL
            const dataURL = this.renderer.domElement.toDataURL('image/png');
            
            // 恢复控制器状态
            if (this.controls) this.controls.enabled = controlsEnabled;
            
            return dataURL;
        } catch (error) {
            console.error('Error capturing screenshot:', error);
            return null;
        }
    },
    
    // 显示/隐藏坐标轴
    toggleAxes(visible) {
        if (this.axesHelper) {
            this.axesHelper.visible = visible;
        }
    },
    
    // 显示/隐藏原子核
    toggleNucleus(visible) {
        if (this.nucleus) {
            this.nucleus.visible = visible;
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
        
        // 清理场景中的所有对象
        if (this.scene) {
            while(this.scene.children.length > 0) { 
                this.scene.remove(this.scene.children[0]); 
            }
        }
        
        this.isInitialized = false;
        console.log('Visualization engine disposed');
    }
};

// 导出到全局作用域
window.VisualizationEngine = VisualizationEngine;
