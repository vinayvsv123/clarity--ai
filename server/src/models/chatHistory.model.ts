import mongoose,{Document as MDocument,Model} from 'mongoose';

interface IMessage{
    role:'user' | 'assistant';
    content:string;
    toolsUsed?:string[];
    createdAt?:Date;
}

export interface IChatHistory extends MDocument{
    userId:mongoose.Types.ObjectId;
    documentId:mongoose.Types.ObjectId;
    messages:IMessage[];
    createdAt:Date;
   
}

const messageSchema=new mongoose.Schema<IMessage>({
    role:{
        type:String,
        enum:['user','assistant'],
        required:true
    },
    content:{
        type:String,
        required:true
    },
    toolsUsed:{
        type:[String],
        default:[]
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

const chatHistorySchema=new mongoose.Schema<IChatHistory>({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    documentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Document',
        required:true
    },
    messages:[messageSchema],
    createdAt:{
        type:Date,
        default:Date.now
    }
   
},
{
    timestamps:true
});

const ChatHistory:Model<IChatHistory>=mongoose.model<IChatHistory>('ChatHistory',chatHistorySchema);
export default ChatHistory;