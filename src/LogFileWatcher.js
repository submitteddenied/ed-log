const EventEmitter = require('events')
const fs = require('fs')
const path = require('path')

class LogFileWatcher extends EventEmitter {
    constructor(filepath, options) {
        super()
        this.filepath = filepath
        this.watcher = fs.watch(this.filepath, {persistent: true, recursive: true, encoding: 'utf8'}, (event, filename) => this.onFileUpdate(event, filename))
        this.nextLine = 0
        if(options.catchup === undefined || options.catchup === true) {
            this.onFileUpdate('change', this.filepath)
        } else {
            fs.readFile(path.resolve(this.filepath), {encoding: 'utf8'}, (err, contents) => {
                if(err) {
                    console.log(`LogFileWatcher[${this.filepath}]: Error reading file - ${err}`)
                    return
                }
    
                const data = contents.split('\n')
                this.nextline = data.length
            })
        }
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

            const data = contents.split('\n')
            while(this.nextLine < data.length) {
                try {
                    this.processLine(data[this.nextLine])
                    this.nextLine++
                } catch(err) {
                    //TODO: What if it's not a JSON parse error?
                    //Incomplete line or something?
                    break
                }
            }
        })
    }

    processLine(lineStr) {
        const data = JSON.parse(lineStr)
        this.emit('update', data)
    }
}

module.exports = LogFileWatcher