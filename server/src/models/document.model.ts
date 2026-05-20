import mongoose ,{Document as MDocument,Model}from 'mongoose';

interface IChunk{
    chunkIndex:number;
    text:string;
    pineconeId:string;
}

export interface IDocument extends MDocument{
    userId:mongoose.Types.ObjectId;
    filename:string;
    originalName:string;
    namespace:string;
    pageCount:number;
    totalChunks:number;
    chunks:IChunk[];
    status: 'processing' | 'ready' | 'failed';
}
const chunkSchema=new mongoose.Schema<IChunk>({
    chunkIndex:{
        type:Number,
        required:true,
        index:true
    },
    text:{
        type:String,
        required:true
    },
    pineconeId:{
        type:String,
        required:true
    }
});

const documentSchema=new mongoose.Schema<IDocument>({
    userId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'User',
      required:true
    },
    filename:{
        type:String,
        required:true   
    },
    originalName:{
        type:String,
        required:true
    },
    namespace:{
        type:String,
        required:true    
    },
    pageCount:{
        type:Number,
    },
    totalChunks:{
        type:Number,
    },
    chunks:{
        type:[chunkSchema],
        default:[]
    },
     status:{ 
        type: String,
        enum: ['processing', 'ready', 'failed'],
        default: 'processing'
    }
},
{
    timestamps:true    
});

const DocumentModel:Model<IDocument>=mongoose.model<IDocument>('Document',documentSchema);
export default DocumentModel;