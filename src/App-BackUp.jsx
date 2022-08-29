import styled from "@emotion/styled";
import { css } from "@emotion/react";
import Slider from "rc-slider";
import axios from "axios";
// import e from "express";
import { useEffect, useRef, useState, useCallback } from "react";
import Cropper from "react-cropper";
import "rc-slider/assets/index.css";
import "cropperjs/dist/cropper.css";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [screenShot, setScreenShot] = useState();
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(100);
  const [currentAspectRatioSelector, setCurrentAspectRatioSelector] =
    useState();
  const [savedAspectRatios, setSavedAspectRatios] = useState({
    facebook: {},
    instagram: {},
    twitter: {},
    linkedIn: {},
    tiktok: {},
  });

  const [instagramLimit, setInstagramLimit] = useState();

  const marks =
    instagramLimit && instagramLimit <= 100
      ? {
          [instagramLimit]: "instagram",
        }
      : {};

  const videoRef = useRef(null);
  const cropperRef = useRef(null);

  useEffect(() => {
    if (videoRef?.current?.duration) {
      const mark = (100 / videoRef?.current?.duration) * 2 + start;
      mark <= 100 && setInstagramLimit(mark);
    }
  }, [videoRef?.current?.duration, start]);

  const aspectRatios = {
    facebook: ["9 / 16", "16 / 9", "1 / 1"],
    instagram: ["9 / 16", "16 / 9", "1 / 1", "4 / 5"],
    twitter: ["1 / 1", "2 / 1"],
    linkedIn: ["9 / 16", "16 / 9", "1 / 1"],
    tiktok: ["9 / 16"],
  };

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

  const handleAspectRatioSelect = (key, value) => {
    cropperRef?.current?.cropper?.reset();
    setCurrentAspectRatioSelector([key, value]);
    cropperRef?.current?.cropper?.setAspectRatio(eval(value));
  };

  const saveAspectRatio = () => {
    if (!currentAspectRatioSelector) return;
    const [key, value] = currentAspectRatioSelector;
    const cropData = cropperRef?.current?.cropper.getData();
    setSavedAspectRatios((prevSavedAspectRatios) => ({
      ...prevSavedAspectRatios,
      [key]: {
        [value]: cropData,
      },
    }));
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
      const cropPost = await axios.post(
        "http://localhost:4000/video/crop",
        {
          fileName,
          ...cropData,
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
      const trimCropVideo = await axios.post(
        "http://localhost:4000/video/trimcrop",
        {
          fileName,
          start: trimStart,
          duration,
          ...cropData,
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
        marks={marks}
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
          style={{ height: 600, width: "100%" }}
          responsive={true}
          guides={true}
          autoCrop={true}
          dragMode={"move"}
          viewMode={2}
          zoomTo={0}
          minCropBoxHeight={20000}
          minCropBoxWidth={20000}
          movable={true}
          ref={cropperRef}
        />
      )}
      <button onClick={handleTrim}> Trim</button>
      <button onClick={handleCrop}> Crop</button>
      <button onClick={handleTrimAndCrop}> Trim & Crop</button>
      <br />
      <br />
      {screenShot && (
        <>
          <button onClick={() => cropperRef?.current?.cropper?.reset()}>
            reset Cropping
          </button>
          <button onClick={saveAspectRatio}>Save</button>
        </>
      )}
      <br />
      <br />
      {Object.keys(aspectRatios).map((key) => (
        <div>
          {key}
          <br />
          {aspectRatios[key].map((ar) => (
            <button
              className={"show-focus"}
              style={{
                backgroundColor: savedAspectRatios?.[key]?.[ar] ? "red" : "",
              }}
              onClick={() => handleAspectRatioSelect(key, ar)}
            >
              {ar}
            </button>
          ))}
          <br />
          <br />
        </div>
      ))}
    </div>
  );
}

export default App;
