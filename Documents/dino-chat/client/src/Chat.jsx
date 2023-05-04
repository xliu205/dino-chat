import { useEffect } from "react";
import { useState } from "react";
import { useContext } from "react";
import { UserContext } from "./UserContext";
import Avatar from "./Avatar";
import Inbox from "./Inbox";
import uniqBy from "lodash/uniqBy";
import { useRef } from "react";
import MySvg from "/Users/lisaliu/Documents/dino-chat/dinosaur.svg";
import axios from "axios";
import Contact from "./Contact";



export default function Chat() {
    const [ws,setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);
    const { username, id, setId, setUsername } = useContext(UserContext);
    const [newMessageText, setNewMessagesText] = useState('');
    const [messages, setMessages] = useState([]);
    const divUnderMessages = useRef();
    const [offlinePeople, setOfflinePeople] = useState({});
    // const backgroundColor = rgba(132, 130, 243, 0.05);
    useEffect(() => {
      connectToWs();
  }, []);

  function connectToWs(){
     const ws = new WebSocket("ws://localhost:4000");
     setWs(ws);
      ws.addEventListener("message", handleMessage);
      ws.addEventListener("close", () => {
          setTimeout(() => {
              console.log("reconnecting...");
              connectToWs();
          }, 5000);
      });

  }

  function showOnlinePeople(peopleArray){
    const people = {};
    peopleArray.forEach(({userId,username}) => {
        people[userId] = username;

    });
    setOnlinePeople(people);
    }


  function handleMessage(ev) {
    // console.log('new message', e);
    const messageData = JSON.parse(ev.data);
    // console.log({ev,messageData});
    // console.log(messageData);
    if ('online' in messageData) {
      showOnlinePeople(messageData.online);
    }else if('text' in messageData)
    {
      // console.log('new message', messageData);
      setMessages(prev =>([...prev, {
        ...messageData,
      }]));
    }
  }

  function sendMessage(ev) {
    ev.preventDefault();
    ws.send(JSON.stringify({
      recipient:selectedUserId,
      text:newMessageText,
    }));
    //clear input box
    setNewMessagesText('');
    //add message to messages
    setMessages(prev => [...prev, {
      text:newMessageText, 
      isOur:true,
      sender:id,
      recipient:selectedUserId,
      //id is a unique key by which react can identify each message
      _id:Date.now(),
    }]);
    
  }
 function logout() {
   axios.post("/logout").then(() => {
     setWs(null);
     setId(null);
     setUsername(null);
   });
 }

  useEffect(() => {
    //scroll it into view
    const div = divUnderMessages.current;
    if(div){
    div.scrollIntoView({behavior:'smooth',block:'end'});
    }

  },[messages]);


  useEffect(() => {
    axios.get("/people").then((res) => {
      const offlinePeopleArr = res.data
        .filter((p) => p._id !== id)
        .filter((p) => !Object.keys(onlinePeople).includes(p._id));
      const offlinePeople = {};
      offlinePeopleArr.forEach((p) => {
        offlinePeople[p._id] = p;
      });
      setOfflinePeople(offlinePeople);
    });
  }, [onlinePeople]);


  useEffect(() => {
    if (selectedUserId){
    axios.get('/messages/'+selectedUserId).then(res=>{
      // console.log(res.data);
      setMessages(res.data);
    });
    }
  }, [selectedUserId]);


  const onlinePeopleExclOurUser = {...onlinePeople};
  delete onlinePeopleExclOurUser[id];
  const messageWithoutDupes = uniqBy(messages,'_id');

  return (
    <div
      className="fixed flex h-screen w-screen text-white bg-gray"
      // style={{ backgroundColor: "rgba(132, 130, 243, 0.05)" }}
    >
      <div className="bg-black h-screen w-1/3 flex flex-col overflow-y-scroll">
        <div className="flex-grow">
          <Inbox />
          {Object.keys(onlinePeopleExclOurUser).map((userId) => (
            <Contact
              key={userId}
              id={userId}
              online={true}
              username={onlinePeopleExclOurUser[userId]}
              onClick={() => {
                setSelectedUserId(userId);
                // console.log({ userId });
              }}
              selected={userId === selectedUserId}
            />
          ))}
          {Object.keys(offlinePeople).map((userId) => (
            <Contact
              key={userId}
              id={userId}
              online={false}
              username={offlinePeople[userId].username}
              onClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId}
            />
          ))}
        </div>
        <div className="absolute bottom-0 p-1 w-1/3 text-center bg-pink-300">
          <div className="flex p-2 w-full h-10 pl-2 py-2 gap-2">
          
            <div className="w-10 h-10 -my-1 ml-1">
              <Avatar username={username} />
            </div>
          

            <span className="justify-content-center w-full text-white my-span">
              Welcome to Dino Chat! {username}
            </span>

            <button className="flex justify-end" onClick={logout}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col bg-gray-800 h-screen w-2/3 p-2">
        {/* <div className="flex-grow overflow-y-scroll"> */}
        <div className="fixed flex flex-col bg-gray-800 h-screen justify-center items-center">
          <img
            src={MySvg}
            alt="My SVG"
            style={{ width: "30%", height: "auto" }}
          />
          {/* Hello there, {username}! */}
        </div>
        {/* </div> */}

        {!!selectedUserId && (
          <div className="relative h-full">
            {/* <div className="mb-4"> */}
            <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
              {messageWithoutDupes.map((message) => (
                <div
                  key={message._id}
                  className={message.sender === id ? "text-right" : "text-left"}
                >
                  <div
                    key={message._id}
                    className={
                      "text-left inline-block rounded-md text-sm p-2 my-2" +
                      (message.sender === id
                        ? " bg-gray-600 text-white"
                        : " bg-purple-200 text-gray-600")
                    }
                  >
                    sender: {message.sender}
                    <br />
                    my id: {id}
                    <br />
                    {message.text}
                  </div>
                </div>
              ))}
              <div ref={divUnderMessages}></div>
            </div>
            {/* </div> */}

            <div className="absolute bottom-5 left-10 right-10">
              <form className="flex gap-2" onSubmit={sendMessage}>
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(ev) => setNewMessagesText(ev.target.value)}
                  className="bg-gray-800 flex-grow rounded-sm border p-2"
                  placeholder="what's on your mind?"
                />
                <button type="submit" className="text-white rounded-sm p-2 ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="rgba(163, 177, 255, 1)"
                    className="w-5 h-5"
                  >
                    <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
