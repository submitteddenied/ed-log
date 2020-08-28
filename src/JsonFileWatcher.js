const EventEmitter = require('events')
const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')

class JsonFileWatcher extends EventEmitter {
    constructor(filepath, options) {
        super()
        this.filepath = filepath
        this.watcher = chokidar.watch(this.filepath, {persistent: true, usePolling: true, interval: 500})
        this.watcher.on('change', (filename, stats) => this.onFileUpdate(filename, stats))
        
        this.onFileUpdate(this.filepath, null)
    }

    onFileUpdate(filename, stats) {
        fs.readFile(path.resolve(this.filepath), {encoding: 'utf8'}, (err, contents) => {
            if(err) {
                console.log(`LogFileWatcher[${this.filepath}]: Error reading file - ${err}`)
                return
            }

            try{
                const data = JSON.parse(contents)
                this.emit('update', data)
            } catch (err) {
                //possible incomplete file here, ignore
            }
        })
    }
}

module.exports = JsonFileWatcher