// 3D可视化引擎
const VisualizationEngine = {
    // 状态变量
    isInitialized: false,
    isAnimating: false,
    animationFrameId: null,
    rotationAngle: 0,
    zoomLevel: 1,
    
    // WebGL上下文
    gl: null,
    canvas: null,
    
    // 当前数据
    currentData: null,
    currentState: null,
    
    // 初始化WebGL
    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas element with id "${canvasId}" not found.`);
            return false;
        }
        
        // 获取WebGL上下文
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        if (!this.gl) {
            console.error('WebGL is not supported by your browser.');
            return false;
        }
        
        // 设置画布尺寸
        this.resizeCanvas();
        
        // 设置WebGL基本配置
        this.setupWebGL();
        
        this.isInitialized = true;
        console.log('WebGL visualization engine initialized.');
        return true;
    },
    
    // 设置画布尺寸
    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // 检查尺寸是否变化
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
            
            if (this.gl) {
                this.gl.viewport(0, 0, width, height);
            }
        }
    },
    
    // 设置WebGL
    setupWebGL() {
        // 清除颜色和深度缓冲区
        this.gl.clearColor(0.06, 0.09, 0.17, 1.0);
        this.gl.clearDepth(1.0);
        
        // 启用深度测试
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        
        // 启用混合（用于透明效果）
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        
        // 设置视口
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    },
    
    // 渲染场景
    render() {
        if (!this.gl || !this.isInitialized) return;
        
        // 清除缓冲区
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        // 如果有数据，渲染数据
        if (this.currentData && this.currentData.length > 0) {
            this.renderData();
        } else {
            this.renderPlaceholder();
        }
    },
    
    // 渲染数据
    renderData() {
        // 这里应该实现真正的WebGL渲染
        // 由于复杂性，这里先用2D canvas模拟
        
        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;
        
        // 清除画布
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景
        const gradient = ctx.createRadialGradient(
            this.canvas.width/2, this.canvas.height/2, 0,
            this.canvas.width/2, this.canvas.height/2, this.canvas.width/2
        );
        gradient.addColorStop(0, 'rgba(15, 23, 42, 0.8)');
        gradient.addColorStop(1, 'rgba(30, 41, 59, 0.9)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制坐标轴
        this.drawAxes(ctx);
        
        // 绘制电子云点
        this.drawElectronCloud(ctx);
        
        // 绘制原子核
        this.drawNucleus(ctx);
        
        // 添加旋转效果
        this.rotationAngle += 0.005;
    },
    
    // 绘制坐标轴
    drawAxes(ctx) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const scale = Math.min(this.canvas.width, this.canvas.height) / 15;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        
        // 旋转视角
        ctx.rotate(this.rotationAngle);
        
        // X轴 (红色)
        ctx.strokeStyle = 'rgba(255, 50, 50, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-scale * 4, 0);
        ctx.lineTo(scale * 4, 0);
        ctx.stroke();
        
        // Y轴 (绿色)
        ctx.strokeStyle = 'rgba(50, 255, 50, 0.6)';
        ctx.beginPath();
        ctx.moveTo(0, -scale * 4);
        ctx.lineTo(0, scale * 4);
        ctx.stroke();
        
        // Z轴 (蓝色) - 用对角线表示
        ctx.strokeStyle = 'rgba(50, 150, 255, 0.6)';
        ctx.beginPath();
        ctx.moveTo(-scale * 3, -scale * 3);
        ctx.lineTo(scale * 3, scale * 3);
        ctx.stroke();
        
        // 坐标轴标签
        ctx.fillStyle = 'rgba(255, 50, 50, 0.8)';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('X', scale * 4.2, 10);
        
        ctx.fillStyle = 'rgba(50, 255, 50, 0.8)';
        ctx.fillText('Y', 10, -scale * 4.2);
        
        ctx.fillStyle = 'rgba(50, 150, 255, 0.8)';
        ctx.fillText('Z', scale * 3.2, scale * 3.2);
        
        ctx.restore();
    },
    
    // 绘制电子云
    drawElectronCloud(ctx) {
        if (!this.currentData || this.currentData.length === 0) return;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const scale = Math.min(this.canvas.width, this.canvas.height) / 15;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotationAngle);
        
        // 绘制点
        const pointLimit = Math.min(this.currentData.length, 1000);
        for (let i = 0; i < pointLimit; i++) {
            const point = this.currentData[i];
            
            // 简单的2D投影 (实际应该是3D投影)
            const x = point.x * scale;
            const y = point.y * scale;
            
            // 基于概率设置点的大小和透明度
            const size = 1 + point.probability * 5;
            const alpha = 0.1 + point.probability * 0.9;
            
            ctx.fillStyle = `rgba(${point.color[0]}, ${point.color[1]}, ${point.color[2]}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    },
    
    // 绘制原子核
    drawNucleus(ctx) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // 原子核发光效果
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, 20
        );
        gradient.addColorStop(0, 'rgba(255, 100, 100, 1)');
        gradient.addColorStop(1, 'rgba(255, 100, 100, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // 原子核核心
        ctx.fillStyle = 'rgba(255, 50, 50, 0.9)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        ctx.fill();
    },
    
    // 渲染占位符
    renderPlaceholder() {
        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;
        
        // 清除画布
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制提示信息
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('请选择量子态以开始可视化', this.canvas.width/2, this.canvas.height/2);
    },
    
    // 设置数据
    setData(data, state) {
        this.currentData = data;
        this.currentState = state;
        this.render();
    },
    
    // 开始动画
    startAnimation() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        const animate = () => {
            if (!this.isAnimating) return;
            
            this.render();
            this.animationFrameId = requestAnimationFrame(animate);
        };
        
        animate();
    },
    
    // 停止动画
    stopAnimation() {
        this.isAnimating = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    },
    
    // 重置视图
    resetView() {
        this.rotationAngle = 0;
        this.zoomLevel = 1;
        this.render();
    },
    
    // 切换动画状态
    toggleAnimation() {
        if (this.isAnimating) {
            this.stopAnimation();
            return false;
        } else {
            this.startAnimation();
            return true;
        }
    },
    
    // 更新可视化模式
    updateVisualizationMode(mode) {
        console.log(`切换到可视化模式: ${mode}`);
        // 这里应该实现不同可视化模式的切换
        this.render();
    },
    
    // 截图功能
    captureScreenshot() {
        if (!this.canvas) return null;
        
        // 创建临时链接
        const link = document.createElement('a');
        link.download = `hydrogen-electron-cloud-${new Date().getTime()}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
        
        return link.href;
    }
};

// 导出到全局作用域
window.VisualizationEngine = VisualizationEngine;
