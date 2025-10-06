import express from "express"
import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const UserSchema=new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    mobile:{type:String,required:true},
});
 
UserSchema.pre('save',async(next)=>{
    if(!this.isModified('password')){
        return next()
    }
    try{
        const salt=await bcrypt.genSalt(10);
        this.password=await bcrypt.hash(this.password,salt);
        next()
    }catch(error){
        next(error)
    }
})

UserSchema.methods.comparePassword=async function (candidatePassword){
    return bcrypt.compare(candidatePassword, this.password)
};

const UserModel= mongoose.model("User",UserSchema)

export default UserModel
