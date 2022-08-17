import styled from "@emotion/styled";
import axios from "axios";
// import e from "express";
import { useState } from "react";

const H1 = styled.h1`
  color: red;
`;

function App() {

  const [url, setUrl] = useState("")

const handleFileSelected = async (event) => {
  event.preventDefault()
  console.log("event", event)
  // setUrl(window.URL.createObjectURL(event.target.files[0]))
  const postVideo = await axios.post("http://localhost:4000/video/transcode", {video: event.target.files[0]}, {
    headers:{
      "content-Type": "multipart/form-data"
    }
  })
  console.log(postVideo)
  setUrl(postVideo.data.path)
}

  return (
    <div>
      <H1>test</H1>
      <input type="file" name="file" onChange={handleFileSelected} />
      <video src={url} width={800} height={800} controls/>
    </div>
  );
}

export default App;
