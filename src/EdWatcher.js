const path = require('path')
const fs = require('fs')
const EventEmitter = require('events')
const LogFileWatcher = require('./LogFileWatcher')
const JsonFileWatcher = require('./JsonFileWatcher')
const DEFAULT_PATH = path.resolve(process.env.USERPROFILE, "Saved Games", "Frontier Developments", "Elite Dangerous")
const JSON_OPTS = {}
const LOG_OPTS = {catchup: false}

class EDWatcher extends EventEmitter {
    constructor(logs_path=DEFAULT_PATH) {
        super()
        this.logs_path = logs_path
        fs.readdir(path.resolve(this.logs_path), { encoding: 'utf8' }, (err, files) => {
            for(let i = 0; i < files.length; i++) {
                let watcher
                if(files[i].endsWith('.json')) {
                    watcher = new JsonFileWatcher(path.resolve(this.logs_path, files[i]), JSON_OPTS)
                } else if(files[i].endsWith('.log')) {
                    watcher = new LogFileWatcher(path.resolve(this.logs_path, files[i]), LOG_OPTS)
                } else {
                    // not .json or .log - skip
                    continue
                }
                watcher.on('update', (data) => this.onUpdate(data))
            }
        })
    }

    onUpdate(data) {
        const type = data.event
        this.emit('*', data)
        this.emit(type, data)
    }
}

module.exports = EDWatcher