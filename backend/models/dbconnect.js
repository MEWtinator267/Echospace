import mongoose from "mongoose";

const connect = ()=>{
    mongoose.connect(process.env.MONGO_URL)
    console.log(`database connected`);
    
}

export default connect;