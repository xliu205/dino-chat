import RegisterAndLoginForm from "./RegisterAndLoginForm";
import axios from "axios";
import { UserContext } from "./UserContext";
import { UserContextProvider } from "./UserContext";
import { useContext } from "react";
import Chat from "./Chat.jsx";


export default function Routes(){
    const {username, id} = useContext(UserContext);
    if (username) {return <Chat />;
}
    return (<RegisterAndLoginForm />);
}