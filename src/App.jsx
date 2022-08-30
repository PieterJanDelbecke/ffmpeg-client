import { useRef, useEffect, useState } from "react";
import "./App.css";

function App() {
  const sliderContainerRef = useRef(null);
  const sliderDragRef = useRef(null);
  const leftHandleRef = useRef(null);
  const rightHandleRef = useRef(null);

  const [range, setRange] = useState([0, 100]);

  const cleanUp = () => {
    window.document.onmousemove = null;
    window.document.onmouseup = null;
  };

  const getPercentage = (val) => {
    const containerWidth = sliderContainerRef.current?.clientWidth;
    return (val / containerWidth) * 100;
  };

  const setRangeHelper = () => {
    const width = sliderDragRef.current?.clientWidth;
    const from = getPercentage(sliderDragRef.current?.offsetLeft);
    const to = getPercentage(width + sliderDragRef.current?.offsetLeft);
    setRange([from, to]);
  };
  // useEffect(() => {
  //   console.log(sliderDragRef.current?.clientWidth);
  // }, [sliderDragRef.current?.clientWidth]);

  useEffect(() => {
    if (
      leftHandleRef.current &&
      rightHandleRef.current &&
      sliderContainerRef.current
    ) {
      sliderDragRef.current.style.left =
        getPercentage(leftHandleRef.current.offsetLeft) + "%";
      sliderDragRef.current.style.right =
        getPercentage(
          sliderContainerRef.current.clientWidth -
            rightHandleRef.current.offsetLeft
        ) + "%";
    }
  }, [leftHandleRef.current, rightHandleRef.current]);

  const handleLeftDrag = (event) => {
    event.preventDefault();
    const intialStartLeft = leftHandleRef.current.clientLeft;
    const drag = (e) => {
      e.preventDefault();
      let left =
        e.clientX - intialStartLeft - leftHandleRef.current.clientWidth;
      const rigthStarts =
        rightHandleRef.current.offsetLeft - leftHandleRef.current.clientWidth;
      if (left <= 0) {
        left = 0;
      } else if (left >= rigthStarts) {
        left = rigthStarts;
      }
      sliderDragRef.current.style.left = getPercentage(left) + "%";
      leftHandleRef.current.style.left = getPercentage(left) + "%";
      setRangeHelper();
    };

    window.document.onmousemove = drag;
    window.document.onmouseup = cleanUp;
  };

  const handleRightDrag = (event) => {
    event.preventDefault();
    const dragWidth = sliderContainerRef.current.clientWidth;
    const intialStartRight = dragWidth - rightHandleRef.current.offsetLeft;
    const offsetLeft = rightHandleRef.current.offsetLeft;
    const drag = (e) => {
      e.preventDefault();
      let right = offsetLeft - e.clientX + intialStartRight;
      const leftEnds =
        dragWidth -
        leftHandleRef.current.offsetLeft -
        rightHandleRef.current.clientWidth * 2;
      if (right <= 0) {
        right = 0;
      } else if (right >= leftEnds) {
        right = leftEnds;
      }
      sliderDragRef.current.style.right = getPercentage(right) + "%";
      rightHandleRef.current.style.right = getPercentage(right) + "%";
      setRangeHelper();
    };

    window.document.onmousemove = drag;
    window.document.onmouseup = cleanUp;
  };

  const handleDrag = (event) => {
    event.preventDefault();
    const initialStart = sliderDragRef.current.offsetLeft;
    const dragElemWidth = sliderDragRef.current.clientWidth;
    const prev = event.clientX;
    const drag = (e) => {
      e.preventDefault();
      let positionLeft = initialStart + e.clientX - prev;
      let positionRight =
        sliderContainerRef.current.clientWidth - (positionLeft + dragElemWidth);
      if (positionLeft <= 0) {
        positionLeft = 0;
        positionRight = sliderContainerRef.current.clientWidth - dragElemWidth;
      }
      if (positionRight <= 0) {
        positionRight = 0;
        positionLeft = sliderContainerRef.current.clientWidth - dragElemWidth;
      }

      sliderDragRef.current.style.left = getPercentage(positionLeft) + "%";
      leftHandleRef.current.style.left = getPercentage(positionLeft) + "%";
      sliderDragRef.current.style.right = getPercentage(positionRight) + "%";
      rightHandleRef.current.style.right = getPercentage(positionRight) + "%";
      setRangeHelper();
    };

    window.document.onmousemove = drag;
    window.document.onmouseup = cleanUp;
  };

  return (
    <>
      <div>
        <div ref={sliderContainerRef} className="slider_track">
          <div
            ref={sliderDragRef}
            onMouseDown={handleDrag}
            className="slider_drag"
          ></div>
          <div
            ref={leftHandleRef}
            onMouseDown={handleLeftDrag}
            className="handle left_handle"
          ></div>
          <div
            ref={rightHandleRef}
            onMouseDown={handleRightDrag}
            className="handle right_handle"
          ></div>
        </div>
        <div>
          {range[0].toFixed(2)}-{range[1].toFixed(2)}
        </div>
      </div>
    </>
  );
}

export default App;
