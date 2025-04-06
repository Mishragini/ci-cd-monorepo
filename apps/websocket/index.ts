import express from 'express'
import http from 'http'
import { WebSocketServer } from 'ws';
import { prismaClient } from "@repo/db/client"

const app = express()
let server = http.createServer(app)
const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
    console.log("req",req)
    ws.on("message", (message) => {
        let new_user = prismaClient.user.create({
            data: {
                username: Math.random().toString(),
                password: Math.random().toString()
            }
        })
        console.log(`Received message : ${message}`)
        ws.send(JSON.stringify(new_user))
    })
})

server.listen(8080);