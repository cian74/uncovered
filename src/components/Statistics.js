import { doc,getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const Statistics = () => {
    const swipeRef = doc(db,"users","totalSwipes");
    const swipeSnap = getDoc(swipeRef);

    if(swipeSnap.exists()){
        console.log("doc data.", swipeSnap.data());
    } else {
        console.log("no doc data was found");
    }
    return (
        <div>
            {{data}}
        </div>
    );
};

export default Statistics;