import React, { useContext, useEffect, useRef, useState } from "react";
import "./messageContainer.css";
import Message from "../message/Message";
import Conversation from "../conversations/Conversation";
import Search from "../search/Search";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { io } from "socket.io-client";
import SpeechToText from "../inputField/SpeechToText";

const MessagesContainer = () => {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [inputText, setInputText] = useState("");
  const socket = useRef();
  const { user } = useContext(AuthContext);
  const scrollRef = useRef();

  console.log("newMessage ",newMessage);
  useEffect(() => {
    socket.current = io("ws://localhost:8900");
    socket.current.on("getMessage", (data) => {
      console.log(data.text);
      setArrivalMessage({
        conversationId: data.receiverId,
        senderId: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, []);

  useEffect(() => {
    arrivalMessage &&
      currentChat._id === arrivalMessage.conversationId &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await axios.get("http://localhost:8800"+"/api/conversations/" + user._id);
        setConversations(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getConversations();
  }, [user._id]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await axios.get("http://localhost:8800"+"/api/messages/" + currentChat?._id);
        setMessages(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getMessages();
  }, [currentChat]);

  const handleSubmit = async (e) => {
    console.log(currentChat);
    e.preventDefault();
    const message = {
      sender: user._id,
      text: newMessage,
      conversationId: currentChat._id,
    };

    socket.current.emit("sendMessage", {
      senderId: user._id,
      receiverId: 
      currentChat._id,
      text: newMessage,
    });

    try {
      const res = await axios.post("http://localhost:8800"+"/api/messages", message);
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (err) {
      console.log(err);
    }
  };

  const handleVoice = (s) => {
    setNewMessage(s);
  }

const handleJoinConvo = async(convoId) => {
  console.log(convoId);
  const joinInput = {
    conversationId: convoId
  }
  try {
    const res = await axios.put("http://localhost:8800/api/conversations/"+user._id+"/join", joinInput);
    if(res.status == 201){
      setConversations([...conversations,res.data]);
      setCurrentChat(res.data);
    }
    if(res.status==200){
      var arr = conversations.filter(x => x!=res.data);
      setConversations(arr);
      setCurrentChat(null);
    }
  }
  catch(err) {
    console.log(err);
  }
}

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <div className="messenger">
        <div className="chatMenu">
          <div className="chatMenuWrapper">
            <Search conversations={conversations} setConversations={setConversations} setCurrentChat={setCurrentChat} handleJoinConvo={()=>handleJoinConvo()} />
            {conversations.map((c) => (
              <div onClick={() => setCurrentChat(c)}>
                <Conversation conversation={c} currentUser={user} />
              </div>
            ))}
          </div>
        </div>
        <div className="chatBox">
          <div className="chatBoxWrapper">
            {currentChat ? (
              <>
                <div className="chatBoxTop">
                  {messages.map((m) => (
                    <div ref={scrollRef}>
                      <Message message={m} own={m.sender === user._id} />
                    </div>
                  ))}
                </div>
                <div className="chatBoxBottom">
                  <textarea
                    className="chatMessageInput"
                    placeholder="write something..."
                    onChange={(e) => setNewMessage(e.target.value)}
                    value={newMessage}
                  />
                  <SpeechToText setNewMessage={setNewMessage}/>
                  <button className="chatSubmitButton" onClick={handleSubmit}>
                    Send
                  </button>
                </div>
              </>
            ) : (
              <span className="noConversationText">
                Open a conversation to start a chat.
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default MessagesContainer;