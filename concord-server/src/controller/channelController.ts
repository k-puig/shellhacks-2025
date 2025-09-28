import {
  createChannel,
  getChannel,
  getChannelsByCategory,
  updateChannel,
  deleteChannel,
  deleteAllChannelsFromCategory,
} from "../services/channelService";
import {
  CreateChannelInput,
  UpdateChannelInput,
  DeleteChannelInput,
  DeleteChannelsByCategoryIdInput,
} from "../validators/channelValidator";

export async function createNewChannel(data: CreateChannelInput) {
  return await createChannel(data);
}

export async function fetchChannelData(id: string) {
  return await getChannel(id);
}

export async function fetchChannelsByCategory(categoryId: string) {
  return await getChannelsByCategory(categoryId);
}

export async function updateExistingChannel(data: UpdateChannelInput) {
  return await updateChannel(data);
}

export async function deleteExistingChannel(data: DeleteChannelInput) {
  return await deleteChannel(data);
}

export async function deleteAllChannelsByCategory(
  data: DeleteChannelsByCategoryIdInput,
) {
  return await deleteAllChannelsFromCategory(data);
}
