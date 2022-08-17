import styled from '@emotion/styled';
import { css } from '@emotion/react';
import Slider from 'rc-slider';
import axios from 'axios';
// import e from "express";
import { useEffect, useRef, useState } from 'react';
import 'rc-slider/assets/index.css';

function App() {
  const [url, setUrl] = useState('');
  const [start, setStart] = useState();
  const [end, setEnd] = useState();
  const videoRef = useRef();

  const changeVidSeek = (val) => {
    const video = videoRef?.current;
    if (!video || isNaN(video.duration)) return;
    const vidLegth = video.duration;
    const sector = vidLegth / 100;
    videoRef.current.currentTime = sector * val;
  };

  const handleSliderChange = (sliderValue) => {
    const [sliderStart, sliderEnd] = sliderValue;
    if (start !== sliderStart) {
      changeVidSeek(sliderStart);
      setStart(sliderStart);
    } else if (end !== sliderEnd) {
      changeVidSeek(sliderEnd);
      setEnd(sliderEnd);
    }
  };

  const handleFileSelected = async (event) => {
    event.preventDefault();
    const postVideo = await axios.post(
      'http://localhost:4000/video/transcode',
      { video: event.target.files[0] },
      {
        headers: {
          'content-Type': 'multipart/form-data',
        },
      }
    );
    setUrl(postVideo.data.path);
  };

  return (
    <div
      style={{
        padding: 20,
      }}
    >
      <input type="file" name="file" onChange={handleFileSelected} />
      <video ref={videoRef} src={url} width={800} height={800} controls />
      <Slider
        range
        allowCross={false}
        style={{
          height: 50,
          width: 800,
        }}
        railStyle={{
          height: 40,
        }}
        trackStyle={{
          opacity: 0,
        }}
        handleStyle={{
          height: 50,
          borderRadius: 5,
          width: 10,
          backgroundColor: '#0000dd',
        }}
        defaultValue={[0, 100]}
        onChange={handleSliderChange}
      />
    </div>
  );
}

export default App;
