const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splash-screen');
    const initialContent = document.getElementById('initial-content');
    const welcomeContent = document.getElementById('welcome-content');
    const mainContent = document.getElementById('main-content');
    const aboutButton = document.getElementById('about-button');
    const aboutModal = document.getElementById('about-modal');
    const closeModal = document.getElementById('close-modal');
    const calculateButton = document.getElementById('calculate-button');
    const chartContainer = document.getElementById('chart-container');
    // 显示初始内容
    setTimeout(() => {
        initialContent.classList.add('fade-in');
    }, 500);

    // 3秒后隐藏初始内容
    setTimeout(() => {
        initialContent.classList.remove('fade-in');
        initialContent.classList.add('fade-out');
    }, 3500);

    // 4秒后显示欢迎内容
    setTimeout(() => {
        welcomeContent.classList.add('fade-in');
    }, 4500);
    setTimeout(() => {
        welcomeContent.classList.add('fade-out');
    }, 6000);

    // 7秒后开始过渡到主内容
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        mainContent.classList.remove('hidden');
        setTimeout(() => {
            splashScreen.style.display = 'none';
            mainContent.style.opacity = '1';
        }, 1000);
    }, 7000);

    // 添加鼠标移动视差效果（仅在启动画面显示时）
    document.addEventListener('mousemove', (e) => {
        if (splashScreen.style.display !== 'none') {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            const offsetX = 20 * (mouseX - 0.5);
            const offsetY = 20 * (mouseY - 0.5);
            
            initialContent.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            welcomeContent.style.transform = `translate(${-offsetX}px, ${-offsetY}px)`;
        }
    });

    // 窗口控制按钮功能
    document.getElementById('min-button').addEventListener('click', () => {
        ipcRenderer.send('minimize-window');
    });

    document.getElementById('max-button').addEventListener('click', () => {
        ipcRenderer.send('maximize-window');
    });

    document.getElementById('close-button').addEventListener('click', () => {
        ipcRenderer.send('close-window');
    });
    
    
    // 监听窗口最大化/还原事件，更新按钮图标
    ipcRenderer.on('window-maximized', () => {
        document.querySelector('#max-button i').classList.replace('fa-expand', 'fa-compress');
    });

    ipcRenderer.on('window-unmaximized', () => {
        document.querySelector('#max-button i').classList.replace('fa-compress', 'fa-expand');
    });
    // 关于按钮功能
    aboutButton.addEventListener('click', () => {
        aboutModal.classList.remove('hidden');
    });

    closeModal.addEventListener('click', () => {
        aboutModal.classList.add('hidden');
    });

    // 点击模态框外部关闭模态框
    aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            aboutModal.classList.add('hidden');
        }
    });

    let chart = null;
    // 计算按钮功能
calculateButton.addEventListener('click', () => {
    const initialYear = parseInt(document.getElementById('initialYear').value);
    const finalYear = parseInt(document.getElementById('finalYear').value);
    const initialProduction = parseFloat(document.getElementById('initialProduction').value);
    const finalProduction = parseFloat(document.getElementById('finalProduction').value);
    const totalInvestment = parseFloat(document.getElementById('totalInvestment').value);
    const productionCapacityIndex = parseFloat(document.getElementById('productionCapacityIndex').value);
    const annualPriceIndexIncrease = parseFloat(document.getElementById('annualPriceIndexIncrease').value);

    // 计算公式
    const result = totalInvestment * 
                   Math.pow((finalProduction / initialProduction), productionCapacityIndex) * 
                   Math.pow((1 + annualPriceIndexIncrease / 100), (finalYear - initialYear));

    // 显示结果
    const resultContainer = document.getElementById('result-container');
    const resultValue = document.getElementById('result-value');
    resultValue.textContent = `拟建项目静态投资=${result.toFixed(2)}（万元）`;
    resultContainer.classList.remove('hidden');

    // 创建年份数组和结果数组（包括最终年份后五年）
    const years = Array.from({length: finalYear - initialYear + 6}, (_, i) => initialYear + i);
    const values = years.map((year) => {
        if (year <= finalYear) {
            return totalInvestment * 
                   Math.pow((finalProduction / initialProduction), productionCapacityIndex * (year - initialYear) / (finalYear - initialYear)) * 
                   Math.pow((1 + annualPriceIndexIncrease / 100), (year - initialYear));
        } else {
            // 对于最终年份之后的年份，我们使用最终年份的计算结果并应用年增长率
            return result * Math.pow((1 + annualPriceIndexIncrease / 100), (year - finalYear));
        }
    });

    // 绘制图表
    const ctx = document.getElementById('result-chart').getContext('2d');
    
    // 如果图表已存在，销毁它
    if (chart) {
        chart.destroy();
    }

    // 创建新图表
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: '拟建项目静态投资额',
                data: values,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: '拟建项目静态投资额变化趋势以及预测'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '年份'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '静态投资额'
                    },
                    beginAtZero: true
                }
            }
        }
    });

    // 确保图表容器可见
    document.getElementById('chart-container').style.display = 'block';
});
});