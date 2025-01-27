import asyncHandler from "express-async-handler";
import crypto from 'crypto'
import sendEmail from "../utils/sendEmail.js";
import User from "../models/User.js";
import createError from "../utils/errors.js";

export const forgetPassword = asyncHandler(async (req, res, next) => {
    //get user by email
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(new createError(`No User Match This Email ${req.body.email}`, 404))
    }
    // if user exist => generate random 6 digits ,hash it , save it
    const randomCode = Math.floor(Math.random() * 1000000).toString();
    const hashedRandomCode = crypto.createHmac('sha256', process.env.JWT_SECRET_KEY)
        .update(randomCode)
        .digest('hex');

    user.passwordRestCode = hashedRandomCode;
    user.passwordRestCodeExpire = Date.now() + 5 * 1000 * 60;
    user.passwordRestVerified = false;
    await user.save();





    // Send the code via email
    try {
        const message = `
        Hi ${user.name},
        
        We received a request to reset your password. Please use the verification code below to complete the verification process:
        
        ================================
        **Your Reset Code:**  ${randomCode}
        ================================
        
        This code is valid for the next 5 minutes. If you did not request a password reset, please ignore this email.
        
        If you need further assistance, feel free to contact us 
        
        Thanks,
        The Azarm Team
    `;

        // Send the email
        await sendEmail({
            email: user.email,
            subject: 'Your Reset Code (Valid For 5 Minutes)',
            message: message
        });

    } catch (err) {
        // Handle error and reset user data
        user.passwordRestCode = undefined;
        user.passwordRestCodeExpire = undefined;
        user.passwordRestVerified = undefined;

        await user.save();

        return next(new createError(err.message, 500));
    }

    res.status(201).send('Code sent to email');



});

export const verifyResetCode = asyncHandler(async (req, res, next) => {
    const hashedResetCode = crypto.createHmac('sha256', process.env.JWT_SECRET_KEY)
        .update(req.body.resetCode)
        .digest('hex');

    const user = await User.findOne({
        passwordRestCode: hashedResetCode,
        passwordRestCodeExpire: { $gt: Date.now() }
    })
    if (!user) {
        return next(new createError('Invalid or expired reset code , please try again'))
    }
    console.log(user)
    user.passwordRestVerified = true;
    res.status(201).send('Valid reset code')



})

export const resetPassword = asyncHandler(
    async (req, res, next) => {
        const user = User.findOne({ email: req.body.email });
        if (!user) {
            return next(new createError(`No user match this email`, 404))
        }
        if (!user.passwordRestVerified) {
            return next(new createError(`reset code did not verified`, 501))

        }

        user.passwordRestCode = undefined;
        user.passwordRestCodeExpire = undefined;
        passwordRestVerified = undefined;
        user.password = req.body.newPassword;


        await user.save();
        const token = Jwt.sign({
            id: user._id

        }, process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.JWT_EXPIRE_DATE })
        res.status(200).json({ data: user, userToken: token })

    }



)

