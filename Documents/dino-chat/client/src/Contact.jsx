import React from "react";
import Avatar from "./Avatar";

export default function Contact({online, id, username, onClick, selected}) {

    return (
      <div
        key={id}
        onClick={() => {
          onClick(id);
        }}
        // className={
        //   "border-b border-gray-100 py-2 pl-4 flex items-center gap-2 cursor-pointer" +
        //   (userId === selectedUserId
        //     ? "bg-blue-400"
        //     : "hover:bg-gray-100")
        // }
        className={
          "border-gray-100 py-2 pl-4 flex items-center gap-2 cursor-pointer" +
          (selected? " bg-gray-800" : "")
        }
      >
        {/* {selected && <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>} */}
        <Avatar online={online} username={username} userId={id} />
        <span className="text-white">{username}</span>
      </div>
    );



}