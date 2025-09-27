//send a ping to a user

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

export async function getUserInformation(userId: string): Promise<{id: string, name: string} | null> {
    try{
        if(!userId){
            throw new Error('missing userId');
        }

        //TODO: add some prisma code here
        //to fetch user information

        return {id: userId, name: "Test User"};
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

export async function getAllMessage(userId: string): Promise<{}
