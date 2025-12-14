// 简单2D可视化降级方案
const FallbackVisualization = {
    canvas: null,
    ctx: null,
    currentState: null,
    currentData: null,
    animationId: null,
    
    init(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error('Canvas not found:', canvasId);
            return false;
        }
        
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('2D context not supported');
            return false;
        }
        
        this.ctx = ctx;
        
        // 设置画布大小
        this.resizeCanvas();
        
        // 绘制初始界面
        this.drawInitialMessage();
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => this.resizeCanvas());
        
        return true;
    },
    
    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        if (!container) return;
        
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // 设置画布显示尺寸
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        
        // 设置画布实际像素尺寸（防止模糊）
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        
        // 缩放上下文以匹配像素比例
        if (this.ctx) {
            this.ctx.scale(dpr, dpr);
        }
        
        // 重绘当前内容
        if (this.currentData && this.currentState) {
            this.setData(this.currentData, this.currentState);
        } else {
            this.drawInitialMessage();
        }
    },
    
    clearCanvas() {
        if (!this.ctx || !this.canvas) return;
        
        const dpr = window.devicePixelRatio || 1;
        this.ctx.clearRect(0, 0, this.canvas.width / dpr, this.canvas.height / dpr);
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, 0, this.canvas.width / dpr, this.canvas.height / dpr);
    },
    
    drawInitialMessage() {
        this.clearCanvas();
        
        if (!this.ctx || !this.canvas) return;
        
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);
        
        // 绘制标题
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('氢原子电子云可视化', width / 2, height / 2 - 40);
        
        // 绘制副标题
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '18px Arial';
        this.ctx.fillText('选择量子态开始可视化', width / 2, height / 2);
        
        // 绘制简单原子图示
        this.drawSimpleAtom(width / 2, height / 2 + 60);
    },
    
    drawSimpleAtom(x, y) {
        if (!this.ctx) return;
        
        // 原子核
        this.ctx.beginPath();
        this.ctx.arc(x, y, 15, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fill();
        
        // 电子轨道
        this.ctx.beginPath();
        this.ctx.arc(x, y, 60, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // 电子（动画效果）
        const time = Date.now() / 1000;
        const electronX = x + Math.cos(time) * 60;
        const electronY = y + Math.sin(time) * 60;
        
        this.ctx.beginPath();
        this.ctx.arc(electronX, electronY, 8, 0, Math.PI * 2);
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.fill();
        
        // 请求下一帧动画
        if (!this.animationId) {
            this.animationId = requestAnimationFrame(() => {
                // 清除并重绘
                const rect = this.ctx.getTransform();
                this.ctx.setTransform(1, 0, 0, 1, 0, 0); // 重置变换
                this.clearCanvas();
                this.drawInitialMessage();
                this.ctx.setTransform(rect); // 恢复变换
                this.animationId = null;
            });
        }
    },
    
    setData(data, state) {
        if (!this.ctx || !this.canvas) return;
        
        this.currentData = data;
        this.currentState = state;
        
        // 清除之前的动画
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // 清除画布
        this.clearCanvas();
        
        if (!state) return;
        
        // 绘制量子态信息
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`量子态: ${state.label}`, 20, 40);
        this.ctx.fillText(`n=${state.n}, l=${state.l}, m=${state.m}`, 20, 70);
        this.ctx.fillText(state.description, 20, 100);
        
        // 绘制电子云（简化2D投影）
        if (data && data.length > 0) {
            const centerX = width / 2;
            const centerY = height / 2;
            
            // 计算合适的缩放因子
            const maxRadius = state.n * 2;
            const scale = Math.min(width, height) * 0.4 / maxRadius;
            
            // 绘制电子云点
            const pointCount = Math.min(data.length, 2000); // 限制点数以提高性能
            for (let i = 0; i < pointCount; i++) {
                const point = data[i];
                
                // 将3D坐标投影到2D（简单忽略z坐标）
                const x = centerX + point.x * scale;
                const y = centerY + point.y * scale;
                
                // 基于概率设置颜色和透明度
                const alpha = Math.min(0.8, point.probability * 3);
                const size = 2 + point.probability * 8;
                
                // 使用点的颜色
                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${point.color[0]}, ${point.color[1]}, ${point.color[2]}, ${alpha})`;
                this.ctx.fill();
            }
            
            // 绘制原子核
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ef4444';
            this.ctx.fill();
            
            // 绘制发光效果
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
            this.ctx.fill();
            
            // 绘制坐标轴
            this.drawAxes(centerX, centerY, scale * maxRadius * 0.8);
            
            // 绘制比例尺
            this.drawScale(centerX, centerY, scale);
        }
    },
    
    drawAxes(x, y, length) {
        if (!this.ctx) return;
        
        // 保存上下文状态
        this.ctx.save();
        
        // X轴
        this.ctx.beginPath();
        this.ctx.moveTo(x - length, y);
        this.ctx.lineTo(x + length, y);
        this.ctx.strokeStyle = 'rgba(255, 100, 100, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // X轴箭头
        this.ctx.beginPath();
        this.ctx.moveTo(x + length, y);
        this.ctx.lineTo(x + length - 10, y - 5);
        this.ctx.lineTo(x + length - 10, y + 5);
        this.ctx.closePath();
        this.ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
        this.ctx.fill();
        
        // Y轴
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - length);
        this.ctx.lineTo(x, y + length);
        this.ctx.strokeStyle = 'rgba(100, 255, 100, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Y轴箭头
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - length);
        this.ctx.lineTo(x - 5, y - length + 10);
        this.ctx.lineTo(x + 5, y - length + 10);
        this.ctx.closePath();
        this.ctx.fillStyle = 'rgba(100, 255, 100, 0.8)';
        this.ctx.fill();
        
        // 坐标轴标签
        this.ctx.fillStyle = 'rgba(255, 100, 100, 0.9)';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText('X', x + length + 15, y + 5);
        
        this.ctx.fillStyle = 'rgba(100, 255, 100, 0.9)';
        this.ctx.fillText('Y', x + 5, y - length - 10);
        
        // 原点标签
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.fillText('O', x - 12, y + 15);
        
        // 恢复上下文状态
        this.ctx.restore();
    },
    
    drawScale(x, y, scale) {
        if (!this.ctx) return;
        
        // 绘制比例尺
        const scaleLength = 50; // 像素长度
        const scaleValue = scaleLength / scale; // 实际长度
        
        // 比例尺位置
        const scaleX = x + 100;
        const scaleY = y + 150;
        
        // 保存上下文状态
        this.ctx.save();
        
        // 绘制比例尺线
        this.ctx.beginPath();
        this.ctx.moveTo(scaleX, scaleY);
        this.ctx.lineTo(scaleX + scaleLength, scaleY);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // 绘制比例尺端点
        this.ctx.beginPath();
        this.ctx.moveTo(scaleX, scaleY - 5);
        this.ctx.lineTo(scaleX, scaleY + 5);
        this.ctx.moveTo(scaleX + scaleLength, scaleY - 5);
        this.ctx.lineTo(scaleX + scaleLength, scaleY + 5);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // 绘制比例尺标签
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(scaleValue.toFixed(2) + ' a.u.', scaleX + scaleLength / 2, scaleY + 20);
        this.ctx.fillText('比例尺', scaleX + scaleLength / 2, scaleY - 10);
        
        // 恢复上下文状态
        this.ctx.restore();
    },
    
    // 开始动画（简化版本）
    startAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        const animate = () => {
            if (!this.currentData || !this.currentState) {
                this.drawInitialMessage();
            } else {
                // 轻微旋转效果
                const time = Date.now() / 10000;
                const angle = time * Math.PI * 2;
                
                // 创建一个旋转后的数据副本
                const rotatedData = this.currentData.map(point => {
                    const cos = Math.cos(angle);
                    const sin = Math.sin(angle);
                    
                    return {
                        ...point,
                        x: point.x * cos - point.y * sin,
                        y: point.x * sin + point.y * cos
                    };
                });
                
                // 使用旋转后的数据重绘
                this.setData(rotatedData, this.currentState);
            }
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        this.animationId = requestAnimationFrame(animate);
    },
    
    // 停止动画
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    },
    
    // 截图功能
    captureScreenshot() {
        if (!this.canvas) return null;
        
        // 创建临时canvas用于高质量截图
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        if (!tempCtx) return null;
        
        // 设置临时canvas尺寸（更高分辨率）
        const dpr = 2; // 提高分辨率
        tempCanvas.width = this.canvas.width * dpr;
        tempCanvas.height = this.canvas.height * dpr;
        
        // 绘制当前内容到临时canvas
        tempCtx.scale(dpr, dpr);
        tempCtx.drawImage(this.canvas, 0, 0);
        
        // 返回数据URL
        return tempCanvas.toDataURL('image/png');
    },
    
    // 清理资源
    dispose() {
        this.stopAnimation();
        this.currentData = null;
        this.currentState = null;
        this.ctx = null;
        this.canvas = null;
    }
};

// 导出到全局作用域
window.FallbackVisualization = FallbackVisualization;
