import { randomUUID } from 'node:crypto'
import { Database } from "./database.js"
import { buildRoutePath } from './utils/builde-route-path.js'

const database = new Database()

export const routes = [

    {
        method:'GET',
        path:buildRoutePath('/tasks'),
        handler:(req,res) => {
            const {search} = req.query
            const tasks = database.select('tasks', search ? {
                title: search,
                description :search,
            }:null)
            return res.end(JSON.stringify(tasks))
        }
    },
    {
        method:'POST',
        path:buildRoutePath('/tasks'),
        handler:(req,res) => {
            // if(!req.body.title){
            //     return res.writeHead(401).end('Necessário titúlo da tasks')
            // }
            // if(!req.body.description){
            //     return res.writeHead(401).end('Necessário descrição da tasks')
            // }
            const {title, description} = req.body
            const task = {
                id: randomUUID(),
                title,
                description,
                completed_at: false,
                created_at: new Date(),
                updated_at: new Date(),
            }
            database.insert('tasks',task)
            return res.writeHead(201).end('CRIAÇÃO')
        }
    },
    {
        method:'PUT',
        path:buildRoutePath('/tasks/:id'),
        handler:(req,res) => {
            // if(!req.body.title){
            //     return res.writeHead(401).end('Necessário titúlo da tasks')
            // }
            // if(!req.body.description){
            //     return res.writeHead(401).end('Necessário descrição da tasks')
            // }
            const {id} = req.params
            const {title, description} = req.body
            if(!title && !description){
                return res.writeHead(404).end('sem titúlo ou descrição')
            }
            const {rowIndex, oldTask, task} = database.update('tasks',id,{
                title,
                description,
            })


            if(rowIndex > -1 ){
                return res.writeHead(202).end(`atualizado:  ${id} \ntitúlo: ${task.title} => ${oldTask.title} \nDescrição: ${task.description}\n => \n${oldTask.description}`)
                // return res.writeHead(202).end(`atualizado:  ${id} `)
            }
            return res.writeHead(404).end(`não foi encontrado o id : \n${id}`)

        }
    },
    {
        method:'PATCH',
        path:buildRoutePath('/tasks/:id'),
        handler:(req,res) => {
            const {id} = req.params
            const complete = database.complete('tasks',id)
            if(complete[0] > -1){
                const task = complete[1]
                return res.writeHead(202).end(`Task do id: ${id} \ntitúlo: ${task.title} \nStatus: ${task.completed_at ?'completo':'incompleto'}`)
            }
            return res.writeHead(404).end(`não foi encontrado o id : \n${id}`)
        }
    },
    {
        method:'DELETE',
        path:buildRoutePath('/tasks/:id'),
        handler:(req,res) => {
            const {id} = req.params
            const deleted = database.delete('tasks',id)
            if(deleted[0] > -1 ){
                const task = deleted[1]
                return res.writeHead(202).end(`Deletado:\nid: ${id} \nTitúlo: ${task.title} \nCriado: ${task.created_at}`)
            }
            return res.writeHead(404).end(`não foi encontrado o id : \n${id}`)
        }
    }
]