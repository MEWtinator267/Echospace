import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'
import connect from './models/dbconnect.js';
import  dotenv from 'dotenv';
import AccessLogic from './Routes/AccessRoute.js'
dotenv.config()

const PORT = process.env.PORT

const app = express();

connect()
app.use(bodyParser.json())
app.use(cors())



app.use('/auth',AccessLogic)

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
    
})