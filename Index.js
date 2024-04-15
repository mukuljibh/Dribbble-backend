import express from 'express';
import bodyParser from 'body-parser';
import cors from "cors";
import mongoose from 'mongoose';
import { UserCredentialsModel } from './databaseModels.js';
import nodemailer from 'nodemailer';
import { body, validationResult } from 'express-validator';
import ErrorMessages from './ErrorMessage.js';

const uri = "mongodb+srv://mukul:8368555400@dribbblecluster.xnwg76a.mongodb.net/DribbbleDB?retryWrites=true&w=majority&appName=dribbblecluster";

const app = express();
const port = 4000;
app.use(bodyParser.urlencoded({ extended: true })); // middleware which fetches the form data 
app.use(bodyParser.json());
app.use(cors());//for cross generation support 

const CONNNECTIONSTRING = uri;

function connectToDatabase() {
    //make sure that server open only when database is available
    return new Promise((resolve, reject) => {
        mongoose.connect(CONNNECTIONSTRING)
            .then(() => {
                resolve("Connected successfully to Database")
            }).catch((err) => {
                reject(`Database unreachable`)
            })
    })
}
//route for checking username exist already or not
app.get("/checkUserName", (req, res) => {
    const isUsernameExist = req.query.Username;
    UserCredentialsModel.find({ Username: isUsernameExist })
        .then((data) => {
            res.status(200).json({ message: data.length > 0 });
        })
        .catch((err) => {
            res.status(500).json({ error: "something goes wrong with the database", message: err });
        })
})
//route for register new user
app.post("/register", [
    body("userDetails.Username")
        .notEmpty().withMessage(ErrorMessages.emptyRegexMessage)
        .custom(value => /^\S*$/.test(value)).withMessage(`Username ${ErrorMessages.spaceNotAllowedRegexMessage}`)
        .isLength({ min: 6 }).withMessage(ErrorMessages.lengthErrorRegexMessage)
    ,
    body("userDetails.Password")
        .notEmpty().withMessage(ErrorMessages.emptyRegexMessage)
        .custom(value => /^[a-zA-Z0-9_\-!@#$%^&*()+=[\]{}|\\;:'",<.>/?]{8,}$/.test(value)).withMessage(`Password ${ErrorMessages.passwordRegexMessage}`)
    ,
    body("userDetails.Email").notEmpty().withMessage(ErrorMessages.emptyRegexMessage)
        .custom(value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)).withMessage(ErrorMessages.emailRegexMessage)
], (req, res) => {

    const userDataToSave = req.body.userDetails;
    const UserCredentialsObj = new UserCredentialsModel(userDataToSave);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array())
        return res.status(400).json({ errors: errors.array() });
    }
    UserCredentialsObj.save()
        .then(() => {
            res.status(200).json({ message: "Data posted into the Database" });
        })
        .catch((error) => {

            if (error.code === 11000 && error.keyValue) {
                const duplicateFields = Object.keys(error.keyValue)[0];
                res.status(500).json({ error: `${duplicateFields} already registered with us.` });
            }
            else {
                res.status(500).json({ error: `Error saving data: ${error.message}` });
            }
        })
})

app.post("/send-email", async (req, res) => {

    console.log(req.body)
    const userDataToEmail = req.body.userDetails
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'mukulbhardwaj966@gmail.com',
            pass: 'famy rafw ytap ebgg'
        }
    });
    var mailOptions = {
        from: 'dribbbleinfo@gmail.com',
        to: `${userDataToEmail.Email}`,
        subject: 'Thanks for creating  your account and welcome to Dribbble',
        html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6;">
            <h2 style="color: #333;">Hello ${userDataToEmail.Name},</h2>
            <p>Thank you for registering on Dribbble!</p>
            <p>We are thrilled to have you as part of our community. Your unique username is: <strong>${userDataToEmail.Username}</strong></p>
            <p>Feel free to explore our platform, showcase your work, and connect with other creatives.</p>
            <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
            <p>Best regards,<br/>The Dribbble Team</p>
        </div>`
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).json({ error: "Problem while sending the email", msg: error });
        } else {
            console.log(info)
            res.status(200).json({ message: "email has been succesfully send", msg: info });
        }
    });
})



app.listen(port, () => {
    connectToDatabase()
        .then((msg) => {
            console.log(msg)
            console.log(`server starting runining on port ${port}`)
        })
        .catch((err) => {
            console.log(err)
        })
})