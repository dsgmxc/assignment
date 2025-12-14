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
    }
    
    init() {
        console.log('Initializing Hydrogen Visualization App...');
        
        this.loadingElement = document.getElementById('loadingText');
        
        // 检查WebGL支持
        this.checkWebGLSupport();
        
        // 加载量子态选项
        this.loadQuantumStateOptions();
        
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
                let initSuccess = false;
                
                if (this.is3DEnabled && typeof VisualizationEngine !== 'undefined') {
                    console.log('Attempting to initialize 3D engine...');
                    initSuccess = VisualizationEngine.init('electronCanvas');
                    
                    if (initSuccess) {
                        console.log('3D visualization engine initialized');
                        this.isInitialized = true;
                        this.showNotification('3D可视化引擎已就绪', 'success');
                    } else {
                        console.warn('3D engine failed, falling back to 2D');
                        this.is3DEnabled = false;
                    }
                }
                
                // 如果3D失败或不可用，使用2D降级方案
                if (!this.is3DEnabled && typeof FallbackVisualization !== 'undefined') {
                    console.log('Initializing 2D fallback visualization...');
                    initSuccess = FallbackVisualization.init('electronCanvas');
                    
                    if (initSuccess) {
                        console.log('2D fallback visualization initialized');
                        this.isInitialized = true;
                        this.showNotification('2D可视化模式已启用', 'info');
                    }
                }
                
                if (initSuccess) {
                    if (this.loadingElement) {
                        this.loadingElement.style.display = 'none';
                    }
                    
                    // 默认选择1s轨道
                    setTimeout(() => {
                        this.selectQuantumState('1,0,0');
                    }, 1000);
                } else {
                    console.error('All visualization engines failed');
                    this.showError('无法初始化可视化引擎，请检查控制台日志');
                }
            } catch (error) {
                console.error('Error initializing visualization:', error);
                this.showError('初始化过程中发生错误: ' + error.message);
            }
        }, 500);
    }
    
    // 加载量子态选项
    loadQuantumStateOptions() {
        const selectElement = document.getElementById('quantumState');
        if (!selectElement) {
            console.error('Quantum state select element not found');
            return;
        }
        
        const states = QuantumStates.getAllStates();
        if (!states || states.length === 0) {
            console.error('No quantum states found');
            return;
        }
        
        // 清空现有选项
        selectElement.innerHTML = '<option value="" disabled selected>请选择量子态</option>';
        
        // 按主量子数分组
        const groupedStates = {};
        states.forEach(state => {
            if (!groupedStates[state.n]) {
                groupedStates[state.n] = [];
            }
            groupedStates[state.n].push(state);
        });
        
        // 添加量子态选项（按n值分组）
        Object.keys(groupedStates).sort((a, b) => parseInt(a) - parseInt(b)).forEach(n => {
            const group = document.createElement('optgroup');
            group.label = `n = ${n} (主量子数)`;
            
            groupedStates[n].forEach(state => {
                const option = document.createElement('option');
                option.value = `${state.n},${state.l},${state.m}`;
                option.textContent = `${state.label} - ${state.description}`;
                group.appendChild(option);
            });
            
            selectElement.appendChild(group);
        });
        
        console.log(`Loaded ${states.length} quantum states`);
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
            // 防止在输入框中触发快捷键
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
        
        // 解析量子态
        const [n, l, m] = value.split(',').map(Number);
        
        // 获取量子态信息
        const state = QuantumStates.getState(n, l, m);
        if (!state) {
            this.showError('无效的量子态');
            return;
        }
        
        this.currentQuantumState = state;
        
        // 更新量子数显示
        this.updateQuantumNumberDisplay(n, l, m);
        
        // 更新轨道信息
        this.updateOrbitalInfo(state);
        
        // 生成电子云数据
        this.generateAndDisplayElectronCloud(n, l, m);
    }
    
    // 更新量子数显示
    updateQuantumNumberDisplay(n, l, m) {
        const nValue = document.getElementById('nValue');
        const lValue = document.getElementById('lValue');
        const mValue = document.getElementById('mValue');
        
        if (nValue) nValue.textContent = n;
        if (lValue) lValue.textContent = l;
        if (mValue) mValue.textContent = m;
        
        // 添加轨道符号
        const orbitalSymbol = QuantumStates.getOrbitalName(l);
        if (lValue) {
            lValue.innerHTML = `${l} <span style="font-size:0.8em;color:#94a3b8">(${orbitalSymbol})</span>`;
        }
    }
    
    // 更新轨道信息
    updateOrbitalInfo(state) {
        // 可以在这里添加更多轨道信息的显示
        console.log('Orbital info:', {
            label: state.label,
            name: state.name,
            description: state.description,
            shape: QuantumStates.getShapeDescription(state.l),
            orientation: QuantumStates.getMagneticDescription(state.l, state.m)
        });
    }
    
    // 生成并显示电子云
    generateAndDisplayElectronCloud(n, l, m) {
        if (!this.isInitialized) {
            this.showError('可视化引擎未初始化');
            return;
        }
        
        // 显示加载状态
        this.showLoading('正在生成电子云数据...');
        
        // 使用requestAnimationFrame避免阻塞UI
        requestAnimationFrame(() => {
            try {
                const numPoints = parseInt(document.getElementById('pointDensity').value) || 3000;
                const cutoff = parseFloat(document.getElementById('probabilityCutoff').value) || 0.05;
                
                console.log(`Generating electron cloud: n=${n}, l=${l}, m=${m}, points=${numPoints}`);
                
                // 生成电子云数据
                const electronData = WaveFunction.generateElectronCloudData(n, l, m, numPoints);
                
                if (!electronData || electronData.length === 0) {
                    throw new Error('电子云数据生成失败');
                }
                
                // 应用概率阈值过滤
                const filteredData = electronData.filter(point => point.probability >= cutoff);
                
                console.log(`Generated ${electronData.length} points, filtered to ${filteredData.length} points`);
                
                // 更新可视化
                if (this.is3DEnabled && VisualizationEngine && VisualizationEngine.setData) {
                    VisualizationEngine.setData(filteredData, this.currentQuantumState);
                } else if (FallbackVisualization && FallbackVisualization.setData) {
                    FallbackVisualization.setData(filteredData, this.currentQuantumState);
                }
                
                // 隐藏加载状态
                this.hideLoading();
                
                // 显示成功消息
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
    
    // 模式按钮点击事件
    onModeButtonClick(event) {
        const button = event.currentTarget;
        const mode = button.dataset.mode;
        
        // 移除所有按钮的active类
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 为当前按钮添加active类
        button.classList.add('active');
        
        this.visualizationMode = mode;
        
        // 更新可视化模式
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
        
        // 更新值显示
        switch(id) {
            case 'pointDensity':
                document.getElementById('densityValue').textContent = value;
                // 重新生成电子云
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
                // 重新生成电子云
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
                
                // 这里可以添加动画速度控制逻辑
                // 注意：Three.js动画速度通常通过修改增量值实现
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
            } else if (FallbackVisualization) {
                // 2D模式的动画控制
                if (FallbackVisualization.animationId) {
                    FallbackVisualization.stopAnimation();
                    isAnimating = false;
                } else {
                    FallbackVisualization.startAnimation();
                    isAnimating = true;
                }
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
            } else if (FallbackVisualization && FallbackVisualization.captureScreenshot) {
                screenshotUrl = FallbackVisualization.captureScreenshot();
            }
            
            if (screenshotUrl) {
                // 创建下载链接
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
            
            // 生成数据
            const electronData = WaveFunction.generateElectronCloudData(n, l, m, Math.min(numPoints, 10000));
            
            // 格式化数据为JSON
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
            
            // 创建JSON文件
            const jsonStr = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // 创建下载链接
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `hydrogen-data-${this.currentQuantumState.label}-${timestamp}.json`;
            
            const link = document.createElement('a');
            link.download = filename;
            link.href = url;
            link.click();
            
            // 清理URL
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
            // 2D模式不需要重置视图
            
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
        
        // 滚动到目标元素
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
        
        // 更新活动链接
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
        // 更新值显示
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
        
        // 初始化模式按钮状态
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
        
        // 更新加载状态显示错误
        if (this.loadingElement) {
            this.loadingElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> <span>${message}</span>`;
        }
    }
    
    // 显示通知
    showNotification(message, type = 'info') {
        // 移除旧通知
        const oldNotifications = document.querySelectorAll('.notification');
        oldNotifications.forEach(notification => {
            if (notification.parentNode) {
                notification.remove();
            }
        });
        
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 添加关闭按钮事件
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        // 自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        // 保存通知引用
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
        // 清理可视化引擎
        if (this.is3DEnabled && VisualizationEngine && VisualizationEngine.dispose) {
            VisualizationEngine.dispose();
        }
        
        if (FallbackVisualization && FallbackVisualization.dispose) {
            FallbackVisualization.dispose();
        }
        
        // 清理通知
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
    
    // 确保所有必需的库都已加载
    if (typeof QuantumStates === 'undefined') {
        console.error('QuantumStates library not loaded');
        document.body.innerHTML = '<div style="color:white;padding:20px;text-align:center;">错误：量子态库未加载</div>';
        return;
    }
    
    if (typeof WaveFunction === 'undefined') {
        console.error('WaveFunction library not loaded');
        document.body.innerHTML = '<div style="color:white;padding:20px;text-align:center;">错误：波函数库未加载</div>';
        return;
    }
    
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
