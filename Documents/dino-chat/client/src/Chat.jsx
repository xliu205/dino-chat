import { useEffect } from "react";
import { useState } from "react";
import { useContext } from "react";
import { UserContext } from "./UserContext";
import Avatar from "./Avatar";
import Inbox from "./Inbox";
import uniqBy from "lodash/uniqBy";
import { useRef } from "react";
import MySvg from "/Users/lisaliu/Documents/dino-chat/dinosaur.svg";



export default function Chat() {
    const [ws,setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);
    const { username, id } = useContext(UserContext);
    const [newMessageText, setNewMessagesText] = useState('');
    const [messages, setMessages] = useState([]);
    const divUnderMessages = useRef();
    // const backgroundColor = rgba(132, 130, 243, 0.05);
    useEffect(() => {
      const ws = new WebSocket("ws://localhost:4000");
      setWs(ws);
      ws.addEventListener("message", handleMessage)
  }, []);


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
      id:Date.now(),
    }]);
    

 
  }
  useEffect(() => {
    //scroll it into view
    const div = divUnderMessages.current;
    if(div){
    div.scrollIntoView({behavior:'smooth',block:'end'});
    }

  },[messages]);


  const onlinePeopleExclOurUser = {...onlinePeople};
  delete onlinePeopleExclOurUser[id];
  const messageWithoutDupes = uniqBy(messages,'id');

  return (
    <div
      className="flex h-screen w-screen text-white bg-gray"
      // style={{ backgroundColor: "rgba(132, 130, 243, 0.05)" }}
    >
      <div className="bg-black h-screen w-1/3">
        <Inbox />

        {Object.keys(onlinePeopleExclOurUser).map((userId) => (
          <div
            key={userId}
            onClick={() => {
              setSelectedUserId(userId);
              console.log("userId:", userId);
              console.log("selectedUserId:", selectedUserId);
            }}
            // className={
            //   "border-b border-gray-100 py-2 pl-4 flex items-center gap-2 cursor-pointer" +
            //   (userId === selectedUserId
            //     ? "bg-blue-400"
            //     : "hover:bg-gray-100")
            // }
            className={
              "border-gray-100 py-2 pl-4 flex items-center gap-2 cursor-pointer" +
              (userId === selectedUserId ? " bg-gray-800" : "")
            }
          >
            <Avatar username={onlinePeople[userId]} userId={userId} />
            <span className="text-white">{onlinePeople[userId]}</span>
          </div>
        ))}
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
                    className={
                      message.sender === id ? "text-right" : "text-left"
                    }
                  >
                    <div
                      className={
                        "text-left inline-block rounded-md text-sm p-2 my-2" +
                        (message.sender === id
                          ? " bg-purple-100 text-white"
                          : " bg-white text-gray-500")
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
