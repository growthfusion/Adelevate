import React from "react";


export default function Page(){

return(
    <>
<div className="min-h-screen flex items-center justify-center">
    <div className="px-3 py-">
   <input type="Date" 
       placeholder="Today"
   />
     <input type="Date" 
       placeholder="Yesterday"
   />

    <input type="place" 
       placeholder="Zone"
   />

   <input 
    type="Tags"
    placeholder="Title"/>
    </div>
     
     <button className="bg-blue-600 px-5 py-5 hover:bg-blue-700">Apply</button>
</div>
    </>
)
}