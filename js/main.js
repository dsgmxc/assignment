// 主应用程序
document.addEventListener('DOMContentLoaded', function() {
    // 初始化应用程序
    initApp();
});

// 初始化应用程序
function initApp() {
    // 初始化可视化引擎
    if (!VisualizationEngine.init('electronCanvas')) {
        document.getElementById('loadingText').innerHTML = 
            '<i class="fas fa-exclamation-triangle"></i> <span>WebGL不支持，请使用现代浏览器</span>';
        return;
    }
    
    // 加载量子态选项
    loadQuantumStateOptions();
    
    // 设置事件监听器
    setupEventListeners();
    
    // 更新UI
    updateUI();
    
    // 默认选择第一个量子态
    setTimeout(() => {
        document.getElementById('quantumState').value = '1,0,0';
        onQuantumStateChange();
    }, 100);
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
    
    // 生成电子云数据
    const numPoints = parseInt(document.getElementById('pointDensity').value);
    const electronData = WaveFunction.generateElectronCloudData(n, l, m, numPoints);
    
    // 更新可视化
    VisualizationEngine.setData(electronData, state);
    
    // 开始动画
    if (!VisualizationEngine.isAnimating) {
        VisualizationEngine.startAnimation();
        document.getElementById('animateBtn').innerHTML = '<i class="fas fa-pause"></i> 暂停动画';
    }
    
    // 显示状态信息
    showNotification(`已切换到 ${state.label} 轨道`, 'info');
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
    VisualizationEngine.updateVisualizationMode(mode);
}

// 参数改变事件
function onParameterChange(event) {
    const target = event.target;
    const value = target.value;
    
    // 更新值显示
    if (target.id === 'pointDensity') {
        document.getElementById('densityValue').textContent = value;
        
        // 如果量子态已选择，重新生成数据
        if (document.getElementById('quantumState').value) {
            onQuantumStateChange();
        }
    } else if (target.id === 'probabilityCutoff') {
        document.getElementById('cutoffValue').textContent = parseFloat(value).toFixed(2);
    } else if (target.id === 'animationSpeed') {
        document.getElementById('speedValue').textContent = parseFloat(value).toFixed(1) + 'x';
    }
}

// 动画按钮点击事件
function onAnimateButtonClick() {
    const isAnimating = VisualizationEngine.toggleAnimation();
    
    const button = document.getElementById('animateBtn');
    if (isAnimating) {
        button.innerHTML = '<i class="fas fa-pause"></i> 暂停动画';
    } else {
        button.innerHTML = '<i class="fas fa-play"></i> 开始动画';
    }
}

// 截图按钮点击事件
function onScreenshotButtonClick() {
    const screenshotUrl = VisualizationEngine.captureScreenshot();
    if (screenshotUrl) {
        showNotification('截图已保存', 'success');
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
        timestamp: new Date().toISOString()
    };
    
    // 转换为JSON字符串
    const dataStr = JSON.stringify(data, null, 2);
    
    // 创建下载链接
    const link = document.createElement('a');
    link.download = `hydrogen-data-${new Date().getTime()}.json`;
    link.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    link.click();
    
    showNotification('数据已导出', 'success');
}

// 重置视图按钮点击事件
function onResetViewButtonClick() {
    VisualizationEngine.resetView();
    showNotification('视图已重置', 'info');
}

// 导航链接点击事件
function onNavLinkClick(event) {
    event.preventDefault();
    
    const link = event.currentTarget;
    const targetId = link.getAttribute('href').substring(1);
    
    // 滚动到目标元素
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
    }
    
    // 更新活动链接
    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.remove('active');
    });
    link.classList.add('active');
}

// 窗口大小改变事件
function onWindowResize() {
    VisualizationEngine.resizeCanvas();
    VisualizationEngine.render();
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
}

// 更新UI
function updateUI() {
    // 更新加载状态
    const loadingElement = document.getElementById('loadingText');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    
    // 更新值显示
    document.getElementById('densityValue').textContent = document.getElementById('pointDensity').value;
    document.getElementById('cutoffValue').textContent = 
        parseFloat(document.getElementById('probabilityCutoff').value).toFixed(2);
    document.getElementById('speedValue').textContent = 
        parseFloat(document.getElementById('animationSpeed').value).toFixed(1) + 'x';
}

// 显示通知
function showNotification(message, type = 'info') {
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
    
    // 添加样式
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

// 导出函数到全局作用域
window.initApp = initApp;
window.onQuantumStateChange = onQuantumStateChange;
