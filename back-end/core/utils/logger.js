const COLORS = {
    RED: '\x1b[31m',
    BLUE: '\x1b[34m',
    YELLOW: '\x1b[33m',
    GREEN: '\x1b[32m',
    PURPLE: '\x1b[35m',
    RESET: '\x1b[0m'
};

class Logger {
    constructor(module, config = {}) {
        this.module = module;
        this.ID = 0;
        this.config = config;

        this.queues = {
            debug: [],
            info: [],
            warn: [],
            error: []
        };

        this.timers = {
            debug: null,
            info: null,
            warn: null,
            error: null
        };
    }

    debug(message) {
        if (process.env.DEBUG) {
            this.processMessage('debug', COLORS.PURPLE, 'DEBUG', message);
        }
    }

    info(message) {
        this.processMessage('info', COLORS.GREEN, 'INFO ', message);
    }

    warn(message) {
        this.processMessage('warn', COLORS.YELLOW, 'WARN ', message);
    }

    error(message) {
        this.processMessage('error', COLORS.RED, 'ERROR', message);
    }

    processMessage(level, color, label, message) {
        const levelConfig = this.config[level] || {};
        const cooldown = levelConfig.cooldown || 0;

        this.queues[level].push({
            color,
            label,
            message,
            timestamp: Date.now()
        });

        if (!this.timers[level]) {
            const first = this.queues[level].shift();
            this.inner_log(first.color, first.label, first.message);

            if (cooldown > 0) {
                this.timers[level] = setTimeout(() => {
                    this.flushQueue(level, color, label);
                }, cooldown);
            }
        }
    }

    flushQueue(level, color, label) {
        const queue = this.queues[level];
        if (queue.length === 0) {
            this.timers[level] = null;
            return;
        }

        const levelConfig = this.config[level] || {};
        const truncate = levelConfig.truncate || queue.length;

        let messagesToLog = queue.slice(0, truncate);
        if (truncate < queue.length) {
            const skipped = queue.length - truncate;
            messagesToLog.push({
                color,
                label,
                message: `[${skipped} more message(s) truncated]`
            });
        }

        messagesToLog.forEach((item, i) => {
            if (i === 1 ) {
                this.inner_log(item.color, item.label, item.message);
            }
        });

        this.queues[level] = [];
        this.timers[level] = null;
    }

    inner_log(color, level, msg) {
        if (typeof msg === 'object') {
            msg = JSON.stringify(msg, null, 2);
        }

        console.log(`${color}[ ${this.now()} ] [ ${String(this.ID++).padStart(5, '0')}:${this.module} ] [ ${level} ] - ${msg}${COLORS.RESET}`);
    }

    now() {
        const date = new Date();
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const MM = String(date.getMinutes()).padStart(2, '0');
        const ss = String(date.getSeconds()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd} ${hh}:${MM}:${ss}`;
    }
}

let modules = {}
export default function get_logger(module_name, config = {}) {
    if (!modules[module_name]) {
        modules[module_name] = 0;
    } else {
        modules[`${module_name} ${++modules[module_name]}`] = 0;
    }

    return new Logger(module_name, config);
}
