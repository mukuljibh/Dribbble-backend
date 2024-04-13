import mongoose from 'mongoose';

const credentialsSchema = new mongoose.Schema({
    Username: {
        type: String,
        unique: true,
    },
    Email: {
        type: String,
        unique: true,
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