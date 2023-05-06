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

    //realtime connection to server
    useEffect(() => {
      connectToWs();
    }, [selectedUserId]);

  function connectToWs(){
     const ws = new WebSocket("ws://localhost:4000");
     setWs(ws);
      ws.addEventListener("message", handleMessage);
      ws.addEventListener("close", () => {
          setTimeout(() => {
              console.log("reconnecting...");
              connectToWs();
          }, 1000);
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
    console.log({ev,messageData});
    // console.log(messageData);
    if ('online' in messageData) {
      showOnlinePeople(messageData.online);
    }else if('text' in messageData)
    {
      //check if message is for the selected user
      if (messageData.sender === selectedUserId) {
        setMessages((prev) => [
          ...prev,
          {
            ...messageData,
          },
        ]);
      }
      
    }
  }

  function sendMessage(ev, file = null) {
    if (ev) ev.preventDefault();
    ws.send(
      JSON.stringify({
      recipient:selectedUserId,
      text:newMessageText,
      file,
    }));
    
    if (file){
      axios.get('/messages/' + selectedUserId).then(res => {
        setMessages(res.data);
      });
    } else {
      //clear input box
      setNewMessagesText("");
      //add message to messages
      setMessages(prev => ([...prev,
        {
          text: newMessageText,
          isOur: true,
          sender: id,
          recipient: selectedUserId,
          //id is a unique key by which react can identify each message
          _id: Date.now(),
        }]));
    }
  }

 function logout() {
   axios.post("/logout").then(() => {
     setWs(null);
     setId(null);
     setUsername(null);
   });
 }

  //return a base64 encoded string
function sendFile(ev) {
    const reader = new FileReader();
    reader.readAsDataURL(ev.target.files[0]);
    reader.onload = () => {
      sendMessage(null, {
        name: ev.target.files[0].name,
        data: reader.result,
      });
    };
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
    <div className="fixed flex h-screen w-screen text-white bg-gray">
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
          <div className="flex p-2 w-full h-10 pl-2 py-2 gap-2 justify-between">
            <div className="w-10 h-10 -my-1 ml-1">
              <Avatar username={username} />
            </div>
            <span className="w-full text-white text-sm mb-10 ml-2 mr-2">
              Welcome to Dino Chat! {username}
            </span>
            <div className="flex justify-end">
              <button onClick={logout}>
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
      </div>

      <div
        style={{ backgroundColor: "rgba(136, 35, 209, 0.6)" }}
        className="flex flex-col h-screen w-2/3"
      >
        {/* <div className="flex-grow overflow-y-scroll"> */}
        <div className="fixed flex flex-col h-screen justify-center items-center">
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
            <div className="absolute text-center bg-black p-4 w-full left-0 right-0">
              <div className="flex items-center">
                {onlinePeople[selectedUserId] ? (
                  <div>Talking to {onlinePeople[selectedUserId]}</div>
                ) : (
                  <div>Talking to {offlinePeople[selectedUserId].username}</div>
                )}
              </div>
              <div className="absolute top-2 w-8 h-8 right-4 my-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                  />
                </svg>
              </div>
            </div>

            {/* <div className="mb-4"> */}
            <div className="overflow-y-scroll absolute top-14 left-0 right-0 bottom-12 p-4">
              {messageWithoutDupes.map((message) => (
                <div
                  key={message._id}
                  className={message.sender === id ? "text-right" : "text-left"}
                >
                  <div
                    key={message._id}
                    className={
                      "text-left inline-block rounded-md text-sm p-2 my-2" +
                      (message.sender === id ? " bg-gray-600 text-white":" bg-purple-200 text-gray-600")
                    }
                  >
                    {/* sender: {message.sender}
                    <br />
                    my id: {id}
                    <br /> */}
                    {message.text}
                    {message.file && (
                      <div>
                        <a
                          target="_blank"
                          className="flex items-center gap-1 border-b"
                          href={
                            axios.defaults.baseURL + "/uploads/" + message.file}>
                          {message.file}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={divUnderMessages}></div>
            </div>
            {/* </div> */}

            <div className="absolute bottom-1 left-10 right-10">
              <form className="flex gap-2" onSubmit={sendMessage}>
                <div className="flex items-center">
                  <label type="button" className="cursor-pointer -ml-6">
                    <input type="file" className="hidden" onChange={sendFile} />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                  </label>

                  <label type="button" className="ml-2 cursor-pointer">
                    {/* <input type="file" className="hidden" onChange={sendFile} /> */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                      />
                    </svg>
                  </label>
                </div>

                <input
                  type="text"
                  value={newMessageText}
                  onChange={(ev) => setNewMessagesText(ev.target.value)}
                  className="bg-gray-800 flex-grow rounded-sm border p-2"
                  placeholder="what's on your mind?"
                />

                <button type="submit" className="-mr-8">
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
