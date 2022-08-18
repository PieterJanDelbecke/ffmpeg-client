import styled from "@emotion/styled";
import { css } from "@emotion/react";
import Slider from "rc-slider";
import axios from "axios";
// import e from "express";
import { useEffect, useRef, useState, useCallback } from "react";
import Cropper from "react-cropper";
import "rc-slider/assets/index.css";
import "cropperjs/dist/cropper.css";

function App() {
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [screenShot, setScreenShot] = useState();
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(100);
  const videoRef = useRef(null);
  const cropperRef = useRef(null);

  const handleScreenShot = () => {
    if (videoRef?.current) setScreenShot(takeSnapshot(videoRef?.current));
  };

  const changeVidSeek = (value) => {
    const video = videoRef?.current;
    if (!video || isNaN(video.duration)) return;
    videoRef.current.currentTime = videoLengthMapping(video.duration, value);
  };

  const videoLengthMapping = (duration, value) => {
    const sector = duration / 100;
    return sector * value;
  };

  const takeSnapshot = (video) => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    return canvas.toDataURL("image/jpeg", 0.5);
  };

  const getMappedRange = (duration, start, end) => {
    const mappedStart = videoLengthMapping(duration, start);
    const mappedend = videoLengthMapping(duration, end);
    return [mappedStart, mappedend];
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
      "http://localhost:4000/video/transcode",
      { video: event.target.files[0] },
      {
        headers: {
          "content-Type": "multipart/form-data",
        },
      }
    );
    setUrl(postVideo.data.path);
    setFileName(postVideo.data.fileName);
    handleScreenShot();
  };

  const handleTrim = async (event) => {
    const videoDuration = videoRef?.current?.duration;
    const [trimStart, trimEnd] = getMappedRange(videoDuration, start, end);
    const duration = trimEnd - trimStart;

    const postVideo = await axios.post(
      "http://localhost:4000/video/trim",
      {
        start: trimStart,
        duration,
        fileName,
      },
      {
        headers: {
          "content-Type": "application/json",
        },
      }
    );
    setUrl(postVideo.data.path);
    setFileName(postVideo.data.fileName);
    handleScreenShot();
  };

  const handleCrop = async () => {
    try {
      const cropperObject = cropperRef?.current;
      const cropData = cropperObject.cropper.getData();
      const imageData = cropperObject.cropper.getImageData();
      const cropImageData = {
        x: cropData.x <= 0 ? 0 : cropData.x,
        y: cropData.y <= 0 ? 0 : cropData.y,
        height:
          cropData.height >= imageData.naturalHeight
            ? imageData.naturalHeight
            : cropData.height,
        width:
          cropData.width >= imageData.naturalWidth
            ? imageData.naturalWidth
            : cropData.width,
      };
      const cropPost = await axios.post(
        "http://localhost:4000/video/crop",
        {
          fileName,
          ...cropImageData,
        },
        {
          headers: {
            "content-Type": "application/json",
          },
        }
      );
      setUrl(cropPost.data.path);
      setFileName(cropPost.data.fileName);
      handleScreenShot();
    } catch (error) {
      console.log(error);
    }
  };

  const handleTrimAndCrop = async () => {
    try {
      const videoDuration = videoRef?.current?.duration;
      const [trimStart, trimEnd] = getMappedRange(videoDuration, start, end);
      const duration = trimEnd - trimStart;
      const cropperObject = cropperRef?.current;
      const cropData = cropperObject.cropper.getData();
      const imageData = cropperObject.cropper.getImageData();
      const cropImageData = {
        x: cropData.x <= 0 ? 0 : cropData.x,
        y: cropData.y <= 0 ? 0 : cropData.y,
        height:
          cropData.height >= imageData.naturalHeight
            ? imageData.naturalHeight
            : cropData.height,
        width:
          cropData.width >= imageData.naturalWidth
            ? imageData.naturalWidth
            : cropData.width,
      };
      const trimCropVideo = await axios.post(
        "http://localhost:4000/video/trimcrop",
        {
          fileName,
          start: trimStart,
          duration,
          ...cropImageData,
        },
        {
          headers: {
            "content-Type": "application/json",
          },
        }
      );
      setUrl(trimCropVideo.data.path);
      setFileName(trimCropVideo.data.fileName);
      handleScreenShot();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      style={{
        padding: 20,
      }}
    >
      <div>
        <input type="file" name="file" onChange={handleFileSelected} />
      </div>
      <video
        ref={videoRef}
        crossOrigin={"Anonymous"}
        onLoad={handleScreenShot}
        onSeeked={handleScreenShot}
        src={url}
        width={800}
        height={800}
        controls
      />
      <Slider
        range
        allowCross={false}
        step={0.001}
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
          backgroundColor: "#0000dd",
        }}
        defaultValue={[0, 100]}
        onChange={handleSliderChange}
      />
      {screenShot && (
        <Cropper
          src={screenShot}
          style={{ height: 800, width: "100%" }}
          // Cropper.js options
          // initialAspectRatio={16 / 9}
          guides={true}
          rotatable={false}
          zoomable={false}
          autoCrop={true}
          ref={cropperRef}
        />
      )}
      <button onClick={handleTrim}> Trim</button>
      <button onClick={handleCrop}> Crop</button>
      <button onClick={handleTrimAndCrop}> Trim & Crop</button>
    </div>
  );
}

export default App;
