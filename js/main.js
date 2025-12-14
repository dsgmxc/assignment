// 主应用程序
document.addEventListener('DOMContentLoaded', function() {
    // 初始化应用程序
    initApp();
});

// 初始化应用程序
function initApp() {
    // 先隐藏加载提示
    const loadingElement = document.getElementById('loadingText');
    
    // 加载量子态选项
    loadQuantumStateOptions();
    
    // 设置事件监听器
    setupEventListeners();
    
    // 初始化可视化引擎
    setTimeout(() => {
        if (VisualizationEngine.init('electronCanvas')) {
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            console.log('Visualization engine initialized successfully');
            
            // 默认选择第一个量子态
            setTimeout(() => {
                const quantumSelect = document.getElementById('quantumState');
                if (quantumSelect && quantumSelect.options.length > 1) {
                    quantumSelect.value = '1,0,0';
                    onQuantumStateChange();
                }
            }, 500);
        } else {
            if (loadingElement) {
                loadingElement.innerHTML = 
                    '<i class="fas fa-exclamation-triangle"></i> <span>无法初始化3D引擎，请刷新页面重试</span>';
            }
            console.error('Failed to initialize visualization engine');
        }
    }, 100);
    
    // 更新UI
    updateUI();
}

// 加载量子态选项
function loadQuantumStateOptions() {
    const selectElement = document.getElementById('quantumState');
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
function setupEventListeners() {
    // 量子态选择
    document.getElementById('quantumState').addEventListener('change', onQuantumStateChange);
    
    // 可视化模式切换
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', onModeButtonClick);
    });
    
    // 参数控制
    document.getElementById('pointDensity').addEventListener('input', onParameterChange);
    document.getElementById('probabilityCutoff').addEventListener('input', onParameterChange);
    document.getElementById('animationSpeed').addEventListener('input', onParameterChange);
    
    // 控制按钮
    document.getElementById('animateBtn').addEventListener('click', onAnimateButtonClick);
    document.getElementById('screenshotBtn').addEventListener('click', onScreenshotButtonClick);
    document.getElementById('exportDataBtn').addEventListener('click', onExportDataButtonClick);
    document.getElementById('resetViewBtn').addEventListener('click', onResetViewButtonClick);
    
    // 画布控制按钮
    document.getElementById('rotateBtn').addEventListener('click', function() {
        // 切换旋转模式
        showNotification('旋转模式已激活', 'info');
    });
    
    document.getElementById('zoomInBtn').addEventListener('click', function() {
        if (VisualizationEngine.camera) {
            VisualizationEngine.camera.position.multiplyScalar(0.9);
            showNotification('已放大', 'info');
        }
    });
    
    document.getElementById('zoomOutBtn').addEventListener('click', function() {
        if (VisualizationEngine.camera) {
            VisualizationEngine.camera.position.multiplyScalar(1.1);
            showNotification('已缩小', 'info');
        }
    });
    
    // 导航链接
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', onNavLinkClick);
    });
    
    // 窗口大小改变
    window.addEventListener('resize', onWindowResize);
    
    // 键盘快捷键
    document.addEventListener('keydown', onKeyDown);
}

// 量子态改变事件
function onQuantumStateChange() {
    const selectElement = document.getElementById('quantumState');
    const value = selectElement.value;
    
    if (!value) return;
    
    // 解析量子态
    const [n, l, m] = value.split(',').map(Number);
    
    // 获取量子态信息
    const state = QuantumStates.getState(n, l, m);
    
    // 更新量子数显示
    document.getElementById('nValue').textContent = n;
    document.getElementById('lValue').textContent = l;
    document.getElementById('mValue').textContent = m;
    
    // 显示加载状态
    const loadingElement = document.getElementById('loadingText');
    if (loadingElement) {
        loadingElement.style.display = 'flex';
        loadingElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>正在生成电子云数据...</span>';
    }
    
    // 异步生成电子云数据（避免阻塞UI）
    setTimeout(() => {
        const numPoints = parseInt(document.getElementById('pointDensity').value);
        const cutoff = parseFloat(document.getElementById('probabilityCutoff').value);
        
        try {
            // 生成电子云数据
            const electronData = WaveFunction.generateElectronCloudData(n, l, m, numPoints);
            
            // 应用概率阈值过滤
            const filteredData = electronData.filter(point => 
                point.probability >= cutoff
            );
            
            // 更新可视化
            VisualizationEngine.setData(filteredData, state);
            
            // 隐藏加载状态
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            
            // 确保动画在运行
            if (VisualizationEngine.isInitialized && !VisualizationEngine.isAnimating) {
                VisualizationEngine.isAnimating = true;
                document.getElementById('animateBtn').innerHTML = '<i class="fas fa-pause"></i> 暂停动画';
            }
            
            // 显示状态信息
            showNotification(`已切换到 ${state.label} 轨道`, 'info');
        } catch (error) {
            console.error('生成电子云数据时出错:', error);
            if (loadingElement) {
                loadingElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>数据生成失败，请重试</span>';
            }
            showNotification('数据生成失败，请重试', 'error');
        }
    }, 100);
}

// 模式按钮点击事件
function onModeButtonClick(event) {
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
        showNotification(`已切换到${mode === 'points' ? '点状云' : mode === 'density' ? '密度图' : '等值面'}模式`, 'info');
    }
}

// 参数改变事件
function onParameterChange(event) {
    const target = event.target;
    const value = target.value;
    
    // 更新值显示
    if (target.id === 'pointDensity') {
        document.getElementById('densityValue').textContent = value;
        
        // 更新点密度
        if (VisualizationEngine.updatePointDensity) {
            VisualizationEngine.updatePointDensity(parseInt(value));
        }
        
        // 如果量子态已选择，重新生成数据
        if (document.getElementById('quantumState').value) {
            const loadingElement = document.getElementById('loadingText');
            if (loadingElement) {
                loadingElement.style.display = 'flex';
                loadingElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>正在更新点密度...</span>';
            }
            
            setTimeout(() => {
                onQuantumStateChange();
            }, 50);
        }
    } else if (target.id === 'probabilityCutoff') {
        document.getElementById('cutoffValue').textContent = parseFloat(value).toFixed(2);
        
        // 更新概率阈值
        if (VisualizationEngine.updateProbabilityCutoff) {
            VisualizationEngine.updateProbabilityCutoff(parseFloat(value));
            showNotification(`概率阈值已更新为 ${parseFloat(value).toFixed(2)}`, 'info');
        }
    } else if (target.id === 'animationSpeed') {
        document.getElementById('speedValue').textContent = parseFloat(value).toFixed(1) + 'x';
        showNotification(`动画速度已调整为 ${parseFloat(value).toFixed(1)}x`, 'info');
    }
}

// 动画按钮点击事件
function onAnimateButtonClick() {
    if (!VisualizationEngine.isInitialized) {
        showNotification('可视化引擎未初始化', 'error');
        return;
    }
    
    const isAnimating = VisualizationEngine.toggleAnimation();
    
    const button = document.getElementById('animateBtn');
    if (isAnimating) {
        button.innerHTML = '<i class="fas fa-pause"></i> 暂停动画';
        showNotification('动画已开始', 'success');
    } else {
        button.innerHTML = '<i class="fas fa-play"></i> 开始动画';
        showNotification('动画已暂停', 'info');
    }
}

// 截图按钮点击事件
function onScreenshotButtonClick() {
    if (!VisualizationEngine.isInitialized) {
        showNotification('可视化引擎未初始化', 'error');
        return;
    }
    
    const screenshotUrl = VisualizationEngine.captureScreenshot();
    if (screenshotUrl) {
        // 创建下载链接
        const link = document.createElement('a');
        link.download = `hydrogen-electron-cloud-${new Date().getTime()}.png`;
        link.href = screenshotUrl;
        link.click();
        
        showNotification('截图已保存', 'success');
    } else {
        showNotification('截图失败', 'error');
    }
}

// 导出数据按钮点击事件
function onExportDataButtonClick() {
    // 创建数据对象
    const data = {
        quantumState: VisualizationEngine.currentState,
        parameters: {
            pointDensity: document.getElementById('pointDensity').value,
            probabilityCutoff: document.getElementById('probabilityCutoff').value,
            animationSpeed: document.getElementById('animationSpeed').value
        },
        timestamp: new Date().toISOString(),
        dataPoints: VisualizationEngine.currentData ? VisualizationEngine.currentData.length : 0
    };
    
    // 转换为JSON字符串
    const dataStr = JSON.stringify(data, null, 2);
    
    // 创建下载链接
    const link = document.createElement('a');
    link.download = `hydrogen-data-${new Date().getTime()}.json`;
    link.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    link.click();
    
    showNotification('数据已导出为JSON文件', 'success');
}

// 重置视图按钮点击事件
function onResetViewButtonClick() {
    if (VisualizationEngine.resetView) {
        VisualizationEngine.resetView();
        showNotification('视图已重置', 'info');
    } else {
        showNotification('重置功能不可用', 'error');
    }
}

// 导航链接点击事件
function onNavLinkClick(event) {
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
function onWindowResize() {
    if (VisualizationEngine.onWindowResize) {
        VisualizationEngine.onWindowResize();
    }
}

// 键盘按键事件
function onKeyDown(event) {
    // 空格键切换动画
    if (event.code === 'Space') {
        event.preventDefault();
        onAnimateButtonClick();
    }
    
    // R键重置视图
    if (event.code === 'KeyR' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        onResetViewButtonClick();
    }
    
    // S键截图
    if (event.code === 'KeyS' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        onScreenshotButtonClick();
    }
    
    // 数字键1-3快速切换模式
    if (event.code >= 'Digit1' && event.code <= 'Digit3') {
        const modeIndex = parseInt(event.code.slice(-1)) - 1;
        const modes = ['points', 'density', 'surface'];
        const modeButtons = document.querySelectorAll('.mode-btn');
        
        if (modeIndex < modeButtons.length) {
            modeButtons[modeIndex].click();
        }
    }
}

// 更新UI
function updateUI() {
    // 更新加载状态
    const loadingElement = document.getElementById('loadingText');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    
    // 更新值显示
    const pointDensityElement = document.getElementById('pointDensity');
    const probabilityCutoffElement = document.getElementById('probabilityCutoff');
    const animationSpeedElement = document.getElementById('animationSpeed');
    
    if (pointDensityElement) {
        document.getElementById('densityValue').textContent = pointDensityElement.value;
    }
    
    if (probabilityCutoffElement) {
        document.getElementById('cutoffValue').textContent = 
            parseFloat(probabilityCutoffElement.value).toFixed(2);
    }
    
    if (animationSpeedElement) {
        document.getElementById('speedValue').textContent = 
            parseFloat(animationSpeedElement.value).toFixed(1) + 'x';
    }
    
    // 初始化模式按钮状态
    const modeButtons = document.querySelectorAll('.mode-btn');
    if (modeButtons.length > 0) {
        modeButtons[0].classList.add('active');
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    // 如果已有相同消息的通知，先移除
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        if (notification.querySelector('span').textContent === message) {
            notification.remove();
        }
    });
    
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
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
    
    // 自动移除
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
    
    // 添加样式（如果尚未添加）
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
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .notification-info {
                background-color: rgba(59, 130, 246, 0.9);
            }
            
            .notification-success {
                background-color: rgba(16, 185, 129, 0.9);
            }
            
            .notification-error {
                background-color: rgba(239, 68, 68, 0.9);
            }
            
            .notification-warning {
                background-color: rgba(245, 158, 11, 0.9);
            }
            
            .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 1.2rem;
                opacity: 0.7;
                transition: opacity 0.2s;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
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

// 导出函数到全局作用域
window.initApp = initApp;
window.onQuantumStateChange = onQuantumStateChange;
window.showNotification = showNotification;

// 添加调试信息
console.log('Hydrogen Electron Cloud Visualization loaded');
