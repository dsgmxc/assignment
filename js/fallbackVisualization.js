// 简单2D可视化降级方案
const FallbackVisualization = {
    init(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return false;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return false;
        
        // 设置画布大小
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        
        // 绘制初始界面
        this.clearCanvas(ctx, canvas);
        this.drawInitialMessage(ctx, canvas);
        
        return true;
    },
    
    clearCanvas(ctx, canvas) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    
    drawInitialMessage(ctx, canvas) {
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('氢原子电子云可视化', canvas.width/2, canvas.height/2 - 40);
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = '18px Arial';
        ctx.fillText('选择量子态开始可视化', canvas.width/2, canvas.height/2);
        
        // 绘制简单原子图示
        this.drawSimpleAtom(ctx, canvas.width/2, canvas.height/2 + 60);
    },
    
    drawSimpleAtom(ctx, x, y) {
        // 原子核
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        
        // 电子轨道
        ctx.beginPath();
        ctx.arc(x, y, 60, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 电子
        const time = Date.now() / 1000;
        const electronX = x + Math.cos(time) * 60;
        const electronY = y + Math.sin(time) * 60;
        
        ctx.beginPath();
        ctx.arc(electronX, electronY, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
    },
    
    setData(data, state) {
        const canvas = document.getElementById('electronCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // 清除画布
        this.clearCanvas(ctx, canvas);
        
        // 绘制量子态信息
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`量子态: ${state.label}`, 20, 40);
        ctx.fillText(`n=${state.n}, l=${state.l}, m=${state.m}`, 20, 70);
        
        // 绘制电子云（简化2D投影）
        if (data && data.length > 0) {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const scale = Math.min(canvas.width, canvas.height) / 20;
            
            // 绘制电子云点
            const pointCount = Math.min(data.length, 500);
            for (let i = 0; i < pointCount; i++) {
                const point = data[i];
                const x = centerX + point.x * scale;
                const y = centerY + point.y * scale;
                
                // 基于概率设置颜色和透明度
                const alpha = Math.min(0.8, point.probability * 2);
                const size = 2 + point.probability * 5;
                
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${point.color[0]}, ${point.color[1]}, ${point.color[2]}, ${alpha})`;
                ctx.fill();
            }
            
            // 绘制原子核
            ctx.beginPath();
            ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444';
            ctx.fill();
            
            // 绘制坐标轴
            this.drawAxes(ctx, centerX, centerY, scale * 5);
        }
    },
    
    drawAxes(ctx, x, y, length) {
        // X轴
        ctx.beginPath();
        ctx.moveTo(x - length, y);
        ctx.lineTo(x + length, y);
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Y轴
        ctx.beginPath();
        ctx.moveTo(x, y - length);
        ctx.lineTo(x, y + length);
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 坐标轴标签
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.fillText('X', x + length + 10, y + 5);
        ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.fillText('Y', x + 5, y - length - 10);
    }
};

// 导出
window.FallbackVisualization = FallbackVisualization;
