import Joi from "joi";

const signupvalidation = (req,res,next)=>{
    const Schema = Joi.object({
        name:Joi.string().required().min(5),
        email:Joi.string().email().required(),
        password: Joi.string().min(5).max(10)
    })

    const {error} = Schema.validate(req.body)
    if(error){
        return res.status(409).json({message:"not validated",error})
    }
    next();

}

const loginvalidation = (req,res,next)=>{
    const schema = Joi.object({
        email:Joi.string().required(),
        password:Joi.string().min(4).max(10)
    })
    const {error} = schema.validate(req.body)
    if(error){
        res.status(409).json({message:"not correct",error})
    }
    next();
}

export  {loginvalidation,signupvalidation}