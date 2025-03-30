import express from 'express'
import http from 'http'
import { WebSocketServer } from 'ws';

const app = express()
let server = http.createServer(app)
const wss = new WebSocketServer({ server });

console.log("Hello via Bun!");