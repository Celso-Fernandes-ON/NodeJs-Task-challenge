import fs from 'node:fs/promises'

const databasePath = new URL('../db.json',import.meta.url)

export class Database{
    #database = {}
    constructor(){
        fs.readFile(databasePath,'utf-8').then(data => {
            this.#database = JSON.parse(data)
        })
        .catch(() => {
            this.#persist()
        })
    }
    #persist(){
        fs.writeFile(databasePath, JSON.stringify(this.#database))
    }
    select(table, search){
        let data = this.#database[table]??[]
        if(search){
            data = data.filter(row =>{
                return Object.entries(search).some(([key, value]) => {
                    return row[key].toLowerCase().includes(value.toLowerCase())
                })
            })
        }
        return data
    }
    insert(table,data){
        if(Array.isArray(this.#database[table])){
            this.#database[table].push(data)
        }else{
            this.#database[table] = [data]
        }
        this.#persist()
        return data
    }
    update(table,id, data){
        const rowIndex = this.checkerDatabase(table, id)
        if(rowIndex > -1){
            const oldTask = this.#database[table][rowIndex]
            const task = this.#database[table][rowIndex]
            
            
            task.title = data.title ? data.title : oldTask.title
            task.description = data.description ? data.description : oldTask.description
            task.updated_at = new Date()
            
            this.#database[table][rowIndex] = task
            this.#persist()
            return [rowIndex, oldTask, task]
        }
        return [rowIndex]

    }
    delete(table,id){
        const rowIndex = this.checkerDatabase(table, id)
        if(rowIndex > -1){
            this.#database[table].splice(rowIndex, 1)
            this.#persist()
        }
        const task = this.#database[table][rowIndex]
        return [rowIndex, task]
    }
    complete(table,id){
        const rowIndex = this.checkerDatabase(table,id)
        // return [rowIndex,0]
        if(rowIndex > -1){
            const task = this.#database[table][rowIndex]

            task.completed_at = task.completed_at ? false : true
            task.updated_at = new Date()

            this.#database[table][rowIndex] = task

        }
        this.#persist()
        return [rowIndex,this.#database[table][rowIndex]]
        
    }
    checkerDatabase(table,id){
        const rowIndex = this.#database[table].findIndex(row => row.id == id)
        return rowIndex
    }
}