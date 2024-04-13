import mongoose from 'mongoose';

const credentialsSchema = new mongoose.Schema({
    Username: {
        type: String,
        unique: true,
        index: true,
    },
    Email: {
        type: String,
        unique: true,
        index: true,
    },
    name: {
        type: String,
    },
    Password: {
        type: String,
    },
});

const UserCredentialsModel = mongoose.model('UserCredentialsModel', credentialsSchema);

export { UserCredentialsModel }