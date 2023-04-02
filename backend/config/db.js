import mongoose from "mongoose";
import colors from 'colors'

const connectDB = async () => {
    mongoose.set('strictQuery', true);
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            // useCreateIndex: true
        })
        console.log(`Mongodb Connected: ${conn.connection.host}`.cyan.underline)
    }catch (error){
        console.log(`Error: ${error.message}`.red.bold)
        process.exit(1)
    }
}

export default connectDB;