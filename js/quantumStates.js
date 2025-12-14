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
    
    // 生成电子云数据点 - 修复版
    generateElectronCloudData(n, l, m, numPoints) {
        console.log(`生成电子云数据: n=${n}, l=${l}, m=${m}, 点数=${numPoints}`);
        
        const data = [];
        const maxRadius = n * 5; // 根据n值调整最大半径
        
        // 轨道特定参数
        let shapeFactor = 1;
        let orientationFactor = 1;
        
        // 根据轨道类型调整参数
        if (l === 1) { // p轨道
            shapeFactor = 2;
            if (m === 0) orientationFactor = Math.abs(Math.cos); // pz
            else if (m === 1) orientationFactor = Math.abs(Math.sin); // px
            else if (m === -1) orientationFactor = Math.abs; // py
        } else if (l === 2) { // d轨道
            shapeFactor = 3;
        }
        
        for (let i = 0; i < numPoints; i++) {
            // 生成球坐标
            const r = Math.pow(Math.random(), 1/3) * maxRadius;
            const theta = Math.acos(2 * Math.random() - 1);
            const phi = 2 * Math.PI * Math.random();
            
            // 转换为直角坐标
            const x = r * Math.sin(theta) * Math.cos(phi);
            const y = r * Math.sin(theta) * Math.sin(phi);
            const z = r * Math.cos(theta);
            
            // 计算概率密度（简化模型）
            let probability = 0;
            
            // 径向概率分布
            const radialFactor = Math.exp(-r / n) * Math.pow(r, 2*l);
            
            // 角度分布
            let angularFactor = 1;
            if (l === 0) {
                angularFactor = 1; // s轨道球对称
            } else if (l === 1) {
                if (m === 0) angularFactor = Math.abs(Math.cos(theta)); // pz
                else if (m === 1) angularFactor = Math.abs(Math.sin(theta) * Math.cos(phi)); // px
                else if (m === -1) angularFactor = Math.abs(Math.sin(theta) * Math.sin(phi)); // py
            } else if (l === 2) {
                if (m === 0) angularFactor = Math.abs(3 * Math.cos(theta) * Math.cos(theta) - 1); // dz²
                else if (m === 1) angularFactor = Math.abs(Math.sin(theta) * Math.cos(theta) * Math.cos(phi)); // dxz
                else if (m === -1) angularFactor = Math.abs(Math.sin(theta) * Math.cos(theta) * Math.sin(phi)); // dyz
                else if (m === 2) angularFactor = Math.abs(Math.sin(theta) * Math.sin(theta) * Math.cos(2 * phi)); // dx²-y²
                else if (m === -2) angularFactor = Math.abs(Math.sin(theta) * Math.sin(theta) * Math.sin(2 * phi)); // dxy
            }
            
            // 计算总概率
            probability = radialFactor * angularFactor * shapeFactor;
            
            // 归一化到0-1范围
            probability = Math.min(1, probability * 5);
            
            // 基于概率和量子态设置颜色
            const colorIntensity = Math.min(1, probability * 3);
            let color;
            
            switch(l) {
                case 0: // s轨道 - 蓝色系
                    color = [
                        Math.floor(100 * colorIntensity),
                        Math.floor(150 * colorIntensity),
                        255
                    ];
                    break;
                case 1: // p轨道 - 绿色系
                    color = [
                        Math.floor(100 * colorIntensity),
                        255,
                        Math.floor(150 * colorIntensity)
                    ];
                    break;
                case 2: // d轨道 - 紫色系
                    color = [
                        Math.floor(200 * colorIntensity),
                        Math.floor(100 * colorIntensity),
                        255
                    ];
                    break;
                default: // 其他轨道 - 青色系
                    color = [
                        Math.floor(100 * colorIntensity),
                        255,
                        255
                    ];
            }
            
            // 只保留概率较高的点
            if (probability > 0.01) {
                data.push({
                    x: x,
                    y: y,
                    z: z,
                    probability: probability,
                    color: color
                });
            }
        }
        
        console.log(`生成完成: ${data.length}个有效点`);
        return data;
    }
};

// 导出到全局作用域
window.QuantumStates = QuantumStates;
window.WaveFunction = WaveFunction;
