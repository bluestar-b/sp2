import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

const host = "http://cutedomain.thddns.net:8885/"


const socket = io.connect(host);


socket.on('connect', function() {
    console.log('Connected to the server');

    setInterval(function() {
        socket.emit('system_info');
    }, 300)

});

socket.on('system_info', function(data) {
    updateChartsWithData(data);

});

const ctx = document.getElementById('cpu-chart').getContext('2d');
const mem = document.getElementById('mem-chart').getContext('2d');
const datasets = [];

const cpuData = {
    labels: [],
    datasets: datasets
};


const cpuChart = new Chart(ctx, {
    type: 'line',
    data: cpuData,
    options: {
        maintainAspectRatio: false,
        responsive: false,
        borderColor: "blue",
        fill: false,
        scales: {
            x: {
                max: 10,
                display: false
            },
            y: {
                beginAtZero: true,
                max: 100
            }
        },
        animation: false
    }
});

const memoryData = {
    labels: [],
    datasets: [
        {
            label: "Memory Usage(Percent)",
            data: []
    }
  ]
};

const memChart = new Chart(mem, {
    type: 'line',
    data: memoryData,
    options: {
        maintainAspectRatio: false,
        responsive: false,
        borderColor: "blue",
        fill: false,
        scales: {
            x: {
                max: 10,
                display: false
            },
            y: {
                beginAtZero: false,
                max: 100
            }
        },
        animation: false
    }
});

const memData = memoryData.datasets[0].data;


function formatSize(size) {
    const power = 2 ** 10;
    let n = 0;
    const labels = { 0: 'B', 1: 'KB', 2: 'MB', 3: 'GB', 4: 'TB' };

    while (size > power) {
        size /= power;
        n += 1;
    }

    return `${size.toFixed(2)} ${labels[n]}`;
}

setInterval(async function() {

    const currentTime = new Date().toLocaleTimeString();

    document.getElementById("current-time").innerHTML = currentTime;

}, 1000)

async function updateChartsWithData(data) {


    const currentTime = new Date().toLocaleTimeString();

    document.getElementById("current-time").innerHTML = currentTime;


    const cpuPercentList = document.getElementById('cpu-usage-list');
    cpuPercentList.innerHTML = `<div>${data.cpu_percent.map((percent, index) => `<div>CPU-${index + 1}: ${percent.toFixed(2)}%</div>`).join('')}</div>`;


    const elements = {
        "memory-total": data.memory_info.total,
        "memory-available": data.memory_info.available,
        "memory-percent": data.memory_info.percent,
        "disk-total": data.disk_usage.total,
        "disk-used": data.disk_usage.used,
        "disk-free": data.disk_usage.free,
        "disk-percent": data.disk_usage.percent,
        "net-bytes-sent": data.net_io_counters.bytes_sent,
        "net-bytes-recv": data.net_io_counters.bytes_recv,
        "net-packets-sent": data.net_io_counters.packets_sent,
        "net-packets-recv": data.net_io_counters.packets_recv,
    };

    for (const elementId in elements) {
        if (elementId.includes("percent")) {
            document.getElementById(elementId).innerHTML = elements[elementId] + "%";
        } else {
            document.getElementById(elementId).innerHTML = formatSize(elements[elementId]);
        }
    }


    memData.push(data.memory_info.percent);
    if (memData.length > 10) {
        memData.shift();
    }
    memoryData.labels.push(currentTime);

    while (memoryData.labels.length > 10) {
        memoryData.labels.shift();
    }
    memChart.update();


    cpuData.labels.push(currentTime);

    for (let i = 0; i < data.cpu_count; i++) {
        cpuData.datasets[i] = cpuData.datasets[i] || {
            label: `CPU ${i + 1}`,
            data: [],
            backgroundColor: `rgba(${Math.floor(Math.random() * 156) + 100}, ${Math.floor(Math.random() * 156) + 100}, ${Math.floor(Math.random() * 156) + 100}, 0.2)`,
            borderColor: `rgba(${Math.floor(Math.random() * 156) + 100}, ${Math.floor(Math.random() * 156) + 100}, ${Math.floor(Math.random() * 156) + 100}, 1)`,
            borderWidth: 2
        };
        cpuData.datasets[i].data.push(data.cpu_percent[i]);
        if (cpuData.datasets[i].data.length > 10) {
            cpuData.datasets[i].data.shift();
        }
    }

    while (cpuData.labels.length > 10) {
        cpuData.labels.shift();
    }
    cpuChart.update();
}

