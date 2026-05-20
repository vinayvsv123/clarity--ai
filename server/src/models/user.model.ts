import mongoose ,{Document,Model} from 'mongoose';

export interface IUser extends Document{
    username:string;
    email:string;
    password:string;
    createdAt:Date;
}

const userSchema=new mongoose.Schema<IUser>({
    username:{
        type:String,
        required:true,
        unique:true,
        minlength:4,
        maxlength:20
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        match:/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        trim:true
    },
    password:{
        type:String,
        required:true,
        minlength:4
        //unique:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    } , 
},
{
    timestamps:true
});

const User:Model<IUser>=mongoose.model<IUser>('User',userSchema);
export default User;