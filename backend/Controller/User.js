import express, { response } from "express"
import jwt from "jsonwebtoken"
import UserModel from "../Model/User.js"


export const Login=async(req,res)=>{
    const {email,password}=req.body

    console.log("secret",process.env.JWT_SECRET)
    try{
        const user=await UserModel.findOne({email:email})
        if(user){
            const isMatch=await user.comparePassword(password)
            if(isMatch){
                const token= jwt.sign({email:user.email},process.env.JWT_SECRET,{expiresIn:'24h'})
                res.json({
                    status:"Login done",
                    token:token,
                })
            }else{
                res.status(404).send("wrong password")
            }
        }else{
            res.send("user not found")
        }
    }catch(error){
        console.log("login error:",error)
        return res.status(500).send("server error")
    }
};

export const Register=async(req,res)=>{
    try{
        const {email,password,name,number}=req.body
        await UserModel.create({email,password,name,number})
        res.send("created")

    }catch(error){
        console.log(error)
    }
}

export const UpdateUser=async(req,res)=>{
    try{
        const{email,number,profileimg,address,name}=req.body
        const user=await UserModel.findOne({email:email})
        user.number=number
        user.profileimg=profileimg
        user.address=address
        user.name=name
        user.save()
        res.send("done")

    }catch(error){
        console.log(error)
    }
}

export const GetDetails=async(req,res)=>{
    try{
        const user=await UserModel.findOne({email:req.user.email})
        res.json(user)
    }catch(error){
        res.json(error)
    }
}