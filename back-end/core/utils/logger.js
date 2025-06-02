const COLORS = {
    RED: '\x1b[31m',
    BLUE: '\x1b[34m',
    YELLOW: '\x1b[33m',
    GREEN: '\x1b[32m',
    PURPLE: '\x1b[35m',
    RESET: '\x1b[0m'
};


class Logger {
    constructor(module) {
        this.module = module
        this.ID = 0
    }

    debug(message) {
        if (process.env.DEBUG) {
            this.inner_log(COLORS.PURPLE, 'DEBUG', message);
        }
    }

    info(message) {
        this.inner_log(COLORS.GREEN, 'INFO ', message);
    }

    warn(message) {
        this.inner_log(COLORS.YELLOW, 'WARN ', message);
    }

    error(message) {
        this.inner_log(COLORS.RED, 'ERROR', message);
    }

    inner_log(color, level, msg) {
        if (typeof msg === 'object') {
            msg = JSON.stringify(msg, null, 2);
        }

        console.log(`${color}[ ${this.now()} ] [ ${this.module}:${String(this.ID++).padStart(5, '0')} ] [ ${level} ] - ${msg}${COLORS.RESET}`);
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
export default function get_logger(module_name) {
    if (!modules[module_name]) {
        modules[module_name] = 0;
    } else {
        modules[`${module_name} ${++modules[module_name]}`] = 0;
    }

    return new Logger(module_name);
}
