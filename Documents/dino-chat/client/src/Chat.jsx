import { useEffect } from "react";
import { useState } from "react";
import { useContext } from "react";
import { UserContext } from "./UserContext";
import Avatar from "./Avatar";
import Inbox from "./Inbox";
import MySvg from "/Users/lisaliu/Documents/dino-chat/dinosaur.svg";



export default function Chat() {
    const [ws,setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);
    const { username, id } = useContext(UserContext);
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
    console.log(messageData);
    if ('online' in messageData) {
      showOnlinePeople(messageData.online);
    }
  }

  const onlinePeopleExclOurUser = {...onlinePeople};
  delete onlinePeopleExclOurUser[id];

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
        <div className="flex flex-col bg-gray-800 h-screen justify-center items-center">
          <img
            src={MySvg}
            alt="My SVG"
            style={{ width: "30%", height: "auto" }}
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="bg-white flex-grow rounded-sm border p-2"
            placeholder="what's on your mind?"
          />
          <button className="text-white rounded-sm p-2 ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="rgba(163, 177, 255, 1)"
              className="w-5 h-5"
            >
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
