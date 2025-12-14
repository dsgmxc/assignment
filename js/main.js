// 主应用程序
class HydrogenVisualizationApp {
    constructor() {
        this.isInitialized = false;
        this.is3DEnabled = true;
        this.loadingElement = null;
        this.currentQuantumState = null;
        this.notifications = [];
        this.visualizationMode = 'points';
        this.currentAnimationSpeed = 1.0;
        this.quantumStates = this.initializeQuantumStates();
    }
    
    initializeQuantumStates() {
        return [
            { n: 1, l: 0, m: 0, label: "1s", name: "1s轨道", description: "基态，球形对称" },
            { n: 2, l: 0, m: 0, label: "2s", name: "2s轨道", description: "第一激发态，球形对称" },
            { n: 2, l: 1, m: 0, label: "2pz", name: "2pz轨道", description: "哑铃形，沿z轴" },
            { n: 2, l: 1, m: 1, label: "2px", name: "2px轨道", description: "哑铃形，沿x轴" },
            { n: 2, l: 1, m: -1, label: "2py", name: "2py轨道", description: "哑铃形，沿y轴" },
            { n: 3, l: 0, m: 0, label: "3s", name: "3s轨道", description: "球形对称，有径向节面" },
            { n: 3, l: 1, m: 0, label: "3pz", name: "3pz轨道", description: "哑铃形，有径向节面" },
            { n: 3, l: 2, m: 0, label: "3dz²", name: "3dz²轨道", description: "花瓣形，沿z轴" },
            { n: 3, l: 2, m: 1, label: "3dxz", name: "3dxz轨道", description: "花瓣形，在xz平面" },
            { n: 3, l: 2, m: -1, label: "3dyz", name: "3dyz轨道", description: "花瓣形，在yz平面" },
            { n: 3, l: 2, m: 2, label: "3dx²-y²", name: "3dx²-y²轨道", description: "花瓣形，在xy平面沿x,y轴" },
            { n: 3, l: 2, m: -2, label: "3dxy", name: "3dxy轨道", description: "花瓣形，在xy平面对角线" }
        ];
    }
    
    init() {
        console.log('Initializing Hydrogen Visualization App...');
        
        this.loadingElement = document.getElementById('loadingText');
        
        // 检查WebGL支持
        this.checkWebGLSupport();
        
        // 设置事件监听器
        this.setupEventListeners();
        
        // 初始化可视化
        this.initVisualization();
        
        // 更新UI
        this.updateUI();
        
        // 添加通知样式
        this.addNotificationStyles();
        
        console.log('App initialized successfully');
    }
    
    // 检查WebGL支持
    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) {
                console.warn('WebGL not supported, falling back to 2D');
                this.is3DEnabled = false;
                this.showNotification('WebGL不支持，正在使用2D可视化模式', 'warning');
            } else {
                console.log('WebGL is supported');
            }
        } catch (error) {
            console.warn('WebGL check failed:', error);
            this.is3DEnabled = false;
        }
    }
    
    // 初始化可视化引擎
    initVisualization() {
        if (this.loadingElement) {
            this.loadingElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>正在初始化可视化引擎...</span>';
            this.loadingElement.style.display = 'flex';
        }
        
        // 延迟初始化，确保DOM完全加载
        setTimeout(() => {
            try {
                if (this.is3DEnabled && typeof VisualizationEngine !== 'undefined') {
                    console.log('Attempting to initialize 3D engine...');
                    const initSuccess = VisualizationEngine.init('electronCanvas');
                    
                    if (initSuccess) {
                        console.log('3D visualization engine initialized');
                        this.isInitialized = true;
                        this.showNotification('3D可视化引擎已就绪', 'success');
                        
                        // 默认选择1s轨道
                        setTimeout(() => {
                            this.selectQuantumState('1,0,0');
                        }, 500);
                    } else {
                        console.warn('3D engine failed');
                        this.showNotification('3D引擎初始化失败', 'error');
                    }
                } else {
                    console.log('3D not enabled or engine not available');
                }
                
                if (this.loadingElement) {
                    this.loadingElement.style.display = 'none';
                }
            } catch (error) {
                console.error('Error initializing visualization:', error);
                this.showError('初始化过程中发生错误: ' + error.message);
            }
        }, 500);
    }
    
    // 获取量子态信息
    getQuantumState(n, l, m) {
        return this.quantumStates.find(state => 
            state.n === n && state.l === l && state.m === m
        ) || null;
    }
    
    // 获取所有量子态
    getAllQuantumStates() {
        return this.quantumStates;
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 量子态选择
        const quantumSelect = document.getElementById('quantumState');
        if (quantumSelect) {
            quantumSelect.addEventListener('change', (e) => this.onQuantumStateChange(e));
        }
        
        // 可视化模式切换
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.onModeButtonClick(e));
        });
        
        // 参数控制
        const pointDensity = document.getElementById('pointDensity');
        if (pointDensity) {
            pointDensity.addEventListener('input', (e) => this.onParameterChange(e));
            pointDensity.addEventListener('change', (e) => this.onParameterChange(e));
        }
        
        const probabilityCutoff = document.getElementById('probabilityCutoff');
        if (probabilityCutoff) {
            probabilityCutoff.addEventListener('input', (e) => this.onParameterChange(e));
            probabilityCutoff.addEventListener('change', (e) => this.onParameterChange(e));
        }
        
        const animationSpeed = document.getElementById('animationSpeed');
        if (animationSpeed) {
            animationSpeed.addEventListener('input', (e) => this.onParameterChange(e));
            animationSpeed.addEventListener('change', (e) => this.onParameterChange(e));
        }
        
        // 控制按钮
        const animateBtn = document.getElementById('animateBtn');
        if (animateBtn) {
            animateBtn.addEventListener('click', () => this.onAnimateButtonClick());
        }
        
        const screenshotBtn = document.getElementById('screenshotBtn');
        if (screenshotBtn) {
            screenshotBtn.addEventListener('click', () => this.onScreenshotButtonClick());
        }
        
        const exportDataBtn = document.getElementById('exportDataBtn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => this.onExportDataButtonClick());
        }
        
        const resetViewBtn = document.getElementById('resetViewBtn');
        if (resetViewBtn) {
            resetViewBtn.addEventListener('click', () => this.onResetViewButtonClick());
        }
        
        // 画布控制按钮
        const zoomInBtn = document.getElementById('zoomInBtn');
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => this.zoomIn());
        }
        
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => this.zoomOut());
        }
        
        const rotateBtn = document.getElementById('rotateBtn');
        if (rotateBtn) {
            rotateBtn.addEventListener('click', () => this.toggleRotation());
        }
        
        // 导航链接
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.onNavLinkClick(e));
        });
        
        // 窗口大小改变
        window.addEventListener('resize', () => this.onWindowResize());
        
        // 键盘快捷键
        this.setupKeyboardShortcuts();
    }
    
    // 设置键盘快捷键
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                return;
            }
            
            switch(e.key.toLowerCase()) {
                case ' ':
                    e.preventDefault();
                    this.onAnimateButtonClick();
                    break;
                case 'r':
                    this.onResetViewButtonClick();
                    break;
                case '+':
                case '=':
                    this.zoomIn();
                    break;
                case '-':
                case '_':
                    this.zoomOut();
                    break;
                case 's':
                    this.onScreenshotButtonClick();
                    break;
                case '1':
                    this.selectQuantumState('1,0,0');
                    break;
                case '2':
                    this.selectQuantumState('2,0,0');
                    break;
                case '3':
                    this.selectQuantumState('3,0,0');
                    break;
            }
        });
    }
    
    // 选择量子态
    selectQuantumState(value) {
        const selectElement = document.getElementById('quantumState');
        if (selectElement) {
            selectElement.value = value;
            this.onQuantumStateChange({ target: selectElement });
        }
    }
    
    // 量子态改变事件
    onQuantumStateChange(event) {
        const value = event.target.value;
        if (!value) return;
        
        console.log('Selected quantum state:', value);
        
        const [n, l, m] = value.split(',').map(Number);
        
        const state = this.getQuantumState(n, l, m);
        if (!state) {
            this.showError('无效的量子态');
            return;
        }
        
        this.currentQuantumState = state;
        
        // 更新量子数显示
        this.updateQuantumNumberDisplay(n, l, m);
        
        // 生成电子云数据
        this.generateAndDisplayElectronCloud(n, l, m);
    }
    
    // 更新量子数显示
    updateQuantumNumberDisplay(n, l, m) {
        const nValue = document.getElementById('nValue');
        const lValue = document.getElementById('lValue');
        const mValue = document.getElementById('mValue');
        
        if (nValue) nValue.textContent = n;
        if (lValue) {
            const orbitalNames = ['s', 'p', 'd', 'f'];
            const orbitalName = orbitalNames[l] || l;
            lValue.innerHTML = `${l} <span style="font-size:0.8em;color:#94a3b8">(${orbitalName})</span>`;
        }
        if (mValue) mValue.textContent = m;
    }
    
    // 生成并显示电子云
    generateAndDisplayElectronCloud(n, l, m) {
        if (!this.isInitialized) {
            this.showError('可视化引擎未初始化');
            return;
        }
        
        this.showLoading('正在生成电子云数据...');
        
        requestAnimationFrame(() => {
            try {
                const numPoints = parseInt(document.getElementById('pointDensity').value) || 3000;
                const cutoff = parseFloat(document.getElementById('probabilityCutoff').value) || 0.05;
                
                console.log(`Generating electron cloud: n=${n}, l=${l}, m=${m}, points=${numPoints}`);
                
                // 生成电子云数据
                const electronData = this.generateElectronCloudData(n, l, m, numPoints);
                
                if (!electronData || electronData.length === 0) {
                    throw new Error('电子云数据生成失败');
                }
                
                // 应用概率阈值过滤
                const filteredData = electronData.filter(point => point.probability >= cutoff);
                
                console.log(`Generated ${electronData.length} points, filtered to ${filteredData.length} points`);
                
                // 更新可视化
                if (this.is3DEnabled && VisualizationEngine && VisualizationEngine.setData) {
                    VisualizationEngine.setData(filteredData, this.currentQuantumState);
                }
                
                this.hideLoading();
                
                this.showNotification(
                    `已切换到 ${this.currentQuantumState.label} 轨道<br>` +
                    `<small>${this.currentQuantumState.description}</small>`, 
                    'success'
                );
                
            } catch (error) {
                console.error('Error generating electron cloud:', error);
                this.showError('生成电子云数据失败: ' + error.message);
            }
        });
    }
    
    // 生成电子云数据
    generateElectronCloudData(n, l, m, numPoints) {
        const data = [];
        const maxRadius = n * 3;
        
        // 轨道颜色
        const getOrbitalColor = (l, probability, x, y, z) => {
            const orbitalColors = [
                [100, 150, 255], // s轨道 - 蓝色
                [100, 255, 150], // p轨道 - 绿色
                [200, 100, 255], // d轨道 - 紫色
                [255, 200, 100]  // f轨道 - 橙色
            ];
            
            const baseColor = orbitalColors[l] || orbitalColors[0];
            const intensity = 0.5 + probability * 0.5;
            
            return [
                Math.min(255, Math.floor(baseColor[0] * intensity)),
                Math.min(255, Math.floor(baseColor[1] * intensity)),
                Math.min(255, Math.floor(baseColor[2] * intensity))
            ];
        };
        
        // 生成点
        for (let i = 0; i < numPoints; i++) {
            let x, y, z, probability;
            
            // 根据轨道类型生成不同分布
            if (l === 0) { // s轨道 - 球形
                const phi = Math.random() * Math.PI * 2;
                const theta = Math.acos(2 * Math.random() - 1);
                const r = Math.random() * maxRadius;
                
                x = r * Math.sin(theta) * Math.cos(phi);
                y = r * Math.sin(theta) * Math.sin(phi);
                z = r * Math.cos(theta);
                
                probability = Math.exp(-r / n);
            } 
            else if (l === 1) { // p轨道
                const phi = Math.random() * Math.PI * 2;
                const theta = Math.acos(2 * Math.random() - 1);
                const r = Math.random() * maxRadius;
                
                x = r * Math.sin(theta) * Math.cos(phi);
                y = r * Math.sin(theta) * Math.sin(phi);
                z = r * Math.cos(theta);
                
                // p轨道的概率分布
                if (m === 0) { // pz
                    probability = Math.exp(-r / n) * Math.abs(Math.cos(theta));
                } else if (m === 1) { // px
                    probability = Math.exp(-r / n) * Math.abs(Math.sin(theta) * Math.cos(phi));
                } else if (m === -1) { // py
                    probability = Math.exp(-r / n) * Math.abs(Math.sin(theta) * Math.sin(phi));
                } else {
                    probability = Math.exp(-r / n);
                }
            }
            else { // d轨道及其他
                const phi = Math.random() * Math.PI * 2;
                const theta = Math.acos(2 * Math.random() - 1);
                const r = Math.random() * maxRadius;
                
                x = r * Math.sin(theta) * Math.cos(phi);
                y = r * Math.sin(theta) * Math.sin(phi);
                z = r * Math.cos(theta);
                
                probability = Math.exp(-r / n) * Math.pow(Math.sin(theta), 2);
            }
            
            // 归一化概率
            probability = Math.min(1, probability * 2);
            
            data.push({
                x: x,
                y: y,
                z: z,
                probability: probability,
                color: getOrbitalColor(l, probability, x, y, z)
            });
        }
        
        return data;
    }
    
    // 模式按钮点击事件
    onModeButtonClick(event) {
        const button = event.currentTarget;
        const mode = button.dataset.mode;
        
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        button.classList.add('active');
        
        this.visualizationMode = mode;
        
        if (this.is3DEnabled && VisualizationEngine && VisualizationEngine.setVisualizationMode) {
            VisualizationEngine.setVisualizationMode(mode);
        }
        
        this.showNotification(`已切换到${this.getModeName(mode)}模式`, 'info');
    }
    
    // 获取模式名称
    getModeName(mode) {
        const modeNames = {
            'points': '点状云',
            'density': '密度图',
            'surface': '等值面'
        };
        return modeNames[mode] || mode;
    }
    
    // 参数改变事件
    onParameterChange(event) {
        const target = event.target;
        const value = target.value;
        const id = target.id;
        
        switch(id) {
            case 'pointDensity':
                document.getElementById('densityValue').textContent = value;
                if (this.currentQuantumState) {
                    this.generateAndDisplayElectronCloud(
                        this.currentQuantumState.n,
                        this.currentQuantumState.l,
                        this.currentQuantumState.m
                    );
                }
                break;
                
            case 'probabilityCutoff':
                document.getElementById('cutoffValue').textContent = parseFloat(value).toFixed(2);
                if (this.currentQuantumState) {
                    this.generateAndDisplayElectronCloud(
                        this.currentQuantumState.n,
                        this.currentQuantumState.l,
                        this.currentQuantumState.m
                    );
                }
                break;
                
            case 'animationSpeed':
                const speed = parseFloat(value);
                document.getElementById('speedValue').textContent = speed.toFixed(1) + 'x';
                this.currentAnimationSpeed = speed;
                break;
        }
    }
    
    // 动画按钮点击事件
    onAnimateButtonClick() {
        if (!this.isInitialized) {
            this.showError('可视化引擎未初始化');
            return;
        }
        
        try {
            let isAnimating = false;
            
            if (this.is3DEnabled && VisualizationEngine && VisualizationEngine.toggleAnimation) {
                isAnimating = VisualizationEngine.toggleAnimation();
            }
            
            const button = document.getElementById('animateBtn');
            if (button) {
                if (isAnimating) {
                    button.innerHTML = '<i class="fas fa-pause"></i> 暂停动画';
                    this.showNotification('动画已开始', 'success');
                } else {
                    button.innerHTML = '<i class="fas fa-play"></i> 开始动画';
                    this.showNotification('动画已暂停', 'info');
                }
            }
        } catch (error) {
            console.error('Error toggling animation:', error);
            this.showError('控制动画失败');
        }
    }
    
    // 截图按钮点击事件
    onScreenshotButtonClick() {
        if (!this.isInitialized) {
            this.showError('可视化引擎未初始化');
            return;
        }
        
        try {
            let screenshotUrl = null;
            
            if (this.is3DEnabled && VisualizationEngine && VisualizationEngine.captureScreenshot) {
                screenshotUrl = VisualizationEngine.captureScreenshot();
            }
            
            if (screenshotUrl) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const stateLabel = this.currentQuantumState ? this.currentQuantumState.label : 'unknown';
                const filename = `hydrogen-electron-cloud-${stateLabel}-${timestamp}.png`;
                
                const link = document.createElement('a');
                link.download = filename;
                link.href = screenshotUrl;
                link.click();
                
                this.showNotification('截图已保存为 ' + filename, 'success');
            } else {
                throw new Error('无法生成截图');
            }
        } catch (error) {
            console.error('Error capturing screenshot:', error);
            this.showError('截图失败: ' + error.message);
        }
    }
    
    // 导出数据按钮点击事件
    onExportDataButtonClick() {
        if (!this.currentQuantumState) {
            this.showError('请先选择量子态');
            return;
        }
        
        try {
            const n = this.currentQuantumState.n;
            const l = this.currentQuantumState.l;
            const m = this.currentQuantumState.m;
            const numPoints = parseInt(document.getElementById('pointDensity').value) || 3000;
            
            const electronData = this.generateElectronCloudData(n, l, m, Math.min(numPoints, 10000));
            
            const exportData = {
                quantumState: this.currentQuantumState,
                parameters: {
                    n: n,
                    l: l,
                    m: m,
                    points: electronData.length,
                    timestamp: new Date().toISOString()
                },
                data: electronData.map(point => ({
                    x: point.x,
                    y: point.y,
                    z: point.z,
                    probability: point.probability,
                    color: point.color
                }))
            };
            
            const jsonStr = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `hydrogen-data-${this.currentQuantumState.label}-${timestamp}.json`;
            
            const link = document.createElement('a');
            link.download = filename;
            link.href = url;
            link.click();
            
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            this.showNotification('数据已导出为 ' + filename, 'success');
            
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showError('导出数据失败: ' + error.message);
        }
    }
    
    // 重置视图按钮点击事件
    onResetViewButtonClick() {
        if (!this.isInitialized) {
            this.showError('可视化引擎未初始化');
            return;
        }
        
        try {
            if (this.is3DEnabled && VisualizationEngine && VisualizationEngine.resetView) {
                VisualizationEngine.resetView();
            }
            
            this.showNotification('视图已重置', 'info');
        } catch (error) {
            console.error('Error resetting view:', error);
            this.showError('重置视图失败');
        }
    }
    
    // 放大
    zoomIn() {
        if (this.is3DEnabled && VisualizationEngine && VisualizationEngine.camera) {
            VisualizationEngine.camera.position.multiplyScalar(0.9);
            this.showNotification('已放大', 'info');
        }
    }
    
    // 缩小
    zoomOut() {
        if (this.is3DEnabled && VisualizationEngine && VisualizationEngine.camera) {
            VisualizationEngine.camera.position.multiplyScalar(1.1);
            this.showNotification('已缩小', 'info');
        }
    }
    
    // 切换旋转
    toggleRotation() {
        if (this.is3DEnabled && VisualizationEngine && VisualizationEngine.isAnimating !== undefined) {
            VisualizationEngine.isAnimating = !VisualizationEngine.isAnimating;
            const button = document.getElementById('rotateBtn');
            if (button) {
                button.classList.toggle('active');
                this.showNotification(
                    VisualizationEngine.isAnimating ? '旋转已启用' : '旋转已禁用',
                    'info'
                );
            }
        }
    }
    
    // 导航链接点击事件
    onNavLinkClick(event) {
        event.preventDefault();
        
        const link = event.currentTarget;
        const targetId = link.getAttribute('href').substring(1);
        
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
        
        document.querySelectorAll('.nav-link').forEach(l => {
            l.classList.remove('active');
        });
        link.classList.add('active');
    }
    
    // 窗口大小改变事件
    onWindowResize() {
        if (this.is3DEnabled && this.isInitialized && VisualizationEngine && VisualizationEngine.onWindowResize) {
            VisualizationEngine.onWindowResize();
        }
    }
    
    // 更新UI
    updateUI() {
        const pointDensity = document.getElementById('pointDensity');
        const probabilityCutoff = document.getElementById('probabilityCutoff');
        const animationSpeed = document.getElementById('animationSpeed');
        
        if (pointDensity) {
            document.getElementById('densityValue').textContent = pointDensity.value;
        }
        
        if (probabilityCutoff) {
            document.getElementById('cutoffValue').textContent = 
                parseFloat(probabilityCutoff.value).toFixed(2);
        }
        
        if (animationSpeed) {
            const speed = parseFloat(animationSpeed.value);
            document.getElementById('speedValue').textContent = speed.toFixed(1) + 'x';
            this.currentAnimationSpeed = speed;
        }
        
        const modeButtons = document.querySelectorAll('.mode-btn');
        if (modeButtons.length > 0) {
            modeButtons[0].classList.add('active');
        }
    }
    
    // 显示加载状态
    showLoading(message) {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'flex';
            this.loadingElement.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>${message}</span>`;
        }
    }
    
    // 隐藏加载状态
    hideLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'none';
        }
    }
    
    // 显示错误
    showError(message) {
        console.error(message);
        this.showNotification(message, 'error');
        
        if (this.loadingElement) {
            this.loadingElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> <span>${message}</span>`;
        }
    }
    
    // 显示通知
    showNotification(message, type = 'info') {
        const oldNotifications = document.querySelectorAll('.notification');
        oldNotifications.forEach(notification => {
            if (notification.parentNode) {
                notification.remove();
            }
        });
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        document.body.appendChild(notification);
        
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        this.notifications.push(notification);
    }
    
    // 获取通知图标
    getNotificationIcon(type) {
        const icons = {
            'info': 'fa-info-circle',
            'success': 'fa-check-circle',
            'warning': 'fa-exclamation-triangle',
            'error': 'fa-exclamation-circle'
        };
        return icons[type] || 'fa-info-circle';
    }
    
    // 添加通知样式
    addNotificationStyles() {
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 12px;
                    color: white;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                    min-width: 300px;
                    max-width: 400px;
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex: 1;
                }
                
                .notification-content i {
                    font-size: 1.2rem;
                }
                
                .notification-info {
                    background-color: rgba(59, 130, 246, 0.9);
                }
                
                .notification-success {
                    background-color: rgba(16, 185, 129, 0.9);
                }
                
                .notification-warning {
                    background-color: rgba(245, 158, 11, 0.9);
                }
                
                .notification-error {
                    background-color: rgba(239, 68, 68, 0.9);
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 1rem;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                    padding: 5px;
                    border-radius: 4px;
                }
                
                .notification-close:hover {
                    opacity: 1;
                    background-color: rgba(255, 255, 255, 0.1);
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // 清理资源
    dispose() {
        if (this.is3DEnabled && VisualizationEngine && VisualizationEngine.dispose) {
            VisualizationEngine.dispose();
        }
        
        this.notifications.forEach(notification => {
            if (notification.parentNode) {
                notification.remove();
            }
        });
        this.notifications = [];
        
        console.log('App disposed');
    }
}

// 创建并初始化应用程序
let app;

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded, starting app...');
    
    try {
        app = new HydrogenVisualizationApp();
        app.init();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        document.body.innerHTML = `
            <div style="color:white;padding:40px;text-align:center;">
                <h2>应用程序初始化失败</h2>
                <p>${error.message}</p>
                <p>请检查控制台获取详细信息</p>
            </div>
        `;
    }
});

// 页面卸载时清理
window.addEventListener('beforeunload', function() {
    if (app && app.dispose) {
        app.dispose();
    }
});

// 导出到全局作用域
window.HydrogenVisualizationApp = HydrogenVisualizationApp;
window.app = app;
