import{
    Channel,
    Category
} from '@prisma/client';
import { PrismaClient } from "@prisma/client";
import { getUserInformation, getUserCredentials } from './userService';
import {
    CreateChannelInput,
    UpdateChannelInput,
    DeleteChannelInput,
    DeleteChannelsByCategoryIdInput
} from '../validators/channelValidator';
import{
    UpdateCategoryInput,
    DeleteCategoryInput,
    DeleteCategoriesByInstanceIdInput,
    CreateCategoryInput
} from '../validators/categoryValidator';

const prisma = new PrismaClient();


export async function createCategory(data: CreateCategoryInput): Promise<Category | null>{
    try{

        //Confirm if user exists and is admin
        const requestingUser = await getUserInformation(data.requestingUserId);
        const requestingUserCredentials = await getUserCredentials(
            data.requestingUserId,
        )

        if (
            !requestingUser ||
            !requestingUserCredentials ||
            !requestingUser.admin ||
            requestingUserCredentials.token == null ||
            data.requestingUserToken != requestingUserCredentials.token
        ) {
            return null;
        }

        const newCategory = await prisma.category.create({
            data: {
                name: data.name,
                position: data.position
            } 
        });

        if(!newCategory){
            throw new Error("could not create category");
        }

        let curInstance;
        if(data.instanceId){
            curInstance = await prisma.instance.findUnique({
                where: {
                    id: data.instanceId
                },
                include: {
                    Category: true
                }
            });

            if(!curInstance){
                throw new Error("could not find instance to add category to");
            }

            await prisma.category.update({
                where: {
                    id: newCategory.id
                },
                data: {
                    instanceId: curInstance.id
                }
            });

            return newCategory;
        }

        return newCategory;
    }catch(err){
        console.log("services::channelService::createCategory - ", err);
        return null;
    }
}

export async function getCategory(
    categoryId: string,
): Promise<Category | null>{
    try{
        const category = await prisma.category.findUnique({
            where: {
                id: categoryId
            }
        });
        
        if(!category){
            throw new Error("could not find category");
        }

        return category;
    }catch(err){
        console.log("services::channelService::getCategory - ", err);
        return null;
    }
}

export async function getCategoriesByInstance(
    instanceId: string
): Promise<Category[] | null>{
    try{
        const categories = await prisma.category.findMany({
            where: {
                instanceId: instanceId
            },
            include: {
                Channel: true
            },
            orderBy: {
                position: 'asc'
            }
        });

        if(!categories){
            throw new Error("could not find categories for instance");
        }

        return categories;
    }catch(err){
        console.log("services::channelService::getCategoriesByInstance - ", err);
        return null;
    }
}

export async function updateCategory(data: UpdateCategoryInput): Promise<Category | null>{
    try{

        //Confirm if user exists and is admin
        const requestingUser = await getUserInformation(data.requestingUserId);
        const requestingUserCredentials = await getUserCredentials(
            data.requestingUserId,
        )

        if (
            !requestingUser ||
            !requestingUserCredentials ||
            !requestingUser.admin ||
            requestingUserCredentials.token == null ||
            data.requestingUserToken != requestingUserCredentials.token
        ) {
            return null;
        }

        const updatedCategory = await prisma.category.update({
            where: {
                id: data.id
            },
            data: {
                name: data.name,
                position: data.position,
                Channel: data.channels ? { set: data.channels } : undefined
            }
        });

        if(!updatedCategory){
            throw new Error("could not update category");
        }

        return updatedCategory;
    }catch(err){
        console.log("services::channelService::updateCategory - ", err);
        return null;
    }
}

export async function deleteCategory(data: DeleteCategoryInput): Promise<boolean | null>{
    try{

        //Confirm if user exists and is admin
        const requestingUser = await getUserInformation(data.requestingUserId);
        const requestingUserCredentials = await getUserCredentials(
            data.requestingUserId,
        )

        if (
            !requestingUser ||
            !requestingUserCredentials ||
            !requestingUser.admin ||
            requestingUserCredentials.token == null ||
            data.requestingUserToken != requestingUserCredentials.token
        ) {
            return null;
        }

        const deleteAllChannels = await prisma.channel.deleteMany({
            where: {
                categoryId: data.id
            }
        });

        if(deleteAllChannels.count === 0){
            throw new Error("could not delete channels from category");
        }

        const deletedCategory = await prisma.category.delete({
            where: {
                id: data.id
            }
        });

        if(!deletedCategory){
            throw new Error("could not delete category");
        }

        return true;
    }catch(err){
        console.log("services::channelService::deleteCategory - ", err);
        return false;
    }
}

export async function deleteAllCategoriesFromInstance(data: DeleteCategoriesByInstanceIdInput): Promise<boolean | null>{
    try{

        //Confirm if user exists and is admin
        const requestingUser = await getUserInformation(data.requestingUserId);
        const requestingUserCredentials = await getUserCredentials(
            data.requestingUserId,
        )

        if (
            !requestingUser ||
            !requestingUserCredentials ||
            !requestingUser.admin ||
            requestingUserCredentials.token == null ||
            data.requestingUserToken != requestingUserCredentials.token
        ) {
            return null;
        }

        const deletedCategories = await prisma.category.deleteMany({    
            where: {
                instanceId: data.instanceId
            }
        });

        if(deletedCategories.count === 0){
            throw new Error("could not delete categories from instance");
        }

        return true;
    }catch(err){
        console.log("services::channelService::deleteAllCategoriesFromInstance - ", err);
        return false;
    }
}

export async function createChannel(data: CreateChannelInput): Promise<Channel | null>{
    try{

        //Confirm if user exists and is admin
        const requestingUser = await getUserInformation(data.requestingUserId);
        const requestingUserCredentials = await getUserCredentials(
            data.requestingUserId,
        )

        if (
            !requestingUser ||
            !requestingUserCredentials ||
            !requestingUser.admin ||
            requestingUserCredentials.token == null ||
            data.requestingUserToken != requestingUserCredentials.token
        ) {
            return null;
        }

        const newChannel = await prisma.channel.create({
            data: {
                type: data.type,
                name: data.name,
                description: data.description,
                categoryId: data.categoryId ? data.categoryId : null
            }
        });

        if(!newChannel){
            throw new Error("could not create channel");
        }
        
        return newChannel;
    }catch(err){
        console.log("services::channelService::createChannel - ", err);
        return null;
    }
}

export async function getChannel(
    channelId: string
): Promise<Channel | null>{
    try{
        const channel = await prisma.channel.findUnique({
            where: {
                id: channelId
            }
        });

        if(!channel){
            throw new Error("could not find channel");
        }

        return channel;
    }catch(err){
        console.log("services::channelService::getChannel - ", err);
        return null;
    }
}

export async function getChannelsByCategory(
    categoryId: string
): Promise<Channel[] | null>{
    try{
        const channels = await prisma.channel.findMany({
            where: {
                categoryId: categoryId
            }
        });
        
        if(!channels){
            throw new Error("could not find channels for category");
        }
        return channels;
    }
    catch(err){
        console.log("services::channelService::getChannelsByCategory - ", err);
        return null;
    }   
}

export async function updateChannel(data: UpdateChannelInput): Promise<Channel | null>{
    try{

        //Confirm if user exists and is admin
        const requestingUser = await getUserInformation(data.requestingUserId);
        const requestingUserCredentials = await getUserCredentials(
            data.requestingUserId,
        )

        if (
            !requestingUser ||
            !requestingUserCredentials ||
            !requestingUser.admin ||
            requestingUserCredentials.token == null ||
            data.requestingUserToken != requestingUserCredentials.token
        ) {
            return null;
        }

        const updatedChannel = await prisma.channel.update({
            where: {
                id: data.id
            },
            data: {
                name: data.name,
                description: data.description,
                categoryId: data.categoryId  ? data.categoryId : undefined
            }
        });

        if(!updatedChannel){
            throw new Error("could not update channel");
        }

        return updatedChannel;
    }catch(err){
        console.log("services::channelService::updateChannel - ", err);
        return null;
    }
}

export async function deleteChannel(data: DeleteChannelInput): Promise<boolean | null>{
    try{

        //Confirm if user exists and is admin
        const requestingUser = await getUserInformation(data.requestingUserId);
        const requestingUserCredentials = await getUserCredentials(
            data.requestingUserId,
        )

        if (
            !requestingUser ||
            !requestingUserCredentials ||
            !requestingUser.admin ||
            requestingUserCredentials.token == null ||
            data.requestingUserToken != requestingUserCredentials.token
        ) {
            return null;
        }

        const deletedChannel = await prisma.channel.delete({
            where: {
                id: data.id
            }
        });

        if(!deletedChannel){
            throw new Error("could not delete channel");
        }

        return true;
    }catch(err){
        console.log("services::channelService::deleteChannel - ", err);
        return false;
    }
}

export async function deleteAllChannelsFromCategory(data: DeleteChannelsByCategoryIdInput): Promise<boolean | null>
{
    try{
        //Confirm if user exists and is admin
        const requestingUser = await getUserInformation(data.requestingUserId);
        const requestingUserCredentials = await getUserCredentials(
            data.requestingUserId,
        )

        if (
            !requestingUser ||
            !requestingUserCredentials ||
            !requestingUser.admin ||
            requestingUserCredentials.token == null ||
            data.requestingUserToken != requestingUserCredentials.token
        ) {
            return null;
        }

        const deletedChannels = await prisma.channel.deleteMany({
            where: {
                categoryId: data.categoryId
            }
        });

        if(deletedChannels.count === 0){
            throw new Error("could not delete channels from category");
        }

        return true; 
    }catch(err){
        console.log("services::channelService::deleteAllChannelsFromCategory - ", err);
        return false;
    }
}
