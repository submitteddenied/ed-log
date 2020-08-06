const EventEmitter = require('events')
const fs = require('fs')
const path = require('path')

class JsonFileWatcher extends EventEmitter {
    constructor(filepath, options) {
        super()
        this.filepath = filepath
        this.watcher = fs.watch(this.filepath, {persistent: true, recursive: true, encoding: 'utf8'}, (event, filename) => this.onFileUpdate(event, filename))
        
        this.onFileUpdate('change', this.filepath)
    }

    onFileUpdate(event, filename) {
        if(event !== 'change') {
            //ignore non-changes
            return
        }

        fs.readFile(path.resolve(this.filepath), {encoding: 'utf8'}, (err, contents) => {
            if(err) {
                console.log(`LogFileWatcher[${this.filepath}]: Error reading file - ${err}`)
                return
            }

            const data = JSON.parse(contents)
            this.emit('update', data)
        })
    }
}

module.exports = JsonFileWatcher