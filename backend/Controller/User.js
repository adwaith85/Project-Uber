import express from "express"
import jwt from "jsonwebtoken"
import UserModel from "../Model/User"

export const Login=async(req,res)=>{
    const {email,setEmail}=req.body
    try{
        const user=await UserModel.findOne({email})
        if(user){
            const isMatch=await user.compare(password)
            if(isMatch){
                const token= jwt.sign({email:user.email},'querty',{expires:'24'})
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