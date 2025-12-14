// 主应用程序
class HydrogenVisualizationApp {
    constructor() {
        this.isInitialized = false;
        this.loadingElement = null;
        this.currentQuantumState = null;
    }
    
    init() {
        console.log('Initializing Hydrogen Visualization App...');
        
        this.loadingElement = document.getElementById('loadingText');
        
        // 加载量子态选项
        this.loadQuantumStateOptions();
        
        // 设置事件监听器
        this.setupEventListeners();
        
        // 初始化Three.js可视化
        this.initVisualization();
        
        // 更新UI
        this.updateUI();
    }
    
    // 初始化可视化引擎
    initVisualization() {
        if (this.loadingElement) {
            this.loadingElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>正在初始化3D引擎...</span>';
        }
        
        // 延迟初始化，确保DOM完全加载
        setTimeout(() => {
            try {
                if (VisualizationEngine.init('electronCanvas')) {
                    console.log('Visualization engine initialized');
                    this.isInitialized = true;
                    
                    if (this.loadingElement) {
                        this.loadingElement.style.display = 'none';
                    }
                    
                    // 默认选择1s轨道
                    setTimeout(() => {
                        this.selectQuantumState('1,0,0');
                    }, 500);
                } else {
                    console.error('Visualization engine initialization failed');
                    this.showError('无法初始化3D可视化引擎');
                }
            } catch (error) {
                console.error('Error initializing visualization:', error);
                this.showError('初始化过程中发生错误: ' + error.message);
            }
        }, 100);
    }
    
    // 加载量子态选项
    loadQuantumStateOptions() {
        const selectElement = document.getElementById('quantumState');
        if (!selectElement) return;
        
        const states = QuantumStates.getAllStates();
        
        // 清空现有选项
        selectElement.innerHTML = '<option value="" disabled selected>请选择量子态</option>';
        
        // 添加量子态选项
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = `${state.n},${state.l},${state.m}`;
            option.textContent = `${state.label} (n=${state.n}, l=${state.l}, m=${state.m}) - ${state.description}`;
            selectElement.appendChild(option);
        });
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
        }
        
        const probabilityCutoff = document.getElementById('probabilityCutoff');
        if (probabilityCutoff) {
            probabilityCutoff.addEventListener('input', (e) => this.onParameterChange(e));
        }
        
        const animationSpeed = document.getElementById('animationSpeed');
        if (animationSpeed) {
            animationSpeed.addEventListener('input', (e) => this.onParameterChange(e));
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
        
        // 导航链接
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.onNavLinkClick(e));
        });
        
        // 窗口大小改变
        window.addEventListener('resize', () => this.onWindowResize());
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
        
        // 生成电子云数据
        this.generateAndDisplayElectronCloud(n, l, m);
    }
    
    // 更新量子数显示
    updateQuantumNumberDisplay(n, l, m) {
        const nValue = document.getElementById('nValue');
        const lValue = document.getElementById('lValue');
        const mValue = document.getElementById('mValue');
        const stateValue = document.getElementById('stateValue');
        
        if (nValue) nValue.textContent = n;
        if (lValue) lValue.textContent = l;
        if (mValue) mValue.textContent = m;
        if (stateValue) stateValue.textContent = this.currentQuantumState?.label || '';
    }
    
    // 生成并显示电子云
    generateAndDisplayElectronCloud(n, l, m) {
        if (!this.isInitialized) {
            this.showError('可视化引擎未初始化');
            return;
        }
        
        // 显示加载状态
        this.showLoading('正在生成电子云数据...');
        
        // 异步生成数据，避免阻塞UI
        setTimeout(() => {
            try {
                const numPoints = parseInt(document.getElementById('pointDensity').value) || 3000;
                
                // 生成电子云数据
                const electronData = WaveFunction.generateElectronCloudData(n, l, m, numPoints);
                
                // 应用概率阈值过滤
                const cutoff = parseFloat(document.getElementById('probabilityCutoff').value) || 0.05;
                const filteredData = electronData.filter(point => point.probability >= cutoff);
                
                // 更新可视化
                VisualizationEngine.setData(filteredData, this.currentQuantumState);
                
                // 隐藏加载状态
                this.hideLoading();
                
                // 显示成功消息
                this.showNotification(`已切换到 ${this.currentQuantumState.label} 轨道`, 'success');
                
            } catch (error) {
                console.error('Error generating electron cloud:', error);
                this.showError('生成电子云数据失败: ' + error.message);
            }
        }, 100);
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
        
        // 更新可视化模式
        if (VisualizationEngine.setVisualizationMode) {
            VisualizationEngine.setVisualizationMode(mode);
            this.showNotification(`已切换到${this.getModeName(mode)}模式`, 'info');
        }
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
        
        // 更新值显示
        switch(target.id) {
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
                document.getElementById('speedValue').textContent = parseFloat(value).toFixed(1) + 'x';
                // 这里可以添加动画速度控制逻辑
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
            const isAnimating = VisualizationEngine.toggleAnimation();
            const button = document.getElementById('animateBtn');
            
            if (isAnimating) {
                button.innerHTML = '<i class="fas fa-pause"></i> 暂停动画';
                this.showNotification('动画已开始', 'success');
            } else {
                button.innerHTML = '<i class="fas fa-play"></i> 开始动画';
                this.showNotification('动画已暂停', 'info');
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
            const screenshotUrl = VisualizationEngine.captureScreenshot();
            if (screenshotUrl) {
                // 创建下载链接
                const link = document.createElement('a');
                link.download = `hydrogen-electron-cloud-${new Date().getTime()}.png`;
                link.href = screenshotUrl;
                link.click();
                
                this.showNotification('截图已保存', 'success');
            }
        } catch (error) {
            console.error('Error capturing screenshot:', error);
            this.showError('截图失败');
        }
    }
    
    // 重置视图按钮点击事件
    onResetViewButtonClick() {
        if (!this.isInitialized) {
            this.showError('可视化引擎未初始化');
            return;
        }
        
        try {
            VisualizationEngine.resetView();
            this.showNotification('视图已重置', 'info');
        } catch (error) {
            console.error('Error resetting view:', error);
            this.showError('重置视图失败');
        }
    }
    
    // 放大
    zoomIn() {
        if (VisualizationEngine.camera) {
            VisualizationEngine.camera.position.multiplyScalar(0.9);
            this.showNotification('已放大', 'info');
        }
    }
    
    // 缩小
    zoomOut() {
        if (VisualizationEngine.camera) {
            VisualizationEngine.camera.position.multiplyScalar(1.1);
            this.showNotification('已缩小', 'info');
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
        if (this.isInitialized && VisualizationEngine.onWindowResize) {
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
            document.getElementById('speedValue').textContent = 
                parseFloat(animationSpeed.value).toFixed(1) + 'x';
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
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
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
        }, 3000);
        
        // 添加样式（如果尚未添加）
        this.addNotificationStyles();
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
                    border-radius: 8px;
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
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                }
                
                .notification-info {
                    background-color: #3b82f6;
                }
                
                .notification-success {
                    background-color: #10b981;
                }
                
                .notification-error {
                    background-color: #ef4444;
                }
                
                .notification-warning {
                    background-color: #f59e0b;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 1.2rem;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                }
                
                .notification-close:hover {
                    opacity: 1;
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
            `;
            document.head.appendChild(style);
        }
    }
}

// 创建并初始化应用程序
let app;

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded, starting app...');
    app = new HydrogenVisualizationApp();
    app.init();
});

// 导出到全局作用域
window.HydrogenVisualizationApp = HydrogenVisualizationApp;
window.app = app;
