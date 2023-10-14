from flask import Flask, jsonify
import psutil
from flask_socketio import SocketIO
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")


def get_system_info():
    cpu_count = psutil.cpu_count(logical=True)
    cpu_percent = psutil.cpu_percent(interval=1, percpu=True)
    memory_info = psutil.virtual_memory()
    disk_partitions = psutil.disk_partitions()
    disk_usage = psutil.disk_usage('/')
    net_io_counters = psutil.net_io_counters()

    system_info = {
        'cpu_count': cpu_count,
        'cpu_percent': cpu_percent,
        'memory_info': {
            'total': memory_info.total,
            'available': memory_info.available,
            'percent': memory_info.percent
        },
        'disk_partitions': [p._asdict() for p in disk_partitions],
        'disk_usage': {
            'total': disk_usage.total,
            'used': disk_usage.used,
            'free': disk_usage.free,
            'percent': disk_usage.percent
        },
        'net_io_counters': net_io_counters._asdict(),
    }

    return system_info



print(get_system_info())



@app.route("/")
def index():
    return jsonify({"message": "Orbiting Earth in the spaceship, I saw how beautiful our planet is. People, let us preserve and increase this beauty, not destroy it! - Yuri Gagarin"})


@app.route("/data")
def device_data():
    return jsonify(get_system_info()), 200



@socketio.on('connect')
def handle_connect():
    socketio.emit('connect', {'data': 'You are connected!'})


@socketio.on('system_info')
def handle_get_system_info():
    system_info = get_system_info()
    socketio.emit('system_info', system_info)




if __name__ == '__main__':
     socketio.run(app, host='0.0.0.0', port=80, debug=True)
#    app.run(host='0.0.0.0', debug=True)
