import { createSlice } from "@reduxjs/toolkit";
import { faker } from "@faker-js/faker";
import { AWS_S3_REGION, S3_BUCKET_NAME } from "../../config";
import { SelectConversation } from "./app";

const user_id = window.localStorage.getItem("user_id");

const initialState = {
  direct_chat: {
    conversations: [],
    current_conversation: {},
    current_messages: [],
  },
  group_chat: {},
};

const slice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    fetchDirectConversations(state, action) {
      const list = action.payload.conversations.map((el) => {
        const user = el.participants.find(
          (elm) => elm._id.toString() !== user_id
        );
          const date=new Date(el.updatedAt)
          const hours = date.getHours();
          const minutes = date.getMinutes();
          console.log(date,"date--update",)
        return {
          id: el._id,
          user_id: user?._id,
          name: `${user?.firstName} ${user?.lastName}`,
          online: user?.status === "Online",
          img: `https://${S3_BUCKET_NAME}.s3.${AWS_S3_REGION}.amazonaws.com/${user?.avatar}`,
          msg: el.messages.length ? el.messages?.slice(-1)[0].text : "",
          time: el.updatedAt,
          unread: 0,
          pinned: false,
          about: user?.about,
          // updated:el.updated_at
        };
      });
      list.sort((a, b) => new Date(a.time) - new Date(b.time))
      state.direct_chat.conversations = list;
      if (!list.length) {
        state.direct_chat.current_conversation = null;
        state.direct_chat.current_messages = []
        // SelectConversation({room_id:null})
      }
    },
    updateDirectConversation(state, action) {
      console.log("updateDirectConversation")
      const this_conversation = action.payload.conversation;
      state.direct_chat.conversations = state.direct_chat.conversations.map(
        (el) => {
          if (el?.id !== this_conversation._id) {
            return el;
          } else {
            const user = this_conversation.participants.find(
              (elm) => elm._id.toString() !== user_id
            );
            return {
              id: this_conversation._id._id,
              user_id: user?._id,
              name: `${user?.firstName} ${user?.lastName}`,
              online: user?.status === "Online",
              img: faker.image.avatar(),
              msg: faker.music.songName(),
              time: "9:36",
              unread: 0,
              pinned: false,
              // updated:el.updated_at
            };
          }
        }
      );
    },
    addDirectConversation(state, action) {
      const this_conversation = action.payload.conversation;
      console.log("conversation",action.payload.conversation)

      const user = this_conversation.participants.find(
        (elm) => elm._id.toString() !== user_id
      );
      state.direct_chat.conversations = state.direct_chat.conversations.filter(
        (el) => el?.id !== this_conversation._id
      );
      const msg={
        id: this_conversation._id,
        user_id: user?._id,
        name: `${user?.firstName} ${user?.lastName}`,
        online: user?.status === "Online",
        img: faker.image.avatar(),
        msg: faker.music.songName(),
        time: "9:36",
        unread: 0,
        pinned: false,
        // updated:el.updated_at
      }
      state.direct_chat.conversations.push(msg);
    },
    setCurrentConversationData(state, action) {
      console.log("setCurrentConversationData payload",action.payload)
      state.direct_chat.current_conversation = action.payload;
    },
    setCurrentConversation(state, action) {
      console.log("setCurrentConversation payload",action.payload)
      state.direct_chat.current_conversation = action.payload;
    },
    fetchCurrentMessages(state, action) {
      const messages = action.payload.messages;
      const formatted_messages = messages.map((el) => ({
        id: el._id,
        type: "msg",
        subtype: el.type,
        message: el.text,
        incoming: el.to === user_id,
        outgoing: el.from === user_id,
      }));
      state.direct_chat.current_messages = formatted_messages;
    },
    addDirectMessage(state, action) {
      state.direct_chat.current_messages.push(action.payload.message);
    },
    addMessageInConversation(state, action) {
      // state.direct_chat.current_messages.push(action.payload.message);
      console.log("payload",action.payload)
      // const updatedConversations = 
      const { conversationId, message } = action.payload.message;
      // Find the conversation by ID
      const updatedConversations = state.direct_chat.conversations.map((conversation) => {
        console.log("js",{conversation},conversationId)
        if (conversation.id === conversationId) {
          // Update the messages array in this conversation
          console.log("inside here")
          return {
            ...conversation,
            msg: message,
          };
        }
        return conversation;
      });
      console.log({updatedConversations},"unsoretd")
updatedConversations.sort((a, b) => new Date(a.time) - new Date(b.time))
      state.direct_chat.conversations=updatedConversations
      
      console.log(state.direct_chat.conversations)
    }
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export const FetchDirectConversations = ({ conversations }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.fetchDirectConversations({ conversations }));
  };
};
export const AddDirectConversation = ({ conversation }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.addDirectConversation({ conversation }));
  };
};
export const UpdateDirectConversation = ({ conversation }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateDirectConversation({ conversation }));
  };
};

export const SetCurrentConversation = (current_conversation) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.setCurrentConversation(current_conversation));
  };
};


export const FetchCurrentMessages = ({ messages }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.fetchCurrentMessages({ messages }));
  }
}

export const AddDirectMessage = (message) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.addDirectMessage({ message }));
  }
}

export const addMessageInConversation = (message) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.addMessageInConversation({ message }));
  }
}

