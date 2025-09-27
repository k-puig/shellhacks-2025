import { Message, MessagePing, Role, UserAuth } from "@prisma/client";

export async function getUserChannels(userId: string): Promise<string[] | null> {
    try{
        if(!userId){
            throw new Error('missing userId');
        }

        //TODO: add some prisma code here
        //to fetch all the channels a user is part of


        return ["test1","test2"];
    }catch(err){
        const errMessage = err as Error

        if(errMessage.message === 'missing userId'){
            console.log('services::actions::getUserChannels - missing userId');
            return null;
        }

        console.log('services::actions::getUserChannels - unknown error', errMessage);
        return null;
    }
}

export async function getUserInformation(userId: string):
 Promise<{
    id: string, 
    userName: string,
    nickName?: string,
    bio?: string,
    picture?: string,
    banner?: string,
    admin: boolean,
    status: 'online' | 'offline' | 'dnd' | 'idle' | 'invis',
    role: Role[],
    userAuth?: UserAuth,
    messages: Message[],
    MessagePing: MessagePing[]
} | null> {
    try{
        if(!userId){
            throw new Error('missing userId');
        }
        //TODO: add some prisma code here
        //to fetch user information

        return {
            id: userId,
            userName: "Test User",
            bio: "this is a bio",
            picture: "https://www.goodhousekeeping.com/life/pets/g61070837/cutest-cat-breeds/",
            banner: "https://www.goodhousekeeping.com/life/pets/g61070837/cutest-cat-breeds/",
            admin: false,
            status: "offline",
            role: [],
            userAuth: undefined,
            messages: [],
            MessagePing: []
        };

    }catch(err){
        const errMessage = err as Error

        if(errMessage.message === 'missing userId'){
            console.log('services::actions::getUserInformation - missing userId');
            return null;
        }

        console.log('services::actions::getUserInformation - unknown error', errMessage);
        return null;
    }
}

export async function getAllMessage(userId: string): Promise<{id: string, content: string, senderId: string, receiverId: string}[] | null> {
    try{
        if(!userId){
            throw new Error('missing userId');
        }

        //TODO: add some prisma code here
        //to fetch all messages for a user

        return [
            {id: "1", content: "Hello", senderId: userId, receiverId: "2"},
            {id: "2", content: "Hi", senderId: "2", receiverId: userId}
        ];
    }catch(err){
        const errMessage = err as Error

        if(errMessage.message === 'missing userId'){
            console.log('services::actions::getAllMessage - missing userId');
            return null;
        }

        console.log('services::actions::getAllMessage - unknown error', errMessage);
        return null;
    }
}


export async function sendMessage(userId: string, content: string): Promise<boolean> {
    try{
        if(!userId){
            throw new Error('missing userId');
        }

        if(!content){
            throw new Error('missing content');
        }

        //TODO: add some prisma code here
        //to save a message

        //todo: add some socketio code to 
        //emit the message to the receiver 

        return true;
    }catch(err){
        const errMessage = err as Error

        if(errMessage.message === 'missing userId'){
            console.log('services::actions::sendMessage - missing userId');
            return false;
        }

        if(errMessage.message === 'missing content'){
            console.log('services::actions::sendMessage - missing content');
            return false;
        }

        console.log('services::actions::sendMessage - unknown error', errMessage);
        return false;
    }
}
