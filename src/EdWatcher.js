const path = require('path')
const fs = require('fs')
const EventEmitter = require('events')
const LogFileWatcher = require('./LogFileWatcher')
const JsonFileWatcher = require('./JsonFileWatcher')

class EDWatcher extends EventEmitter {
    static DEFAULT_PATH = path.resolve(process.env.USERPROFILE, "Saved Games", "Frontier Developments", "Elite Dangerous")
    static JSON_OPTS = {}
    static LOG_OPTS = {catchup: false}
    constructor(logs_path=EDWatcher.DEFAULT_PATH) {
        super()
        this.logs_path = logs_path
        fs.readdir(path.resolve(this.logs_path), { encoding: 'utf8' }, (err, files) => {
            for(let i = 0; i < files.length; i++) {
                let watcher
                if(files[i].endsWith('.json')) {
                    watcher = new JsonFileWatcher(path.resolve(this.logs_path, files[i]), EDWatcher.JSON_OPTS)
                } else if(files[i].endsWith('.log')) {
                    watcher = new LogFileWatcher(path.resolve(this.logs_path, files[i]), EDWatcher.LOG_OPTS)
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
        this.emit(type, data)
    }
}

module.exports = EDWatcher