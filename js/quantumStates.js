// 氢原子量子态数据
const QuantumStates = {
    // 量子态配置
    states: [
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
    ],
    
    // 轨道形状描述
    shapeDescriptions: {
        0: "球形对称 (s轨道)",
        1: "哑铃形 (p轨道)",
        2: "花瓣形 (d轨道)",
        3: "复杂形状 (f轨道)"
    },
    
    // 轨道颜色映射
    orbitalColors: {
        0: { name: "s", baseColor: [100, 150, 255], gradient: [0.8, 1.2, 1.0] }, // 蓝色系
        1: { name: "p", baseColor: [100, 255, 150], gradient: [0.8, 1.0, 1.2] }, // 绿色系
        2: { name: "d", baseColor: [200, 100, 255], gradient: [1.2, 0.8, 1.0] }  // 紫色系
    },
    
    // 获取所有量子态
    getAllStates() {
        return this.states;
    },
    
    // 根据n,l,m值获取量子态
    getState(n, l, m) {
        return this.states.find(state => 
            state.n === n && state.l === l && state.m === m
        ) || null;
    },
    
    // 根据label获取量子态
    getStateByLabel(label) {
        return this.states.find(state => state.label === label) || null;
    },
    
    // 获取特定n值的所有量子态
    getStatesByN(n) {
        return this.states.filter(state => state.n === n);
    },
    
    // 获取特定l值的所有量子态
    getStatesByL(l) {
        return this.states.filter(state => state.l === l);
    },
    
    // 获取轨道名称
    getOrbitalName(l) {
        const names = ['s', 'p', 'd', 'f', 'g'];
        return names[l] || `l=${l}`;
    },
    
    // 获取形状描述
    getShapeDescription(l) {
        return this.shapeDescriptions[l] || `角量子数 l=${l}`;
    },
    
    // 获取磁量子数描述
    getMagneticDescription(l, m) {
        if (l === 0) return "球形对称";
        if (l === 1) {
            if (m === 0) return "沿z轴方向";
            if (m === 1) return "沿x轴方向";
            if (m === -1) return "沿y轴方向";
        }
        if (l === 2) {
            if (m === 0) return "沿z轴方向";
            if (m === 1) return "在xz平面";
            if (m === -1) return "在yz平面";
            if (m === 2) return "在xy平面沿x,y轴";
            if (m === -2) return "在xy平面对角线";
        }
        return `磁量子数 m=${m}`;
    },
    
    // 获取轨道颜色
    getOrbitalColor(l, probability, x, y, z) {
        const colorConfig = this.orbitalColors[l] || this.orbitalColors[0];
        const [r, g, b] = colorConfig.baseColor;
        const [rg, gg, bg] = colorConfig.gradient;
        
        // 基于概率调整亮度
        const intensity = 0.5 + probability * 0.5;
        
        // 基于位置添加渐变效果
        const distance = Math.sqrt(x*x + y*y + z*z);
        const positionFactor = 1 + 0.3 * Math.sin(distance * 0.5);
        
        return [
            Math.min(255, Math.floor(r * intensity * rg * positionFactor)),
            Math.min(255, Math.floor(g * intensity * gg * positionFactor)),
            Math.min(255, Math.floor(b * intensity * bg * positionFactor))
        ];
    }
};

// 波函数相关参数和函数
const WaveFunction = {
    // 玻尔半径 (米)
    a0: 5.29177210903e-11,
    
    // 归一化常数
    getNormalizationConstant(n, l) {
        const factorial = (num) => {
            if (num <= 1) return 1;
            return num * factorial(num - 1);
        };
        
        const numerator = Math.pow(2 / (n * this.a0), 3) * factorial(n - l - 1);
        const denominator = 2 * n * factorial(n + l);
        
        return Math.sqrt(numerator / denominator);
    },
    
    // 拉盖尔多项式
    associatedLaguerre(x, n, l) {
        // 简化实现，实际需要完整拉盖尔多项式计算
        if (n === 1 && l === 0) return 1;
        if (n === 2 && l === 0) return 2 - x;
        if (n === 2 && l === 1) return 1;
        if (n === 3 && l === 0) return 3 - 2*x + (2/9)*x*x;
        if (n === 3 && l === 1) return 4 - (4/3)*x;
        if (n === 3 && l === 2) return 1;
        
        // 默认返回简化值
        return 1;
    },
    
    // 球谐函数 (简化版)
    sphericalHarmonic(theta, phi, l, m) {
        // 简化实现，返回近似值
        if (l === 0 && m === 0) return Math.sqrt(1/(4*Math.PI));
        
        if (l === 1) {
            if (m === 0) return Math.sqrt(3/(4*Math.PI)) * Math.cos(theta);
            if (m === 1) return Math.sqrt(3/(8*Math.PI)) * Math.sin(theta) * Math.cos(phi);
            if (m === -1) return Math.sqrt(3/(8*Math.PI)) * Math.sin(theta) * Math.sin(phi);
        }
        
        if (l === 2) {
            if (m === 0) return Math.sqrt(5/(16*Math.PI)) * (3*Math.cos(theta)*Math.cos(theta) - 1);
            if (m === 1) return Math.sqrt(15/(8*Math.PI)) * Math.sin(theta) * Math.cos(theta) * Math.cos(phi);
            if (m === -1) return Math.sqrt(15/(8*Math.PI)) * Math.sin(theta) * Math.cos(theta) * Math.sin(phi);
            if (m === 2) return Math.sqrt(15/(32*Math.PI)) * Math.sin(theta)*Math.sin(theta) * Math.cos(2*phi);
            if (m === -2) return Math.sqrt(15/(32*Math.PI)) * Math.sin(theta)*Math.sin(theta) * Math.sin(2*phi);
        }
        
        // 默认返回
        return 1/Math.sqrt(4*Math.PI);
    },
    
    // 径向波函数
    radialWaveFunction(r, n, l) {
        const rho = 2 * r / (n * this.a0);
        const norm = this.getNormalizationConstant(n, l);
        const laguerre = this.associatedLaguerre(rho, n, l);
        
        return norm * Math.exp(-rho/2) * Math.pow(rho, l) * laguerre;
    },
    
    // 完整波函数
    waveFunction(r, theta, phi, n, l, m) {
        const radial = this.radialWaveFunction(r, n, l);
        const angular = this.sphericalHarmonic(theta, phi, l, m);
        
        return radial * angular;
    },
    
    // 概率密度
    probabilityDensity(r, theta, phi, n, l, m) {
        const psi = this.waveFunction(r, theta, phi, n, l, m);
        return psi * psi;
    },
    
    // 计算径向概率分布
    calculateRadialProbability(r, n, l) {
        // 径向概率密度: P(r) = r² |R_{nl}(r)|²
        const radial = this.radialWaveFunction(r, n, l);
        return r * r * radial * radial;
    },
    
    // 计算角度概率分布
    calculateAngularProbability(theta, phi, l, m) {
        const angular = this.sphericalHarmonic(theta, phi, l, m);
        return angular * angular;
    },
    
    // 生成电子云数据点 - 重构版
    generateElectronCloudData(n, l, m, numPoints) {
        console.log(`开始生成电子云数据: n=${n}, l=${l}, m=${m}, 目标点数=${numPoints}`);
        
        const data = [];
        const maxRadius = n * n * this.a0 * 100; // 基于玻尔半径和主量子数
        
        // 轨道特定参数
        let shapeFactor = 1.0;
        let orientationParams = { x: 1, y: 1, z: 1 };
        
        // 根据轨道类型调整形状参数
        switch(l) {
            case 0: // s轨道
                shapeFactor = 0.8;
                break;
            case 1: // p轨道
                shapeFactor = 1.2;
                // 根据磁量子数调整方向
                if (m === 0) { // pz
                    orientationParams = { x: 0.3, y: 0.3, z: 1.0 };
                } else if (m === 1) { // px
                    orientationParams = { x: 1.0, y: 0.3, z: 0.3 };
                } else if (m === -1) { // py
                    orientationParams = { x: 0.3, y: 1.0, z: 0.3 };
                }
                break;
            case 2: // d轨道
                shapeFactor = 1.5;
                // 根据磁量子数调整方向
                if (m === 0) { // dz²
                    orientationParams = { x: 0.5, y: 0.5, z: 1.0 };
                } else if (m === 1) { // dxz
                    orientationParams = { x: 1.0, y: 0.5, z: 1.0 };
                } else if (m === -1) { // dyz
                    orientationParams = { x: 0.5, y: 1.0, z: 1.0 };
                } else if (Math.abs(m) === 2) { // dxy 或 dx²-y²
                    orientationParams = { x: 1.0, y: 1.0, z: 0.5 };
                }
                break;
        }
        
        let generatedPoints = 0;
        let totalAttempts = 0;
        const maxAttempts = numPoints * 10; // 防止无限循环
        
        // 使用改进的概率分布采样
        while (generatedPoints < numPoints && totalAttempts < maxAttempts) {
            totalAttempts++;
            
            // 生成球坐标
            let r, theta, phi;
            
            // 使用改进的采样策略
            if (l === 0) {
                // s轨道 - 球对称，均匀分布
                r = Math.pow(Math.random(), 1/3) * maxRadius;
                theta = Math.acos(2 * Math.random() - 1);
                phi = 2 * Math.PI * Math.random();
            } else {
                // p和d轨道 - 根据概率分布采样
                r = this.sampleRadialDistance(n, l);
                [theta, phi] = this.sampleAngularDirection(l, m);
            }
            
            // 转换为直角坐标
            const x = r * Math.sin(theta) * Math.cos(phi) * orientationParams.x;
            const y = r * Math.sin(theta) * Math.sin(phi) * orientationParams.y;
            const z = r * Math.cos(theta) * orientationParams.z;
            
            // 计算精确的概率密度
            let probability = this.calculateProbabilityDensity(r, theta, phi, n, l, m);
            
            // 应用形状因子
            probability *= shapeFactor;
            
            // 归一化概率
            probability = this.normalizeProbability(probability, n, l);
            
            // 应用接受-拒绝采样
            if (this.acceptPoint(probability, r, maxRadius)) {
                // 计算颜色
                const color = QuantumStates.getOrbitalColor(l, probability, x, y, z);
                
                data.push({
                    x: x,
                    y: y,
                    z: z,
                    probability: probability,
                    color: color,
                    radius: r,
                    theta: theta,
                    phi: phi
                });
                
                generatedPoints++;
            }
        }
        
        console.log(`生成完成: ${data.length}个有效点 (尝试次数: ${totalAttempts}, 接受率: ${(data.length/totalAttempts*100).toFixed(1)}%)`);
        
        // 如果需要，对数据进行排序和筛选
        return this.postProcessData(data, numPoints);
    },
    
    // 径向距离采样
    sampleRadialDistance(n, l) {
        // 基于主量子数和角量子数的径向分布
        const meanRadius = n * n * this.a0 * 100; // 平均半径
        const spread = meanRadius * (0.3 + 0.1 * l); // 根据轨道类型调整分布宽度
        
        // 使用Gamma分布近似氢原子径向分布
        const shape = n - l;
        const scale = meanRadius / shape;
        
        let r = 0;
        for (let i = 0; i < shape; i++) {
            r -= Math.log(Math.random());
        }
        r *= scale;
        
        return Math.min(r, meanRadius * 3); // 限制最大半径
    },
    
    // 角度方向采样
    sampleAngularDirection(l, m) {
        let theta, phi;
        
        switch(l) {
            case 0: // s轨道
                theta = Math.acos(2 * Math.random() - 1);
                phi = 2 * Math.PI * Math.random();
                break;
                
            case 1: // p轨道
                if (m === 0) { // pz - 主要沿z轴
                    theta = Math.acos(Math.pow(Math.random(), 0.3) * 2 - 1);
                    phi = 2 * Math.PI * Math.random();
                } else if (m === 1) { // px - 主要沿x轴
                    theta = Math.PI / 2;
                    phi = 0;
                } else if (m === -1) { // py - 主要沿y轴
                    theta = Math.PI / 2;
                    phi = Math.PI / 2;
                }
                break;
                
            case 2: // d轨道
                if (m === 0) { // dz² - 沿z轴的双锥
                    theta = Math.acos(Math.pow(Math.random(), 0.5) * 2 - 1);
                    phi = 2 * Math.PI * Math.random();
                } else if (Math.abs(m) === 1) { // dxz 或 dyz
                    theta = Math.PI / 4 + (Math.PI / 4) * (Math.random() - 0.5);
                    phi = (m === 1 ? 0 : Math.PI / 2) + (Math.PI / 8) * (Math.random() - 0.5);
                } else { // dxy 或 dx²-y²
                    theta = Math.PI / 2 + (Math.PI / 12) * (Math.random() - 0.5);
                    phi = (m === 2 ? Math.PI / 4 : 3 * Math.PI / 4) + (Math.PI / 8) * (Math.random() - 0.5);
                }
                break;
                
            default:
                theta = Math.acos(2 * Math.random() - 1);
                phi = 2 * Math.PI * Math.random();
        }
        
        // 添加一些随机扰动
        theta += (Math.random() - 0.5) * 0.2;
        phi += (Math.random() - 0.5) * 0.2;
        
        return [theta, phi];
    },
    
    // 计算概率密度
    calculateProbabilityDensity(r, theta, phi, n, l, m) {
        try {
            // 计算径向部分
            const radialProbability = this.calculateRadialProbability(r, n, l);
            
            // 计算角度部分
            const angularProbability = this.calculateAngularProbability(theta, phi, l, m);
            
            // 总概率密度
            let probability = radialProbability * angularProbability;
            
            // 避免数值溢出
            if (!isFinite(probability) || probability <= 0) {
                probability = 1e-10;
            }
            
            return probability;
        } catch (error) {
            console.warn('概率密度计算错误:', error);
            return 1e-10;
        }
    },
    
    // 归一化概率
    normalizeProbability(probability, n, l) {
        // 基于量子数的归一化因子
        const normalizationFactor = 1.0 / (n * (l + 1));
        
        // 应用归一化
        let normalized = probability * normalizationFactor;
        
        // 确保在合理范围内
        normalized = Math.max(0, Math.min(1, normalized));
        
        // 应用非线性变换以增强可视化效果
        normalized = Math.pow(normalized, 0.7);
        
        return normalized;
    },
    
    // 接受-拒绝采样
    acceptPoint(probability, r, maxRadius) {
        // 基础接受率
        let acceptanceRate = probability;
        
        // 考虑径向衰减
        const radialFactor = Math.exp(-r / (maxRadius * 0.3));
        acceptanceRate *= radialFactor;
        
        // 添加随机因素
        const randomFactor = Math.random();
        
        // 接受条件
        return acceptanceRate > randomFactor * 0.5;
    },
    
    // 数据后处理
    postProcessData(data, targetCount) {
        if (data.length === 0) {
            console.warn('无有效数据点生成');
            return [];
        }
        
        // 按概率排序
        data.sort((a, b) => b.probability - a.probability);
        
        // 如果生成的点太多，随机采样
        if (data.length > targetCount) {
            const sampledData = [];
            const step = data.length / targetCount;
            
            for (let i = 0; i < targetCount; i++) {
                const idx = Math.floor(i * step);
                sampledData.push(data[idx]);
            }
            
            // 添加一些随机点以保持多样性
            const randomPoints = Math.min(100, Math.floor(targetCount * 0.1));
            for (let i = 0; i < randomPoints; i++) {
                const randomIdx = Math.floor(Math.random() * data.length);
                sampledData.push(data[randomIdx]);
            }
            
            return sampledData.slice(0, targetCount);
        }
        
        // 如果生成的点不足，可以复制一些高概率点
        if (data.length < targetCount) {
            const repeatedData = [...data];
            const needed = targetCount - data.length;
            
            for (let i = 0; i < needed; i++) {
                const sourceIdx = i % data.length;
                const point = { ...data[sourceIdx] };
                
                // 添加微小扰动
                point.x += (Math.random() - 0.5) * 0.1;
                point.y += (Math.random() - 0.5) * 0.1;
                point.z += (Math.random() - 0.5) * 0.1;
                
                repeatedData.push(point);
            }
            
            return repeatedData;
        }
        
        return data;
    },
    
    // 快速生成测试数据（用于调试）
    generateTestData(n, l, m, numPoints) {
        console.log(`生成测试数据: n=${n}, l=${l}, m=${m}`);
        
        const data = [];
        const radius = n * 2;
        
        for (let i = 0; i < numPoints; i++) {
            // 生成简单的球坐标
            const r = Math.random() * radius;
            const theta = Math.random() * Math.PI;
            const phi = Math.random() * 2 * Math.PI;
            
            // 转换为直角坐标
            const x = r * Math.sin(theta) * Math.cos(phi);
            const y = r * Math.sin(theta) * Math.sin(phi);
            const z = r * Math.cos(theta);
            
            // 简单概率分布
            let probability = Math.exp(-r / n);
            
            // 根据轨道类型调整
            if (l === 1 && m === 0) probability *= Math.abs(Math.cos(theta));
            if (l === 1 && Math.abs(m) === 1) probability *= Math.abs(Math.sin(theta));
            if (l === 2) probability *= Math.abs(Math.sin(theta) * Math.cos(theta));
            
            // 颜色
            const color = QuantumStates.getOrbitalColor(l, probability, x, y, z);
            
            data.push({
                x: x,
                y: y,
                z: z,
                probability: probability,
                color: color
            });
        }
        
        return data;
    }
};

// 导出到全局作用域
window.QuantumStates = QuantumStates;
window.WaveFunction = WaveFunction;
