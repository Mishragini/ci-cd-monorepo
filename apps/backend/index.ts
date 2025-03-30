import express, { type NextFunction, type Request, type Response } from 'express'
import { prismaClient as prisma } from '@repo/db/client'
import * as jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

const app = express();
app.use(express.json())
dotenv.config()

interface authenticatedRequest extends Request{
    user_id : string
}

let authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("inside authMiddleware")
        let auth_header = req?.headers?.authorization;
        console.log("auth_header", auth_header)
        let token = auth_header?.split(' ')[1]
        console.log("token",token)
        if (!auth_header || !token) {
            res.status(404).json({ message: "Authorization header required" })
            return
        }

        let secret_key = process.env.JWT_SECRET || "jwt_secret_key";
        console.log("secret_key",secret_key)
        let decoded = jwt.verify(token, secret_key) as jwt.JwtPayload
        console.log("decoded",decoded)
        let { username, user_id } = decoded

        let user = await prisma.user.findFirst({
            where: {
                username
            }
        })
        if (!user) {
            res.status(400).json({ message: `User with username ${username} does not exist` })
            return
        }
        (req as authenticatedRequest).user_id = user?.id
        next()
    } catch (error) {
        console.log("hfeijoi", error)
        let error_message =  error instanceof Error ? error?.message : "Something went wrong"
        res.status(500).json({ error: error_message })
    }
}


app.post("/user", async (req, res) => {
    try {
        let { username, password } = req.body;
        let hashed_password = await bcrypt.hash(password, 10)
        let new_user = await prisma.user.create({
            data: {
                username,
                password: hashed_password
            }
        })
        console.log("secret key from env", process.env.JWT_SECRET)
        let secret_key = process.env.JWT_SECRET || "jwt_secret_key";
        let token = jwt.sign({username,user_id:new_user?.id},secret_key)
        res.json({ message: `User with id ${new_user?.id} created successfully!`,token })
    } catch (error) {
        res.status(500).json({ error })
    }
})

app.get("/todos", authMiddleware,async (req, res) => {
    try {
        let user_id = (req as authenticatedRequest).user_id;
        const todos = await prisma.todo.findMany({
            where: {
                userId : user_id
            }
        })
        if (!todos.length) {
            res.json(404).json({message: `No Todos found for userId ${user_id}`})
        }
        res.json({messages: "Todos fetched successfully!", todos})
    } catch (error) {
        res.status(500).json({ error })
    }
})

app.post("/todo", authMiddleware, async (req, res) => {
    try {
        console.log("fjeoiu29")
        let user_id = (req as authenticatedRequest).user_id;
        console.log("user id",user_id)
        let { task} = req.body;
        const new_todo = await prisma.todo.create({
            data: {
                task,
                user: {
                    connect: {
                        id: user_id
                    }
                }
            }
        })
        res.json({ messages: "Todos created successfully!", new_todo })
    } catch (error) {
        console.log("fkwejo",error)
        res.status(500).json({ error })
    }
})


app.listen(3003, () => {
    console.log("Server listening port 3003")
})