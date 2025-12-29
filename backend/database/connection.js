import mongoose from 'mongoose';

const connection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to the database');
    } catch (error) {
        console.log('Error connecting to the database');
    }
}
    export default connection;