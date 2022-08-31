import { useRef, useEffect, useState } from "react";

function TrimmerSlider({ onChange, videoLength, maxTimeLimit }) {
  const sliderContainerRef = useRef(null);
  const sliderDragRef = useRef(null);
  const leftHandleRef = useRef(null);
  const rightHandleRef = useRef(null);

  const maxTimeLimitPercentage = (maxTimeLimit / videoLength) * 100;

  const [range, setRange] = useState([0, 100]);

  const cleanUp = () => {
    window.document.onmousemove = null;
    window.document.onmouseup = null;
    setRangeHelper();
  };

  const getPercentage = (val) => {
    const containerWidth = sliderContainerRef.current?.clientWidth;
    return (val / containerWidth) * 100;
  };

  const setRangeHelper = () => {
    const width = sliderDragRef.current?.clientWidth;
    const from = getPercentage(sliderDragRef.current?.offsetLeft).toFixed(3);
    const to = getPercentage(width + sliderDragRef.current?.offsetLeft).toFixed(
      3
    );
    setRange([from, to]);
    onChange([Number(from), Number(to)]);
  };

  useEffect(() => {
    if (
      leftHandleRef.current &&
      rightHandleRef.current &&
      videoLength &&
      maxTimeLimit
    ) {
      leftHandleRef.current.style.left = "0%";
      rightHandleRef.current.style.right =
        getPercentage(
          sliderContainerRef.current.clientWidth -
            0 -
            (leftHandleRef.current.offsetLeft +
              (sliderContainerRef.current.clientWidth / 100) *
                maxTimeLimitPercentage)
        ) + "%";
    }
  }, [videoLength, maxTimeLimit]);

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
            rightHandleRef.current.offsetLeft -
            rightHandleRef.current.clientWidth
        ) + "%";
    }
  }, [leftHandleRef.current?.offsetLeft, rightHandleRef.current?.offsetLeft]);

  const handleLeftDrag = (event) => {
    event.preventDefault();
    const intialStartLeft = leftHandleRef.current.offsetLeft;
    const containerWidth = sliderContainerRef.current.clientWidth;
    const drag = (e) => {
      e.preventDefault();
      let left = intialStartLeft + (e.clientX - event.clientX);
      const rigthStarts =
        rightHandleRef.current.offsetLeft - leftHandleRef.current.clientWidth;
      if (left <= 0) {
        left = 0;
      } else if (left >= rigthStarts) {
        left = rigthStarts;
      }
      const isPercentageCorrect =
        maxTimeLimitPercentage >
        getPercentage(sliderDragRef.current.clientWidth);
      const isPercentageInBound =
        rightHandleRef.current.offsetLeft +
          rightHandleRef.current.clientWidth -
          (sliderContainerRef.current.clientWidth / 100) *
            maxTimeLimitPercentage <
        left;
      if (!(isPercentageInBound || isPercentageCorrect)) {
        left =
          rightHandleRef.current.offsetLeft +
          rightHandleRef.current.clientWidth -
          (sliderContainerRef.current.clientWidth / 100) *
            maxTimeLimitPercentage;
      }
      sliderDragRef.current.style.left = getPercentage(left) + "%";
      leftHandleRef.current.style.left = getPercentage(left) + "%";
    };

    window.document.onmousemove = drag;
    window.document.onmouseup = cleanUp;
  };

  const handleRightDrag = (event) => {
    event.preventDefault();
    const containerWidth = sliderContainerRef.current.clientWidth;
    const intialStartRight =
      rightHandleRef.current.offsetLeft + rightHandleRef.current.clientWidth;

    const drag = (e) => {
      e.preventDefault();
      let right =
        containerWidth - (intialStartRight + (e.clientX - event.clientX));
      const leftEnds =
        containerWidth -
        leftHandleRef.current.offsetLeft -
        (leftHandleRef.current.clientWidth +
          rightHandleRef.current.clientWidth);
      if (right <= 0) {
        right = 0;
      } else if (right >= leftEnds) {
        right = leftEnds;
      }

      const isPercentageCorrect =
        maxTimeLimitPercentage >
        getPercentage(sliderDragRef.current.clientWidth);
      const isPercentageInBound =
        leftHandleRef.current.offsetLeft +
          (sliderContainerRef.current.clientWidth / 100) *
            maxTimeLimitPercentage >=
        sliderContainerRef.current.clientWidth - right;
      if (!(isPercentageInBound || isPercentageCorrect)) {
        right =
          sliderContainerRef.current.clientWidth -
          (leftHandleRef.current.offsetLeft +
            (sliderContainerRef.current.clientWidth / 100) *
              maxTimeLimitPercentage);
      }
      sliderDragRef.current.style.right = getPercentage(right) + "%";
      rightHandleRef.current.style.right = getPercentage(right) + "%";
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
      let boundry = sliderContainerRef.current.clientWidth - dragElemWidth;
      let positionLeft = initialStart + e.clientX - event.clientX;
      let positionRight =
        sliderContainerRef.current.clientWidth - (positionLeft + dragElemWidth);
      if (positionLeft <= 0) {
        positionLeft = 0;
        positionRight = boundry;
      }
      if (positionRight <= 0) {
        positionRight = 0;
        positionLeft = boundry;
      }
      sliderDragRef.current.style.left = getPercentage(positionLeft) + "%";
      leftHandleRef.current.style.left = getPercentage(positionLeft) + "%";
      sliderDragRef.current.style.right = getPercentage(positionRight) + "%";
      rightHandleRef.current.style.right = getPercentage(positionRight) + "%";
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
          {range[0]}-{range[1]}
        </div>
      </div>
    </>
  );
}

export default TrimmerSlider;
